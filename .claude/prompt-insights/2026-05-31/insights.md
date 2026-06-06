# Prompt Insights — 2026-05-31

## Summary

- **Total prompts:** 38
- **correction:** 11
- **skill:** 4
- **prompt-reference:** 2
- **nada:** 21

## Slash-command tally

| Command | Count |
|---|---|
| /code-get-project-context | 12 |
| /task-multiple-plans | 4 |
| /task-update-project-context | 2 |
| /task-add-prompt | 1 |
| /task-simple-plan-lvl1 (referenced) | 1 |
| /utils-write-documentation | 2 |

## Entries

### 1780234066.md — correction
- **Summary:** Plans must be persisted to disk under a structured path (`.claude/current-tasks/{task-name}/plans/{index}-{plan-name}/...`) per stage, not held only in memory.
- **Recommendation:** This is feedback shaping the `task-multiple-plans` skill. Ensure the skill documents the canonical persistence path layout for each stage.
- **Destination:** `task-multiple-plans` skill.

### 1780234182.md — correction
- **Summary:** In the "Example plan set", each plan should be followed by a justification (why sync / why parallel), with an example.
- **Recommendation:** Add the justification-per-plan requirement to the example section of the skill.
- **Destination:** `task-multiple-plans` skill.

### 1780234255.md — correction
- **Summary:** User clarified intent: do NOT replace the existing back/front + plan-name format with a new one; MERGE the two blocks and just add justifications. Generic lesson: when asked to "add X", augment the existing structure — never silently invent a new format.
- **Recommendation:** Capture as a CLAUDE.md / general behavior rule. Wrong-way: rewriting a doc into a new format when asked only to add a section. Correct-way: preserve existing structure and only add the requested element.
- **Destination:** CLAUDE.md rule (preserve-existing-format-when-adding) — reinforces the existing "NO GUESSING" / Intent-Check rules.

### 1780234574.md — correction (+ skill content)
- **Summary:** Refines `task-multiple-plans`: save stage-3 simple plans under `.../briefing/{plan-index}-{plan-name}.md`; add stage 4 (main agent validates no overlap/conflict between plans); add stage 5 (spawn sub-agents to create plans).
- **Recommendation:** Fold the stage 4 overlap-validation and stage 5 sub-agent plan-creation into the skill.
- **Destination:** `task-multiple-plans` skill.

### 1780234705.md — prompt-reference
- **Summary:** Provides the exact sub-agent prompt template for plan creation (invokes `/code-get-project-context`, uses `code-get-coding-designs`/`code-write-code`/`code-most-used-libraries`, asks clarifying questions via AskUserQuestion) plus the recommended Claude-Code deep-plan structure (Context, Decisions, Files to Modify/Create, Existing Code to Reuse, Code blocks, Contracts/Tables, Verification).
- **Recommendation:** Keep as a reusable reference template `multi-plan-subagent-plan-prompt`. Strong, well-structured; the deep-plan structure block is reusable beyond this one skill.
- **Destination:** prompt-reference template; the plan-structure block is also a candidate for the `task-multiple-plans` skill body.

### 1780234990.md — correction (+ skill content)
- **Summary:** Adds stage 6 (implement plan with the same agent using a given prompt) and stage 7 (review + final feedback); critically: do NOT instruct sub-agents to format files (lint/format conflicts during parallel jobs) and make sub-agents aware they run in parallel.
- **Recommendation:** Generic lesson worth elevating: parallel sub-agents must NOT run formatting/lint on shared files; defer formatting to a final sync step. Add to the skill, and consider a general parallel-execution rule.
- **Destination:** `task-multiple-plans` skill; plus general-coding-practices note on "no formatting in parallel sub-agent jobs".

### 1780238535.md — prompt-reference
- **Summary:** Well-scoped cross-project pattern-porting request: copy specific patterns from another repo into project-backend/project-web (HttpStatus enum over magic numbers; findManyWithPagination + findManyWithCursorPagination; `{ items, hasMore, nextCursor }` use-case response shape; web api-client/hooks/api-routes/models in separate files).
- **Recommendation:** Good reference for "port-patterns-from-reference-repo" tasks. Note: the individual rules (HttpStatus enum, cursor-pagination response shape) are already captured in patterns/practices, but the structured porting prompt itself is a reusable shape.
- **Destination:** prompt-reference template `port-patterns-from-reference-repo`.

### 1780240376.md — correction
- **Summary:** No `export all` (barrel) in `backend/modules/utils`; split into separate files (types, http, etc.). Request/Response contract types belong in `api/contracts/` and must be named with `RequestData` / `ResponseData` suffixes.
- **Recommendation:** Two rules: (1) already covered by existing "no export-only/barrel files" memory fact — reinforce. (2) NEW: contract types live in `api/contracts/` and end in `RequestData`/`ResponseData`.
- **Destination:** general-coding-practices.md (contract-types-naming-and-location) + existing no-barrel memory fact.

### 1780256744.md — correction
- **Summary:** When splitting a component into multiple components, apply the `page-structure` design pattern.
- **Recommendation:** Reinforces existing `page-structure` design + code-get-coding-designs usage; not novel enough alone. Border-line nada, kept because it ties component-splitting to the page-structure design.
- **Destination:** no new asset; reinforces `page-structure` design.

