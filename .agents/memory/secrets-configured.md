---
name: Secrets & env vars configured
description: Which secrets and env vars are set, and which Supabase key the server actually reads
---

# Secrets & env vars configured

## Rule
The server reads `SUPABASE_PUBLISHABLE_KEY` (with `SUPABASE_ANON_KEY` as fallback) — not `SUPABASE_ANON_KEY` alone. Always set `SUPABASE_PUBLISHABLE_KEY`.

## Secrets (stored as Replit Secrets)
- `GEMINI_API_KEY` — Google Gemini AI (legal research, AI chat, insights)
- `RESEND_API_KEY` — Resend email service (appointment and invitation notifications)
- `SUPABASE_PUBLISHABLE_KEY` — Supabase client auth key
- `SUPABASE_SECRET_KEY` — Supabase service-role key

## Env vars (shared, non-secret)
- `SUPABASE_URL` — https://kbwdsugnqypqdzfmyvwx.supabase.co
- `SUPABASE_JWKS_URL` — https://kbwdsugnqypqdzfmyvwx.supabase.co/auth/v1/.well-known/jwks.json

**Why:** Supabase confirmed initializing in server logs ("Supabase client initialized successfully.") after setting these values.

**How to apply:** If re-importing or cloning this project, set all four secrets above plus the two URL env vars before starting the server.
