---
name: code-get-project-context
description: Gives the AI a quick, accurate picture of what the ben-prototype repository is and how its two sub-projects are organized. Use at the start of any task so you never have to guess the project's purpose, structure, or conventions.
---

# Ben Prototype — Quick Project Context

## What is ben-prototype?

**Ben** is a voice-first personal assistant app — "your busy-day brain: say it, Ben files it."

The `ben-prototype` repository is the **v1 prototyping workspace** for this app. It is not a production codebase — its purpose is to design, iterate, and validate Ben's screens and interactions before the real product is built.

The repo contains two separate Vite + React + Tailwind v4 projects:

- [`project-design/`](../../../project-design/) — Design sandbox and gallery
- [`project-web/`](../../../project-web/) — Mock web implementation of Ben
- Comming soon: `project-mobile/` — Real mobile implementation of Ben (not started yet)

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

**Purpose:** The real web implementation of Ben — currently in its earliest stage (essentially a Hello World placeholder).

It shares the same stack as `project-design` but is a completely separate project. Work here will grow as the design is validated in `project-design`.

---

## Source of truth documents

- [`docs/design.md`](../../../docs/design.md) — full design system: color palette, typography, spacing, brand voice, component descriptions.

For deeper context on conventions, workflows, and design rules, use the [`context-get-project-design-context`](../context-get-project-design-context/SKILL.md) skill.
