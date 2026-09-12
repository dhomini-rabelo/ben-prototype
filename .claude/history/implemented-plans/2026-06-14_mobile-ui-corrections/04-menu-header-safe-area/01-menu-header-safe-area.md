# Plan 04 — Add safe-area top spacing to the menu sidebar header

## Context

The menu sidebar header (Ben brand mark + close `X`) renders too high and overlaps the
device status bar, while the chat and notes screens correctly sit below it.

Root cause: `src/layout/components/menu/menu-sidebar.tsx` renders its root `View`
with no top safe-area inset. By contrast:

- `src/layout/components/menu-list/menu-list-shell.tsx` (notes/reminders/tasks list views)
  reads the inset via `useSafeAreaInsets()` and applies `style={{ paddingTop: insets.top }}`
  to its root `View`.
- `src/layout/components/menu/menu-sheet.tsx` follows the same pattern for the bottom inset
  (`style={{ paddingBottom: insets.bottom }}`).

The chat screen relies on a page-level `SafeAreaView edges={['top','bottom']}`. The menu route
itself (`src/pages/menu/page.tsx`) wraps the views in a plain `View` with **no** top inset, so
each menu view is individually responsible for its own top spacing. `MenuSidebar` is the only
menu view missing it.

Render chain (for impact analysis):
`src/pages/menu/page.tsx` → `MenuSidebarView` (`menu-sidebar-view.tsx`, data wiring only,
no layout) → `MenuSidebar` (`menu-sidebar.tsx`). The menu route is presented modally. None of
these ancestors apply a top inset, so adding `paddingTop: insets.top` to the `MenuSidebar`
root will not double up.

## Decisions

1. **Match the established pattern exactly.** Use `useSafeAreaInsets()` from
   `react-native-safe-area-context` and apply `style={{ paddingTop: insets.top }}` on the
   sidebar's root `View` — identical to `menu-list-shell.tsx`. This keeps the menu header
   vertically aligned with the notes/reminders/tasks list headers and the chat header.

2. **Apply the inset on the existing root `View`, not a new wrapper.** The root `View` already
   carries `className` (height, background, shadow, and the passed-through `className` prop).
   Adding the `style` prop alongside the existing `className` mirrors `menu-list-shell.tsx`
   and `menu-sheet.tsx`, which both combine `style` (inset) with `className` (NativeWind).
   No structural/JSX changes, no new component.

3. **Scope: top inset only.** The briefing is specifically about the header overlapping the
   status bar. The bottom of the sidebar is a short list that does not reach the home
   indicator, and the reference (`menu-list-shell.tsx`) also only applies the top inset.
   Do not add a bottom inset.

4. **Preserve the existing `className`/`style` separation.** `paddingTop` is a dynamic runtime
   value (device-dependent), so it must be a `style` prop, not a NativeWind class — consistent
   with how every other safe-area consumer in this codebase handles it.

## Files to Modify

### `project-mobile/src/layout/components/menu/menu-sidebar.tsx`

**Change 1 — add the `useSafeAreaInsets` import.**

The file currently imports (top of file):

```tsx
import { Bell, ListTodo, NotebookPen, Settings, X } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
```

Add the `react-native-safe-area-context` import. Place it after the `react-native` import,
matching the import ordering in `menu-list-shell.tsx` and `menu-sheet.tsx` (`react-native`
import immediately followed by the `react-native-safe-area-context` import):

```tsx
import { Bell, ListTodo, NotebookPen, Settings, X } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandMark } from '@/layout/components/brand-mark'
```

**Change 2 — read the inset inside the component.**

The component body currently begins:

```tsx
export function MenuSidebar({
  variant = 'default',
  counts,
  className,
  onSelect,
  onClose,
}: MenuSidebarProps) {
  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
```

Insert the inset read as the first statement of the body (mirrors `menu-list-shell.tsx`,
where `const insets = useSafeAreaInsets()` is the first line of the component body):

```tsx
export function MenuSidebar({
  variant = 'default',
  counts,
  className,
  onSelect,
  onClose,
}: MenuSidebarProps) {
  const insets = useSafeAreaInsets()

  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
```

**Change 3 — apply the top inset to the root `View`.**

The root `View` is currently:

```tsx
    <View
      className={cn(
        'h-full w-full bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
```

Add the `style` prop carrying the top inset (matching `menu-list-shell.tsx`'s
`style={{ paddingTop: insets.top }}`):

```tsx
    <View
      style={{ paddingTop: insets.top }}
      className={cn(
        'h-full w-full bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
```

## Existing Code to Reuse

- `useSafeAreaInsets` from `react-native-safe-area-context` — already a project dependency
  and used by `menu-list-shell.tsx`, `menu-sheet.tsx`, and other screens. No new dependency.
- `cn` from `@/layout/utils/colors`/`styles` — already imported in the file; the `className`
  composition is left untouched.
- The `style` + `className` combination pattern is taken verbatim from
  `menu-list-shell.tsx` and `menu-sheet.tsx`.

## Out of Scope / Non-Goals

- Do **not** edit `src/pages/menu/page.tsx`, `menu-sidebar-view.tsx`, or any
  `menu-settings` / list-view files — they are owned by other plans or already handle their
  own insets. The list views (`menu-list-shell.tsx`) and detail sheet (`menu-sheet.tsx`)
  already apply their own insets and must not be changed.
- No bottom inset, no JSX restructuring, no new component, no formatting step.

## Verification

1. **Type check** (project root is `project-mobile`):

   ```bash
   cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
   ```

   Expect no new type errors. `useSafeAreaInsets()` returns `EdgeInsets`, so
   `insets.top` is a `number`, which satisfies `paddingTop` in a `ViewStyle`.

2. **Visual confirmation** (manual / browser-mobile-tester): open the menu (modal route),
   confirm the Ben brand mark and the close `X` no longer overlap the status bar and that the
   header now sits at the same vertical offset as the chat header and the notes list header.

## Files the plan will modify

- `project-mobile/src/layout/components/menu/menu-sidebar.tsx`
