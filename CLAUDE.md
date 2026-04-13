# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp CRM — a monorepo with two workspaces:
- `backend/` — Node.js + TypeScript + Express + Baileys + Prisma (PostgreSQL)
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

**Baileys (WhatsApp) layer (`baileys/`):**
- `client.ts` — manages multiple `WASocket` instances keyed by `sessionId`, handles reconnect logic. Auth state is persisted to `.baileys-auth/<sessionId>/`.
- `handlers.ts` — processes incoming `messages.upsert` events: upserts contacts, creates/finds open conversations, saves messages, emits `message:new` via Socket.io.

**Services:**
- `WhatsAppService` — static class; `init()` restores sessions from DB on startup, `createSession()` starts a new Baileys connection, `sendMessage()` sends via the first active socket and saves the outbound message.
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

When a message arrives, Baileys upserts a `Contact` by phone, finds or creates an OPEN `Conversation`, then creates the `Message`. This means one open conversation per contact at a time.

## First-Time Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d
npm install
npm run db:migrate    # name it "init"
npm run dev
```

Then visit Settings → add a session → scan the QR code in WhatsApp.

## Important Notes

- Baileys is an unofficial WhatsApp Web client. Sessions are stored locally in `.baileys-auth/` (gitignored). If the QR is needed again, delete that folder and reconnect.
- The `SessionManager` component shows raw QR strings. Install `qrcode.react` and replace the `<pre>` block to render a scannable QR image.
- All routes are unauthenticated. Add auth middleware in `backend/src/api/server.ts` before production use.
