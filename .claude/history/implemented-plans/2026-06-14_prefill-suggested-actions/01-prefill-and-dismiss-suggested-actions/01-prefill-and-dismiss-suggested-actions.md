# Plan: Prefill chat input from Suggested Actions and dismiss used buttons

## Context

In `project-mobile`, the chat empty state shows a "Suggested Actions" section with two
hardcoded buttons (Bell → "Remind me to...", NotebookPen → "Create a note about..."). Today
these buttons do nothing — `SuggestedAction` already accepts an optional `onPress` but the
parent (`ChatEmptyState`) never passes one.

Goal: tapping a suggestion should

1. **prefill** the chat text input with that action's starter text, and
2. **dismiss** only the tapped button (other untapped suggestions stay), hiding the whole
   "Suggested Actions" section once every suggestion has been used.

No auto-send — prefill only; the user finishes typing and sends.

### Relevant existing pieces

- `project-mobile/src/pages/chat/components/chat-empty-state/chat-empty-state.tsx` — renders
  the section and the two `<SuggestedAction>` elements (currently hardcoded inline).
- `project-mobile/src/pages/chat/components/suggested-action.tsx` — already typed with
  `onPress?: () => void` and renders an `active:` pressed state. **No change needed** beyond
  what it already exposes.
- `project-mobile/src/pages/chat/states/chat-state.ts` — `export const draftAtom = atom('')`
  (Jotai). This atom is the chat input value, written from the footer via `useChatInput`.
- `project-mobile/src/pages/chat/hooks/use-chat-input.ts` — reference for how the draft atom is
  consumed (`useAtom(draftAtom)`, `setDraft(value)`).
- `project-mobile/src/pages/chat/page.tsx` (lines 74–92) — renders `<ChatEmptyState />` only
  while `historyState.isEmpty && !hasVoiceBubble`. So the empty state mounts/unmounts with that
  condition; local dismissal state lives exactly as long as the empty state is visible, which is
  the desired behavior.

## Decisions

- **Prefill text ends with a trailing space, no ellipsis.** The button *label* keeps its
  ellipsis ("Remind me to...") as a visual hint, but the *prefill* writes
  `"Remind me to "` and `"Create a note about "`. Rationale: the ellipsis is a UI placeholder
  meaning "keep going"; inserting it literally would force the user to delete `...` before
  typing. The trailing space lets the user start the next word immediately. This separates the
  display label from the inserted text, so we model each action as
  `{ id, icon, label, prefill }`.

- **Dismissal state is local `useState` in `ChatEmptyState`, keyed by a stable `id`.** The
  briefing confirms no global store is needed. The empty state already mounts only when chat
  history is empty (`page.tsx`), so resetting dismissals on unmount (e.g. after a message is
  sent and the history becomes non-empty) is correct and intuitive — a fresh empty state should
  offer all suggestions again. A `Set<SuggestedActionId>` of dismissed ids is the simplest fit.

- **Actions modeled as a module-level constant array.** Following the React component pattern
  "keep pure/reusable data outside the component", the action definitions live at module scope
  (`SUGGESTED_ACTIONS`). This also makes the render a single `.map` and makes adding/removing
  suggestions a data edit. `id` is a string-literal union for type safety.

