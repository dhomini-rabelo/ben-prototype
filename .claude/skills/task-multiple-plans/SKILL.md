---
name: task-multiple-plans
description: Break a task into a set of small high-level plans that run synchronously or in parallel across multiple agents. A main agent defines the plan set, the user approves it, then sub-agents detail each plan and the user approves each one.
disable-model-invocation: true
---

# Multiple Plans

## Overview

Use this skill when a task is large enough to be split into several small plans that can be executed by multiple agents — some in parallel, some in sequence. Instead of producing a single plan (see `.claude/skills/task-simple-plan-lvl1/SKILL.md`), a main agent defines a **set of plans**; each plan is first detailed as a simple plan, validated for conflicts, and then expanded into a deep plan by a dedicated sub-agent.

The flow has seven stages:

1. **Define the plan set** — the main agent lists the small plans.
2. **Approve the plan set** — the user approves with `AskUserQuestion`.
3. **Detail each plan as a simple plan** — sub-agents produce simple plans.
4. **Validate there is no overlap** — the main agent confirms parallel plans do not conflict.
5. **Create the deep plans** — sub-agents expand each simple plan into a deep, code-level plan.
6. **Implement each plan** — the same sub-agents implement their deep plans.
7. **Review and final feedback** — the main agent reviews, formats once, and reports back.

## When to use

- When a task spans multiple concerns (e.g. backend and frontend) that can progress independently.
- When you want several agents to work in parallel on separate parts of the same feature.
- When the work needs an explicit order: shared contracts first, then parallel implementation, then a final merge.

## File layout

All plan files live under a single task folder. Use **two-digit, zero-padded** indexes (`01`, `02`, ...) and **kebab-case** names that describe the action.

```
.claude/current-tasks/{task-name}/
  {index}-{plan-name}/
    start-briefing.md                    ← Stage 1: the high-level brief for this plan
    briefing/
      {plan-index}-{plan-name}.md        ← Stage 3: the simple plan (task-simple-plan-lvl1)
    {plan-index}-{plan-name}.md          ← Stage 5: the deep plan (Claude Code plan structure)
```

- `{task-name}`: kebab-case name of the overall task.
- `{index}`: the plan's sequential index in the set (`01`, `02`, ...). Parallel plans (same plan number) still get **distinct folder indexes**.
- `{plan-name}`: kebab-case description of the action the plan performs.
- `{plan-index}`: the index of the plan inside its folder (`01`, `02`, ...).

## Workflow

### Stage 1 — Define the plan set

1. Act as the **main agent** that designs the overall execution.
2. Produce a list of small plans. Each plan must follow the format below.
3. Group plans that can run in **parallel** by giving them the **same plan number**.
4. Sequence dependent plans by giving them **increasing plan numbers** (lower numbers run first).
5. Ensure plans that run in parallel **never touch the same files**. When parallel work produces pieces that must be combined (e.g. new routes), add a final **synchronous plan** with a higher number whose only job is to merge them.
6. Under each plan line, add a bullet with the **justification** for why it runs synchronously or in parallel (which plans it depends on, and which files it owns).
7. Save each plan's brief to its own folder at `.claude/current-tasks/{task-name}/{index}-{plan-name}/start-briefing.md`. The brief contains the plan line (number, side, parallel/sync) and a short paragraph describing its goal and the files it owns.

#### Plan format

```
**Plan {number} [Backend | Frontend] ({parallel | sync})**: {one-line description}
```

- `{number}`: same number = runs in parallel; higher number = runs after lower numbers.
- `[Backend | Frontend]`: the side this plan belongs to.
- `({parallel | sync})`: whether the plan can run alongside others with the same number, or must run alone.

#### Example plan set

**Task:** Add a messages feature shared by backend and frontend.

---

**Plan 1 [Backend] (sync)**: Define the contracts that backend and frontend will share
- Defines the contract used during Plan 2 execution, so it must finish before anything else starts.

**Plan 2 [Backend] (parallel)**: Create the routes for messages
- Depends only on the contract from Plan 1 and touches its own route files, so it runs in parallel with the frontend.

**Plan 2 [Frontend] (parallel)**: Implement the messages screen
- Depends only on the contract from Plan 1 and touches its own screen files, so it runs in parallel with the backend.

**Plan 3 [Backend] (sync)**: Merge the new routes into the main router
- Merges the routes created in parallel into the main router; it must run alone and last to avoid file conflicts with Plan 2.

### Stage 2 — Approve the plan set

1. After defining the plan set, ask the user to approve it using the `AskUserQuestion` tool.
2. Do **not** proceed to Stage 3 until the user approves.
3. If the user requests changes, update the plan set and ask again.

### Stage 3 — Detail each plan as a simple plan

1. For each plan, spawn a **sub-agent** to produce its **simple plan** using `.claude/skills/task-simple-plan-lvl1/SKILL.md`. Give the sub-agent the plan's `start-briefing.md` as input.
2. Run sub-agents according to the plan numbers:
   - Plans with the **same number** run **in parallel** (one sub-agent each, launched together).
   - Plans with **higher numbers** run **after** lower-numbered plans finish.
3. Each sub-agent saves its simple plan at `.claude/current-tasks/{task-name}/{index}-{plan-name}/briefing/{plan-index}-{plan-name}.md`.
4. After each simple plan is produced, ask the user to approve it with the `AskUserQuestion` tool before moving on.
5. Do **not** start a dependent (higher-numbered) plan until the plans it depends on are approved.

