# Prompt Insights — 2026-06-06

## Summary

- Total prompts: 28
- nada: 16
- correction: 6
- skill: 4
- prompt-reference: 2

## Slash-command tally

| Command | Count |
|---|---|
| /code-get-project-context | 3 |
| /task-add-prompt | 2 |
| /task-multiple-plans-auto-approval | 1 |
| /task-update-project-context | 1 |
| /task-scan-coding-patterns-and-designs | 1 |
| /task-harvest-prompt-history | 1 |

---

## Entries

### 1780750140.md
- Summary: Asks why a server-side error during chat showed no frontend feedback and whether a chat-error state is needed.
- Category: nada
- Reason: One-off diagnostic question, no reusable rule or workflow.

### 1780750314.md
- Summary: Plan to implement OpenRouter via Vercel AI SDK with gpt-120-oss, including research on adapter, on-prem router spec, and fastest providers (excluding Cerebras).
- Category: prompt-reference
- Recommendation: Keep as a reference template for "research + multi-part implementation plan" prompts (combines targeted research directives with a concrete planning goal).
- Suggested destination: prompt-reference template — proposed name `research-then-plan-integration`.

### 1780750447.md
- Summary: "let's go with Failed message bubble" — picks an option for the chat-error UI.
- Category: nada
- Reason: Trivial one-off decision/answer.

### 1780751170.md
- Summary: `/code-get-project-context` + asks whether RELATORIO-STATUS-COMPONENTES-E-TELAS.md is up to date.
- Category: nada
- Reason: Slash invocation + one-off status question (already covered by task-update-project-context).

### 1780751742.md
- Summary: Asks to add a console.log to see which tools are used and the API response.
- Category: nada
- Reason: One-off debugging request.

### 1780751956.md
- Summary: "fix and then tell me the next step to implement".
- Category: nada
- Reason: Trivial continuation instruction.

### 1780752082.md
- Summary: `/task-multiple-plans-auto-approval` + "create a plan to implement this next step".
- Category: nada
- Reason: Slash invocation with trivial follow-up.

### 1780753161.md
- Summary: Use createID instead of new ID; entity foreign keys must be an ID class (not string); fix all wrong id typings across the project.
- Category: correction
- Recommendation: Already captured in memory (id-typing-conventions.md) and listed as an existing memory fact. No new asset needed.
- Suggested destination: already-captured (drop).

### 1780753770.md
- Summary: Functions like loadOwnedNote/loadOwnedReminder/loadOwnedTask are pointless since the repository get can double-query `{ id, userId }`.
- Category: correction
- Recommendation: Generic rule — wrong-way: create per-entity ownership loader helpers; correct-way: use the repository get operation with a compound `{ id, userId }` query to enforce ownership. Add as a backend domain/repository practice.
- Suggested destination: general-coding-practices.md (or backend-domain-structure design).

### 1780754492.md
- Summary: `/code-get-project-context` + create a plan to refactor `project-web/.../menu/` so it follows the project's code patterns.
- Category: nada
- Reason: One-off refactor planning request, no reusable shape beyond existing planning skills.

### 1780755738.md
- Summary: Proposes splitting menu categories (menu-list, menu-tasks) into separate components and moving them to layout/components/.
- Category: nada
- Reason: One-off design discussion specific to the menu.

### 1780755881.md
- Summary: `/task-add-prompt` — requests a skill where Claude acts as orchestrator: take git diff, split into max 5 (rec. 3) subagents that each evaluate specific files against project patterns and return improvement reports; orchestrator produces a final doc and uses AskUserQuestion before implementing.
- Category: skill
- Recommendation: update-existing — this is the genesis of `task-review-diff-standards`. Already implemented; no new skill needed. Note the orchestrator+subagent+report pattern.
- Suggested destination: already-captured (task-review-diff-standards) → drop.

### 1780757050.md
- Summary: More menu improvements — remove export-only index.ts; use a store for current target/view with goBackToMenu to avoid prop drilling; don't load all tasks/notes/reminders at the root, lazy-load deeper.
- Category: correction
- Recommendation: Two generic rules. (1) export-only files — already captured (no-export-only-files memory). (2) NEW: avoid prop drilling shared UI state (current target/view) by using a feature store; and don't eagerly load list data at a container root — defer loading to inner components that actually need it (load-on-interaction).
- Suggested destination: general-coding-practices.md or web-feature-state-components-structure design (for the store/lazy-load rule).

