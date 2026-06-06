---
name: task-harvest-prompt-history
description: Mine the .claude/prompt-history log to surface prompts worth turning into reusable assets — behavior corrections, skill candidates, and complex prompts worth keeping as references — then route the approved ones to the existing capture skills. Use when the user wants to extract value from past prompts (not from code), either for the whole history or for the days not yet evaluated.
disable-model-invocation: true
---

# Harvest Prompt History Skill

## Overview

The `UserPromptSubmit` hook saves **every** prompt to `.claude/prompt-history/{YYYY-MM-DD}/{timestamp}.md`. That log is a goldmine of signal that code-based harvesting misses: rules the user had to correct by hand, workflows repeated across days, and well-crafted complex prompts.

This skill is a **classifier and router**, not a writer. It fans out **one subagent per day**, each subagent evaluates its day's prompts and writes an insights file, then the orchestrator consolidates everything, lets the user choose, and **hands the approved items to the existing capture skills**. It never re-implements writing logic.

It is the prompt-history counterpart of [`task-scan-coding-patterns-and-designs`](../task-scan-coding-patterns-and-designs/SKILL.md), which harvests conventions from code. This one harvests them from prompts.

Use the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) skill to shape every file you write.

## Core rules

1. The `prompt-history` log is **immutable** — it is written by a hook. **Never edit a prompt file.** All evaluation output goes to the parallel `.claude/prompt-insights/` tree.
2. **Route, never reinvent.** The destinations are existing skills — this skill only proposes and dispatches.
3. **Fan out by day**, with **at most 7 subagents running at the same time**. Dispatch in waves of 7.
4. **Be incremental by default.** A day that already has an insights file is considered evaluated — skip it unless the user explicitly asks for a full re-run.

## Step 1 — Load the "already captured" baseline

So the harvest never proposes something that already exists, read first:

1. The list of existing skills in `.claude/skills/` (folder names + each `description`) — the baseline for **skill** candidates.
2. The coding-pattern and design registries — the baseline for **correction** candidates:
   - [`code-write-code/SKILL.md`](../code-write-code/SKILL.md), its `coding-patterns/` folder, and [`general-coding-practices.md`](../code-write-code/general-coding-practices.md).
   - [`code-get-coding-designs/SKILL.md`](../code-get-coding-designs/SKILL.md) and its `designs/` folder.
3. The project `CLAUDE.md` rules — so a rule already written there is not re-proposed.
4. The existing prompt-reference acervo at `.claude/prompt-templates/` (if it exists) — the baseline for **prompt-reference** candidates.

This baseline is authoritative: a candidate already covered by it must be dropped.

## Step 2 — Build the day inventory

1. List the date folders under `.claude/prompt-history/`.
2. Drop any date that already has `.claude/prompt-insights/{date}/insights.md` (unless the user asked for a full re-run).
3. The remaining dates are the **work units** — one subagent per date.

## Step 3 — Dispatch the per-day subagents (max 7 at a time)

Dispatch the day subagents in **waves of at most 7**. Each subagent reads only its own day, evaluates the prompts, and writes exactly one insights file. Subagents are **read-and-report only** — they never edit prompt files, skills, patterns, designs, `CLAUDE.md`, or the acervo.

### Pre-filter (cheap, before classifying)

A large share of prompts are noise. Mark these as `nada` without deep analysis:

- Pure slash-command invocations (e.g. `/task-archive-current-task`), with no extra instruction.
- Trivial one-liners and filler (`minor`, `prossiga`, `ok`, `continue`).
- One-off requests tied to a single moment with no reusable shape.

Still **tally** the slash commands seen — the per-skill usage count is a useful byproduct (it shows which skills earn their keep).

### Classification (for the non-noise prompts)

Assign each remaining prompt to exactly one category:

1. **correction** — the user corrected the AI's behavior ("this pattern is wrong, always do X", "use Y instead of Z"). The highest-value category: each one is a rule born from a mistake. Extract the **generic rule** (a short wrong-way / correct-way shape when possible) and a suggested destination: `general-coding-practices.md`, a `coding-patterns/` file, a design, or a `CLAUDE.md` rule.
2. **skill** — a workflow that repeats or is clearly reusable. The recommendation **must** be one of:
   - `update-existing` — name the existing skill to extend and what to add to it.
   - `create-new` — a proposed skill name (kebab-case) and one-line purpose; note when the skill should aggregate a **set** of related prompts rather than a single one.
