import { IttyRouter } from 'itty-router';

import type { IRequest as IttyRequest, IttyRouterType } from 'itty-router';

import waitUntil from './waitUntil';

type Transfer = {
  error ?:string;
  id :string;
  name :string;
  size :number;
  state :string;
  token :string;
};

type TransferFile = {
  name :string;
  size :number;
};

export default class TransferObject implements DurableObject {
  environment :WorkerEnvironment;
  router :IttyRouterType<IttyRequest, void[], Response>;
  storage :DurableObjectStorage;
  stream ?:TransformStream;

  constructor(state :DurableObjectState, environment :WorkerEnvironment) {
    this.environment = environment;
    this.storage = state.storage;

    this.router = IttyRouter();
    this.router.get('/api/transfer/:token/connect', this.connect);
    this.router.patch('/api/transfer/:token/close', this.close);
    this.router.patch('/api/transfer/:token/open', this.open);
    this.router.patch('/api/transfer/:token/transfer', this.transfer);
    this.router.post('/api/transfer/:token', this.create);
    this.router.all('*', () => new Response('invalid route', { status: 404 }));
  }

  async fetch(request :IttyRequest) :Promise<Response> {
    return this.router.fetch(request, this.environment);
  }

  //
  //
  // transfer lifecycle methods
  //
  //

  close = async () :Promise<Response> => {
    try {
      // https://github.com/cloudflare/workers-sdk/issues/12777
      await this.stream!.writable.close();
      await this.resolve();
      return new Response('ok');
    }
    catch (e) {
      console.log(e);
      await this.resolve(e);
      return new Response(e, { status: 500 });
    }
  };

  connect = async () :Promise<Response> => {
    try {
      const transfer = await this.storage.get<Transfer>('transfer');
      transfer!.state = 'RECEIVER_WAITING';
      await this.storage.put('transfer', transfer);

      await waitUntil(
        async () => {
          const t = await this.storage.get<Transfer>('transfer');
          return t!.state !== 'RECEIVER_WAITING';
        },
        { max: 30_000 },
      );

      return new Response(this.stream!.readable, {
        headers: {
          'content-disposition': `attachment; filename="${transfer!.name}"`,
          'content-type': 'application/octet-stream',
        },
      });
    }
    catch (e) {
      console.log(e);
      await this.resolve(e);
      return new Response(e, { status: 500 });
    }
  };

  create = async (request :IttyRequest) :Promise<Response> => {
    try {
      const token = request.params.token;
      const file = await request.json().catch(() => []) as TransferFile;
      await this.storage.put('transfer', {
        error: undefined,
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        state: 'INITIAL',
        token,
      });
      return new Response(token);
    }
    catch (e) {
      console.log(e);
      await this.resolve(e);
      return new Response(e, { status: 500 });
    }
  };

  open = async () :Promise<Response> => {
    try {
      const transfer = await this.storage.get<Transfer>('transfer');
      transfer!.state = 'SENDER_WAITING';
      await this.storage.put('transfer', transfer);

      await waitUntil(
        async () => {
          const t = await this.storage.get<Transfer>('transfer');
          return t!.state !== 'SENDER_WAITING';
        },
        { max: 30_000 },
      );

      return new Response('ok');
    }
    catch (e) {
      console.log(e);
      await this.resolve(e);
      return new Response(e, { status: 500 });
    }
  };

  transfer = async (request :Request) :Promise<Response> => {
    try {
      const transfer = await this.storage.get<Transfer>('transfer');
      transfer!.state = 'PROGRESS';
      await this.storage.put('transfer', transfer);

      this.stream ??= new FixedLengthStream(transfer!.size);

      await request.body!.pipeTo(this.stream.writable, { preventClose: true });
      return new Response('ok');
    }
    catch (e) {
      console.log(e);
      await this.resolve(e);
      return new Response(e, { status: 500 });
    }
  };

  //
  //
  // internal methods
  //
  //

  resolve = async (error ?:unknown) => {
    const transfer = (await this.storage.get<Transfer>('transfer'))!;
    if (error === undefined && transfer.error === undefined) {
      transfer.error = undefined;
      transfer.state = 'SUCCESS';
    }
    else {
      if (!transfer.error) {
        if (error instanceof Error && error.message.length > 0) {
          transfer.error = error.message;
        }
        else if (typeof error === 'string' && error.length > 0) {
          transfer.error = error;
        }
        else {
          transfer.error = 'unknown';
        }
      }
      transfer.state = 'FAILURE';
    }
    await this.storage.put('transfer', transfer);
  };
}
