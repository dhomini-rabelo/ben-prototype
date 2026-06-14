# Prompt Insights — 2026-05-30

- Total prompts: 9
- correction: 1
- skill: 2
- prompt-reference: 0
- nada: 6

## Slash-command tally

| Command | Count |
| --- | --- |
| /code-get-project-context | 1 |

## Entries

### 1780195030.md
- Summary: "Search the internet how to do this (Firebase auth init) correctly, then fix the code" — a research-then-apply-fix workflow over a selected code block.
- Category: skill
- Recommendation: create-new — `code-research-and-fix` — research the correct/idiomatic approach for a selected snippet via web search, then apply the corrected code. Aggregates the recurring "find the right way online, then fix" shape; should bundle with code-write-code conventions.
- Suggested destination: new skill `code-research-and-fix`

### 1780191558.md
- Summary: Replace the DynamoDB-shaped repository interface (passing index in queries) with a more flexible Postgres/Mongo repository interface from an external package, updating affected use-cases.
- Category: skill
- Recommendation: create-new — `code-swap-abstraction-interface` — migrate the codebase from one interface/adapter contract to another reference interface and propagate the change to all consumers (use-cases, adapters). Reusable shape; one-off in detail but recurring in form.
- Suggested destination: new skill `code-swap-abstraction-interface` (alternatively fold guidance into code-write-code)

### 1780193610.md
- Summary: "You forgot to add createdAt and to update avatarUrl in the codebase" — user pointing out that a data-model/doc change was not fully propagated into the entity code.
- Category: correction
- Recommendation: Rule — when a field/model change is requested, propagate it to ALL layers (docs, domain entity, adapters/providers, mappers), not just the file in focus. Wrong-way: edit only the doc or one file. Correct-way: apply the rename/add field consistently across docs + entity + every adapter that constructs it.
- Suggested destination: general-coding-practices.md