- **Use `useSetAtom(draftAtom)`** (write-only) rather than `useAtom`. The empty state never
  reads the draft, only sets it. The front-end preference "use `useAtom` when reading and
  writing the same atom" does not apply here because we only write. This matches Jotai best
  practice (avoid subscribing to a value you don't render).

- **Set the draft directly to the prefill (replace), not append.** The empty state only appears
  when there are no messages and the input is effectively unused, so replacing the draft is the
  expected behavior and matches the briefing ("prefilled with that action's starter text").

- **No change to `suggested-action.tsx`.** It already exposes `onPress` and the pressed state.
  Touching it would be gold-plating.

- **Scope:** only files inside `project-mobile/src/pages/chat/` are modified — in fact only
  `chat-empty-state.tsx`. No other flow is impacted (the draft atom is the same one the footer
  reads, so the prefilled text shows up in the input automatically; no extra wiring needed).

## Files to Modify

### `project-mobile/src/pages/chat/components/chat-empty-state/chat-empty-state.tsx`

Replace the two hardcoded `<SuggestedAction>` elements with a data-driven, dismissable list
that prefills the draft on tap and hides the section when empty.

```tsx
import { Bell, MessageCircle, NotebookPen } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { SuggestedAction } from '@/pages/chat/components/suggested-action'
import { draftAtom } from '@/pages/chat/states/chat-state'

type SuggestedActionId = 'remind' | 'note'

type SuggestedActionData = {
  id: SuggestedActionId
  icon: ComponentType<{
    className?: string
    color?: string
    size?: number
    strokeWidth?: number
  }>
  label: string
  prefill: string
}

const SUGGESTED_ACTIONS: SuggestedActionData[] = [
  { id: 'remind', icon: Bell, label: 'Remind me to...', prefill: 'Remind me to ' },
  {
    id: 'note',
    icon: NotebookPen,
    label: 'Create a note about...',
    prefill: 'Create a note about ',
  },
]

export function ChatEmptyState() {
  const setDraft = useSetAtom(draftAtom)
  const [dismissedIds, setDismissedIds] = useState<Set<SuggestedActionId>>(
    () => new Set(),
  )

  const visibleActions = SUGGESTED_ACTIONS.filter(
    (action) => !dismissedIds.has(action.id),
  )

  function handleSelectAction(action: SuggestedActionData) {
    setDraft(action.prefill)
    setDismissedIds((previous) => new Set(previous).add(action.id))
  }

  return (
    <View className="flex-1">
      <View className="flex-1 flex-col items-center justify-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-surface-container-high">
          <MessageCircle
            className="size-7 text-on-surface-variant"
            strokeWidth={1.5}
          />
        </View>
        <View className="max-w-[280px] flex-col items-center gap-2">
          <Typography variant="tagline" className="text-on-surface text-center">
            No recent messages.
          </Typography>
          <Typography
            variant="body-md"
            className="text-on-surface-variant text-center"
          >
            Let&apos;s get started — tap the mic or type to tell Ben anything.
          </Typography>
        </View>
      </View>

      {visibleActions.length > 0 && (
        <View className="mt-8 flex-col gap-2 border-t border-surface-variant pt-4">
          <Typography
            variant="label-caps"
            className="ml-1 mb-1 text-on-surface-variant"
          >
            Suggested Actions
          </Typography>
          {visibleActions.map((action) => (
            <SuggestedAction
              key={action.id}
              icon={action.icon}
              onPress={() => handleSelectAction(action)}
            >
              {action.label}
            </SuggestedAction>
          ))}
        </View>
      )}
    </View>
  )
}
```

Notes on conformance to project conventions:
- Function declaration for the component and a `handle`-prefixed event handler
  (`handleSelectAction`); inline arrow in JSX is the allowed exception because it passes a
  parameter (`action`).
- Action data lives at module scope (pure, reusable) per the React component pattern.
- `key={action.id}` uses the stable union id.
- Icon `color`/`size`/`strokeWidth` are still handled inside `SuggestedAction` (mobile icon
  color pattern already satisfied there); the `MessageCircle` icon at the top is left exactly as
  it was.
- `new Set(previous).add(action.id)` returns the new Set, producing a fresh reference so React
  re-renders.

## Files to Create

None.

## Existing Code to Reuse

- `draftAtom` from `project-mobile/src/pages/chat/states/chat-state.ts` — the single source of
  truth for the chat input value, already read by the footer through `use-chat-input.ts`.
  Setting it here is enough for the prefilled text to appear in the input.
- `SuggestedAction` (`project-mobile/src/pages/chat/components/suggested-action.tsx`) — reused
  as-is via its existing `icon`, `children`, and `onPress` props.
- `Typography` (`@/layout/components/ui/typography`) — unchanged.

## Impact on other flows

- None. The only shared dependency touched is `draftAtom`, which is intentionally shared with
  the footer/input; writing to it is the mechanism that makes the prefill visible. No backend,
  API, store, or route changes. No other component imports `ChatEmptyState` except `page.tsx`,
  which renders it without props (unchanged).

## Verification

1. Type-check (no formatting step per instructions):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
   ```

2. Manual (in the running app, empty chat history):
   - Tap "Remind me to..." → input shows `Remind me to ` (trailing space, no ellipsis); the
     "Remind me to..." button disappears; "Create a note about..." remains.
   - Tap "Create a note about..." → input is replaced with `Create a note about `; the button
     disappears; the entire "Suggested Actions" section (including its heading) is now hidden.
   - Confirm nothing is auto-sent — the message is only sent when the user taps send.
