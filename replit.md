# Agidi & Co Law Firm Portal

## Overview
Next.js 15 full-stack app. The frontend is a React + Tailwind CSS 4 SPA bridged through a single client `Portal` component (`app/components/Portal.tsx`) that renders the legacy page switcher. The backend is implemented as Next.js App Router API route handlers under `app/api/**/route.ts`. Auth and data are persisted via Supabase when configured, with graceful in-memory fallbacks when keys are missing.

## Stack
- Frontend: React 19, Next.js 15 (App Router), Tailwind CSS 4, lucide-react, recharts, motion, react-markdown
- Backend: Next.js Route Handlers (App Router)
- Optional integrations: Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), Google Gemini (`GEMINI_API_KEY`), Resend (`RESEND_API_KEY`)
- When optional keys are missing, the server falls back to in-memory data and disables the corresponding features.

## Replit Setup
- Workflow: `Server` runs `npm run dev` (`next dev -p 5000`) and binds to port 5000 with webview output.
- `next.config.ts` allows the Replit dev origin and disables image optimization for static export compatibility.
- Deployment: autoscale, build = `npm run build`, run = `npm run start`.

## Project Layout
- `app/layout.tsx` / `app/page.tsx` / `app/[...page]/page.tsx` — Next.js root layout and catch-all page entry points.
- `app/components/Portal.tsx` — client-side SPA wrapper containing the legacy page state and Next.js navigation sync.
- `app/api/**/route.ts` — Next.js API route handlers replacing the former Express backend.
- `lib/server/shared.ts` — shared backend helpers, Supabase/Gemini clients, in-memory fallback stores, password hashing, and session cookies.
- `src/components/` — existing React components consumed by `Portal`.
- `next.config.ts` — Next.js configuration.
- `tsconfig.json` / `postcss.config.mjs` — TypeScript and Tailwind v4 PostCSS setup.

## User preferences
- All code changes must use Next.js patterns and conventions (App Router, Route Handlers, Server/Client components, etc.). Do not introduce Express, standalone Node HTTP servers, or non-Next.js routing.
