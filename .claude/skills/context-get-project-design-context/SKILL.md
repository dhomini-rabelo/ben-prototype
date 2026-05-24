---
name: context-get-project-design-context
description: Load the intent, purpose, and conventions of the ben-prototype project so the user can write short prompts without re-explaining what the project is, where things live, or how to extend it.
disable-model-invocation: true
---

# Ben Prototype — Project Context

## Overview

This repository is a **design prototyping workspace** for an app called **Ben** — a voice-first assistant ("your busy-day brain — say it, Ben files it").

Two distinct concerns live in the same repo:

1. **The Ben app being designed** — screens like Login, Chat, etc.
2. **The "Design Gallery"** — a Google-Stitch-style meta-tool that lists every Ben screen as a live mobile preview card.

Both run inside the same Vite + React + Tailwind v4 project at [project-design/](../../../project-design/).

## Source documents — read before designing

These three files are the canonical brief for Ben. **Read them before any visual, UX, or copy decision** — do not rely on memory of what's "Ben-like." If a request touches design tokens, screen structure, mood, product behavior, or copy, open the relevant file first.

- [docs/design.md](../../../docs/design.md) — the **design system source of truth**: full color palette, typography scale, rounded/spacing tokens, brand voice ("Modern and Human", "Linear-adjacent" precision softened with warmth), layout philosophy (Fixed and Centered, max 480px, strict 8px grid), elevation strategy (tonal layers, no heavy shadows), and component descriptions (primary button, inline error bands, optimistic capture cards, composer with press-and-hold mic, ledger peek, quiet loading states). The frontmatter tokens here are what got ported into [global.css](../../../project-design/src/core/global.css) — when adding new tokens, mirror them here first.
- [docs/prd-to-ux/2026-05-23-ben-prototype/01b-ux-philosophy.md](../../../docs/prd-to-ux/2026-05-23-ben-prototype/01b-ux-philosophy.md) — the **organizing metaphor**: "Chat with a Live Ledger." Single chat surface + persistent glanceable ledger drawer with three tabs (Reminders / Tasks / Notes), peek strip showing "Up next: {title} in 2h". Explains how every PRD feature maps to UI (mic composer at bottom, inline capture cards in chat, drawer peek above composer, clarifying questions as plain messages, etc.). Use this when deciding *where a feature goes* on screen.
- [docs/prd-to-ux/2026-05-23-ben-prototype/03-design-direction.md](../../../docs/prd-to-ux/2026-05-23-ben-prototype/03-design-direction.md) — **mood, tone, and the hard color guardrail**. Friend-tone copy, modern-but-human, never bubbly or clinical. **Critical guardrails:** Ben is *not* monochrome and *not* Linear's blue — the palette must be **vivid-but-adult** (considered greens, warm corals, deep ambers, friendly purples). Must-have affordances: dominant press-and-hold mic, **optimistic capture cards (no spinners between speech-end and confirmation)**, always-visible ledger peek that does not collapse on scroll.

When the user gives a short prompt like "add a chat screen" or "design the ledger drawer," the answer lives in these three files combined.

## What the project represents

- A **fidelity sandbox**: each Ben screen is implemented as a real React route so it can be opened, scaled into a phone-shaped iframe in the gallery, and iterated on without leaving the workspace.
- A **design system in formation**: shared primitives (Typography, Button) and theme tokens (colors, font sizes, animations) are extracted as they get reused across screens.
- A **mobile-first viewer**: every Ben screen targets a 390×844 phone viewport (iPhone-14 class).

## Stack

- Vite 8 + React 19
- react-router v7
- Tailwind CSS v4 (theme via `@theme` in [global.css](../../../project-design/src/core/global.css))
- `tailwind-merge` (configured in [cn.ts](../../../project-design/src/core/cn.ts) to recognise custom font-size tokens)
- `lucide-react` for icons

## Directory conventions

- [project-design/src/pages/Home/page.tsx](../../../project-design/src/pages/Home/page.tsx) — the **Design Gallery** itself. Pages/Components tabs, dark dotted background, phone-shaped cards.
- [project-design/src/pages/app/](../../../project-design/src/pages/app/) — actual **Ben app pages**, one file per screen (e.g. `login.tsx`). Route is `/app/<name>`.
- [project-design/src/layout/components/ui/](../../../project-design/src/layout/components/ui/) — **reusable UI primitives** (e.g. `button.tsx`, `typography.tsx`). One component per file.
- [project-design/src/core/](../../../project-design/src/core/) — app-wide wiring: `main.tsx` (router), `global.css` (theme), `cn.ts` (className merger), `screens.ts` (gallery registry).

## How to add a new Ben screen

1. Create `project-design/src/pages/app/<name>.tsx` exporting a named React component.
2. Register the route in [main.tsx](../../../project-design/src/core/main.tsx) at `/app/<name>`.
3. Add an entry to `PAGES` in [screens.ts](../../../project-design/src/core/screens.ts): `{ id, title, file: "/app/<name>" }`.
4. The gallery picks it up automatically and renders it in a 390×844 iframe card.

## How to add a reusable component

1. Create `project-design/src/layout/components/ui/<name>.tsx`.
2. Use the `cn()` helper from [cn.ts](../../../project-design/src/core/cn.ts) when composing classes.
3. Lean on existing theme tokens (`text-wordmark`, `text-button`, `bg-primary`, `text-on-primary`, etc.) defined in [global.css](../../../project-design/src/core/global.css).

## Design rules

- **Mobile-first.** Default to a 390-wide layout. Avoid hard `min-height` constraints that exceed 844px (they cause iframe scroll in the gallery).
- **Use theme tokens over arbitrary values** when one exists. Font-size tokens registered with `tailwind-merge`: `wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`.
- **Reusable primitives stay generic.** No baked-in `w-full`, `max-w-*`, or page-specific spacing — apply those at the call site via `className`.
- **No 100% HTML fidelity required.** Earlier screens started as static HTML mockups; React ports may simplify or improve them.

## Mandatory project rules (from CLAUDE.md)

- **No guessing.** If a file, name, or workflow isn't obvious, ask via `AskUserQuestion`.
- **After any task**, run from inside [project-design/](../../../project-design/):
  ```bash
  npm run lint:fix
  npx tsc --noEmit
  ```

## When to use this skill

Invoke at the start of any session where the user gives a short prompt that touches the Ben app, the gallery, or shared UI — for example:

- "Add a Chat screen."
- "Extract this into a reusable component."
- "Update the gallery layout."

After loading this context, proceed with the user's actual request.