### 1780257095.md — correction
- **Summary:** After splitting, the old monolithic component file must be deleted (not left alongside the new ones), and new components moved into the proper `components/{component-name}` folder.
- **Recommendation:** Generic lesson: when refactoring/splitting, remove the original file and place new units in the conventional folder — don't leave dead duplicates.
- **Destination:** general-coding-practices.md (remove-original-after-split rule).

### 1780240490.md — nada
- Trivial follow-up ("delete index.ts and update imports"), one-off mechanical action.

### 1780258257.md — correction
- **Summary:** All file names in project-web must be kebab-case (rename camelCase files).
- **Recommendation:** Codify kebab-case as the file-naming convention for project-web.
- **Destination:** general-coding-practices.md / CLAUDE.md (kebab-case file names in project-web). Aligns with the existing CLAUDE.md kebab-case naming guidance.

### 1780258491.md — correction
- **Summary:** Update the `page-structure` design's file-name pattern (to kebab-case).
- **Recommendation:** Ensure the `page-structure` design documents kebab-case file naming consistently.
- **Destination:** `page-structure` design.

### 1780259549.md — prompt-reference / skill-trigger
- **Summary:** Combined `/task-multiple-plans` + `/code-get-project-context` to add the AI agent: integrate Vercel AI SDK, first write a doc via `/utils-write-documentation` BEFORE planning, target gemini-flash-lite.
- **Recommendation:** Reinforces a recurring workflow shape: "write library docs via utils-write-documentation before planning an integration". Worth noting as a planning convention.
- **Destination:** note in `task-multiple-plans` skill: "for new library integrations, generate docs via utils-write-documentation before planning". (Pattern repeats in 1780280510.md.)

### 1780260597.md — skill (create-new)
- **Summary:** Fan out 5 sub-agents to search the web on different sources about a topic, saving each research result to `.claude/pesquisas/{tema}`.
- **Recommendation:** create-new skill `parallel-web-research` — orchestrate N parallel web-search sub-agents over distinct sources and persist results to a fixed path. (Note: a `deep-research` skill exists in the harness, but this repo-specific variant with fixed output path is distinct.)
- **Destination:** new skill `parallel-web-research`.

### 1780262447.md — correction / workflow
- **Summary:** "still happening — search on internet about the proper fix" — directs the AI to web-search for the correct fix rather than guessing.
- **Recommendation:** Generic lesson: when a fix doesn't work and the cause is unclear, search the web for the proper fix instead of repeated guessing. Aligns with NO GUESSING.
- **Destination:** general-coding-practices.md / CLAUDE.md (search-web-when-stuck rule).

### 1780264633.md — correction
- **Summary:** A single use-case file doing two things should be two separate use-cases; each must use the use-case interface at `project-backend/src/modules/domain/use-case.ts`.
- **Recommendation:** Reinforces existing `use-case-structure` pattern; adds the rule that one use-case = one responsibility and must implement the shared use-case interface.
- **Destination:** `use-case-structure` coding pattern.

### 1780264757.md — correction
- **Summary:** "you did add the use-case interface for the other existing use cases" — when introducing a shared interface, apply it consistently to all existing use-cases, not just the new one.
- **Recommendation:** Generic lesson: when adopting a shared interface/abstraction, retrofit all existing siblings for consistency.
- **Destination:** general-coding-practices.md (apply-shared-interface-consistently).

### 1780264956.md — correction
- **Summary:** A non-component helper file (`use-chat-messages.ts`) should be moved to a utils location.
- **Recommendation:** Generic lesson: generic/reusable helpers belong in a utils location, not co-located with a single feature. Minor; reinforces structure conventions.
- **Destination:** no new asset; reinforces structure designs.

### 1780279626.md — correction
- **Summary:** Fix `task-multiple-plans`: stage-1 proposal plans were not being saved; save to `.claude/current-tasks/{task-name}/{index}-{plan-name}/start-briefing.md` and remove the `/plans/` folder from the path.
- **Recommendation:** Correct the path scheme in the skill (drop `/plans/`, rename briefing → start-briefing for stage 1).
- **Destination:** `task-multiple-plans` skill.

### 1780280510.md — prompt-reference / skill-trigger
- **Summary:** `/task-multiple-plans` to implement remaining screens; transcription via AssemblyAI; web-research AssemblyAI first and write a doc via `/utils-write-documentation` before implementing.
- **Recommendation:** Same recurring convention as 1780259549.md — "research + write docs before implementing an external integration". Reinforces the note proposed for `task-multiple-plans`.
- **Destination:** `task-multiple-plans` skill (research-and-doc-before-integration convention).

## Notes on nada (pre-filtered)

The following are pure slash-command invocations with no reusable instruction, trivial one-liners, or one-off mechanical requests:
1780197527 (doc-update one-off), 1780197565 (one-off model review), 1780197683/1780197714 (one-off naming tweak Q&A), 1780197915 (/task-update-project-context only), 1780233802 (the original skill-creation request — already realized as the task-multiple-plans skill; captured indirectly), 1780235144 (slash-only), 1780240490 (mechanical delete), 1780258014 ("fix it"), 1780258362 (one-off chat bug), 1780258541 ("go ahead"), 1780258976 (one-off UI tweak), 1780259265 (slash-only), 1780259704 (one-off status table), 1780262143 (numbered acks), 1780262312 ("fix it"), 1780262868 (one-off login bug), 1780264881 (one-off TS error), 1780256744-pair partial, etc.

Note: 1780233802 is the genesis prompt for the now-existing `task-multiple-plans` skill; logged here for traceability but not re-proposed since the skill already exists.
