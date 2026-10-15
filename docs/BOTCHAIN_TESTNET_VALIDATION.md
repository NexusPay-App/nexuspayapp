# BOT Chain testnet validation — 15 October 2026

Stable app: https://nexuspayapp-ten.vercel.app
Public integration showcase: https://nexuspayapp-ten.vercel.app/ecosystem

BOT testnet (968) remains enabled; mainnet (677) remains disabled. Home network selection now reaches the shared send form. BOT sends use the dedicated payment API, retain a stable idempotency key for uncertain submissions, and poll until confirmed or failed. Phone numbers and email recipients are normalized separately.

Phone signup now completes registration with the verified code and establishes the returned session. It no longer starts a second login. Actual SMS delivery is disabled in the deployed test backend and must be configured before general phone onboarding. Google initialization failure does not block the phone form.

Validation: production build and TypeScript passed; 13 unit tests passed; 14 desktop/mobile browser tests passed with mocked APIs; final signup/password-validation rerun passed all four tests. Lint has no errors and 10 existing warnings. `npm ls --all` passed. Production dependency audit reports two moderate findings, zero high/critical after Reclaim SDK 5.8.3.

Funded API payment receipts, backend security changes, and remaining production setup are recorded in the [backend readiness report](https://github.com/NexusPay-App/backendMirror/blob/main/docs/BOTCHAIN_TECHNICAL_READINESS.md). Controlled QA activity does not count toward ecosystem adoption requirements.
