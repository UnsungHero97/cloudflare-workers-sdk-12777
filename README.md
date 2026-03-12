# cloudflare-workers-sdk-12777

https://github.com/cloudflare/workers-sdk/issues/12777

To reproduce:

1. visit https://cloudflare-workers-sdk-12777.oskov.workers.dev/
2. select a file
3. click initiate transfer
4. click download
5. observe `/close` request results in `Error: Network connection lost.`

https://github.com/user-attachments/assets/f162acd1-99a7-47e7-870a-9a646a4a6b4d
