import { IttyRouter, cors } from 'itty-router';

import type { IRequest as IttyRequest } from 'itty-router';

const { preflight, corsify } = cors();

async function passToTransfer(request :IttyRequest, environment :WorkerEnvironment) {
  const url = new URL(request.url);
  const token = request.params.token;
  const transferId = environment.TRANSFER.idFromName(token);
  const transfer = environment.TRANSFER.get(transferId);
  return transfer.fetch('https://transfer.object' + url.pathname + url.search, request);
}

function getRouter() {
  const router = IttyRouter({
    before: [preflight],
    finally: [corsify],
  });

  router.get('/api/transfer/:token/connect', passToTransfer);
  router.patch('/api/transfer/:token/close', passToTransfer);
  router.patch('/api/transfer/:token/open', passToTransfer);
  router.patch('/api/transfer/:token/transfer', passToTransfer);
  router.post('/api/transfer/:token', () => new Response('invalid route', { status: 404 }));
  router.post('/api/transfer', (request :IttyRequest, environment :WorkerEnvironment) => {
    const token = crypto.randomUUID();
    const transferId = environment.TRANSFER.idFromName(token);
    const transfer = environment.TRANSFER.get(transferId);
    return transfer.fetch(`https://transfer.object/api/transfer/${token}`, request);
  });

  router.all('*', () => new Response('invalid route', { status: 404 }));
  return router;
}

export { default as TransferObject } from './TransferObject';

export default {
  async fetch(request :Request, environment :WorkerEnvironment) {
    return getRouter()
      .fetch(request, environment)
      .catch((e) => {
        console.log(e);
        return new Response('error', { status: 500 });
      });
  },
};