### 1780757916.md
- Summary: useMenuCounts loads notes/reminders/tasks unnecessarily — only load on user click; MenuSidebar should be static; never declare 2 components in one file (menu-sidebar.tsx).
- Category: correction
- Recommendation: (1) Reinforces lazy-load-on-interaction rule above. (2) "never 2 components per file" already captured (one-component-per-file memory).
- Suggested destination: same as 1780757050 (lazy-load rule); component rule already captured → drop that part.

### 1780758307.md
- Summary: Create a plan to refactor ItemDetailSheet following project code patterns; free to move files/create folders.
- Category: nada
- Reason: One-off refactor planning request.

### 1780759819.md
- Summary: "prefer the naming `root` instead of `shell`".
- Category: correction
- Recommendation: Generic naming rule — wrong-way: name the top-level wrapper component `*-shell`; correct-way: name it `*-root`. Minor naming convention.
- Suggested destination: general-coding-practices.md (naming conventions) or page-structure/react-components pattern.

### 1780761687.md
- Summary: Edit task-multiple-plans-auto-approval SKILL.md to call a new skill when the task completes.
- Category: nada
- Reason: One-off skill-wiring edit.

### 1780763151.md
- Summary: Clarifies the new skill must be only an orchestrator (like the auto-approval skill) — invoke new/reuse prior agents rather than implement code itself, for the code-review-and-improve step.
- Category: nada
- Reason: One-off clarification refining a specific skill's behavior.

### 1780763243.md
- Summary: `/task-update-project-context`.
- Category: nada
- Reason: Pure slash invocation.

### 1780765347.md
- Summary: `/task-add-prompt` — new skill to fully scan the project and extract not-yet-added coding patterns/designs; fan out 3 subagents for backend + 3 for web, split files, each writes a report to .claude/reports/, then orchestrator merges into the pattern folders.
- Category: skill
- Recommendation: update-existing — this became `task-scan-coding-patterns-and-designs` (already in skills list). Captures the 3+3 subagent fan-out + reports + merge workflow. No new skill needed.
- Suggested destination: already-captured (task-scan-coding-patterns-and-designs) → drop.

### 1780765508.md
- Summary: Asks the difference between task-propose-coding-patterns-or-design and the new scan skill.
- Category: nada
- Reason: One-off clarifying question.

### 1780765728.md
- Summary: `/task-scan-coding-patterns-and-designs`.
- Category: nada
- Reason: Pure slash invocation.

### 1780766781.md
- Summary: Update task-review-diff-standards SKILL.md so subagents also save reports to .claude/reports.
- Category: nada
- Reason: One-off skill edit.

### 1780767046.md
- Summary: The http-presenter pattern is wrong — always use the typing `import { Serialize, WithID } from '@/modules/domain/types'` for http data transfer, and always use Omit instead of Pick so adding a new field surfaces a type error forcing it into the serializer.
- Category: correction
- Recommendation: Generic rule — wrong-way: type HTTP presenters by Picking fields manually; correct-way: use `Serialize`/`WithID` from `@/modules/domain/types` and use `Omit` (not `Pick`) so new fields raise a type error and must be added to the serializer explicitly.
- Suggested destination: http-presenter coding pattern (update the existing pattern file).

### 1780767416.md
- Summary: Describes storing prompts in .claude/prompt-history and proposes a skill that fans out subagents to analyze each prompt per day and annotate it with a "what to do" suggestion (nada / create skill / save as coding pattern / coding design / general practice / complex-prompt reference).
- Category: prompt-reference
- Recommendation: This is the design spec that birthed `task-harvest-prompt-history` (this run). Keep as a reference template for "design a prompt-mining/annotation pipeline" prompts. Skill itself already exists → don't propose a new skill.
- Suggested destination: prompt-reference template — proposed name `design-prompt-harvest-pipeline`.

### 1780767554.md
- Summary: "prossiga".
- Category: nada
- Reason: Trivial continuation.

### 1780767656.md
- Summary: "now fix the wrong presenter code".
- Category: nada
- Reason: Trivial follow-up to the http-presenter correction (1780767046).

### 1780768279.md
- Summary: "no need to use AskUserQuestion in this case, I'll answer via chat" (re: task-harvest-prompt-history).
- Category: correction
- Recommendation: Skill-behavior preference — for the harvest/review flow the user prefers to answer clarifications inline in chat rather than via the AskUserQuestion tool. Narrow and skill-specific.
- Suggested destination: task-harvest-prompt-history SKILL.md (note the inline-chat preference) — low priority.

### 1780768534.md
- Summary: `/task-harvest-prompt-history`.
- Category: nada
- Reason: This very harvest run → noise per instructions.
