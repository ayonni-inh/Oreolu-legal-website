---
name: Invitation workflow
description: How admin invitation links for staff and clients are created, tracked, and persisted
---

## Rule
Invitations are tracked in the in-memory `Invitation[]` array AND persisted to Supabase `invitations` table (graceful fallback if table missing).

**Why:** Admin needs to see all sent invitations, their status, and resend expired ones. The `Invitation` interface has: id, token, userId, email, firstName, lastName, role, status (PENDING/ACCEPTED/EXPIRED), invitedBy, inviteUrl, createdAt, acceptedAt, expiresAt.

## Endpoints
- `POST /api/staff` — creates staff user + invitation, sends email via Resend
- `GET /api/invite/:token` — checks Supabase first, then in-memory; returns name/email for SetPasswordModal
- `POST /api/invite/:token/activate` — hashes password, sets user ACTIVE, marks invitation ACCEPTED
- `GET /api/invitations?role=Admin` — lists all invitations for AdminAIPanel Invitations tab
- `POST /api/invitations/:id/resend` — generates new token, resets expiry, re-sends email

## Frontend
- AdminAIPanel has `invitations` tab (TabId union includes `'invitations'`). Fetched in `refreshAll()`.
- Invitation tab shows tracker table with Copy/Resend actions, stats grid, and "Send Invitation" form.
- Send Invitation form supports both Staff (→ /api/staff) and Client (→ /api/auth/register with temp password).
