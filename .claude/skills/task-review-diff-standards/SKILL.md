---
name: task-review-diff-standards
description: Orchestrate a review of the current git diff against the project's standards. A main agent splits the changed files across up to 5 review sub-agents (3 recommended), each reports how the changes could be improved, the main agent writes a decision document, and asks the user with AskUserQuestion before implementing any improvement.
disable-model-invocation: true
---

# Review Diff Against Standards

## Overview

Use this skill to review the changes already applied to the project (the **git diff**) and check whether they follow the project's conventions and design patterns. You act as an **orchestrator agent**: you split the changed files across a few review **sub-agents**, each evaluates its assigned files and returns an improvement report, then you consolidate everything into a single **decision document** and ask the user — with `AskUserQuestion` — which improvements to implement before touching any code.

The flow has five stages:

1. **Collect the diff** — gather the changed files and their diffs.
2. **Group and dispatch** — split the changed files across **up to 5** sub-agents (**3 recommended**).
3. **Review in parallel** — each sub-agent reports how its files could be improved.
4. **Write the decision document** — consolidate the reports into one document with a recommendation per item.
5. **Ask before implementing** — use `AskUserQuestion` to confirm which improvements to apply, then implement them.

## When to use

- After applying changes, when you want a consistency check against the project's patterns before committing.
- When the diff spans several files or projects (`project-design`, `project-web`, `project-backend`) and a single pass would be too shallow.
- When you want an explicit, user-approved list of improvements instead of silently rewriting the code.

## Workflow

### Stage 1 — Collect the diff

1. Run `git status` and `git diff` (include staged changes with `git diff --staged`) to list every changed file and its content.
2. If there are **no changes**, stop and tell the user there is nothing to review.
3. Group the changed files by **project** (`project-design`, `project-web`, `project-backend`) and by **concern**, so related files are reviewed together.

### Stage 2 — Group and dispatch to sub-agents

1. Split the changed files into **review groups**. Use **at most 5** groups and **prefer 3**.
2. Each group must hold **related files** — same project and same concern when possible — so a sub-agent reviews a coherent slice.
3. Never assign the **same file** to two sub-agents.
4. If there are few changes, use **fewer** sub-agents (even one) — do not pad the count.

### Stage 3 — Review in parallel

1. Create the `.claude/reports/` folder if it does not exist.
2. Spawn **one sub-agent per group**, launched together so they run in parallel.
3. Give each sub-agent the prompt below, listing the exact files and diffs it owns and the **exact report path** it must write.
4. Each sub-agent **writes its report** to `.claude/reports/diff-review-{n}.md` (n = 1..5, one per group) **and** returns the same report as its response. It does **not** change any code.

#### Sub-agent prompt

````
/code-get-project-context

Review the following changes from the current git diff and evaluate whether they follow the project's standards, conventions, and design patterns.

Files and diffs you own:

{list of files and their diffs}

Write your report to: {report-path}

Use the skills `code-get-coding-designs` and `code-write-code` to learn the patterns the codebase follows, and read the surrounding code so your judgment is based on the real conventions — NO GUESSING.

For each file, report:
- **Follows the standard** — what is already consistent with the project.
- **Deviates from the standard** — where the change breaks a convention or pattern, with the concrete file and line, and the pattern it should follow.
- **Suggested improvement** — what to change and why, with a severity of `high` | `medium` | `low`.

Write your report to the report path above AND return the same report as your response. Do NOT change any code.
````

### Stage 4 — Write the decision document

1. As the **orchestrator**, read every sub-agent report.
2. Consolidate them into a single markdown document at the repository root named `diff-review-report.md`.
3. Shape the document with the [`utils-write-documentation`](../utils-write-documentation/SKILL.md) conventions.
4. For **each** suggested improvement, add your **recommendation**: `implement` or `skip`, with a short rationale. Be explicit about what you think is worth doing and what is not.
5. Group items by severity and by project so the user can scan them quickly.

### Stage 5 — Ask before implementing

1. Use the `AskUserQuestion` tool to ask which improvements to implement. Offer the items you recommend (`implement`) as options, and let the user pick a subset.
2. Do **not** change any code until the user answers.
3. Implement only the **approved** improvements, using the `code-get-coding-designs` and `code-write-code` skills to keep the code consistent.
4. After implementing, run the lint and type-check commands in each affected project:

```bash
cd /path/to/project && npm run lint:fix
cd /path/to/project && npx tsc --noEmit
```

5. Report back what was implemented and what was skipped.

## Rules

- Write the sub-agent reports and the decision document in **English**.
- Use **at most 5** sub-agents; **3 is the recommended** default. Use fewer when the diff is small.
- Sub-agents **only review** — they write their own review report to `.claude/reports/diff-review-{n}.md` and never change code.
- Never assign the same changed file to more than one sub-agent.
- The decision document is saved at the **repository root** as `diff-review-report.md`.
- Always ask with `AskUserQuestion` **before** implementing any improvement — never implement straight from the reports.
- Base every finding on the real code and conventions — **NO GUESSING**.
- Do **not** include a "Summary" or "Conclusion" section in the decision document.
