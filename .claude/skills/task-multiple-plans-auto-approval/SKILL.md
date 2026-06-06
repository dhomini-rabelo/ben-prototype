---
name: task-multiple-plans-auto-approval
description: Break a task into a set of small high-level plans that run synchronously or in parallel across multiple agents, end-to-end with no user approval gates. A main agent defines the plan set, sub-agents detail and expand each plan, and everything is implemented automatically.
disable-model-invocation: true
---

# Multiple Plans (Auto Approval)

## Overview

Use this skill when a task is large enough to be split into several small plans that can be executed by multiple agents — some in parallel, some in sequence — and you want the whole flow to run **end-to-end without stopping for user approval**. Instead of producing a single plan (see `.claude/skills/task-simple-plan-lvl1/SKILL.md`), a main agent defines a **set of plans**; each plan is first detailed as a simple plan, validated for conflicts, then expanded into a deep plan by a dedicated sub-agent, and finally implemented.

This is the auto-approval variant of `.claude/skills/task-multiple-plans/SKILL.md`. The difference: **there are no `AskUserQuestion` approval gates** — the main agent proceeds automatically through every stage. Use it when the user has explicitly delegated the full task and wants it completed without intermediate check-ins.

The flow has eight stages:

1. **Define the plan set** — the main agent lists the small plans.
2. **Detail each plan as a simple plan** — sub-agents produce simple plans.
3. **Validate there is no overlap** — the main agent confirms parallel plans do not conflict.
4. **Create the deep plans** — sub-agents expand each simple plan into a deep, code-level plan.
5. **Implement each plan** — the same sub-agents implement their deep plans.
6. **Review and final feedback** — the main agent reviews, formats once, and reports back.
7. **Review the diff against standards** — run the `task-review-diff-standards` skill on the resulting changes.
8. **Propose new coding patterns or designs** — run the `task-propose-coding-patterns-or-designs` skill; the user approves the new conventions.

## When to use

- When a task spans multiple concerns (e.g. backend and frontend) that can progress independently.
- When you want several agents to work in parallel on separate parts of the same feature.
- When the work needs an explicit order: shared contracts first, then parallel implementation, then a final merge.
- When the user wants the task completed **autonomously**, without approving each step.

## File layout

All plan files live under a single task folder. Use **two-digit, zero-padded** indexes (`01`, `02`, ...) and **kebab-case** names that describe the action.

