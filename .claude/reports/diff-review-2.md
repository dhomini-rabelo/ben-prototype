# Diff Review 2 — `finished`/`reopen` task-workspace treatment

Reviewed the staged changes for the four owned files against the project's
page-structure design and the front-end / general code preferences (loaded via
`code-get-coding-designs` and `code-write-code`). No code was changed.

Scope reviewed:

- `project-web/src/pages/task-workspace/components/text-content/text-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/todo-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/todo-list-item.tsx`
- `project-web/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`

---

## `text-content/text-content.tsx`

### Follows the standard
- Uses `cn()` from `@/layout/utils/styles` to merge conditional classes — the
  established pattern across the workspace components (`todo-list-item.tsx`).
- Import is correctly path-aliased and ordered (`@/layout` before `@/pages`),
  matching the rest of the file.
- `isFinished` derived after the `if (!task) return null` guard, so `task` is
  non-null — correct.

### Deviates from the standard
- **Duplicated derivation of "finished" state.** `text-content.tsx:32`
  computes `task.status === "finished"`, but the same component already receives
  `readOnly` (`page.tsx:112` passes `isFinished || hasPendingDiff`). The fact
  "this task is finished" is now derived in 4 places: `page.tsx:95`,
  `text-content.tsx:32`, `todo-content.tsx:20`, and `workspace-footer.tsx:20`.
  The general preference *"Apply a change across every matching file and layer …
  propagate it"* is about consistency; here the same boolean is re-derived
  instead of being passed once. The page already owns `isFinished` and threads
  `readOnly` down — the finished styling should ride the same channel rather
  than each child reaching back into `task.status`.

### Suggested improvement
- Drive the dimmed/strikethrough styling from a prop passed by the page (e.g. a
  single `finished`/state prop) instead of re-reading `task.status` inside the
  leaf. This keeps the "finished" concept owned in one place (`page.tsx`).
  Severity: **low** (works correctly; this is a cohesion/duplication concern,
  not a bug).

---

## `todo-content/todo-content.tsx`

### Follows the standard
- Uses `cn()` for the conditional `opacity-60` wrapper — consistent.
- Threads `finished={isFinished}` down to `TodoListItem`, matching the
  page-structure pattern of a container passing presentational flags to its
  child rows.

### Deviates from the standard
- **Import ordering breaks the convention.** `todo-content.tsx:4` places
  `import { cn } from "@/layout/utils/styles"` *after* the three `@/pages/...`
  imports (lines 1–3). Everywhere else in this folder (`text-content.tsx:2-5`,
  `workspace-footer.tsx:2-9`) `@/layout` imports come before `@/pages` imports.
  The new `cn` import should be grouped with `@/layout` at the top.
- **Same duplicated "finished" derivation** as `text-content` —
  `todo-content.tsx:20` re-derives `task.status === "finished"` while also
  receiving `readOnly={isFinished}` from `page.tsx:110`. (Same root issue.)

### Suggested improvement
- Move the `cn` import above the `@/pages` imports to match the file-group
  ordering used in the sibling files. Severity: **low** (cosmetic;
  `lint:fix` may or may not reorder it depending on the import plugin — note
  the repo's eslint config has no `import/order` rule, so this won't be
  auto-fixed and should be done manually).

---

## `todo-content/todo-list-item.tsx`

### Follows the standard
- Adds the optional `finished?: boolean` to the prop type and destructures it
  in the same order as the type declaration — consistent with the file.
- Applies the class through the existing `cn()` block — correct mechanism.

### Deviates from the standard
- **Boolean-prop accumulation / redundant style.** This violates the front-end
  preference *"Collapse multiple boolean props into one state param"*
  (`frontend-code-preferences.md`). `TodoListItem` now carries `done`, `diff`,
  and `finished` — three independent state inputs to one presentational row.
- **The `finished` branch is functionally redundant with `done`.**
  `todo-list-item.tsx:57` adds `finished && "text-on-surface-variant
  line-through"`, but line 53 already applies the *identical* classes for
  `done && "..."`. For a finished task the rows are dimmed via the parent's
  `opacity-60`; the strikethrough on un-done items is the only delta. The new
  class string duplicates the `done` string verbatim, which will drift if one
  is ever changed.

### Suggested improvement
- Prefer a single `state`/variant input over stacking `done` + `diff` +
  `finished` booleans (per the preference), and reuse the shared
  `"text-on-surface-variant line-through"` string instead of repeating the
  literal — e.g. compute `const isMuted = done || finished` once and apply the
  class through that. Severity: **medium** (named convention violation + a
  copy-pasted class literal that is a maintenance hazard).

---

## `workspace-footer/workspace-footer.tsx`

### Follows the standard
- Extracts `const isFinished = task?.status === "finished"` and reuses it for
  both `disabled` and the placeholder — good local DRY, and the optional-chain
  is correct because `task` may be undefined here (no early `null` guard in
  this component).
- `cn` not introduced unnecessarily; plain conditional placeholder string is
  appropriate.

### Deviates from the standard
- No structural deviation. The only cross-file note is the same
  "finished" derivation now living in 4 components (see above) — acceptable
  here since this component genuinely owns its own `task` lookup and has no
  `readOnly` prop to ride on.

### Suggested improvement
- None required. Optionally, the placeholder copy `"reopen to keep editing"`
  vs `"Ask Ben to edit…"` mixes lowercase and an ellipsis-cased style — confirm
  with design which casing is intended, but this is a copy decision, not a code
  standard. Severity: **low**.

---

## Summary of actionable items

| # | File / line | Issue | Severity |
|---|-------------|-------|----------|
| 1 | `todo-list-item.tsx:11,57` | New `finished` boolean stacks on `done`+`diff` (violates "collapse boolean props"); class string duplicates the `done` literal | medium |
| 2 | `todo-content.tsx:4` | `cn` import placed after `@/pages` imports; inconsistent group ordering (not auto-fixed by lint) | low |
| 3 | `text-content.tsx:32`, `todo-content.tsx:20` | Re-derive `task.status === "finished"` although the page already passes `readOnly` driven by the same fact — finished styling could ride the same prop | low |
| 4 | `workspace-footer.tsx:31` | Placeholder copy casing/ellipsis differs — confirm with design | low |

No correctness bugs found. All changes compile-compatible with the existing
prop shapes and use the project's `cn()` styling mechanism. The main convention
gap is the boolean-prop accumulation + duplicated class literal in
`todo-list-item.tsx`.
