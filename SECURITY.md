# Security Policy

## Security posture

Eco-Sync Nexus is an experimental engineering prototype involving authentication, user-owned data, email integrations, simulation logic, and a privileged blockchain relayer. It is **not currently presented as production-hardened, independently audited, or suitable for handling valuable assets**.

Security reports are welcome and should be handled responsibly.

## Supported versions

The project does not currently maintain a formal long-term support matrix. Unless a maintainer states otherwise, security fixes should target the current `main` branch.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Use GitHub Private Vulnerability Reporting if enabled for the repository, or contact the maintainer through a private channel. Please include:

- Affected component, route, file, contract, or integration
- Vulnerability category
- Affected commit, version, or deployment
- Clear reproduction steps or a minimal proof of concept
- Security impact and realistic attack prerequisites
- Suggested mitigation, if known
- Whether the issue is exploitable in offline, local, testnet, or deployed environments

Remove secrets, credentials, personal data, and unrelated information from the report.

## High-priority security surfaces

Reports involving the following areas should be treated as high priority:

- Authentication bypass or OTP abuse
- Missing OTP expiry, attempt limits, or rate limiting
- Session-token forgery or cookie weaknesses
- Cross-user access to schedules, notifications, profiles, or transactions
- Injection, unsafe deserialization, or unvalidated input
- Secret or private-key exposure
- Unauthorized contract minting or relayer abuse
- Signature replay, signer mismatch, chain mismatch, or amount manipulation
- Dependency vulnerabilities with a practical attack path
- Sensitive information leakage through logs, errors, or client bundles

## Web3-specific guidance

The settlement flow may use a server-side relayer and an owner-controlled mint function. Treat the following as highly sensitive:

- `BLOCKCHAIN_PRIVATE_KEY`
- Contract ownership credentials
- RPC credentials and deployment keys
- Contract addresses paired with privileged operational details
- Signed payloads and authorization data

If a private key is exposed:

1. Stop using the key immediately.
2. Move or revoke associated permissions where possible.
3. Assume associated assets and contracts may be at risk.
4. Rotate dependent credentials.
5. Preserve minimal forensic evidence without spreading the secret.
6. Report the exposure privately.

Do not test against third-party wallets, production infrastructure, or funds you do not own or have explicit permission to use.

## Authentication and application security

The project uses OTP-based authentication and signed session mechanisms. Before production use, the authentication layer should receive additional controls such as:

- Strong OTP expiry and single-use enforcement
- Attempt limits and IP/account-level throttling
- Abuse detection and alerting
- Secure cookie configuration appropriate to deployment
- CSRF protections where applicable
- Session invalidation and secret rotation procedures
- Structured audit logging without sensitive values
- Schema validation and consistent authorization checks

## Smart-contract security

The smart contract is not independently audited. Potential issues involving access control, owner privileges, mint limits, accounting, replay protection, chain configuration, or transaction authorization should be reported privately and treated as sensitive.

A successful compilation is not evidence of contract safety.

## Secret handling

Never commit:

- `.env` or `.env.local`
- Private keys, mnemonics, or seed phrases
- Session secrets and API keys
- SMTP credentials or email-provider tokens
- Database credentials
- Production exports or personal data

Use environment variables and managed secret stores. Rotate any credential that may have been exposed.

## Responsible disclosure

Please allow maintainers reasonable time to investigate, reproduce, and remediate a report before public disclosure. Do not exploit a vulnerability beyond what is necessary to demonstrate impact, access unrelated data, degrade availability, or modify/destroy assets.

The project may acknowledge valid reports after remediation, subject to the reporter's preference and safety considerations.
