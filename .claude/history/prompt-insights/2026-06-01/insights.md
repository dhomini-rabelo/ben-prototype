# Prompt Insights — 2026-06-01

## Summary

- Total prompts in folder: 45
- `nada` (noise / one-off / pure slash invocation): 30
- `correction`: 10
- `skill`: 3
- `prompt-reference`: 2

## Slash-command tally

| Command | Count |
|---|---|
| /code-get-project-context | 7 |
| /task-multiple-plans-auto-approval | 4 |
| /task-add-coding-pattern-or-design | 4 |
| /task-update-project-context | 3 |
| /task-add-prompt | 2 |
| /task-archive-current-task | 2 |
| /task-multiple-plans | 1 (referenced via opened-file, not invoked) |

(Several prompts combine two slash commands on the same line; each command counted once per occurrence.)

---

## Corrections

### 1780360295.md
- Summary: Move memory repositories to the infra layer; split use-cases into smaller functions (one per captureView), like `persist-captures.ts`.
- Category: correction
- Recommendation: Generic rule — repository implementations belong in the infra layer, not domain; large use-case classes should be decomposed into small, single-responsibility helper functions.
- Suggested destination: `code-get-coding-designs/designs/backend-domain-structure.md` (already partly captured by that design; reinforce the "decompose use-cases into small functions" rule there).

### 1780361535.md
- Summary: Utility functions reused across multiple use-cases must live in `project-backend/src/domain/utils`; only use-case classes may live in `domain/use-cases`. Move misplaced files.
- Category: correction
- Recommendation: Rule — `domain/use-cases` holds use-case classes only; shared util/validation functions go to `domain/utils` and `domain/validation`. (Same theme as 1780365510/1780365605/1780365797/1780365849.)
- Suggested destination: `backend-domain-structure.md` design (the domain-folder layout design these prompts ultimately produced).

### 1780361806.md / 1780362285.md
- Summary: Presenters need typed responses (referencing an external `mapper.ts` example).
- Category: correction
- Recommendation: Rule — HTTP presenters must return explicitly typed response objects, not untyped/implicit shapes.
- Suggested destination: `code-write-code/coding-patterns/http-presenter.md`.

### 1780362652.md
- Summary: Delete the comment and propose 3 better names, asking via AskUserQuestion.
- Category: correction
- Recommendation: Behavior reminder — when naming is ambiguous, surface candidate names through AskUserQuestion rather than picking silently. Already covered by CLAUDE.md AskUserQuestion rule; no new asset needed beyond noting reinforcement.
- Suggested destination: (covered by existing CLAUDE.md rule — no action).

### 1780363395.md
- Summary: The new pattern was not applied to several use-case files (captures, persist-ben-message, persist-user-message); apply consistently everywhere.
- Category: correction
- Recommendation: Behavior rule — when applying a pattern across a codebase, enumerate and cover ALL matching files; do not stop at a subset. Pair with sub-agent fan-out for completeness.
- Suggested destination: `general-coding-practices.md` (process note) or `code-write-code/SKILL.md`.

### 1780363553.md
- Summary: "Shouldn't you update the web project too?" — backend contract change left the web client unsynced.
- Category: correction
- Recommendation: Rule — when a backend response/contract changes, also update the consuming web project to match the new contract in the same task.
- Suggested destination: `general-coding-practices.md` (cross-project contract-sync rule).

### 1780363823.md
- Summary: A parallel sub-agent overwrote prior skill-file updates; re-apply the lost changes.
- Category: correction
- Recommendation: Process rule — when fanning work out to parallel sub-agents, avoid having multiple agents edit the same shared file (e.g. skill/pattern docs) to prevent clobbering; serialize shared-file edits.
- Suggested destination: `general-coding-practices.md` or the sub-agent guidance in the multiple-plans skill.

### 1780365797.md / 1780366069.md
- Summary: Design docs should NOT capture the current project state or a large concrete example; they should describe only how the structure/idea works generically.
- Category: correction
- Recommendation: Rule — coding-design and coding-pattern docs must describe the generic mechanism, not snapshot current code or embed large project-specific examples.
- Suggested destination: `task-add-coding-pattern-or-design/SKILL.md` (exactly what prompt 1780366173 then codified).

