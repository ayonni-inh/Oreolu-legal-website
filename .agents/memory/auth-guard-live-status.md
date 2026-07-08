---
name: Auth guard with live status
description: Server-side auth guards must re-verify the current user status and role on every protected request because signed cookies can outlive account changes.
---

**Rule:** `requireRole` must be async and load the latest user record from the database (or in-memory fallback) to verify `status === 'ACTIVE'` and that the role still matches the allowed list.

**Why:** The session cookie has a 24-hour TTL. If an admin later blocks a user or changes their role, the old cookie remains valid until it expires. A naive guard that only checks the cookie's role would allow a blocked or demoted user to keep hitting protected APIs and viewing dashboards.

**How to apply:**
- Make `requireRole` async and load the user by `session.id` using `loadUserById`.
- If the user is missing, `status !== 'ACTIVE'`, or the role is not allowed, return 403 and clear the session cookie so the client cannot keep using it.
- Update every route that calls `requireRole` to `await` it.
- Apply the same live-status check to `/api/auth/me` so the portal never rehydrates a revoked session.