```
.claude/current-tasks/{task-name}/
  {index}-{plan-name}/
    start-briefing.md                    ← Stage 1: the high-level brief for this plan
    briefing/
      {plan-index}-{plan-name}.md        ← Stage 2: the simple plan (task-simple-plan-lvl1)
    {plan-index}-{plan-name}.md          ← Stage 4: the deep plan (Claude Code plan structure)
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
8. Proceed directly to Stage 2 — **do not ask the user to approve the plan set**.

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

### Stage 2 — Detail each plan as a simple plan

1. For each plan, spawn a **sub-agent** to produce its **simple plan** using `.claude/skills/task-simple-plan-lvl1/SKILL.md`. Give the sub-agent the plan's `start-briefing.md` as input.
2. Run sub-agents according to the plan numbers:
   - Plans with the **same number** run **in parallel** (one sub-agent each, launched together).
   - Plans with **higher numbers** run **after** lower-numbered plans finish.
3. Each sub-agent saves its simple plan at `.claude/current-tasks/{task-name}/{index}-{plan-name}/briefing/{plan-index}-{plan-name}.md`.
4. Proceed automatically — **do not ask the user to approve each simple plan**. Start dependent (higher-numbered) plans as soon as the plans they depend on finish.

### Stage 3 — Validate there is no overlap

1. The **main agent** reads every simple plan produced in Stage 2.
2. Confirm that plans meant to run in **parallel** (same plan number) do **not** touch the same files and have **no conflicts** between them.
3. If a conflict is found, resolve it — for example, move the shared work into an earlier synchronous plan, or add a final synchronous plan to merge the parallel outputs — and re-run the affected Stage 2 plans.
4. Proceed automatically once validation passes — **do not ask the user to approve the validation result**.

### Stage 4 — Create the deep plans with sub-agents

1. For each plan, spawn a **sub-agent** to produce its **deep plan**, passing the prompt below with the plan's specification (its `start-briefing.md` and the simple plan from Stage 2).
2. Run sub-agents according to the plan numbers (same number → parallel, higher number → after).
3. Each sub-agent saves its deep plan at `.claude/current-tasks/{task-name}/{index}-{plan-name}/{plan-index}-{plan-name}.md`.
4. Proceed automatically — **do not ask the user to approve each deep plan**. Start dependent (higher-numbered) plans as soon as the plans they depend on finish.

#### Sub-agent prompt

````
/code-get-project-context

Create a plan for

{plan specification}

by reading the documentation and the codebase.

Use the skills `code-get-coding-designs`, `code-write-code`, and `code-most-used-libraries` to keep the code consistent with the existing codebase and follow the best practices.

This plan runs alongside other plans in parallel, so it must only touch the files it owns and must not depend on files owned by another parallel plan. Do not include any formatting step (`npm run lint:fix`) — formatting is handled once after all parallel plans finish.

This runs in auto-approval mode. Make reasonable, well-justified decisions and proceed without asking the user. Only stop if a decision is genuinely blocking and cannot be resolved from the codebase or sensible defaults.
If these changes impact on another flow or part of the codebase, account for that impact directly in the plan.
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

### Stage 5 — Implement each plan

1. For each plan, use the **same sub-agent that created its deep plan** to implement it, passing the prompt below.
2. Run sub-agents according to the plan numbers (same number → parallel, higher number → after).
3. Do **not** start a dependent (higher-numbered) plan until the plans it depends on finish.
4. Sub-agents must **not** run formatting (`npm run lint:fix`) — formatting is run once after all parallel plans finish, to avoid conflicts.

#### Sub-agent prompt

````
Implement this plan

Make sure to follow the patterns and best practices of the codebase, using the skills `code-get-coding-designs`, `code-write-code`, and `code-most-used-libraries` to keep the code consistent with the existing codebase.

This plan runs alongside other plans in parallel, so only touch the files this plan owns and do not run formatting (`npm run lint:fix`).

This runs in auto-approval mode. Implement the plan fully and proceed without asking the user for confirmation.
````

### Stage 6 — Review and final feedback

1. After all plans are implemented, the **main agent** reviews whether everything is correct and consistent across the plans.
2. Run formatting once for the whole change with `npm run lint:fix`, and verify the build with `npx tsc --noEmit` in the affected project(s).
3. Give the user a **final feedback**: what was implemented, how the plans fit together, any follow-ups or risks.

### Stage 7 — Review the diff against standards

1. Once the task is complete, invoke the [`task-review-diff-standards`](../task-review-diff-standards/SKILL.md) skill to review the resulting git diff against the project's conventions and design patterns.
2. The main agent stays a **pure orchestrator** here — exactly as in the rest of this flow, it does **not** review or edit code itself. It **delegates** the work to sub-agents, either **spawning new sub-agents** or **reusing the sub-agents from earlier stages**, whichever it judges best (e.g. reuse the sub-agent that owns a file so it carries its context).
3. That skill orchestrates the review sub-agents and produces the `diff-review-report.md` decision document, then asks the user with `AskUserQuestion` which improvements to apply. This is an intentional final review gate — let it run as the skill defines, even though the rest of this flow is auto-approval.
4. Once the user picks the improvements, the main agent **dispatches the actual code changes to sub-agents** (new or reused) — never implementing them itself — then runs the formatting and type-check once across the affected projects.

### Stage 8 — Propose new coding patterns or designs

1. After the diff review is complete, invoke the [`task-propose-coding-patterns-or-designs`](../task-propose-coding-patterns-or-designs/SKILL.md) skill on the resulting change set to surface reusable conventions worth documenting.
2. The main agent stays a **pure orchestrator** — it does not analyze or write conventions itself. It **delegates** the work to sub-agents, either spawning new ones or reusing the sub-agents from earlier stages, whichever it judges best.
3. That skill proposes candidate coding patterns or designs and asks the user with `AskUserQuestion` which to capture. This is an intentional final approval gate — **the user approves the new patterns** — so let it run as the skill defines, even though the rest of this flow is auto-approval.
4. Once the user picks the proposals, the main agent **dispatches the creation to sub-agents**, which hand them off to the `task-add-coding-pattern-or-design` skill — never creating or registering them itself.

## Rules

- Write in **English**.
- **Auto-approval**: never use `AskUserQuestion` for approval gates — the flow runs end-to-end without stopping for user confirmation between stages. Make reasonable, well-justified decisions and proceed. Only stop if a decision is genuinely blocking and cannot be resolved from the codebase or sensible defaults.
- Keep the plan set small: each plan is a focused, single-concern unit.
- Parallel plans (same number) must **not** modify the same files.
- When parallel plans create pieces that must be joined, add a final synchronous plan to merge them.
- Each simple plan (Stage 2) must follow the format and rules of `.claude/skills/task-simple-plan-lvl1/SKILL.md`.
- Each deep plan (Stage 4) must be created with the sub-agent prompt and follow the Claude Code plan structure described in Stage 4.
- Sub-agents must **never** run formatting (`npm run lint:fix`) during parallel work — it can conflict. Formatting runs once in Stage 6.
- Use the **same sub-agent** to create the deep plan (Stage 4) and implement it (Stage 5).
- After the task is complete (Stage 7), always run the [`task-review-diff-standards`](../task-review-diff-standards/SKILL.md) skill on the resulting diff.
- After the diff review (Stage 8), always run the [`task-propose-coding-patterns-or-designs`](../task-propose-coding-patterns-or-designs/SKILL.md) skill so any reusable conventions can be captured **with the user's approval**.
- In Stages 7 and 8 the main agent acts **only as an orchestrator** — it never reviews, edits, or writes conventions itself. It delegates the review, the approved improvements, and the proposed patterns/designs to sub-agents (new ones or the ones reused from earlier stages), whichever it judges best.
- Do **not** include a "Summary" or "Conclusion" section.
