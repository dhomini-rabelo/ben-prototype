---
name: task-archive-current-task
description: Move all files from .claude/current-tasks/ into a dated history folder under .claude/history/, following the project naming convention.
disable-model-invocation: true
---

# Archive Current Task Skill

## Overview

Use this skill when the current task is complete and its files should be archived. It moves everything in `.claude/current-tasks/` into a new folder inside `.claude/history/` named after today's date and the task title.

## Naming Convention

History folders follow this pattern:

```
YYYY-MM-DD_task-title-in-kebab-case
```

Examples:
- `2026-05-07_migrate-trial-30-to-7-days`
- `2026-05-07_remove-post-limit-for-trial-companies`

## Workflow

1. Read `.claude/current-tasks/task.md` and extract the task title from the `# Task:` heading.
2. Convert the title to **kebab-case**: lowercase, spaces replaced with hyphens, special characters removed.
3. Get today's date in `YYYY-MM-DD` format from the `currentDate` context.
4. Build the destination folder name: `YYYY-MM-DD_kebab-case-title`.
5. Create the destination folder at `.claude/history/<folder-name>/`.
6. Move all files from `.claude/current-tasks/` into the destination folder.
7. Leave `.claude/current-tasks/` empty (do not delete the directory).

## Requirements

- Use the `currentDate` from context to get today's date — do not infer or guess it.
- Do not rename the files themselves; only the parent folder is named after the task.
- If `.claude/current-tasks/task.md` does not exist, ask the user via `AskUserQuestion` what title to use before proceeding.
- Do not modify the content of any file — only move them.

## Example

Given today is `2026-05-08` and `task.md` starts with:

```md
# Task: Upgrade AI text generation model from Gemini 3 Pro to Gemini 3.1 Pro
```

The destination folder will be:

```
.claude/history/2026-05-08_upgrade-ai-text-generation-model-from-gemini-3-pro-to-gemini-3-1-pro/
```