### 1780365849.md
- Summary: In the domain-structure design, "the subject is usually an entity name."
- Category: correction
- Recommendation: Clarification rule for the domain-structure design — use-case/util folders are grouped by subject, and the subject is normally an entity name.
- Suggested destination: `backend-domain-structure.md`.

### 1780366173.md
- Summary: Edit `task-add-coding-pattern-or-design` skill so generated designs/patterns represent the generic mechanism instead of current state / big project example.
- Category: correction (drives a concrete skill edit)
- Recommendation: Update existing skill `task-add-coding-pattern-or-design` to instruct generic-over-concrete authoring. (This is the actionable version of the 1780365797/1780366069 corrections.)
- Suggested destination: `task-add-coding-pattern-or-design/SKILL.md`.

---

## Skills

### 1780317884.md
- Summary: "Create a skill like task-multiple-plans but only with auto approval."
- Category: skill
- Recommendation: create-new — this is the origin of `task-multiple-plans-auto-approval`, which already exists. Drop as already-captured; noted only for provenance.
- Suggested destination: (already exists — no action).

### 1780359949.md
- Summary: Skill to create new coding patterns or coding designs (pattern → general-coding-practices.md or separate file; structural → coding design; can create several at once).
- Category: skill
- Recommendation: create-new — origin of `task-add-coding-pattern-or-design`, which already exists. Already-captured; provenance only.
- Suggested destination: (already exists — no action).

### 1780360148.md
- Summary: Skill that evaluates a task's output and proposes new coding patterns/designs to create via `/task-add-coding-pattern-or-design`.
- Category: skill
- Recommendation: create-new — origin of `task-propose-coding-patterns-or-designs`, which already exists. Already-captured; provenance only.
- Suggested destination: (already exists — no action).

---

## Prompt references

### 1780364861.md
- Summary: Detailed refactor instruction — convert a single large service file into a folder (`gemini-agent-provider/index.ts`) keeping the main class in index and extracting variables/helper functions into sibling files; "think to do a great job."
- Category: prompt-reference
- Recommendation: Good template for the "explode a large service/class file into a sub-folder structure" task. This task type was later generalized into `service-structure` design (1780365921/1780366069); keep this prompt as the concrete worked example of the request shape.
- Suggested destination: prompt-reference template named `refactor-large-file-into-subfolder`.

### 1780317500.md
- Summary: Well-structured spec of the agent design — system-prompt history topics, a single `get-history-context` tool with typed param/response, and the structured-output response shape (message, newReminders, newNotes, newTasks, historyTopic, historyTopicSummary).
- Category: prompt-reference
- Recommendation: Good reference template for specifying an LLM agent's tool + structured-output contract before implementation. Reusable shape for future agent-design prompts.
- Suggested destination: prompt-reference template named `agent-tool-and-structured-output-spec`.

---

## Notes on `nada` items

Pure slash invocations or trivial follow-ups with no reusable shape: 1780316158, 1780316391, 1780316552, 1780316769, 1780319926, 1780320067, 1780320404, 1780322982, 1780333507, 1780334957 ("go ahead"), 1780359751, 1780362251, 1780363977, 1780284605 ("one or two state objects?"), 1780318062 (task-specific answers to AI questions), 1780318985 ("how to fix streaming?"), 1780284520 (apply-pattern one-off), 1780360728 (fan-out 5 sub-agents one-off), 1780361401 (recreate one specific pattern), 1780362027 (specific response-structure pattern — already captured as use-case-response-structure), 1780363132 (remove one line + fix imports), 1780363678 (update two specific skill files), 1780364539 (route-naming one-off — covered by http-route-handler), 1780360295 also overlaps domain rules but counted under corrections. Two `<task-notification>` system messages (1780362767, 1780362903) are tool outputs, not prompts. 1780365510 / 1780365605 are the domain-structure design creation flow (covered by corrections above + existing design).