3. **prompt-reference** — a complex, well-structured prompt worth keeping as a reusable template / few-shot reference for writing future complex prompts. Give it a proposed name and one line on what makes it a good reference.
4. **nada** — noise or one-off (from the pre-filter or after analysis).

### Insights file each subagent writes

Write to `.claude/prompt-insights/{date}/insights.md` with:

1. A header: the date, total prompts, and the count per category.
2. A **slash-command tally** for the day (command → count).
3. One entry per non-`nada` prompt containing:
   - The source path (`.claude/prompt-history/{date}/{timestamp}.md`).
   - A one-line summary of the prompt.
   - Its **category**.
   - Its **recommendation** (the extracted rule, the skill action, or the template note — per the category above).
   - Its suggested **destination**.

## Step 4 — Subagent prompt template

```md
You are evaluating ONE day of prompt history to find prompts worth turning into
reusable assets. The prompt-history log is immutable — do NOT edit any file in it.

Day folder (read every .md in it): {day-folder}

Already captured (drop anything matching these):
{baseline-summary}

Steps:
1. Pre-filter noise (pure slash commands, trivial one-liners, one-offs) → category `nada`,
   but still tally the slash commands you see.
2. Classify each remaining prompt as one of: correction | skill | prompt-reference.
   - correction: extract the generic rule (wrong-way/correct-way when possible) + destination.
   - skill: recommend `update-existing` (name the skill + what to add) OR `create-new`
     (proposed kebab-case name + purpose; note if it should aggregate a SET of prompts).
   - prompt-reference: proposed name + why it is a good reference.
3. Write ONE report to {insights-path} with: header (date, totals, per-category counts),
   the slash-command tally, and one entry per non-`nada` prompt (source path, one-line
   summary, category, recommendation, destination).

Do not edit any skill, pattern, design, CLAUDE.md, the acervo, or any prompt file.
Only write the insights file.
```

## Step 5 — Consolidate across days (orchestrator)

After every day's insights file exists:

1. Read all files under `.claude/prompt-insights/`.
2. **De-duplicate** candidates that recur across days and merge overlapping ones.
3. **Rank by recurrence** — a correction or workflow that shows up on several days or in several prompts is a stronger candidate than a one-off. Recurrence is the key signal that only the consolidation step can see.
4. Drop anything already covered by the Step 1 baseline.
5. Group survivors by destination: coding pattern / design / `general-coding-practices.md` / `CLAUDE.md` rule / skill (new or existing) / prompt-reference acervo.

## Step 6 — Let the user choose

Present the consolidated, recurrence-ranked proposals **in the chat** as a numbered list (one line per proposal: rank, category, destination, one-line rationale) and ask the user to reply with which ones to act on. **Do not use `AskUserQuestion` here** — the user answers directly in the chat. **Never create or edit anything in this step.** Include the slash-command usage summary so the user can spot skills to retire.

## Step 7 — Route the approved proposals

Hand each approved proposal to its owner — do not write the asset here:

- **correction → coding pattern / design / general-practice** — hand to [`task-add-coding-pattern-or-design`](../task-add-coding-pattern-or-design/SKILL.md). Submit them all together for a single run.
- **correction → project rule** — when the rule is about how the AI should behave (not how code is shaped), add it to `CLAUDE.md`, and consider a `feedback`-type memory entry. Confirm with the user first.
- **skill / create-new** — hand to [`task-add-prompt`](../task-add-prompt/SKILL.md), passing the source prompt(s) as the seed idea.
- **skill / update-existing** — edit the named existing `SKILL.md` directly to fold in the new capability.
- **prompt-reference** — write the template to `.claude/prompt-templates/{name}.md` (create the folder if missing) and keep a one-line pointer in `.claude/prompt-templates/INDEX.md`. Store the **generic, reusable shape** of the prompt, not the raw one-off text.

## Step 8 — Report a summary

Finish with a short summary listing: how many prompts were evaluated, the per-category counts, every asset that was created or updated and where, the days now covered under `.claude/prompt-insights/`, and the slash-command usage tally.

## Requirements

- The `prompt-history` log is read-only — never edit a prompt file.
- Fan out one subagent per day; never more than 7 running at once.
- Subagents only read and write their own insights file; all creation/routing belongs to the orchestrator and the owner skills.
- Never propose something already in the Step 1 baseline.
- File and folder names use **kebab-case**; all written content is in **English**.
- Always let the user choose before routing — never auto-create assets.
- Prefer recurring candidates; a one-off prompt is rarely worth an asset.
