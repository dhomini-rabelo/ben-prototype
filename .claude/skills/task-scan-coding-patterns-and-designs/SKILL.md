---
name: task-scan-coding-patterns-and-designs
description: Run a full project scan with parallel subagents to discover coding patterns and coding designs that are not yet documented, then consolidate and register them. Use when the user wants to sweep the whole codebase (not just a recent diff) to capture every reusable convention that is still missing from the registries.
disable-model-invocation: true
---

# Scan Coding Patterns and Designs Skill

## Overview

This skill performs an **exhaustive scan of the existing codebase** to surface coding patterns and coding designs that are **not yet documented**. It splits the work across **parallel subagents** — each scanning a slice of the files and writing a report — and then the orchestrator consolidates every report and registers the new conventions.

It differs from [`task-propose-coding-patterns-or-designs`](../task-propose-coding-patterns-or-designs/SKILL.md), which only evaluates the diff of a finished task. This skill targets the **whole project** as it currently stands.

Use the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill to shape every file you write.

## Step 1 — Load context and the existing registries

Before scanning, the orchestrator must know the project layout and what is **already documented**, so duplicates are never proposed.

1. Load [`code-get-project-context`](../code-get-project-context/SKILL.md) to understand the projects (`project-backend`, `project-web`) and their directories.
2. Read the current registries and treat them as the **"already documented"** baseline:
   - Coding designs: [`code-get-coding-designs/SKILL.md`](../code-get-coding-designs/SKILL.md) and every file in its `designs/` folder.
   - Coding patterns: [`code-write-code/SKILL.md`](../code-write-code/SKILL.md), every file in its `coding-patterns/` folder, and [`general-coding-practices.md`](../code-write-code/general-coding-practices.md).

## Step 2 — Build the file inventory and split it

1. List the source files of each target project (`project-backend/src/` and `project-web/src/`). Exclude generated, vendored, and config noise (e.g. `node_modules`, build output, lockfiles).
2. Split each project's files into **3 balanced groups**, preferably along folder/layer boundaries so each subagent sees coherent code (e.g. backend: `domain/`, `adapters/` + `infra/`, `modules/`; web: `api/`, `pages/`, `layout/` + `core/`). Adapt the grouping to the real folder sizes.
3. You will dispatch **6 subagents total**: 3 for `project-backend` and 3 for `project-web`.

## Step 3 — Dispatch the parallel subagents

Create the `.claude/reports/` folder if it does not exist. Dispatch all 6 subagents **in parallel** (read-and-report only — they must not edit pattern folders or registries). Give each subagent:

- The **explicit list of files** it owns (its group).
- The **"already documented" baseline** from Step 1, so it skips known conventions.
- The classification rule (design vs pattern) from Step 4.
- The exact **report path** to write.

### Report path convention

Each subagent writes one report to:

- `.claude/reports/coding-conventions-backend-{n}.md` (n = 1..3)
- `.claude/reports/coding-conventions-web-{n}.md` (n = 1..3)

### Report content each subagent must produce

For every **undocumented** candidate it finds, the report lists:

1. A **name** (kebab-case).
2. Its **type**: coding design (structural/architectural) or coding pattern (code-level).
3. A one-line **rationale**.
4. The **files/locations** where it appears (with at least one path).
5. For patterns, a suggested **destination**: `general-coding-practices.md` (small atomic rule) or a standalone `coding-patterns/` file.
6. A short, **generic** illustration of the convention (placeholders, not a raw codebase dump).

## Step 4 — Classification rule (shared with every subagent)

- **Coding design** — a **structural / architectural** convention: folder layout, layer boundaries, file composition, module organization.
- **Coding pattern** — a **code-level** convention: naming, declaration style, props strategy, control flow, error handling.

Only report conventions that are **reusable**, **appear more than once or are likely to repeat**, and are **not already in the baseline**. Skip one-off decisions.

## Step 5 — Consolidate the reports (orchestrator)

After all 6 reports exist, the orchestrator:

1. Reads every report in `.claude/reports/`.
2. **De-duplicates** candidates that multiple subagents reported, and merges overlapping ones into a single convention.
3. Drops anything that, on second look, is already covered by the Step 1 baseline.
4. Groups the survivors by destination: designs folder, `coding-patterns/` folder, or `general-coding-practices.md`.

## Step 6 — Register the consolidated conventions

Hand the consolidated list to the [`task-add-coding-pattern-or-design`](../task-add-coding-pattern-or-design/SKILL.md) skill, which classifies, writes, and registers each convention in the correct location and `SKILL.md`. Submit them all together so they are created in a single run.

If any candidate's classification or destination is unclear, ask the user with `AskUserQuestion` before registering — do not guess.

## Step 7 — Report a summary

Finish with a short summary listing each registered convention, its type, and where it was written, plus the paths of the generated reports under `.claude/reports/`.

## Requirements

- Dispatch exactly **6 subagents** (3 backend, 3 web); divide files among them with no overlap.
- Subagents **only scan and write reports** — they never touch the designs/patterns folders or any `SKILL.md`.
- Never propose or register a convention already in the registries — the Step 1 baseline is authoritative.
- File and folder names use **kebab-case**.
- All written content is in **English** and documents the **generic, reusable shape**, never a raw snapshot of one file.
- Keep every report and every convention focused on a single subject.

## Subagent prompt template

```md
You are scanning a slice of the {project} project to find reusable coding
conventions that are NOT yet documented.

Files you own (scan only these):
{file-list}

Already documented (skip anything matching these):
{baseline-summary}

For every undocumented, reusable convention you find, classify it as a coding
design (structural/architectural) or a coding pattern (code-level). Then write
a report to {report-path} with, per candidate: name (kebab-case), type,
one-line rationale, files where it appears, suggested destination for patterns,
and a short generic illustration.

Do not edit any designs or patterns folders or any SKILL.md. Only write the report.
```
