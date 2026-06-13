---
name: code-get-project-context
description: Gives the AI a quick, accurate picture of what the ben-prototype repository is and how its four sub-projects are organized. Use at the start of any task so you never have to guess the project's purpose, structure, or conventions.
---

# Ben Prototype — Quick Project Context

## What is ben-prototype?

**Ben** is a voice-first personal assistant app — "your busy-day brain: say it, Ben files it."

The `ben-prototype` repository is the **v1 prototyping workspace** for this app. It is not a production codebase — its purpose is to design, iterate, and validate Ben's screens and interactions before the real product is built.

The repo contains four separate projects:

- [`project-design/`](../../../project-design/) — Design sandbox and gallery (Vite + React + Tailwind v4)
- [`project-mobile/`](../../../project-mobile/) — Mobile implementation of Ben (Expo + React Native), ported from `project-web` — **the active development focus**
- [`project-web/`](../../../project-web/) — Web implementation of Ben (Vite + React + Tailwind v4) — now a **reference/frozen** baseline, expected to drift out of date
- [`project-backend/`](../../../project-backend/) — Node.js backend for Ben (Express 5 + TypeScript + Zod)

> **Where work happens now:** active feature work has moved to **`project-mobile`**. `project-web` is treated as the original reference implementation the mobile port was derived from and is **no longer actively maintained**, so expect it to gradually fall behind mobile. New features and changes should target `project-mobile` (and `project-backend` when the API needs to change) unless the user explicitly says otherwise. The shared `project-backend` API still serves both clients.

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

> **Status: reference / frozen.** This was the first real implementation of Ben and the source the mobile port was derived from. Active development has since moved to [`project-mobile`](#project-mobile), so `project-web` is **no longer actively maintained** and is expected to drift out of date relative to mobile. Treat it as the original reference for behavior and API usage, not as the place to add new features (unless the user explicitly asks to change the web app).

**Purpose:** The original web implementation of Ben — routing and Google/Firebase authentication are wired up, and it consumes the `project-backend` API to drive working feature screens, including a working chat experience with the Ben agent, a collaborative task workspace, and a navigation menu for browsing captured tasks, notes, and reminders (with item detail and settings).

### Key directories

- `src/api/` — Backend API client layer: HTTP client, route definitions, request/response contracts, and models
- `src/pages/` — Feature screens (one folder per page, each with its own `components/` and `hooks/`)
- `src/layout/` — Shared UI primitives and cross-page hooks (e.g. API request / pagination hooks)
- `src/core/` — App wiring: router, entry point

It shares the same stack as `project-design` but is a completely separate project (with Firebase added for auth). New feature work no longer lands here — it now targets `project-mobile`.

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

## project-mobile

> **Status: active development focus.** This is where new features and changes now land. It started as a port of `project-web`, but going forward mobile and web will diverge — mobile moves ahead while web stays frozen as the reference baseline.

**Purpose:** The mobile implementation of Ben — a React Native (Expo) port of `project-web`. It reuses the platform-agnostic layers (API client/contracts, Zustand/Jotai state, React Query hooks, the voice state machine, design tokens) and re-implements the presentation and platform-specific pieces (UI primitives, navigation, audio, auth, storage) natively. It consumes the same `project-backend` API and covers the same flows: Google auth, chat with the Ben agent, the task workspace, and the navigation menu (tasks/notes/reminders with detail + settings), plus local notifications for reminders.

### Key directories

- `app/` — Expo Router file-based routes (`index` login, `(protected)/` group with `chat`, `tasks/[taskId]`, `menu`, plus the auth-guard `_layout`)
- `src/api/` — Backend API client layer (ported from web; client rewritten for native token handling and `FormData`)
- `src/pages/` — Feature screens (`login`, `chat`, `task-workspace`, `menu`), each with its own `components/`, `hooks/`, `stores/`
- `src/layout/` — Shared UI primitives, composite components, cross-page hooks, global stores, and utils
- `src/storage/` — Native persistence: `expo-secure-store` (token, with in-memory sync cache) + AsyncStorage (user)
- `src/services/` — Platform-integration boundary (e.g. `notifications-service.ts`, the sole importer of `expo-notifications`); a convention new to mobile (not present in `project-web`)
- `src/core/` — App wiring: env, query client, routes, Firebase, auth bootstrap

### Stack

Expo SDK 54 · React Native 0.81 · React 19 · Expo Router (file-based) · NativeWind v4 (Tailwind v3) · Zustand · Jotai · TanStack Query · axios · Firebase + `@react-native-google-signin/google-signin` (auth) · `expo-audio` (audio) · `expo-secure-store` + AsyncStorage · `expo-notifications` · `react-native-reanimated` + `react-native-gesture-handler` · `lucide-react-native`

---

## Source of truth documents

- [`docs/design.md`](../../../docs/design.md) — full design system: color palette, typography, spacing, brand voice, component descriptions.
- [`docs/data-model.md`](../../../docs/data-model.md) — domain data model for Ben.
- [`docs/api-endpoints.md`](../../../docs/api-endpoints.md) — backend API endpoint reference.
- [`docs/assemblyai-transcription.md`](../../../docs/assemblyai-transcription.md) — reference for the AssemblyAI audio transcription integration.
- [`docs/vercel-ai-sdk.md`](../../../docs/vercel-ai-sdk.md) — reference for the Vercel AI SDK + Gemini agent integration.
- [`docs/google-auth.md`](../../../docs/google-auth.md) — reference for the Google/Firebase authentication flow.

For deeper context on conventions, workflows, and design rules, use the [`context-get-project-design-context`](../context-get-project-design-context/SKILL.md) skill.
