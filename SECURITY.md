# Security Policy

## Supported Versions

Eco-Sync Nexus is actively developed and does not currently publish a long-term support matrix. Security fixes should target the current default branch unless a maintainer explicitly identifies another supported release.

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

Use GitHub Private Vulnerability Reporting if enabled for this repository, or contact the repository maintainer through a private channel. Include:

- affected component or file
- vulnerability type
- affected version or commit
- reproduction steps or proof of concept
- security impact
- suggested mitigation, if known

Do not include production credentials or unrelated personal data.

## High-Priority Areas

Examples include authentication bypass, OTP abuse, session-token forgery, cross-user access, injection, secret leakage, private-key exposure, unsafe smart-contract behavior, transaction authorization bypass, and practical dependency vulnerabilities.

## Web3-Specific Guidance

The Sepolia settlement flow uses a server-side relayer and an owner-controlled mint function. Treat `BLOCKCHAIN_PRIVATE_KEY`, contract ownership, deployment credentials, and privileged RPC credentials as highly sensitive.

If a private key is exposed:

1. Stop using it.
2. Rotate or revoke it where possible.
3. Assume associated assets may be compromised.
4. Rotate dependent credentials.
5. Preserve only the minimum evidence required.

## Authentication Security

The implementation uses OTPs, server-side OTP persistence, HMAC-signed session tokens, and `HttpOnly` cookies. This is a prototype authentication layer and requires further hardening before production use.

## Smart Contract Security

`contracts/EcoToken.sol` is not audited and includes owner-controlled mint functionality. Reports involving unauthorized minting, ownership bypass, accounting errors, allowance bugs, or authorization weaknesses should be treated as high priority.

## Secret Handling

Never commit `.env`, `.env.local`, private keys, mnemonics, passwords, SMTP credentials, API keys, or database credentials. Store secrets in environment variables or a deployment platform's secret store.

## Known Hardening Areas

- OTP rate limiting and brute-force protection
- explicit OTP expiry verification
- stronger schema validation
- comprehensive resource ownership checks
- CSRF protections appropriate to deployment
- API abuse/rate limiting
- security headers
- centralized audit logging
- session-secret rotation
- smart-contract testing and auditing
- dependency scanning
- continuous security monitoring

## Responsible Disclosure

Give maintainers reasonable time to investigate and remediate before public disclosure. Do not use a discovered vulnerability to access, modify, or destroy unrelated data or assets.
