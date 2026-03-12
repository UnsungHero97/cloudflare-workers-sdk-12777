import { ChangeEvent, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

const CHUNK_SIZE = 1_048_576;

async function transfer(
  token :string,
  data :Uint8Array<ArrayBuffer>,
) :Promise<unknown> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('error', () => {
        reject(new Error('network error'));
      });
      xhr.addEventListener('load', () => {
        if (xhr.readyState === 4) {
          resolve(xhr.responseText);
        }
      });
      xhr.upload.addEventListener('progress', (e) => {
        console.log(e.loaded);
      });
      xhr.open('PATCH', `/api/transfer/${token}/transfer`, true);
      xhr.setRequestHeader('content-type', 'application/octet-stream');
      xhr.send(data);
    }
    catch (e) {
      reject(e as Error);
    }
  });
}

function App() {
  const [error, setError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onChangeFile = (e :ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]!);
    }
  };

  const initiate = () => {
    let token :string | null = null;
    void fetch('/api/transfer', {
      body: JSON.stringify({ name: file!.name, size: file!.size }),
      method: 'POST',
    })
      .then(async (r) => {
        token = await r.text();
        setToken(token);
      })
      .then(() => {
        return fetch(`/api/transfer/${token}/open`, { method: 'PATCH' });
      })
      .then(async () => {
        let byteIndex = 0;
        while (true) {
          const bytes = await file!.slice(byteIndex, byteIndex + CHUNK_SIZE).bytes();
          if (bytes.length === 0 || byteIndex > file!.size) {
            break;
          }
          await transfer(token!, bytes);
          byteIndex += bytes.length;
        }
        return fetch(`/api/transfer/${token}/close`, { method: 'PATCH' });
      })
      .catch((e) => {
        console.log(e);
        setError(true);
      });
  };

  return (
    <div>
      <input onChange={onChangeFile} type="file" />
      <div>{file?.name}</div>
      <div>{file?.size}</div>
      <button disabled={!file} onClick={initiate} type="button">initiate transfer</button>
      <br />
      {error ? <div>something is wrong</div> : null}
      <br />
      <br />
      <br />
      {
        token
          ? <a href={`/api/transfer/${token}/connect`} rel="noreferrer" target="_blank">download</a>
          : null
      }
    </div>
  );
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
