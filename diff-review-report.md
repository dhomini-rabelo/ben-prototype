# Diff Review Report — Workspace finished overlay

Decision document consolidating the two standards-review reports
(`.claude/reports/diff-review-1.md`, `.claude/reports/diff-review-2.md`) for the
`workspace-finished` completion-overlay change in `project-web`.

The change adds: a new `WorkspaceDoneOverlay` toast, the `line-through`/`opacity-60`
done treatment on text/todo content, the "reopen to keep editing" composer copy, and
the page integration. No correctness bugs were found. All findings are convention-level.

## Findings and recommendations

### Medium

| # | File / line | Issue | Recommendation |
| --- | --- | --- | --- |
| 1 | `todo-content/todo-list-item.tsx:53,57` | The `finished` branch applies the **exact same class literal** (`text-on-surface-variant line-through`) already applied by the `done` branch — a duplicated literal that can drift. | **implement** — collapse to a single shared condition, e.g. `const isMuted = done || finished;` then apply the muted classes once. Low-risk, removes duplication. |
| 1b | `todo-content/todo-list-item.tsx:11` | `finished` is a third boolean (`done`, `diff`, `finished`) — the front-end preference favors collapsing booleans into one state param. | **skip** — a full `state`/variant refactor of an existing shared row is broader than this task and would churn the `diff`/`done` API. The class-dedup in #1 captures the practical win. |

### Low

| # | File / line | Issue | Recommendation |
| --- | --- | --- | --- |
| 2 | `todo-content/todo-content.tsx:4` | `cn` import is placed **after** the `@/pages/...` imports; siblings put `@/layout` before `@/pages`. eslint has no `import/order` rule, so `lint:fix` won't fix it. | **implement** — move the `cn` import above the `@/pages` imports for consistency. Trivial. |
| 3 | `text-content.tsx:32`, `todo-content.tsx:20` | Both re-derive `task.status === "finished"` although the page passes `readOnly`. | **skip** — intentional: `readOnly = isFinished \|\| hasPendingDiff`, but the strike-through must apply **only** when finished (not on pending-diff). Re-reading `task.status` from the already-cached `useWorkspaceTask` is the single source of truth and avoids conflating two concepts or threading a new prop through `page.tsx` (out of scope). |
| 4 | `workspace-footer.tsx:31` | Placeholder copy `"reopen to keep editing"` differs in casing/ellipsis from `"Ask Ben to edit…"`. | **skip** — `"reopen to keep editing"` is taken **verbatim** from the `project-design` `workspace-finished` spec; matching the design is correct. |
| 5 | `workspace-done-overlay.tsx:7,9` | `text-on-primary` set on the wrapper `<div>` and repeated on the child `Typography` (which inherits color). | **implement** — drop the redundant `text-on-primary` on the `Typography` child. Cosmetic cleanup. |

## Recommended to implement

- **#1** — dedupe the muted/line-through class literal in `todo-list-item.tsx`.
- **#2** — fix the `cn` import ordering in `todo-content.tsx`.
- **#5** — drop the redundant `text-on-primary` on the overlay `Typography`.

## Recommended to skip

- **#1b** (boolean→variant refactor), **#3** (re-derive finished — intentional), **#4** (copy matches design).
