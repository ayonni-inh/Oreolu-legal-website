---
name: Auth & Supabase persistence
description: How login/register/password hashing work; Supabase tables + in-memory fallback pattern
---

## Rule
All auth goes through `/api/auth/login` and `/api/auth/register`. Never skip to fake/demo data — demo users work because they have no `passwordHash`, so the hash check is bypassed (truthy guard: `if (storedHash && !verify(...))`).

**Why:** Previous implementation used hardcoded email checks and setTimeout simulation. Real auth was needed for staff invitations and client onboarding to persist across sessions.

## How to apply
- Password stored as `salt:hash` using `crypto.scryptSync(password, salt, 64)` — no extra deps.
- `hashPassword(pw)` → generates random 16-byte salt, returns `salt:hash`.
- `verifyPassword(pw, stored)` → splits on `:`, re-derives, uses `timingSafeEqual`.
- Supabase `users` table is tried first; if query errors (table missing), falls back to `fallbackUsers[]` in-memory array.
- Demo users (`admin@firm.com`, `sarah@firm.com`, `ogouifemi@gmail.com`) have no `passwordHash` → any password works for them.

## Supabase tables
Run `supabase-schema.sql` in Supabase SQL editor to create `users` and `invitations` tables. Server works without them (in-memory fallback).
