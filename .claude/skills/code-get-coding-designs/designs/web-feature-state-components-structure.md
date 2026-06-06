# Web Feature State Components Structure

How a `project-web` feature that fetches data composes its UI states. A feature splits into a **container** that owns data and orchestration, a set of **status components** for the non-data states, and a **presentational** component for the data itself. **All file and folder names use kebab-case**; only exported component identifiers stay PascalCase.

## Folder layout

```
{feature}/
├── {feature}-view.tsx       # container: fetches data, orchestrates which state renders
├── {feature}-list.tsx       # presentational: renders the loaded data
├── {feature}-loading.tsx    # loading state (skeleton)
├── {feature}-error.tsx      # error state (message + retry)
└── {feature}-empty.tsx      # empty state (title + description)
```

A detail feature uses the same shape with a `-gone.tsx` (not-found) state instead of `-empty.tsx`, and a `-content.tsx` as the presentational part.

## The container view

The `{feature}-view.tsx` container calls the data hook, derives the state, and renders exactly one branch. It owns no presentation beyond the shell; each state is delegated to its own stateless component. The branch order is fixed: **loading → error/gone → empty → data → null**.

```tsx
export function MenuNotesView() {
  const { actions, state } = useNoteListData()
  const notes = state.data?.items ?? []

  return (
    <MenuListShell title="Notes">
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError onRetry={() => actions.refetch()} />
      ) : notes.length === 0 ? (
        <MenuListEmpty title="no notes yet" description="..." />
      ) : (
        <MenuNotesList notes={notes} onSelect={handleSelect} />
      )}
    </MenuListShell>
  )
}
```

## Status components

Each status component (`loading`, `error`, `empty`, `gone`) is a pure, stateless function in its own file. It receives only what it renders (a message, an `onRetry` callback) and never fetches data. This keeps the non-data states reusable and the container readable as a single state machine.

## Presentational component

The `{feature}-list.tsx` (or `{feature}-content.tsx`) receives the already-loaded data plus minimal callbacks (e.g. `onSelect`) and renders it. It performs no fetching and no loading/error handling — those belong to the container.
