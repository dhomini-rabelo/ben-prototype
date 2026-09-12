---
name: task-update-project-context
description: Refresh the code-get-project-context skill by scanning git history and the current code, so the repository's context loader stays in sync with the real state of the repo.
---

# Update Project Context Skill

## Overview

Use this skill to keep **`.claude/skills/code-get-project-context/SKILL.md`** in sync with the real state of the repository. That file is the high-level "what is this repo, how is it organized, and what rules does every Ben screen follow?" context loader.

The skill reads what has changed since the context skill was last modified, then updates it at that same high level.

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
   - Changes to the source-of-truth documents the context skill links to
   - Stack version bumps (Vite, React, Expo, Tailwind, etc.)
   - New/changed backend routes, use cases, or entities
   - New/changed mobile screens (routes) and components
   - New/changed design screens/components in `project-design`

### Phase 2 — Update the context skill

4. **Read** `.claude/skills/code-get-project-context/SKILL.md`.

5. **Rewrite the skill** applying only changes that are true at a high level:
   - Add new sub-projects if they now exist
   - Remove sub-projects or directories that no longer exist
   - Update stack versions if they changed
   - Update purpose summaries if the project intent shifted
   - Update which project is the **active development focus** if it moved
   - Update the **Source of truth documents** section when a brief or technical reference is added, moved, or removed — verify every linked path still resolves
   - Update the **Design rules** section when a rule governing every Ben screen changes (theme tokens, `ActiveTaskPeek` placement, chat anchoring)
   - Update the **Design Gallery workflows** section when the steps to register a screen state or a primitive change (`main.tsx`, `screens.ts`, `_preview.tsx`, the `cn()` helper path)
   - Do **not** include transient details (individual feature names, one-off bug fixes)

6. **Write the updated file** back to `.claude/skills/code-get-project-context/SKILL.md`. If nothing structurally significant changed, leave it untouched.

## Rules

- **High-level, plus the standing sections.** The context skill answers "what is this repo, how is it organized, and what rules does every Ben screen follow?". Keep it concise and free of specific commits, PRs, or dates. Its **Design rules** and **Design Gallery workflows** sections are permanent: they name components (`ActiveTaskPeek`) and files (`screens.ts`) on purpose, so refresh them in place instead of stripping them. Everything outside those sections stays free of transient detail (individual feature names, one-off bug fixes).
- **No status reports.** This repo deliberately keeps no generated status, progress, or readiness documents — `RELATORIO-FUNCIONALIDADES.md` and `RELATORIO-STATUS-COMPONENTES-E-TELAS.md` were removed on purpose. Never recreate them or add a replacement: the real state lives in the code and in git history.
- **No guessing:** never invent endpoints, screens, entities, or components — include only what is confirmed via search in the actual code.
- **Preserve structure:** keep the file's existing section order, table layouts, and link conventions (`../../../` relative paths from the skill). Update content, don't restructure unless the underlying reality changed.
- Preserve the existing frontmatter (`name`, `description`).
- Write in English.

## Example trigger

```
/task-update-project-context
```
