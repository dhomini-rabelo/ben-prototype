---
name: task-propose-coding-patterns-or-designs
description: Evaluate the output of a finished task and propose new coding patterns or coding designs worth capturing. Use after implementing a feature or change to surface reusable conventions, then hand the approved ones to the task-add-coding-pattern-or-design skill.
disable-model-invocation: true
---

# Propose Coding Patterns or Designs Skill

## Overview

This skill reviews the code produced by a task and proposes **new coding designs or coding patterns** that are worth documenting for future consistency. It only proposes and lets the user choose — the actual creation is delegated to the [`task-add-coding-pattern-or-design`](../task-add-coding-pattern-or-design/SKILL.md) skill.

Use the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill to shape any written proposal summaries.

## Step 1 — Gather the task output

Identify the code to evaluate:

- The files created or changed during the current task (use the diff or the list of touched files).
- If the scope is unclear, ask the user which files, folders, or change set to evaluate with `AskUserQuestion`.

## Step 2 — Load what already exists

Avoid proposing conventions that are already documented. Read the current registries first:

- Coding designs: [`code-get-coding-designs/SKILL.md`](../code-get-coding-designs/SKILL.md) and the files in its `designs/` folder.
- Coding patterns: [`code-write-code/SKILL.md`](../code-write-code/SKILL.md), the files in its `coding-patterns/` folder, and [`general-coding-practices.md`](../code-write-code/general-coding-practices.md).

## Step 3 — Analyze for candidate conventions

Inspect the output for conventions that are reusable and **not yet documented**:

- **Coding design candidates** — structural / architectural decisions: new folder layouts, layer boundaries, file composition, module organization.
- **Coding pattern candidates** — code-level decisions: naming choices, declaration style, props strategies, control flow, error handling.

Prefer conventions that:

1. Appear more than once, or are likely to repeat in future tasks.
2. Made a clear, deliberate choice between alternatives.
3. Would help keep the codebase consistent if written down.

Skip one-off decisions and anything already covered by an existing design or pattern.

## Step 4 — Present proposals

For each candidate, present a short proposal containing:

- A clear **name** (kebab-case).
- Its **type**: coding design or coding pattern.
- A one-line **rationale** and a reference to where it appears in the output.
- For patterns, a suggested **destination**: `general-coding-practices.md` (small atomic rule) or a separate `coding-patterns/` file.

Use `AskUserQuestion` to let the user select which proposals to create. Never create anything in this step.

## Step 5 — Hand off approved proposals

Pass the approved proposals to the [`task-add-coding-pattern-or-design`](../task-add-coding-pattern-or-design/SKILL.md) skill, which classifies, writes, and registers each one. Submit all approved proposals together so they are created in a single run.

## Requirements

- Only **propose** here; all file creation and registration belongs to `task-add-coding-pattern-or-design`.
- Do not propose conventions that already exist in the registries.
- Keep each proposal focused on a single convention.
- Always let the user choose which proposals to act on before handing off.

## Example proposal

```md
Proposed conventions from this task:

1. api-client-structure — coding design
   Rationale: API calls are organized into client/routes/contracts/models layers under src/api/.
   Seen in: src/api/

2. boolean-flag-naming — coding pattern → general-coding-practices.md
   Rationale: New booleans use is/should/does prefixes consistently.
   Seen in: src/pages/captures/hooks/use-capture.ts
```
