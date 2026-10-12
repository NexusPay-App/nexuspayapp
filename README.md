# NexusPay frontend

This execution branch upgrades the app to Next.js 16.4, React 19.3 and Tailwind 4.3, with a capability-driven BOT Chain workspace at `/botchain`.

## Local development

Use Node 24.21.0 and npm 12.2.0 (`.nvmrc` / `packageManager`). Run `npm ci`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_URL` to the intended backend and run `npm run dev`. Production can use `/api` only when a same-origin reverse proxy exists. Requests never fall through to another deployment.

Checks: `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`. Browser tests: `npx playwright install chromium` then `npx playwright test`; the config starts the production app on port 3100. Browser API/payment fixtures are mocked and do not send money.

## BOT Chain

The backend owns Thirdweb signing, chain-specific account resolution and operation reconciliation. This frontend contains no wallet private keys or provider application secrets. The network list and payment flags come from `/api/botchain/networks`. BOT/USDT/WBOT balances, chain-specific receive QR, sends, USDT merchant payments and operation history live at `/botchain`.

A pending hash is not shown as paid. Retry keys survive an ambiguous response in session storage. A confirmed/failed result releases that request identity so a later intentional payment gets a new key. A network/account change resets addresses and balances. Offline mode shows a public fallback page; it does not cache private API responses or initiate payments.

Mainnet payments, paymaster sponsorship and BOT M-Pesa settlement are not enabled by this change. Funded testnet validation is still required. The backend repository's `docs/BOTCHAIN_RUNBOOK.md` contains integration parameters, staging steps and recovery requirements.

## Release status

Both application builds and the documented local tests pass. Ten existing frontend lint warnings remain. See [dependency security review](docs/DEPENDENCY_SECURITY_REVIEW.md) for unpatched advisories. Reclaim now requests a backend-created session; rotate the old exposed Reclaim application secret and complete backend verification validation before enabling the feature.
