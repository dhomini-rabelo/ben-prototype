---
name: code-get-project-context
description: Gives the AI a quick, accurate picture of what the ben-prototype repository is, how its four sub-projects are organized, and the design rules every Ben screen follows. Use at the start of any task so you never have to guess the project's purpose, structure, conventions, or design system.
---

# Ben Prototype — Quick Project Context

## What is ben-prototype?

**Ben** is a voice-first personal assistant app: "your busy-day brain: say it, Ben files it."

The `ben-prototype` repository is the **v1 prototyping workspace** for this app. It is not a production codebase. Its purpose is to design, iterate, and validate Ben's screens and interactions before the real product is built.

The repo contains four separate projects:

- [`project-design/`](../../../project-design/) — Design sandbox and gallery (Vite + React + Tailwind v4) — **where a screen is drawn and reviewed before it is implemented**
- [`project-mobile/`](../../../project-mobile/) — Mobile implementation of Ben (Expo + React Native), ported from `project-web` — **the active development focus**
- [`project-web/`](../../../project-web/) — Web implementation of Ben (Vite + React + Tailwind v4) — now a **reference/frozen** baseline, expected to drift out of date
- [`project-backend/`](../../../project-backend/) — Node.js backend for Ben (Express 5 + TypeScript + Zod)

> **Where work happens now:** feature work lands in **`project-mobile`** (and `project-backend` when the API needs to change). `project-design` stays in the loop as the step *before* implementation: a change is drawn there first so it can be seen without paying the cost of building it. `project-web` is the original reference implementation the mobile port was derived from and is **no longer actively maintained**, so expect it to gradually fall behind mobile. The shared `project-backend` API still serves both clients.

---

## project-design

**Purpose:** A fidelity sandbox for designing and reviewing every Ben screen. Each screen state is a real React route, so it can be opened, scaled into a phone-shaped iframe in the gallery, and iterated on without leaving the workspace.

Two things live here: the **Ben screens** themselves, and the **Design Gallery**, a Google-Stitch-style meta-tool that lists every screen as a live mobile preview card.

### Key directories

- `src/pages/app/` — Ben screen states (one file per state)
- `src/pages/components/` — Preview routes for each reusable UI primitive
- `src/layout/components/ui/` — Shared UI primitives (Button, Typography, …)
- `src/pages/Home/page.tsx` — The Design Gallery itself (Pages tab groups states under their parent page; Components tab is the design-system overview)
- `src/layout/utils/` — Shared helpers, including the `cn()` className merger (imported via the `@/layout/utils/cn` alias)
- `src/core/` — App wiring: router (`main.tsx`), gallery registry (`screens.ts`), theme (`global.css`)

### Stack

Vite 8 · React 19 · react-router v7 · Tailwind CSS v4 · `lucide-react`

