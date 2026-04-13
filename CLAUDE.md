# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp CRM — a monorepo with two workspaces:
- `backend/` — Node.js + TypeScript + Express + Z-API + Prisma (PostgreSQL)
- `frontend/` — Next.js 15 (App Router) + Tailwind CSS

## Commands

### Development
```bash
# Start both services
npm run dev

# Start individually
npm run dev --workspace=backend   # http://localhost:3001
npm run dev --workspace=frontend  # http://localhost:3000

# Start PostgreSQL via Docker
docker compose up -d
```

### Database
```bash
npm run db:migrate    # Run migrations (prompts for migration name)
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:studio     # Open Prisma Studio at http://localhost:5555
```

### Build & Lint
```bash
npm run build                             # Build both workspaces
npm run lint --workspace=frontend         # Next.js lint
cd backend && npx tsc --noEmit            # Type-check backend
```

## Architecture

### Backend (`backend/src/`)

Request flow: `index.ts` → `api/server.ts` (Express) → `api/routes/` → `services/` → `lib/prisma.ts`

**Key singletons:**
- `lib/prisma.ts` — shared Prisma client
- `lib/io.ts` — Socket.io server instance; call `setIO()` at startup, `getIO()` anywhere

**Z-API layer (`zapi/`):**
- `client.ts` — HTTP client for the Z-API SaaS gateway. Reads `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` (path), and `ZAPI_CLIENT_TOKEN` (header) from env. Exports `sendTextMessage`, `getConnectionStatus`, `getQrCode`, `setWebhookReceived`.

**Services:**
- `WhatsAppService` — static class; `init()` checks Z-API connection status on startup and registers the webhook URL (only when `WEBHOOK_BASE_URL` is not localhost), `sendMessage()` calls `zapi.sendTextMessage` and saves the outbound message.
- `ContactService` / `ConversationService` — thin Prisma wrappers.

**Socket.io events emitted by the backend:**
| Event | Payload |
|---|---|
| `session:qr` | `{ sessionId, qr }` |
| `session:status` | `{ sessionId, status }` |
| `message:new` | `{ message, conversationId, contact? }` |

### Frontend (`frontend/src/`)

Uses Next.js App Router. Pages under `app/` are Server Components by default; interactive parts (chat, session manager) are `'use client'` components.

**Data fetching:** Server pages call `api.*` functions directly (server-side fetch). Client components use the same `lib/api.ts` from the browser.

**Real-time:** `lib/socket.ts` exports a singleton Socket.io client (`getSocket()`). Client components subscribe in `useEffect` and clean up on unmount.

### Database Schema

Core models: `Contact` (phone unique) → `Conversation` (status: OPEN/PENDING/RESOLVED) → `Message` (direction: INBOUND/OUTBOUND). Supporting: `Tag`, `ContactTag`, `PipelineStage`, `User`, `WhatsAppSession`.

When a message arrives via webhook, the handler upserts a `Contact` by phone, finds or creates an OPEN `Conversation`, then creates the `Message`. This means one open conversation per contact at a time.

## First-Time Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d
npm install
npm run db:migrate    # name it "init"
npm run dev
```

Then visit Settings → scan the QR code via **app.z-api.io** → click "Atualizar Status".

## Important Notes

- **WhatsApp connection is managed via Z-API** — not a local Baileys process. Go to [app.z-api.io](https://app.z-api.io), open your instance, and scan the QR code there. The backend tracks status via webhook callbacks (`ConnectedCallback` / `DisconnectedCallback`).
- **`ZAPI_CLIENT_TOKEN`** is the Security Token found in `app.z-api.io → sua instância → Settings → Security`. It is **different** from `ZAPI_TOKEN` (which is the instance token in the URL path). The client token is sent as the `Client-Token` HTTP header on every request.
- **Webhooks in local development**: Z-API cannot reach `localhost`. Use [ngrok](https://ngrok.com) or similar to expose the backend and set `WEBHOOK_BASE_URL` to the public URL. The backend skips webhook registration automatically when the URL is localhost.
- All routes are unauthenticated. Add auth middleware in `backend/src/api/server.ts` before production use.
