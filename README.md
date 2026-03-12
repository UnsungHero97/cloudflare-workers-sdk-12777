# cloudflare-workers-sdk-12777

To reproduce:

1. visit https://cloudflare-workers-sdk-12777.oskov.workers.dev/
2. select a file
3. click initiate transfer
4. click download
5. observe `/close` request results in `Error: Network connection lost.`
