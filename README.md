# ⚡ ECO-SYNC NEXUS

### Immersive Smart Microgrid Simulation · Carbon-Aware Automation · Web3 Energy Settlement

<p align="center">
  <strong>Model energy. Understand carbon. Automate intelligently.</strong>
</p>

<p align="center">
  A cyberpunk-inspired smart microgrid console for exploring residential energy production, storage, appliance scheduling, carbon-aware decisions, and decentralized energy settlement.
</p>

<p align="center">
  <a href="https://github.com/DIVYANK-BHARDWAJ/eco-sync">Repository</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

> **Project status:** Experimental prototype / educational engineering project. Energy values, carbon forecasts, financial calculations, and blockchain settlement behavior must not be interpreted as live utility-grade telemetry, financial advice, or production-certified infrastructure.

---

## Contents

- [What is Eco-Sync?](#what-is-eco-sync)
- [Why it exists](#why-it-exists)
- [Core capabilities](#core-capabilities)
- [System architecture](#system-architecture)
- [Simulation model](#simulation-model)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Database and smart contracts](#database-and-smart-contracts)
- [API surface](#api-surface)
- [Testing and validation](#testing-and-validation)
- [Security boundaries](#security-boundaries)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is Eco-Sync?

**Eco-Sync Nexus** is a browser-based smart microgrid simulation and decarbonization console. It brings together several engineering domains that are usually developed independently:

- Interactive frontend systems
- Energy generation and battery-storage simulation
- Carbon-intensity forecasting
- Carbon-aware appliance scheduling
- Budget-based automation safeguards
- Email and notification workflows
- Relayed Ethereum Sepolia settlement
- Conversational AI context synchronization

The application is designed as a systems-oriented prototype: the user can interact with a simulated household grid, observe changing energy conditions, schedule flexible loads, inspect operational alerts, and experiment with a tokenized settlement workflow.

## Why it exists

Residential energy systems are becoming more dynamic. Solar generation changes throughout the day, batteries have finite capacity, appliance demand is time-dependent, and grid carbon intensity is not constant.

Eco-Sync explores a single product experience around those constraints:

> **Use energy when it is operationally practical, economically meaningful, and comparatively lower-carbon—while keeping the system observable and bounded.**

The project intentionally combines simulation, persistence, automation, security, and Web3 integration so that the engineering trade-offs are visible rather than hidden behind a single dashboard.

---

## Core capabilities

| Capability | Description |
| --- | --- |
| **Telemetry console** | Interactive dashboard for simulated generation, load, storage, billing, and system events. |
| **Carbon forecast** | Double-sinusoidal model for producing an illustrative 24-hour grid-carbon curve. |
| **Appliance scheduling** | Queue and manage flexible loads such as EV charging, HVAC, and climate-control workloads. |
| **Solar and storage loop** | Simulates generation, household demand, charging, discharging, efficiency loss, and grid dependency. |
| **Budget watchdog** | Turns active simulated appliances off when a configured session budget is exceeded. |
| **Energy settlement** | Demonstrates signature verification and server-side Sepolia token minting through a relayer. |
| **Notification pipeline** | Supports email and in-app notification flows through configurable providers. |
| **AI assistant context** | Sends selected dashboard metrics and operational context to a Botpress-powered assistant. |
| **CRT terminal interface** | Retro terminal-inspired event stream with scanlines, alerts, and synthesized audio cues. |
| **Offline development mode** | Supports local demonstration flows without requiring every external integration. |

---

## System architecture

```mermaid
flowchart TD
    U[User / Prosumer] --> UI[Next.js Dashboard]
    UI --> SIM[Browser Simulation Loop]
    UI --> API[Next.js API Routes]
    API --> AUTH[OTP and Session Layer]
    API --> DB[(PostgreSQL via Prisma)]
    API --> MAIL[Email Providers]
    API --> AI[Botpress Context Integration]
    API --> RELAYER[Web3 Relayer]
    RELAYER --> CHAIN[Ethereum Sepolia / EcoToken]
    SIM --> UI
    SIM --> ALERTS[Budget and Operational Alerts]
    ALERTS --> DB
```

### Settlement flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Dashboard
    participant API as Server API
    participant Wallet as Browser Wallet
    participant Chain as Sepolia Contract
    participant DB as PostgreSQL

    User->>UI: Initiate simulated energy sale
    UI->>Wallet: Request signature
    Wallet-->>UI: Signed message
    UI->>API: Submit sale payload and signature
    API->>API: Authenticate request and verify signature
    API->>Chain: Submit authorized mint transaction
    Chain-->>API: Transaction hash / receipt
    API->>DB: Persist settlement record
    API-->>UI: Return settlement result
    UI-->>User: Display status and transaction reference
```

The diagrams describe the intended system boundaries. They should not be read as proof that every flow is production-hardened or that all operations are atomic across the database and blockchain.

---

## Simulation model

### Net power

The simulator models the household's instantaneous net power as:

```text
Net Power = Solar Generation - Total Load
```

- Positive net power represents simulated surplus.
- Negative net power represents simulated deficit.
- Surplus can charge the battery or be marked as exported when configured.
- Deficit can be supplied by the battery until storage is depleted, after which the household draws from the grid.

### Battery behavior

The simulation applies an illustrative efficiency factor during charging and discharging. Battery behavior is intended for visualization and experimentation, not for sizing real hardware.

### Carbon forecast

The forecast engine uses a double-sinusoidal curve to create changing carbon-intensity conditions over a 24-hour period. The model is synthetic and should be treated as a scenario generator rather than a verified forecast from a grid operator.

### Scheduling

Schedules include a device name, estimated power draw, start time, duration, and lifecycle status. The simulator can represent pending, running, and completed work while exposing potential grid dependency and carbon-aware timing opportunities.

### Budget safeguard

The budget watchdog estimates session cost and can deactivate active simulated appliances after the configured threshold is exceeded. This is a software safeguard inside the simulation; it does not disconnect physical electrical equipment.

---

## Technology stack

| Layer | Technologies |
| --- | --- |
| Application | Next.js 14, React 18, TypeScript |
| Styling and UI | Tailwind CSS, custom CSS, Framer Motion, Lucide React |
| Persistence | PostgreSQL, Neon-compatible connection, Prisma ORM |
| Authentication | OTP-based flow, signed session tokens, HttpOnly cookies |
| Web3 | Solidity, Ethers.js, MetaMask-compatible browser wallet, Ethereum Sepolia |
| Communication | Resend, Brevo, Nodemailer / SMTP fallback paths |
| AI | Botpress Webchat and synchronized dashboard context |
| Audio | Browser Web Audio API |
| Tooling | npm, Prisma CLI, TypeScript scripts, Node.js |

---

## Repository structure

The exact structure may evolve as the project develops. Key areas include:

```text
.
├── app/                 # Next.js application routes and UI
├── components/          # Reusable interface components
├── contracts/           # Solidity contracts
├── prisma/              # Prisma schema and database configuration
├── public/              # Static assets
├── scripts/             # Compilation, deployment, and validation scripts
├── styles/              # Global and feature-specific styling
├── .env.example         # Safe environment variable reference, if present
├── CONTRIBUTING.md      # Contribution workflow
├── CODE_OF_CONDUCT.md   # Community expectations
├── SECURITY.md          # Security policy and disclosure guidance
└── LICENSE              # MIT License
```

Use the repository's actual directory names as the source of truth when navigating the codebase.

---

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm, or a compatible package manager
- PostgreSQL database or a compatible hosted PostgreSQL connection
- Git
- Optional: MetaMask or another EIP-1193-compatible browser wallet
- Optional: Sepolia RPC endpoint and funded relayer account for blockchain experiments
- Optional: credentials for email and Botpress integrations

### 1. Clone the repository

```bash
git clone https://github.com/DIVYANK-BHARDWAJ/eco-sync.git
cd eco-sync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` and add only the values required for your chosen development mode. See [Environment configuration](#environment-configuration).

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Apply the database schema

For a development database:

```bash
npx prisma db push
```

Use migration-based workflows for controlled environments rather than treating `db push` as a production deployment strategy.

### 6. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Optional: run offline

For local demonstrations that do not require external services, configure:

```env
FORCE_OFFLINE="true"
```

Offline mode should be considered a development convenience. Verify the implementation before assuming every route and integration is fully available offline.

---

## Environment configuration

Never commit real credentials. Use a secret manager or deployment platform environment settings outside local development.

```env
# Persistence
DATABASE_URL="postgresql://username:password@host:5432/database"

# Session signing
SESSION_SECRET="replace-with-a-long-random-secret"

# Blockchain configuration
NEXT_PUBLIC_ECO_TOKEN_ADDRESS="0x..."
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia-rpc-provider.example/v3/project-id"
BLOCKCHAIN_PRIVATE_KEY="never-commit-this"

# Email integrations
RESEND_API_KEY="re_..."
BREVO_API_KEY="xkeysib-..."
SMTP_USER="user@example.com"
SMTP_PASSWORD="never-commit-this"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SENDER="sender@example.com"

# Development behavior
FORCE_OFFLINE="false"
```

### Configuration principles

- Keep server-only secrets out of `NEXT_PUBLIC_*` variables.
- Use a dedicated test wallet and test contract on Sepolia.
- Never use a valuable private key for experimentation.
- Rotate credentials immediately if exposure is suspected.
- Document new environment variables in the same change that introduces them.

---

## Database and smart contracts

### Database

The application uses Prisma to access PostgreSQL-backed records such as users, notifications, schedules, OTP verification data, and transaction history.

Before changing the schema:

1. Understand existing relationships and deletion behavior.
2. Consider indexes and uniqueness constraints.
3. Confirm that every user-owned record is scoped to the authenticated user.
4. Test both successful and invalid state transitions.
5. Document migration and rollback implications.

### Smart contract

The project includes an `EcoToken` contract and a deployment/compilation workflow. The contract and relayer path are experimental and should be treated as privileged infrastructure.

Before deploying:

1. Compile the contract using the repository script.
2. Inspect the generated artifact.
3. Use a dedicated Sepolia wallet.
4. Confirm the contract address and network.
5. Validate authorization and minting assumptions.
6. Record the deployed contract address outside source control.

The contract has not been represented as independently audited. Do not use it with funds or assets that you cannot afford to lose.

---

## API surface

The application includes API routes for authentication, profiles, forecasting, scheduling, notifications, and trading. Route names and payloads should be verified against the implementation before integration into external clients.

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/check-user` | POST | Checks whether a user record exists. |
| `/api/auth/otp/send` | POST | Starts an OTP authentication flow. |
| `/api/auth/otp/verify` | POST | Verifies an OTP and establishes a session. |
| `/api/auth/profile` | GET / PATCH | Reads or updates the authenticated user's profile. |
| `/api/auth/signout` | POST | Ends the current session. |
| `/api/auth/budget-exceeded` | POST | Records and communicates a budget event. |
| `/api/auth/test-notify` | POST | Exercises notification delivery. |
| `/api/forecaster/grid` | GET | Returns the illustrative grid forecast. |
| `/api/forecaster/schedule` | GET / POST / PATCH / DELETE | Manages appliance schedules. |
| `/api/trading/sell` | POST | Processes the simulated energy-sale settlement flow. |
| `/api/trading/history` | GET | Returns the authenticated user's settlement history. |
| `/api/notifications` | GET / DELETE | Reads or clears user notifications. |

All state-changing endpoints should validate authentication, input shape, authorization scope, and business-state transitions at the server boundary.

---

## Testing and validation

Run the checks relevant to your change. Depending on the repository's current scripts and environment, useful commands include:

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

A contribution should report:

- Commands executed
- Whether external services were required
- Whether database or contract state was changed
- Any known skipped checks
- Any screenshots or logs that help reviewers reproduce the result

---

## Security boundaries

Eco-Sync handles several sensitive surfaces:

- OTP generation and verification
- Session-token signing and cookie handling
- User-owned schedules and notifications
- Database credentials
- Email-provider credentials
- Blockchain relayer private keys
- Contract ownership and mint authorization
- User-controlled wallet addresses and signatures

The project is an experimental prototype. Security hardening, abuse prevention, comprehensive validation, dependency monitoring, and smart-contract review are ongoing engineering responsibilities. See [SECURITY.md](SECURITY.md) for the reporting process.

---

## Known limitations

- The energy and carbon models are synthetic.
- Browser simulation timing is not equivalent to real-time telemetry.
- The application does not control physical electrical devices.
- Token settlement is experimental and network-dependent.
- Relayer infrastructure introduces privileged-key risk.
- Email providers may be unavailable, rate-limited, or misconfigured.
- OTP authentication requires production-grade rate limiting and abuse controls before public deployment.
- Database persistence and blockchain settlement are not assumed to be one atomic transaction.
- The project should not be used as a substitute for utility data, energy-market advice, or professional electrical engineering.

---

## Roadmap

Potential future directions include:

- [ ] Add schema validation at every API boundary
- [ ] Introduce OTP expiry, attempt limits, and abuse throttling
- [ ] Add automated unit and integration test coverage
- [ ] Add contract tests and static analysis
- [ ] Add idempotent settlement handling and replay protection
- [ ] Improve database transaction consistency and audit logging
- [ ] Add configurable grid-intensity data adapters
- [ ] Separate simulation time from wall-clock time more explicitly
- [ ] Add observability, structured logs, and health checks
- [ ] Add CI security scanning and dependency auditing
- [ ] Improve accessibility and keyboard navigation
- [ ] Provide reproducible demo data and seeded development fixtures

Roadmap items are directional and may change as the implementation evolves.

---

## Contributing

Contributions are welcome when they improve correctness, clarity, security, accessibility, or maintainability.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

For security vulnerabilities, do not open a public issue. Follow [SECURITY.md](SECURITY.md).

## License

Eco-Sync Nexus is released under the [MIT License](LICENSE).

Copyright © 2026 Divyank Bhardwaj.
