---
name: task-add-coding-pattern-or-design
description: Create one or more new coding designs or coding patterns and register them in the right skill. Use when the user wants to capture a structural/architectural convention (coding design) or a code-level convention (coding pattern) so future work stays consistent.
---

# Add Coding Pattern or Design Skill

## Overview

This skill turns a described convention into a documented **coding design** or **coding pattern**, places it in the correct location, and registers it so the relevant skill can discover it later. It supports creating several designs and patterns in a single run.

Use the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill to shape the tone, structure, and formatting of every file you create or edit.

## Step 1 — Classify each convention

For every convention the user describes, decide which type it is:

- **Coding design** — a **structural / architectural** convention. It defines how files, folders, layers, or modules are organized and composed (e.g. page structure, folder hierarchy, layer boundaries).
- **Coding pattern** — a **code-level** convention. It defines how code is written within a file (e.g. naming, component declaration, props strategy, control flow).

When unsure whether something is a design or a pattern, ask the user with `AskUserQuestion` instead of guessing.

## Step 2 — Decide where it lives

### Coding design

1. Create the file at `.claude/skills/code-get-coding-designs/designs/{design-name}.md` (kebab-case).
2. Register it in [`code-get-coding-designs/SKILL.md`](../code-get-coding-designs/SKILL.md) by adding a bullet block with **Purpose**, **When to Use**, and **Coding structures** (the relative path to the new file).

### Coding pattern

A coding pattern goes to **one of two places**:

- **Append to [`general-coding-practices.md`](../code-write-code/general-coding-practices.md)** when it is a small, atomic code rule that needs only a short description and a wrong/correct example (like naming or destructuring rules). No registration step is needed — this file is already loaded by `code-write-code`.
- **Create a separate file** at `.claude/skills/code-write-code/coding-patterns/{pattern-name}.md` (kebab-case) when the pattern is larger, has multiple sections or examples, or covers a distinct topic. Then register it under **Coding Patterns** in [`code-write-code/SKILL.md`](../code-write-code/SKILL.md) with a **When to Use** line and a markdown link to the file.

If it is unclear whether a pattern is small enough for `general-coding-practices.md` or deserves its own file, ask the user.

## Step 3 — Write the content

Match the existing files:

- Coding design files describe layout and composition with headings, fenced directory trees, and `tsx` examples (see [`page-structure.md`](../code-get-coding-designs/designs/page-structure.md)).
- Coding pattern files use a short heading per rule, with **wrong way / correct way** code blocks (see [`react-components.md`](../code-write-code/coding-patterns/react-components.md) and [`general-coding-practices.md`](../code-write-code/general-coding-practices.md)).
- Write everything in **English** with self-explanatory code and no inline comments beyond `// Wrong way` / `// Correct way` markers.

## Step 4 — Handle multiple at once

When the user provides several conventions:

1. Classify each one independently (design vs pattern).
2. Group them by destination (designs folder, coding-patterns folder, `general-coding-practices.md`).
3. Create or edit each file.
4. Register every new standalone file in its owning `SKILL.md`.
5. Report a short summary listing each convention, its type, and where it was written.

## Requirements

- File and folder names use **kebab-case**; the `name` frontmatter (for skills) matches its directory.
- Never duplicate an existing design or pattern — search the target folders first and extend the existing file when the convention already partially exists.
- Always register standalone files in the correct `SKILL.md`; never leave a new file undiscoverable.
- Keep each file focused on a single subject.

## Registration examples

### Coding design entry in `code-get-coding-designs/SKILL.md`

```md
- **Form Structure Patterns**:
  - Purpose: Define how forms are organized into fields, sections, and submit handlers.
  - When to Use: Use when creating or refactoring forms to keep structure consistent.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/form-structure.md`
```

### Coding pattern entry in `code-write-code/SKILL.md`

```md
#### Error Handling Patterns

- When to Use: Whenever you need to handle and surface errors consistently.
- Coding pattern: [Error handling patterns](./coding-patterns/error-handling.md)
```
