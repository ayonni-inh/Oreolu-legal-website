---
name: Forbidden page navigation
description: Use client-side navigation for "Return Home" on access-denied pages instead of full-page reloads.
---

**Rule:** Buttons on the access-denied / forbidden page must use the app's client-side `navigate` helper, not `window.location.href = '/'`.

**Why:** A full reload resets React state and rehydrates from scratch. If the portal has not yet restored the session from the cookie, the reload can make the user appear logged out even though the session cookie is still valid. Passing `onReturnHome={() => navigate('home')}` keeps the user in the same SPA session and lets the session restoration effect run normally.

**How to apply:**
- Make the `<Forbidden />` component accept an `onReturnHome` prop.
- In every `renderPage` branch that returns `<Forbidden />`, pass `() => navigate('home')`.
- Keep the component pure; it should not call `window.location` directly.