To add a screen state or a primitive here, follow [Design Gallery workflows](#design-gallery-workflows).

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

### Design brief — read before any visual, UX, or copy decision

These are the canonical brief for Ben. Open the relevant one before deciding; do not rely on memory of what is "Ben-like."

- [`.claude/agents-docs/design-advisor/design.md`](../../agents-docs/design-advisor/design.md) — the **design system source of truth**: full color palette, typography scale, rounded/spacing tokens, brand voice ("Modern and Human", "Linear-adjacent" precision softened with warmth), layout philosophy (Fixed and Centered, max 480px, strict 8px grid), elevation strategy (tonal layers, no heavy shadows), and component descriptions (primary button, inline error bands, optimistic capture cards, composer with press-and-hold mic, ledger peek, quiet loading states). The frontmatter tokens here are what got ported into [`global.css`](../../../project-design/src/core/global.css). When adding a new token, mirror it here first.
- [`docs/prd-to-ux/2026-05-23-ben-prototype/01b-ux-philosophy.md`](../../../docs/prd-to-ux/2026-05-23-ben-prototype/01b-ux-philosophy.md) — the **organizing metaphor**: "Chat with a Live Ledger." Single chat surface plus a persistent glanceable ledger drawer with three tabs (Reminders / Tasks / Notes), peek strip showing "Up next: {title} in 2h". Maps every PRD feature to UI. Use this to decide *where a feature goes* on screen.
- [`docs/prd-to-ux/2026-05-23-ben-prototype/03-design-direction.md`](../../../docs/prd-to-ux/2026-05-23-ben-prototype/03-design-direction.md) — **mood, tone, and the hard color guardrail**. Friend-tone copy, modern but human, never bubbly or clinical. Ben is *not* monochrome and *not* Linear's blue: the palette is **vivid-but-adult** (considered greens, warm corals, deep ambers, friendly purples). Must-have affordances: dominant press-and-hold mic, **optimistic capture cards with no spinner between speech-end and confirmation**, always-visible ledger peek that does not collapse on scroll.
- [`docs/prd-to-ux/2026-05-23-ben-prototype/04-screen-prompts/`](../../../docs/prd-to-ux/2026-05-23-ben-prototype/04-screen-prompts/) — one file per page (`01-sign-in.md`, `02-chat-surface.md`, `03-inline-capture-cards.md`, `04-task-workspaces.md`, `05-menu-sidebar.md`), each describing that page's states. This is where the state list for a screen comes from.

### Technical reference

- [`docs/data-model.md`](../../../docs/data-model.md) — domain data model for Ben.
- [`docs/api-endpoints.md`](../../../docs/api-endpoints.md) — backend API endpoint reference.
- [`docs/assemblyai-transcription.md`](../../../docs/assemblyai-transcription.md) — the AssemblyAI audio transcription integration.
- [`docs/vercel-ai-sdk.md`](../../../docs/vercel-ai-sdk.md) — the Vercel AI SDK + Gemini agent integration.
- [`docs/google-auth.md`](../../../docs/google-auth.md) — the Google/Firebase authentication flow.

---

## Design rules

These apply to every Ben screen, in `project-design` and `project-mobile` alike.

- **Use theme tokens over arbitrary values** when a token exists. Font-size tokens: `wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`. They live in [`global.css`](../../../project-design/src/core/global.css) (design/web) and in [`typography.tsx`](../../../project-mobile/src/layout/components/ui/typography.tsx) + [`tailwind.config.js`](../../../project-mobile/tailwind.config.js) (mobile).
- **Reusable primitives stay generic.** No baked-in `w-full`, `max-w-*`, or page-specific spacing. Apply those at the call site via `className`.
- **Anchor chat messages to the composer.** Messages and capture cards sit just above the chat input, not floating at the top of the viewport. A tall empty gap between the last bubble and the mic reads as dead air, especially in short exchanges like inline captures.
- **`ActiveTaskPeek` placement.**
  - **Render it only when there are active tasks.** There is no "empty" variant on any screen: with zero in-progress tasks the peek is absent. It exists to surface real work, not to advertise the concept.
  - **Keep it at the bottom of the footer stack.** It never sits above a chat message bubble, a `ChatBanner` (permission-denied, error), or any inline notice. In practice: a screen showing a banner above the input renders no peek at all. The peek appears only in clean states where the sole thing above the input is the peek itself.

---

## Design Gallery workflows

These are specific to `project-design`. A "screen" in Ben is a *page* with one or more *states* (empty, loading, populated, recording, error, …). Each state is its own file and route so it can be previewed independently in the gallery.

### Gallery-specific layout constraints

- **Target a 390x844 phone viewport** (iPhone-14 class). Avoid hard `min-height` constraints above 844px; they cause iframe scroll in the gallery.
- **Chat-shell pages anchor to the composer via a fixed class string.** Any page rendered inside [`_chat-shell.tsx`](../../../project-design/src/pages/app/_chat-shell.tsx) (all `chat-*.tsx` and `capture-*.tsx` states except the centered `chat-empty` welcome) wraps its message `<section>` in `flex flex-1 flex-col justify-end gap-4 pt-2`.

### Add a screen state

1. Create `project-design/src/pages/app/<page>-<state>.tsx` exporting a named PascalCase React component (e.g. `ChatRecording`). The filename pattern is `<page>-<state>.tsx`; the route mirrors it at `/app/<page>-<state>`. The state list for a page comes from its file in [`04-screen-prompts/`](../../../docs/prd-to-ux/2026-05-23-ben-prototype/04-screen-prompts/).
2. Register the route in [`main.tsx`](../../../project-design/src/core/main.tsx) at `/app/<page>-<state>`.
3. Add it to `PAGES` in [`screens.ts`](../../../project-design/src/core/screens.ts):
   - Page already exists: push into its `states` array — `{ id: "<state>", title: "<State>", file: "/app/<page>-<state>" }`.
   - Brand-new page: add a `ScreenPage` object — `{ id, title, states: [...] }`.
4. The gallery picks it up automatically: a section per page, a card per state.

### Add a reusable component

Primitives are **always separated** from screens: own folder, own preview route, own card on the Components tab. Extract a primitive to `ui/` and register it rather than inlining it in a screen file.

1. Create the primitive at `project-design/src/layout/components/ui/<name>.tsx`, one component per file.
2. Compose classes with the `cn()` helper from [`cn.ts`](../../../project-design/src/layout/utils/cn.ts), imported as `@/layout/utils/cn`, leaning on existing theme tokens.
3. **Update the Components page.** The Components tab is the design-system overview, so it stays in sync with what is in `ui/`:
   - Create `project-design/src/pages/components/<name>.tsx` rendering the meaningful variants (default, with-icon, disabled, full-width) via the shared `ComponentPreview` wrapper in [`_preview.tsx`](../../../project-design/src/pages/components/_preview.tsx). Cover what someone scanning the gallery needs to understand the primitive, not every prop.
   - Register the route in [`main.tsx`](../../../project-design/src/core/main.tsx) at `/components/<name>`.
   - Add an entry to `COMPONENTS` in [`screens.ts`](../../../project-design/src/core/screens.ts): `{ id: "<name>", title: "<DisplayName>", file: "/components/<name>" }`.
4. If you introduced a new design token (color, font size, spacing, radius), update [`design-tokens.tsx`](../../../project-design/src/pages/components/design-tokens.tsx) so the overview reflects it.

---

For the code architecture patterns of each project (backend domain layout, web API client, mobile services layer, page structure), use the [`code-get-coding-designs`](../code-get-coding-designs/SKILL.md) skill.
