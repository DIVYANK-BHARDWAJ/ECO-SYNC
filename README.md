# ⚡ Eco-Sync Nexus

**Smart microgrid simulation · Carbon-aware scheduling · Experimental Web3 rewards**

Eco-Sync Nexus is a Next.js web application for exploring household energy demand, simulated solar generation, battery behavior, appliance schedules, grid-carbon forecasts, notifications, and an experimental token-reward flow.

> **Status: Experimental prototype.** Energy and carbon values are simulated; the app does not connect to a physical smart meter or control real appliances. Blockchain features are experimental and are not presented as audited or production-ready. Do not use this project for real-world energy control or financial decisions.

[Architecture](docs/ARCHITECTURE.md) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md)

## Features

- **Energy dashboard:** Explore simulated generation, demand, battery state, and grid dependency.
- **Carbon forecast:** View a synthetic 24-hour grid-carbon curve and compare lower- and higher-intensity periods.
- **Appliance scheduling:** Create and manage simulated device schedules.
- **Notifications:** View in-app notifications and configure supported email providers.
- **User profiles:** Email OTP authentication, session handling, and saved preferences.
- **Experimental ECO rewards:** Demonstrates offline mode and a Sepolia-oriented token-minting flow.
- **Assistant integration:** Includes utilities for passing selected energy-dashboard context to Botpress.
- **Interactive UI:** Motion effects, custom styling, and a terminal-inspired event stream.

Feature availability depends on configuration, database connectivity, and external services.

## How it works

- **Net power:** `Solar Generation - Total Load`
- **Carbon forecast:** An illustrative curve generates 24 hourly values; it is not live grid data.
- **Scheduling:** Device schedules are stored in the database but do not switch physical appliances.
- **Token flow:** The trading API can verify a signed request and call the configured token contract. This is a demonstration, not proof of measured energy generation or a production energy marketplace.

## Technology stack

| Area | Technologies |
| --- | --- |
| Web app | Next.js 14, React 18, TypeScript |
| UI | Tailwind CSS, custom CSS, Framer Motion, Lucide React |
| Database | PostgreSQL, Prisma ORM |
| Authentication | Email OTP, signed sessions, HttpOnly cookies |
| Blockchain | Solidity, Ethers.js 6, Ethereum Sepolia |
| Integrations | Email providers and Botpress utilities |

## Project structure

```text
ECO-SYNC/
├── contracts/       # ECO token contract
├── docs/            # Architecture and project notes
├── prisma/          # Database schema
├── scripts/         # Compilation and validation scripts
├── src/
│   ├── app/         # Pages and API routes
│   ├── components/  # UI components
│   ├── context/     # React context
│   ├── lib/         # Database, session, and integrations
│   └── types/       # Shared TypeScript types
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
└── package.json
```

## Getting started

### Requirements

- Node.js 18 or newer (prefer a supported LTS release)
- npm and Git
- PostgreSQL for persistent features
- Optional: email-provider credentials and Sepolia testnet configuration

### Install and run

```bash
git clone https://github.com/DIVYANK-BHARDWAJ/ECO-SYNC.git
cd ECO-SYNC
npm install
```

Create a `.env.local` file in the project root, then configure the variables needed for your setup. Generate the Prisma client and prepare a development database:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the optional token-contract demonstration, compile the contract artifact:

```bash
node scripts/compile.js
```

This compiles the contract; it does **not** deploy it or verify its security.

## Configuration

Set only the variables required by the features you intend to use. Names referenced by the project include:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for signing sessions |
| `RESEND_API_KEY` | Resend email credential |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SENDER` | SMTP email configuration |
| `BREVO_API_KEY` | Brevo credential, if that integration is used |
| `NEXT_PUBLIC_ECO_TOKEN_ADDRESS` | ECO token contract address for the configured network |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Sepolia RPC endpoint |
| `BLOCKCHAIN_PRIVATE_KEY` | Server-side contract-owner/relayer wallet key |
| `FORCE_OFFLINE` | Offline-demo behavior, where supported |

Example placeholders:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
SESSION_SECRET="replace-with-a-long-random-secret"
RESEND_API_KEY="your-resend-key"
NEXT_PUBLIC_ECO_TOKEN_ADDRESS="0xYourContractAddress"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://your-sepolia-rpc-endpoint"
BLOCKCHAIN_PRIVATE_KEY="your-test-wallet-private-key"
FORCE_OFFLINE="true"
```

The values above are examples, not working credentials. Keep `.env.local` out of source control. Never expose private keys, database passwords, or API secrets in client-side code or `NEXT_PUBLIC_*` variables. Use a dedicated test wallet for blockchain experiments.

## Database

The Prisma schema includes models for users, OTP verification, appliance schedules, notifications, and transactions. To inspect local development data, run:

```bash
npx prisma studio
```

Use a development database while experimenting. Production deployments need reviewed migrations, access controls, backups, and rollback procedures.

## API overview

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/check-user` | POST | Check account existence |
| `/api/auth/otp/send` | POST | Send an email OTP |
| `/api/auth/otp/verify` | POST | Verify OTP and create a session |
| `/api/auth/profile` | GET, PATCH | Read or update profile |
| `/api/auth/signout` | POST | End the session |
| `/api/forecaster/grid` | GET | Return synthetic carbon forecast |
| `/api/forecaster/schedule` | GET, POST, PATCH, DELETE | Manage appliance schedules |
| `/api/trading/sell` | POST | Run demo or experimental reward flow |
| `/api/trading/history` | GET | Read transaction history |
| `/api/notifications` | GET, DELETE | List or clear notifications |

This is a quick reference, not a complete API specification. Check each route for request formats, response fields, validation, and authorization requirements before integrating with it.

## Validation

Run the checks relevant to your changes:

```bash
npm run lint
npm run build
npx tsx scripts/test-prisma-schema.ts
npx tsx scripts/test-botpress.ts
npx tsx scripts/test-grid-api.ts
npx tsx scripts/test-schedule-api.ts
npx tsx scripts/test-message-templates.ts
npx tsx scripts/test-profile-update-style.ts
node scripts/compile.js
```

Some checks may require environment variables, a database, or external services. Do not report checks as passing unless they were actually run successfully.

## Limitations and security

- Forecasts and energy readings are simulated, not real-time measurements.
- The app does not control physical equipment.
- Review OTP expiry, single-use behavior, rate limiting, and abuse protection before production use.
- Enforce user ownership checks for every resource-access API.
- Keep secrets and private keys server-side.
- Review signature replay protection, input validation, chain/contract verification, transaction confirmation, and database consistency before using the blockchain flow beyond a demo.
- External databases, email services, RPC providers, and assistant integrations may be unavailable or misconfigured.

Read [SECURITY.md](SECURITY.md) before reporting or investigating vulnerabilities. Do not disclose security issues in public tickets.

## Roadmap

- Improve input validation, error handling, and API tests.
- Strengthen authentication, authorization, and OTP abuse controls.
- Add replay protection and clearer pending/confirmed/failed blockchain states.
- Improve accessibility, keyboard navigation, and reduced-motion support.
- Add authoritative grid-carbon data through a documented provider.
- Add CI checks for tests, builds, dependency risks, and secret scanning.

## Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
2. Check existing issues before starting major work.
3. Keep changes focused and update relevant tests and documentation.
4. State which checks you ran.
5. Never commit secrets, private keys, or personal data.

## License

Distributed under the [MIT License](LICENSE).

Copyright © 2026 Divyank Bhardwaj.
