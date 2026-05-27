---
name: task-update-project-context
description: Refresh the code-get-project-context skill by scanning git history since the skill was last edited and rewriting it to reflect the current state of the repo at a high level.
---

# Update Project Context Skill

## Overview

Use this skill to keep the `code-get-project-context` skill in sync with the real state of the repository. It reads what has changed since the skill file was last modified, derives only high-level structural or purpose changes, and rewrites the skill accordingly.

## Workflow

1. **Get the skill's last-edit timestamp**

   ```bash
   git log -1 --format="%ai" -- .claude/skills/code-get-project-context/SKILL.md
   ```

2. **List commits since that timestamp**

   ```bash
   git log --since="<timestamp from step 1>" --oneline
   ```

3. **Inspect what changed** — focus on structural signals, not every diff:
   - New top-level directories or sub-projects added/removed
   - New `package.json` files (new projects)
   - Changes to `docs/design.md` or other source-of-truth files
   - Stack version bumps (Vite, React, Tailwind, etc.)
   - New major feature areas visible from directory names

   ```bash
   git diff <commit-before-timestamp>..HEAD --stat
   ```

4. **Read the current skill** at `.claude/skills/code-get-project-context/SKILL.md`.

5. **Rewrite the skill** — apply only changes that are true at a high level:
   - Add new sub-projects if they now exist
   - Remove sub-projects or directories that no longer exist
   - Update stack versions if they changed
   - Update purpose summaries if the project intent shifted
   - Do **not** include transient details (feature names, component names, bug fixes)

6. **Write the updated file** back to `.claude/skills/code-get-project-context/SKILL.md`.

## Rules

- Keep the skill concise and high-level. It should answer "what is this repo and how is it organized?" — not "what was recently added."
- Never mention specific commits, PRs, or dates inside the skill content.
- If nothing structurally significant changed, do not edit the file.
- Preserve the existing frontmatter (`name`, `description`).
- Write in English.

## Example trigger

```
/task-update-project-context
```
