---
name: code-get-project-context
description: Gives the AI a quick, accurate picture of what the ben-prototype repository is and how its two sub-projects are organized. Use at the start of any task so you never have to guess the project's purpose, structure, or conventions.
---

# Ben Prototype — Quick Project Context

## What is ben-prototype?

**Ben** is a voice-first personal assistant app — "your busy-day brain: say it, Ben files it."

The `ben-prototype` repository is the **v1 prototyping workspace** for this app. It is not a production codebase — its purpose is to design, iterate, and validate Ben's screens and interactions before the real product is built.

The repo contains three separate projects:

- [`project-design/`](../../../project-design/) — Design sandbox and gallery (Vite + React + Tailwind v4)
- [`project-web/`](../../../project-web/) — Mock web implementation of Ben (Vite + React + Tailwind v4)
- [`project-backend/`](../../../project-backend/) — Node.js backend for Ben (Express 5 + TypeScript + Zod)
- Coming soon: `project-mobile/` — Real mobile implementation of Ben (not started yet)

---

## project-design

**Purpose:** A fidelity sandbox for designing and reviewing every Ben screen.

### Key directories

- `src/pages/app/` — Ben screen states (one file per state)
- `src/pages/components/` — Preview routes for each reusable UI primitive
- `src/layout/components/ui/` — Shared UI primitives (Button, Typography, …)
- `src/core/` — App wiring: router (`main.tsx`) gallery registry (`screens.ts`)

### Stack

Vite 8 · React 19 · react-router v7 · Tailwind CSS v4 · `lucide-react`

---

## project-web

**Purpose:** The real web implementation of Ben — routing and Google/Firebase authentication are wired up, and it consumes the `project-backend` API to drive working feature screens, including a working chat experience with the Ben agent, a collaborative task workspace, and a navigation menu for browsing captured tasks, notes, and reminders (with item detail and settings).

### Key directories

- `src/api/` — Backend API client layer: HTTP client, route definitions, request/response contracts, and models
- `src/pages/` — Feature screens (one folder per page, each with its own `components/` and `hooks/`)
- `src/layout/` — Shared UI primitives and cross-page hooks (e.g. API request / pagination hooks)
- `src/core/` — App wiring: router, entry point

It shares the same stack as `project-design` but is a completely separate project (with Firebase added for auth). Work here will grow as the design is validated in `project-design`.

---

## project-backend

**Purpose:** The Node.js API server for Ben.

### Key directories

- `src/domain/entities/` — Concrete domain entities (e.g. `user`, `message`, `topic`, `topic-summary`, and the capture entities `note`, `reminder`, `task`)
- `src/domain/use-cases/` — Application use cases (`auth/`, `messages/`, `topics/`, `transcription/`, `captures/`, `tasks/`)
- `src/adapters/` — Ports and adapter implementations (auth provider, JWT, agent provider, transcription provider, in-memory repositories)
- `src/infra/http/` — Express app, server entry point, routes, middlewares, presenters, and error handler
- `src/infra/services/` — Infrastructure services (env validation via Zod, Firebase auth provider, JWT, AssemblyAI transcription provider, Ben agent provider)
- `src/modules/domain/` — Domain primitives: base `Entity`, `AggregateRoot`, `ValueObject`, `Repository`, `UseCase`, domain errors, query helpers

### Stack

Node.js · Express 5 · TypeScript · Zod · Firebase Admin (auth) · JWT · AssemblyAI (audio transcription) · Vercel AI SDK + OpenRouter / Google Gemini (Ben agent) · multer (uploads) · `tsx` (dev runner)

---

## Source of truth documents

- [`docs/design.md`](../../../docs/design.md) — full design system: color palette, typography, spacing, brand voice, component descriptions.
- [`docs/data-model.md`](../../../docs/data-model.md) — domain data model for Ben.
- [`docs/api-endpoints.md`](../../../docs/api-endpoints.md) — backend API endpoint reference.
- [`docs/assemblyai-transcription.md`](../../../docs/assemblyai-transcription.md) — reference for the AssemblyAI audio transcription integration.
- [`docs/vercel-ai-sdk.md`](../../../docs/vercel-ai-sdk.md) — reference for the Vercel AI SDK + Gemini agent integration.
- [`docs/google-auth.md`](../../../docs/google-auth.md) — reference for the Google/Firebase authentication flow.

For deeper context on conventions, workflows, and design rules, use the [`context-get-project-design-context`](../context-get-project-design-context/SKILL.md) skill.
