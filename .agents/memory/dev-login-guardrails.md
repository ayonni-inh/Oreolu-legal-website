---
name: Dev login guardrails
description: How to provide a developer/admin bypass login without creating a second production auth surface or bypassing canonical account controls.
---

**Rule:** A development bypass login endpoint must be disabled in production unless a `DEV_LOGIN_SECRET` environment variable is configured and provided by the caller, and it must never substitute fallback credentials for an existing database account.

**Why:** A public `/api/auth/dev-login` route that can prefer in-memory fallback users over the database weakens the single source of truth for account status and passwords. It becomes a hidden authentication surface that could allow access to revoked or changed accounts.

**How to apply:**
- In `NODE_ENV === 'production'`, return 403 unless `DEV_LOGIN_SECRET` is set and the request includes a matching `devSecret`.
- In development, allow the endpoint to operate without a secret for convenience.
- Always look up the database account first. If a DB account exists, use its `password_hash` and `status` exclusively; do not fall back to seeded in-memory credentials.
- Only fall back to in-memory users when there is no database record at all.
- Enforce the same `PENDING`/`BLOCKED`/`ACTIVE` status checks as the normal login route.
