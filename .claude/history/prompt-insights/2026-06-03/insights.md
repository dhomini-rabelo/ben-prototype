# Prompt Insights — 2026-06-03

- Total prompts: 6
- correction: 3
- skill: 0
- prompt-reference: 1
- nada: 2

## Slash-command tally

| command | count |
|---|---|
| /code-write-code | 1 |

(Referenced inline as `/code-write-code` in 1780486572.md; no standalone slash-command-only invocations.)

---

## Entries

### 1780486572.md
- Summary: Optimize the `useChat` hook and reduce the large number of props passed into the chat page, applying the minify-props strategy and `/code-write-code` coding patterns; output a table of each improvement and its impact (installing libs if needed).
- Category: prompt-reference
- Recommendation: Keep as a reusable template, e.g. `refactor-hook-and-reduce-props-with-impact-table`. It is a well-shaped refactor prompt: names a concrete target, references existing coding patterns, allows lib installation, and asks for a structured improvement/impact table as deliverable.
- Suggested destination: prompt-reference asset (new template).

### 1780487444.md
- Summary: User questions whether installing zustand was necessary and pushes toward using zustand.
- Category: correction
- Recommendation: Part of the state-management convention cluster (see consolidated rule below). Before adding a new state library, confirm it is necessary and prefer the project's chosen tool (zustand) for complex/local-page state.
- Suggested destination: general-coding-practices.md (consolidated with 1780487666 and 1780540869).

### 1780487666.md
- Summary: Migrate chat state to zustand; keep jotai only for simpler cross-component shared state (e.g. sharing an input string), where zustand would be overkill.
- Category: correction
- Recommendation: Establishes a clear state-library boundary rule.
  - Wrong way: Use jotai (or scattered props/atoms) for complex page/feature state with non-trivial logic.
  - Correct way: Use zustand for complex/structured feature state and actions; reserve jotai for simple shared primitives between components (e.g. a shared input string) where a full store is overkill.
- Suggested destination: general-coding-practices.md, and likely the `web-feature-state-components-structure` / `web-page-stores-structure` design docs.

### 1780540869.md
- Summary: Asks why so many props are passed to `RecordingBar` and `ChatInput`, and whether those values could be read from zustand inside the components instead.
- Category: correction
- Recommendation: Reinforces the same rule — prefer reading feature state directly from the zustand store inside components rather than prop-drilling many props through intermediate components.
  - Wrong way: Drill many props down from a parent into child components that all belong to the same feature.
  - Correct way: Have child components consume the feature's zustand store directly, passing only props that are genuinely local/parent-owned.
- Suggested destination: general-coding-practices.md (consolidated with 1780487666); reinforce in `web-feature-state-components-structure` design.

### 1780486776.md
- Summary: "aplique todas essas melhorias instalando as novas libs" — trivial continuation/approval.
- Category: nada

### 1780540423.md
- Summary: One-off request to fix a TS error ("Cannot invoke an object which is possibly 'undefined'") in a zustand store helper using `get`.
- Category: nada

---

## Consolidated correction (cluster: 1780487444, 1780487666, 1780540869)

State-management convention worth capturing as a single rule:

- Prefer **zustand** for complex/structured feature/page state and its actions; reserve **jotai** for simple shared primitives between components (e.g. a shared input string) where a full store is overkill.
- Do not add a new state library without confirming it is necessary.
- Inside feature components, read shared feature state directly from the zustand store instead of prop-drilling many props through parent components.

Suggested destination: general-coding-practices.md (plus reinforcement in `web-feature-state-components-structure` and `web-page-stores-structure` designs).
