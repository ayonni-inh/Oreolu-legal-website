# Agidi & Co Law Firm Portal

## Overview
React + Vite SPA served by an Express server (TypeScript). The Express server provides REST APIs (auth, users, appointments, documents, AI insights, AI chat, email) and serves the Vite-built frontend in production. In development, Vite middleware is mounted on Express.

## Stack
- Frontend: React 19, Vite 6, Tailwind CSS 4, lucide-react, recharts, motion, react-markdown
- Backend: Express 4 (TypeScript via tsx in dev, esbuild bundle in prod)
- Optional integrations: Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), Google Gemini (`GEMINI_API_KEY`), Resend (`RESEND_API_KEY`)
- When optional keys are missing, the server falls back to in-memory data and disables the corresponding features.

## Replit Setup
- Workflow: `Server` runs `npm run dev` (tsx server.ts) and binds to port 5000 with webview output.
- The Express server listens on `0.0.0.0:5000` (configurable via `PORT`). Vite middleware uses `allowedHosts: true` so the Replit proxy iframe can reach it.
- Deployment: autoscale, build = `npm run build`, run = `npm run start` (serves the built SPA + API from `dist/server.cjs`).

## Project Layout
- `server.ts` — Express server, all API routes, and Vite SSR/middleware bootstrap.
- `index.html` / `src/` — Vite + React frontend.
- `vite.config.ts` — Vite configuration with React + Tailwind plugins.
