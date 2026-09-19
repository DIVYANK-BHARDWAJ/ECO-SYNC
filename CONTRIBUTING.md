# Contributing to Eco-Sync Nexus

Thank you for contributing to Eco-Sync Nexus. The project combines a browser-based microgrid simulator, carbon-aware scheduling, a Next.js application, Prisma/PostgreSQL persistence, notification services, and an Ethereum Sepolia settlement flow.

## Development Setup

```bash
git clone https://github.com/DIVYANK-BHARDWAJ/eco-sync.git
cd eco-sync
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Use `FORCE_OFFLINE=true` for local/demo work that should not depend on external services.

## Engineering Guidelines

- Keep simulated energy/carbon values clearly separated from live telemetry.
- Preserve authentication and user-resource ownership checks in every state-changing API.
- Never expose private keys, API credentials, or database credentials.
- Validate API inputs at the boundary: numbers, enums, identifiers, addresses, durations, and status transitions.
- Treat smart-contract and relayer changes as security-sensitive.
- Document assumptions when changing simulation math or financial/token calculations.

## Branches and Commits

Use focused branches such as `feature/carbon-scheduler`, `fix/otp-expiration`, or `security/trading-validation`. Do not commit directly to `main`.

Prefer clear imperative commit messages:

```text
feat: add forecast export
fix: enforce schedule ownership
security: harden OTP verification
docs: clarify Sepolia settlement flow
test: cover transaction validation
```

## Pull Requests

Include:

1. Problem and motivation
2. Implementation summary
3. Scope and affected areas
4. Tests executed and results
5. Security, migration, or deployment impact

For UI changes, add screenshots or a short recording. For API changes, include request/response examples. For Solidity changes, describe deployment impact and provide test evidence.

## Validation

Run the relevant checks before opening a pull request:

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

## Never Commit

- `.env` or `.env.local`
- private keys or mnemonics
- API keys and SMTP passwords
- database credentials
- real user data or exports
- generated local databases containing sensitive information

## Documentation

Update documentation when changing environment variables, API routes, Prisma models, contract behavior, simulation assumptions, external integrations, or security boundaries.

For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Contributor Checklist

- [ ] No secrets or sensitive data were committed.
- [ ] Authentication and resource ownership were preserved.
- [ ] Simulation assumptions were documented where relevant.
- [ ] Affected tests were executed.
- [ ] Lint/build were run when applicable.
- [ ] Documentation was updated for behavior changes.
- [ ] Security and deployment impact was described.
