---
name: task-update-project-context
description: Refresh the code-get-project-context skill AND the two repository reports (RELATORIO-FUNCIONALIDADES.md and RELATORIO-STATUS-COMPONENTES-E-TELAS.md) by scanning git history and the current code, so all three stay in sync with the real state of the repo.
---

# Update Project Context Skill

## Overview

Use this skill to keep three documents in sync with the real state of the repository:

1. **`.claude/skills/code-get-project-context/SKILL.md`** — the **high-level** "what is this repo and how is it organized?" context loader.
2. **`RELATORIO-FUNCIONALIDADES.md`** (repo root) — the **detailed** report of what is implemented and testable today.
3. **`RELATORIO-STATUS-COMPONENTES-E-TELAS.md`** (repo root) — the **detailed** status report comparing the design spec (`project-design`) against the real implementation (`project-web`).

The skill reads what has changed since the context skill was last modified, then updates each document at its own level of detail: high-level for the context skill, fully detailed for the two reports.

## Workflow

### Phase 1 — Detect what changed

1. **Get the context skill's last-edit timestamp**

   ```bash
   git log -1 --format="%ai" -- .claude/skills/code-get-project-context/SKILL.md
   ```

2. **List commits since that timestamp**

   ```bash
   git log --since="<timestamp from step 1>" --oneline
   ```

3. **Inspect what changed** with `git diff <commit-before-timestamp>..HEAD --stat`, looking for signals at every level:
   - New/removed top-level directories or sub-projects (new `package.json` files)
   - Changes to `docs/` source-of-truth files
   - Stack version bumps (Vite, React, Tailwind, etc.)
   - New/changed backend routes, use cases, or entities
   - New/changed web screens (routes) and components
   - New/changed design screens/components in `project-design`

### Phase 2 — Update the high-level context skill

4. **Read** `.claude/skills/code-get-project-context/SKILL.md`.

5. **Rewrite the skill** applying only changes that are true at a high level:
   - Add new sub-projects if they now exist
   - Remove sub-projects or directories that no longer exist
   - Update stack versions if they changed
   - Update purpose summaries if the project intent shifted
   - Do **not** include transient details (feature names, component names, bug fixes)

6. **Write the updated file** back to `.claude/skills/code-get-project-context/SKILL.md`. If nothing structurally significant changed, leave it untouched.

### Phase 3 — Update the two reports

These reports are the **opposite altitude** from the context skill: they are detailed and must reflect feature-, endpoint-, screen-, and component-level reality. Update them whenever the scanned changes touch functionality, endpoints, screens, or components — **even if the high-level context skill did not change**. Re-scan the code (do not rely on memory), then rewrite each report to match what you find.

#### `RELATORIO-FUNCIONALIDADES.md` — what's implemented & testable

Re-scan these source-of-truth files and rewrite the report to match the current code:

- **Runnable projects & ports** — dev scripts of `project-web` / `project-backend`, and the allowed CORS origins in `project-backend/src/infra/http/app.ts`
- **Required env vars** — `project-backend/src/infra/services/env.ts`
- **Backend endpoints table** — `project-backend/src/infra/http/app.ts` (+ the handlers in `project-backend/src/infra/http/routes/`)
- **Use-case behavior** — `project-backend/src/domain/use-cases/` (auth, messages, chat, captures, topics, tasks, transcription)
- **Domain entities** — `project-backend/src/domain/entities/`
- **Agent pipeline** — `project-backend/src/infra/services/gemini-agent-provider/`
- **Web screens & flows** — `project-web/src/core/router.tsx` + `project-web/src/pages/`
- **Divergences vs docs** — compare the code against `docs/api-endpoints.md` and `docs/data-model.md`
- **Known limitations** — in-memory repositories, mocked behaviors, external API keys, etc.

#### `RELATORIO-STATUS-COMPONENTES-E-TELAS.md` — design spec vs implementation

Re-scan and recompute the readiness tables from:

- **Spec / source of truth** — `project-design/src/core/screens.ts` (screen groups, state counts, components) plus `docs/design.md`
- **Implementation** — `project-web/src/core/router.tsx` (routed screens) plus `project-web/src/pages/` and `project-web/src/layout/components/` (implemented components)
- Recompute the **summary counts** (screen groups ready/to-build, components ready/to-build), the **per-screen status table**, and the **per-component status table**.
- A screen/component is **"Pronto"** only when it exists and is routed/used in `project-web`; it is **"A construir"** when it only exists in `project-design`.

#### Finish up

7. **Update the snapshot header** of each report (the `Snapshot:` / `Data:` line — date and branch) to the current date and branch.

## Rules

- **Context skill = high-level.** Concise; answers "what is this repo and how is it organized?" — never transient detail (feature/component names, bug fixes), and never specific commits, PRs, or dates.
- **Reports = detailed and current.** They must reflect feature-, endpoint-, screen-, and component-level reality. This is intentionally the opposite altitude from the context skill.
- **Language:** write the two reports in **Portuguese** (match their existing language). The context skill stays in **English**.
- **No guessing:** never invent endpoints, screens, entities, or components — include only what is confirmed via search in the actual code.
- **Preserve structure:** keep each file's existing section order, table layouts, and link conventions (relative paths from repo root for the reports; `../../../` from the skill). Update content, don't restructure unless the underlying reality changed.
- **Scope updates to what changed:** if a document's domain didn't change, leave that document untouched. For example, if only backend endpoints changed, update `RELATORIO-FUNCIONALIDADES.md` (and possibly the context skill) but not the components/screens report.
- Preserve the existing frontmatter (`name`, `description`).
- Write in English.

## Example trigger

```
/task-update-project-context
```
