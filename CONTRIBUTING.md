# Contributing to Eco-Sync Nexus

Thank you for your interest in contributing to **Eco-Sync Nexus**. This project explores the intersection of smart-grid simulation, carbon-aware automation, application security, persistence, AI context, and Web3 settlement.

Contributions should prioritize **correctness, reproducibility, security, accessibility, and maintainability** over unnecessary complexity.

## Before you begin

1. Read this file, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
2. Search existing issues and pull requests before starting work.
3. Open an issue for substantial architectural changes.
4. Never expose credentials, private keys, personal data, or production telemetry.
5. Treat simulation outputs as illustrative unless backed by a documented data source.

## Development setup

```bash
git clone https://github.com/DIVYANK-BHARDWAJ/eco-sync.git
cd eco-sync
npm install
npx prisma generate
npx prisma db push
npm run dev
```

For local demonstrations, configure `FORCE_OFFLINE=true` where supported. Use a disposable development database and a dedicated test wallet for blockchain work.

## Engineering principles

- **Security first:** validate inputs and enforce authentication and ownership at every state-changing boundary.
- **Explicit assumptions:** document simulation formulas, units, time scales, and rounding behavior.
- **Separation of concerns:** keep UI state, simulation logic, persistence, and privileged infrastructure distinct.
- **Observable behavior:** add useful logs, test evidence, and clear error handling.
- **Accessible UX:** support keyboard navigation, readable contrast, semantic structure, and reduced-motion preferences where practical.
- **No silent breaking changes:** document API, schema, environment, contract, and deployment changes.

## Branch and commit conventions

Do not commit directly to `main`. Use focused branches:

```text
feature/carbon-forecast-export
fix/otp-expiration
security/settlement-replay-protection
docs/setup-troubleshooting
```

Prefer concise conventional-style commits:

```text
feat: add forecast export
fix: enforce schedule ownership
security: harden OTP verification
docs: clarify settlement flow
test: cover schedule validation
refactor: isolate simulation engine
```

## Pull request requirements

Every pull request should include:

1. **Problem:** what is being solved and why?
2. **Scope:** which files, modules, routes, schemas, or contracts changed?
3. **Implementation:** summarize the approach and important trade-offs.
4. **Validation:** list commands run and their results.
5. **Security impact:** explain changes to authentication, authorization, secrets, payments, wallets, or privileged actions.
6. **Data impact:** describe migrations, seed data, destructive behavior, or compatibility concerns.
7. **UX evidence:** add screenshots or a recording for meaningful interface changes.

For Solidity or relayer changes, include network, contract-address impact, authorization assumptions, and test evidence. Do not include private keys or sensitive RPC details.

## Validation checklist

Run the checks relevant to your change:

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

If a check cannot run, explain why in the pull request. Do not claim a test passed if it was skipped or only reviewed manually.

## API and data changes

When changing an endpoint:

- Validate payloads at the boundary.
- Return predictable status codes and error shapes.
- Enforce user ownership server-side.
- Consider replay, duplicate, race-condition, and idempotency behavior.
- Update the README or API documentation.
- Add tests for valid, invalid, unauthorized, and cross-user cases.

When changing Prisma models:

- Review indexes, uniqueness, nullability, and cascade behavior.
- Explain migration and rollback implications.
- Avoid exposing internal database errors to users.

## Web3 changes

Treat contract and relayer changes as security-sensitive:

- Use Sepolia or another test environment.
- Never commit private keys or mnemonics.
- Verify chain ID and contract address.
- Validate signed-message intent, signer ownership, nonce/replay behavior, and amount constraints.
- Document privileged roles and minting authority.
- Include contract tests or a reproducible validation procedure.

## Never commit

- `.env`, `.env.local`, or secret files
- Private keys, mnemonics, seed phrases, or wallet exports
- API keys, SMTP passwords, session secrets, or database credentials
- Real user information or production exports
- Unreviewed generated artifacts containing sensitive data
- Large unrelated binaries or build output

## Documentation standard

Documentation should be updated whenever a change affects:

- Installation or environment variables
- API routes or payloads
- Database models or migrations
- Simulation formulas or units
- Smart-contract behavior
- Security assumptions
- External integrations
- Deployment or operational procedures

## Contributor checklist

- [ ] The change has a clear purpose and limited scope.
- [ ] No secrets or private data were committed.
- [ ] Authentication and ownership checks were preserved.
- [ ] Inputs and state transitions are validated.
- [ ] Relevant tests, lint, or build checks were run.
- [ ] Simulation assumptions are documented.
- [ ] Documentation was updated.
- [ ] Security, migration, and deployment impact is described.
- [ ] The change follows the Code of Conduct.
