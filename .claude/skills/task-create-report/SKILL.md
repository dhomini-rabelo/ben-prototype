---
name: task-create-report
description: Generate a report on a requested subject and save it as a markdown file at the repository root, shaped with the utils-write-documentation skill.
disable-model-invocation: true
---

# Create Report Skill

## Overview

Use this skill when the user asks for a **report** about any aspect of the project (status, components, screens, architecture, etc.). It gathers the relevant information from the repository, writes a markdown file at the **repository root**, and formats the content using the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill.

## Workflow

1. **Confirm the subject** — identify what the report is about from the user's request. If the subject or scope is ambiguous, use `AskUserQuestion` to clarify before writing anything.
2. **Gather the information** — search and read the relevant files so the report reflects the real state of the code. Do **not** guess workflows, file names, or business logic.
3. **Load formatting conventions** — invoke the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill to shape the structure, tone, and markdown formatting of the report.
4. **Write the report** as a markdown file at the **repository root** (`./`), following the naming convention below.
5. **Tell the user** the path of the created file once it is written.

## Requirements

- The file **must** be created at the repository root, not inside a sub-project, unless the user explicitly asks for a different location.
- Always apply the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) conventions to the report content.
- Base every statement on information found in the repository. **NO GUESSING** — if a fact cannot be verified, leave it out or flag it as unknown.
- Write the report in the same language the user used in their request.
- Use a descriptive, kebab-case file name ending in `.md` (e.g. `report-screen-status.md`). Match an existing report's naming pattern if one is already present at the root.

## Example

User request:

```
/task-create-report status of the components and screens
```

Result:

- A markdown file such as `report-components-and-screens-status.md` is created at the repository root.
- Its content is organized with headings, lists, and bold terms per the `utils-write-documentation` conventions.
- The report only describes components and screens that actually exist in the codebase.
