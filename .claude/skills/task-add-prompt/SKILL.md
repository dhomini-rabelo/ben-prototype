---
name: task-add-prompt
description: Create a new prompt skill at .claude/skills/task-{skill-name-in-kebab-case}/SKILL.md using the write-documentation skill as the content template.
disable-model-invocation: true
---

## Overview

Use this skill when a prompt should become a reusable Claude skill.

## Workflow

1. Identify the requested skill name and convert it to **kebab-case**.
2. Create the file at `.claude/skills/task-{skill-name-in-kebab-case}/SKILL.md`.
3. Use `.claude/skills/write-documentation/SKILL.md` to shape the structure, tone, and formatting of the new skill.
4. Write the new skill in **English** and keep it focused on one task.
5. Include YAML frontmatter, a short overview, usage guidance, and examples when helpful.

## Requirements

- Match the directory name and the `name` field in the frontmatter.
- Keep descriptions short and explicit.
- Prefer markdown headings and bullet lists.
- Avoid unrelated implementation details.

## Example Structure

```md
---
name: prompt-example
description: Create a prompt-based skill for example tasks.
---

# Example Skill

## Overview
...
```