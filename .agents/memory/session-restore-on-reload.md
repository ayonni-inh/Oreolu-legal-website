---
name: Session restoration on reload
description: Why the portal must restore the current user from the server on initial mount, and how it prevents the "Access Denied logs me out" symptom.
---

**Rule:** A client-side portal that relies on React state for authentication must call a `/api/auth/me` endpoint on mount to restore the signed-in user from the session cookie.

**Why:** The original `Portal` component initialized `currentUser` and `isLoggedIn` to `null`/`false`. After a successful login the API set the cookie, but if the user reloaded the page or clicked the Forbidden page's "Return Home" button (which used `window.location.href = '/'`), the React state was reset. The app then rendered `<Forbidden />` because it had no user in memory, even though the session cookie was still valid. Users interpreted this as being logged out.

**How to apply:**
- Add a `useEffect` in the root portal that calls `GET /api/auth/me` with `credentials: 'include'`.
- Use `flushSync` (or a single state update) to set both `currentUser` and `isLoggedIn` when the endpoint returns a user.
- Show a brief loading state while restoring so the user does not see a forbidden flash before the request completes.
- Ensure the endpoint itself rejects revoked/stale sessions and clears the cookie.