### Stage 4 — Validate there is no overlap

1. The **main agent** reads every simple plan produced in Stage 3.
2. Confirm that plans meant to run in **parallel** (same plan number) do **not** touch the same files and have **no conflicts** between them.
3. If a conflict is found, resolve it — for example, move the shared work into an earlier synchronous plan, or add a final synchronous plan to merge the parallel outputs — and re-run the affected Stage 3 plans.
4. Report the validation result and ask the user to approve with the `AskUserQuestion` tool before moving on.

### Stage 5 — Create the deep plans with sub-agents

1. For each plan, spawn a **sub-agent** to produce its **deep plan**, passing the prompt below with the plan's specification (its `start-briefing.md` and the approved simple plan from Stage 3).
2. Run sub-agents according to the plan numbers (same number → parallel, higher number → after).
3. Each sub-agent saves its deep plan at `.claude/current-tasks/{task-name}/{index}-{plan-name}/{plan-index}-{plan-name}.md`.
4. After each deep plan is produced, ask the user to approve it with the `AskUserQuestion` tool before moving on.
5. Do **not** start a dependent (higher-numbered) plan until the plans it depends on are approved.

#### Sub-agent prompt

````
/code-get-project-context

Create a plan for

{plan specification}

by reading the documentation and the codebase.

Use the skills `code-get-coding-designs`, `code-write-code`, and `code-most-used-libraries` to keep the code consistent with the existing codebase and follow the best practices.

This plan runs alongside other plans in parallel, so it must only touch the files it owns and must not depend on files owned by another parallel plan. Do not include any formatting step (`npm run lint:fix`) — formatting is handled once after all parallel plans finish.

If you have any questions about the task, ask them before creating the plan using the tool `AskUserQuestion`
If these changes impact on another flow or part of the codebase, please ask questions to understand the impact and how to proceed.
````

#### Deep plan structure

The sub-agent's instructions for the plan to create should include the following:

> ### Follow the Claude Code plan structure
>
> The deep plan should follow the standard Claude Code plan structure. The structure below describes what such a plan typically contains — **the model has full freedom** to organize, add, drop, or reshape sections in whatever way best communicates this specific plan. The format is a guide, **not** a rigid template.
>
> A typical structure includes:
>
> - **Context** — what exists today and what the change should achieve.
> - **Decisions** — choices made and their rationale.
> - **Files to Modify / Create** — one subsection per file, with code blocks for the exact additions when useful.
> - **Existing Code to Reuse** — point at concrete files/symbols.
> - **Code blocks** — for new functions, classes, types, or snippets to add within existing files, so the user can see better the update.
> - **Contracts / Tables** — use tables for API payloads, events, status transitions, etc.
> - **Verification** — how to confirm the change works (`npx tsc --noEmit`, smoke tests, error paths). Do **not** run formatting (`npm run lint:fix`) — that is handled once after all parallel plans finish.
>
> Pick whatever best communicates each part of the plan — a table, a code block, a numbered list, etc. Prefer code blocks for concrete snippets and tables for contracts.

### Stage 6 — Implement each plan

1. For each plan, use the **same sub-agent that created its deep plan** to implement it, passing the prompt below.
2. Run sub-agents according to the plan numbers (same number → parallel, higher number → after).
3. Do **not** start a dependent (higher-numbered) plan until the plans it depends on finish.
4. Sub-agents must **not** run formatting (`npm run lint:fix`) — formatting is run once after all parallel plans finish, to avoid conflicts.

#### Sub-agent prompt

````
Implement this plan

Make sure to follow the patterns and best practices of the codebase, using the skills `code-get-coding-designs`, `code-write-code`, and `code-most-used-libraries` to keep the code consistent with the existing codebase.

This plan runs alongside other plans in parallel, so only touch the files this plan owns and do not run formatting (`npm run lint:fix`).
````

### Stage 7 — Review and final feedback

1. After all plans are implemented, the **main agent** reviews whether everything is correct and consistent across the plans.
2. Run formatting once for the whole change with `npm run lint:fix`, and verify the build with `npx tsc --noEmit` in the affected project(s).
3. Give the user a **final feedback**: what was implemented, how the plans fit together, any follow-ups or risks.

## Rules

- Write in **English**.
- Keep the plan set small: each plan is a focused, single-concern unit.
- Parallel plans (same number) must **not** modify the same files.
- When parallel plans create pieces that must be joined, add a final synchronous plan to merge them.
- Always approve with `AskUserQuestion` — for the plan set (Stage 2), per simple plan (Stage 3), after validation (Stage 4), and per deep plan (Stage 5).
- Each simple plan (Stage 3) must follow the format and rules of `.claude/skills/task-simple-plan-lvl1/SKILL.md`.
- Each deep plan (Stage 5) must be created with the sub-agent prompt and follow the Claude Code plan structure described in Stage 5.
- Sub-agents must **never** run formatting (`npm run lint:fix`) during parallel work — it can conflict. Formatting runs once in Stage 7.
- Use the **same sub-agent** to create the deep plan (Stage 5) and implement it (Stage 6).
- Do **not** include a "Summary" or "Conclusion" section.
