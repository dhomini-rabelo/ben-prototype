# Plan 01 — Fix the broken chat-input voice (mic) and send icon color

## Context

In `project-mobile`, the chat input footer renders a circular `bg-primary` action button that
holds either a `Send` icon (when there is draft text) or a `Mic` / voice icon (when the input is
empty). Both icons currently render "broken" — they appear with the wrong color (effectively
invisible / dark on the dark primary button) instead of the intended white on-primary color.

### Root cause

`chat-footer.tsx` colors both icons with `className="text-on-primary"`:

```tsx
<Send size={20} className="text-on-primary" />
<Mic size={20} className="text-on-primary" />
```

`lucide-react-native` SVG icons do **not** inherit NativeWind `text-*` classes the way web SVG
inherits `currentColor`. NativeWind's `cssInterop` is not wired for `lucide-react-native` /
`react-native-svg`, so `text-*` classNames are silently ignored on icon components. This is
documented in two project sources:

- `project-mobile/src/layout/utils/colors.ts` (file header comment).
- The `code-write-code` coding pattern `coding-patterns/mobile-icon-colors.md` ("Mobile Icon
  Colors").

The rule: icons must receive an explicit `color` hex prop, sourced from the single source of truth
`@/layout/utils/colors`. The correct `on-primary` export already exists there as `onPrimary`
(`'#ffffff'`).

### Confirmed working references (read-only)

- `chat-top-bar.tsx` — `<Menu color={primary} size={24} />` imports `primary` from
  `@/layout/utils/colors`.
- `recording-bar.tsx` — `<Mic color={onPrimary} size={20} />` and
  `<ArrowUp color={onSurfaceVariant} size={14} />`, importing those hexes from
  `@/layout/utils/colors`.

These render correctly precisely because they pass `color` props rather than `text-*` classNames.

## Decisions

1. **Replace `className="text-on-primary"` with `color={onPrimary}` on both the `Send` and `Mic`
   icons.** This matches the documented Mobile Icon Colors pattern and the working `recording-bar.tsx`
   usage (which also pairs an icon on a colored button with `color={onPrimary}`). The `recording-bar`
   stop button uses exactly `<Mic color={onPrimary} size={20} />`, so this is a verbatim, proven
   pattern for the same `Mic` icon on a filled circular button.
2. **Import `onPrimary` from `@/layout/utils/colors`** — the single source of truth for icon hexes;
   the export already exists, so no new color needs to be added.
3. **Keep `size={20}` as-is on both icons** — it is already an explicit prop (correct) and matches the
   sizing used in `recording-bar.tsx`.
4. **Change nothing else.** The `IconButton` wrapper, its `bg-primary` background, the `ml-2`
   spacing, the `opacity-60` disabled affordance on the voice button, the `hasText` branch, and all
   press handlers (`handleSend`, `onStartRecording`) stay exactly as they are. The only visible change
   is the corrected icon color.

### Impact on other flows

None. The change is confined to two icon `color` props inside `chat-footer.tsx`. The `recording`
voice state is rendered by `RecordingBar` (a separate, already-correct file) and is untouched. No
exported API, props, or behavior of `ChatFooter` changes, so no consumer is affected.

## Existing Code to Reuse

- `onPrimary` (`'#ffffff'`) — exported from `project-mobile/src/layout/utils/colors.ts`. Reuse it; do
  not inline a hex and do not add a new export (the needed one already exists).
- The `color={onPrimary} size={20}` icon pattern — already used verbatim by `recording-bar.tsx` for
  the same `Mic` icon on a filled circular button.

## Files to Modify

### `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx`

**Edit 1 — add the `onPrimary` import.** Insert the import alongside the existing imports (placed
after the `useChatMessages` hook import to keep the existing top-to-bottom grouping; exact placement
is not load-bearing as long as it resolves). Concretely, add this line:

```tsx
import { onPrimary } from '@/layout/utils/colors'
```

So the import block becomes:

```tsx
import { memo } from 'react'
import { Mic, Send } from 'lucide-react-native'
import { View } from 'react-native'
import { ChatInput } from '@/layout/components/chat-input'
import { RecordingBar } from '@/layout/components/recording-bar'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { onPrimary } from '@/layout/utils/colors'
import { useChatInput } from '@/pages/chat/hooks/use-chat-input'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
```

**Edit 2 — fix the `Send` icon color.** Replace:

```tsx
            <Send size={20} className="text-on-primary" />
```

with:

```tsx
            <Send size={20} color={onPrimary} />
```

**Edit 3 — fix the `Mic` icon color.** Replace:

```tsx
            <Mic size={20} className="text-on-primary" />
```

with:

```tsx
            <Mic size={20} color={onPrimary} />
```

The resulting JSX body (unchanged except the two icon lines):

```tsx
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label="Send"
            onPress={isDisabled ? undefined : handleSend}
            className="ml-2 bg-primary"
          >
            <Send size={20} color={onPrimary} />
          </IconButton>
        ) : (
          <IconButton
            label="Voice input"
            onPress={canRecord ? onStartRecording : undefined}
            className={`ml-2 bg-primary ${canRecord ? '' : 'opacity-60'}`}
          >
            <Mic size={20} color={onPrimary} />
          </IconButton>
        )}
      </View>
```

## Verification

1. **Type check** (no formatting step is part of this plan):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
   ```

   Expect no new errors. `color?: string` is a valid prop on `lucide-react-native` icon components,
   and `onPrimary` is typed `string`, so this is type-safe.

2. **Static self-check**: confirm `text-on-primary` no longer appears in `chat-footer.tsx` and that
   both `Send` and `Mic` now carry `color={onPrimary}`.

3. **Visual (optional, manual)**: open the chat screen; the empty-input mic icon and the
   draft-present send icon should render solid white on the dark `bg-primary` circular button, matching
   the stop-recording mic in `recording-bar.tsx`.

## Notes / Constraints

- This plan touches only the file it owns: `chat-footer.tsx`. It depends solely on the already-present
  `onPrimary` export in `colors.ts` (read-only reference, owned by no parallel plan) and introduces no
  dependency on any other plan's file.
- Do **not** run `npm run lint:fix` — formatting is handled once after all parallel plans finish.
