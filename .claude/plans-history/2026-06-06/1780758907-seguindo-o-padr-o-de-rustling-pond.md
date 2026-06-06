# Refactor `ItemDetailSheet` (project-web) to the menu-list pattern

## Context

[item-detail-sheet.tsx](project-web/src/layout/components/menu-detail/item-detail-sheet.tsx)
is a 200-line "god component" with 13 props that handles **4 variants**
(`loading` / `error` / `gone` / `populated`) × **2 kinds** (`note` / `reminder`)
all inline, branching on a `variant` prop. The two consumers
([note-detail.tsx](project-web/src/layout/components/menu-detail/note-detail.tsx),
[reminder-detail.tsx](project-web/src/layout/components/menu-detail/reminder-detail.tsx))
already know their state — they just forward `variant="..."` plus a long flat prop list.

The project already has the idiomatic answer to this exact shape in
[menu-list/](project-web/src/layout/components/menu-list/): a structural **shell**
+ **one file per state** (`menu-list-loading`, `menu-list-error`, `menu-list-empty`,
`menu-list-row`), and the **container/view** does the state branching inside the shell
(see [menu-notes-view.tsx](project-web/src/layout/components/menu-notes/menu-notes-view.tsx)).

**Goal:** restructure `ItemDetailSheet` to mirror `menu-list` — drop the `variant` prop,
split each state into its own one-component-per-file module, and move the branching into
`NoteDetail` / `ReminderDetail`. No visual/behavioral change; pure structural refactor.
Scope is **project-web only** (the `project-design` copy is untouched).

## Conventions applied

- **One component per file**, kebab-case filenames, PascalCase exports.
- **No barrel/index re-export files** — containers import each module directly (matches how
  `menu-notes-view` imports each `menu-list-*` file).
- Files stay **flat** inside the existing `menu-detail/` folder with an `item-detail-` prefix,
  exactly mirroring the flat `menu-list/` folder layout.

## New presentational files (in `project-web/src/layout/components/menu-detail/`)

Each is a small, prop-driven presentational component carved verbatim from the current
variant blocks (same markup/classes — no restyling):

- **`item-detail-shell.tsx`** — the always-present frame: wraps `MenuSheet` + the header
  (kind icon + label + close button). Owns the `KIND_META` map (currently lines 25–34).
  Props: `kind: "note" | "reminder"`, `onClose?`, `className?`, `children: ReactNode`.
  Renders header, then `{children}` (the state).
- **`item-detail-loading.tsx`** — the skeleton block (current lines 76–83). No props.
- **`item-detail-error.tsx`** — error block (lines 85–100). Props: `message?`, `onRetry?`.
  Keeps the existing default copy `"couldn't load this one — tap to retry"`.
- **`item-detail-gone.tsx`** — the "gone" message (lines 102–108). No props.
- **`item-detail-content.tsx`** — the populated body (lines 110–197): composes title + body
  + the two meta sub-components below. Props: `title?`, `body?`, `capturedAtAbsolute?`,
  `capturedAtRelative?`, `firesAtRelative?`, `firesAtAbsolute?`, `status?`.
  Renders the reminder timing block only when `firesAt*` props are present (equivalent to the
  current `isReminder && (firesAtRelative || firesAtAbsolute)` gate — no `kind` needed).
- **`item-detail-reminder-meta.tsx`** — the reminder timing/status-badge block (lines 121–157).
  Props: `firesAtRelative?`, `firesAtAbsolute?`, `status?`. Keeps the `isFired` styling logic.
- **`item-detail-captured-meta.tsx`** — the "Captured" footer block (lines 170–195).
  Props: `absolute?`, `relative?`.

## Rewritten container files

Both follow the `menu-notes-view` shape: `<ItemDetailShell>{branch on state}</ItemDetailShell>`.

- **`note-detail.tsx`** — import `ItemDetailShell` + the four state components; branch
  `isLoading → ItemDetailLoading`, 404/missing → `ItemDetailGone`, other error →
  `ItemDetailError` (with `onRetry={actions.refetch}`), else `ItemDetailContent` with the
  note fields. Drops all `variant=` usage.
- **`reminder-detail.tsx`** — same branching, plus passes `status`, `firesAtRelative`,
  `firesAtAbsolute` into `ItemDetailContent`. Reuses the existing
  [format-time](project-web/src/layout/utils/format-time.ts) helpers (`absoluteDateTime`,
  `relativeTime`, `firesAtRelative`) exactly as today.

Representative branch (note-detail):

```tsx
const isGone =
  (state.isError && isAxiosError(state.error) && state.error.response?.status === 404) ||
  (!state.isLoading && !state.isError && !note);

return (
  <ItemDetailShell kind="note" onClose={onClose}>
    {state.isLoading ? (
      <ItemDetailLoading />
    ) : isGone ? (
      <ItemDetailGone />
    ) : state.isError ? (
      <ItemDetailError onRetry={() => actions.refetch()} />
    ) : note ? (
      <ItemDetailContent
        title={note.title}
        body={note.body}
        capturedAtAbsolute={absoluteDateTime(note.capturedAt)}
        capturedAtRelative={relativeTime(note.capturedAt)}
      />
    ) : null}
  </ItemDetailShell>
);
```

## Deletion

- **Delete `item-detail-sheet.tsx`** once both containers no longer import it. No re-export
  shim is left behind (no-barrel-files rule). Grep confirms the only `ItemDetailSheet`
  references in `project-web` are the two container files.

## Verification

1. `cd project-web && npx tsc --noEmit` — must pass clean.
2. `cd project-web && npm run lint:fix` — must pass clean.
3. Run the app (`run` skill / `npm run dev` in project-web) and open the menu → Notes and
   → Reminders, then open an item detail sheet. Confirm all four states render identically to
   before: **loading** skeleton, **populated** (note: title/body/captured; reminder:
   firesAt block + status badge + captured), **error** (retry works), and **gone**
   (e.g. a 404'd id). Visual output should be pixel-identical to the pre-refactor component.
