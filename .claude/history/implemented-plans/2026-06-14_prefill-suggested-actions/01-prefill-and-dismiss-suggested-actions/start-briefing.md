# Plan 1 [Frontend] (sync): Prefill chat input from Suggested Actions and dismiss used buttons

This is the only plan in the set. The whole task is a single-concern frontend change in
`project-mobile`, so there is no parallel work and no merge plan — it runs alone.

## Goal

When the user taps a Suggested Action button in the chat empty state:

1. The chat text input is **prefilled** with the action's starter text (e.g. tapping
   "Remind me to..." fills the input draft with `Remind me to ...`).
2. The **tapped** Suggested Action button is **no longer displayed**. Remaining (untapped)
   suggestions stay visible. When every suggestion has been used, the whole
   "Suggested Actions" section is hidden.

## Why this is one plan

- Frontend only — no backend/API/contract change.
- All edits live inside `project-mobile/src/pages/chat/`.
- No other parallel plan, so no file-ownership conflicts to coordinate.

## Files this plan owns

- `project-mobile/src/pages/chat/components/chat-empty-state/chat-empty-state.tsx` — wire each
  `SuggestedAction` with an `onPress` that prefills the draft and dismisses the tapped action;
  track dismissed actions and hide the section when empty.
- (Possibly) `project-mobile/src/pages/chat/components/suggested-action.tsx` — only if a small
  prop/typing adjustment is needed; the component already accepts `onPress`.

## Existing mechanism to reuse (from architecture exploration)

- The chat input value is a global Jotai atom: `draftAtom` in
  `project-mobile/src/pages/chat/states/chat-state.ts`. `ChatEmptyState` can import it and use
  `useSetAtom(draftAtom)` to prefill the input — both `ChatEmptyState` and the input footer are
  children of the same chat screen and already share this atom.
- `SuggestedAction` already exposes an optional `onPress?: () => void` prop and renders a
  pressed state; the parent simply needs to pass handlers.
- Dismissal state is local to the empty state — a `useState` set of dismissed action ids is the
  simplest fit (no global store needed); it persists while the empty state stays mounted.

## Out of scope

- No backend changes.
- No auto-send (the user finishes typing and sends themselves — prefill only).
- No new global store unless the deep plan finds local state insufficient.
