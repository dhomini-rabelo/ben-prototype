# Prompt Insights — 2026-06-02

- Total prompts: 17
- correction: 3
- skill: 3
- prompt-reference: 1
- nada: 10

## Slash-command tally

(no slash commands invoked this day)

## Entries

### 1780447897.md
- Summary: Asks how to name files that contain only API-route calls and how to better name those functions.
- Category: correction
- Recommendation: Capture naming convention — files containing only API-route call wrappers should be named/located consistently (e.g. under `api/client`), and their functions should carry a suffix making the API call explicit rather than generic verbs.
- Suggested destination: `web-api-client-structure` design (file location/naming) + `general-coding-practices.md` (function naming for API wrappers).

### 1780448613.md
- Summary: `listActiveTasks` is too generic to signal it is an API call; user wants a suffix or marker.
- Category: correction
- Recommendation: Rule — API-call functions must be disambiguated from plain domain helpers via a suffix/prefix that signals the network call (wrong: `listActiveTasks`; correct: a name that marks it as an API request).
- Suggested destination: `general-coding-practices.md` (naming) and/or `web-api-client-structure` design.

### 1780449793.md
- Summary: `api/models` files must contain only the model; response/payload types belong in `api/responses`.
- Category: correction
- Recommendation: Rule — keep model files limited to the model definition; move response/DTO shapes to a dedicated `api/responses` folder.
- Suggested destination: `web-api-client-structure` design.

### 1780449925.md
- Summary: Rejects a custom `buildTaskWorkspacePath` helper; wants the same route-declaration pattern as `api/routes.ts`.
- Category: correction
- Recommendation: Rule — do not introduce ad-hoc path builders; declare routes following the established `api/routes.ts` pattern.
- Suggested destination: `web-api-client-structure` design.

### 1780450818.md
- Summary: A component file grew too large; break it into smaller files inside a per-component folder and move the compound-export object to `index.tsx`.
- Category: skill
- Recommendation: create-new — `task-split-component-into-folder` — split an oversized React component into one-file-per-subcomponent inside a `component-name/` folder, with the compound `index.tsx` aggregating exports. Aggregates this prompt with 1780451113.
- Suggested destination: new skill (could also reinforce `page-structure` / component-folder design).

### 1780451113.md
- Summary: Move a component's context file into a `contexts/` subfolder within the component folder and rename it.
- Category: correction
- Recommendation: Rule — within a component folder, colocate context files under a `contexts/` subfolder with consistent naming.
- Suggested destination: component-folder design (related to `page-structure`) or `general-coding-practices.md`.

### 1780452980.md
- Summary: Move every `useAPICursorPaginated`/`useAPIPaginated`/`useAPIRequest` call into per-route shared hooks under `layout/hooks/api` (one file per route, e.g. `use-message-list-data.ts`), then adopt them and drop now-redundant prop drilling.
- Category: skill
- Recommendation: create-new — `extract-shared-api-data-hook` — extract inline API-data-fetching calls into per-route shared hooks under `layout/hooks/api` to enable React Query context sharing and eliminate prop drilling of fetched data.
- Suggested destination: new skill; reinforces `api-data-hooks` coding pattern.

### 1780453201.md
- Summary: Asks how to improve a specific hook (`use-chat.ts`) by applying the project's coding patterns, plus general improvements.
- Category: skill
- Recommendation: create-new — `review-hook-against-project-patterns` — given a hook file, audit it against the project's coding patterns/designs and propose pattern-aligned plus general refactors. Aggregates this prompt with 1780453218 (same shape, different file).
- Suggested destination: new skill (or extend `code-get-coding-designs` usage into a review workflow).

### 1780453218.md
- Summary: Same request as 1780453201 for `use-task-workspace.ts` — improve the hook applying project patterns.
- Category: skill
- Recommendation: create-new — fold into `review-hook-against-project-patterns` (see 1780453201); confirms the workflow repeats across files.
- Suggested destination: same new skill.

### 1780453990.md
- Summary: A value computed via a plain function call (`diffSummary(useWorkspaceTask())`) should instead follow the project's hook pattern.
- Category: prompt-reference
- Recommendation: Keep as reference — `prefer-hook-pattern-over-helper-function` — a clear, well-scoped example prompt for converting an ad-hoc derived-value helper into the project's standard hook pattern.
- Suggested destination: prompt-reference template.

## nada (filtered, with rationale)

- 1780449339.md — one-off "move changed files to X" instruction.
- 1780449876.md — "apply this for the other files" continuation of 1780449793.
- 1780450472.md — one-off "apply minimum-props-strategies to this file" (pattern already exists).
- 1780450608.md — one-off Q&A: why useQuery vs useInfiniteQuery.
- 1780450992.md — one-off Q&A: how does useChatBannerTone work / when updated.
- 1780452617.md — trivial "improve the pattern to make organization clear" continuation.
- 1780452759.md — one-off Q&A: will moving to a shared hook cause >1 request.
- (no other slash-only or trivial one-liners present)
