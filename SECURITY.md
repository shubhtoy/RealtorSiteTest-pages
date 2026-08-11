# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Email the details to
**Contact@babaflats.com** with "SECURITY" in the subject. Include steps to reproduce, affected
URLs/routes, and any proof-of-concept. We'll acknowledge and work on a fix privately, then disclose
once resolved.

## Handling secrets

- Never commit secrets. `.env` is gitignored; use `.env.example` to document required variables.
- **Transport credentials** (SMTP user/pass, Google service-account key, any API token) live only in
  server environment variables — never in content, never in `NEXT_PUBLIC_*`, never in the repo.
- **Non-secret, user-editable settings** (recipient email, subject/body templates, address, hours)
  live in the editable content document and may be edited in the Studio.
- The Studio is gated by `STUDIO_PASSWORD` (server) which must match `NEXT_PUBLIC_STUDIO_PASSWORD`.
  Use a strong value in production; there is intentionally no hardcoded fallback.
- If a credential is ever exposed (e.g. pasted into a log, chat, or commit), treat it as
  compromised: rotate/deactivate it immediately and check access logs.

## Application safeguards (do not weaken without review)

- Contact API: per-IP rate limiting, server-side validation, and email-header sanitization.
- Uploads: extension allowlist (no SVG/HTML) to prevent stored XSS.
- Security headers (incl. HSTS, Permissions-Policy) set in `next.config.ts`.
- Constant-time comparison for the Studio password check.

If a change touches auth, validation, uploads, or headers, call it out explicitly in the PR.
