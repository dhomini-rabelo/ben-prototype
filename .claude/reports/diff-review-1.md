# Diff Review — chat keyboard handling & icon colors

Scope: `project-mobile` git diff for three files. READ-ONLY review against the project's
Page Structure design and the codebase's icon-color convention (`src/layout/utils/colors.ts`).

---

## 1. `src/pages/chat/components/chat-footer/chat-footer.tsx`

The change replaces `className="text-on-primary"` with `color={onPrimary}` on the `Send` and
`Mic` lucide icons (lines 45 and 53), importing `onPrimary` from `@/layout/utils/colors`.

### Follows the standard
- This is exactly the documented convention. `src/layout/utils/colors.ts` states that
  `lucide-react-native` SVG icons do **not** inherit NativeWind `text-*` classes the way web
  SVG inherits `currentColor`, so icon color must be passed as an explicit hex prop. The old
  `className="text-on-primary"` was effectively a no-op on these icons; the new code fixes it.
- Uses the shared color token (`onPrimary`) rather than a hardcoded hex — consistent with
  `capture-card-icon.tsx`, `chat-top-bar.tsx`, `login/page.tsx`, and other call sites that
  import from the same single-source-of-truth util.
- Import is placed in the correct alphabetical/group position among the `@/layout/...` imports.

### Deviates from the standard
- None within this file.

### Suggested improvement
- **(low)** Parallel sibling out of sync: `src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`
  lines 48 and 59 still render `<Send size={20} className="text-on-primary" />` and
  `<Mic size={20} className="text-on-primary" />` — the identical, still-broken old pattern.
  The chat footer and workspace footer are near-identical twins; this fix should be mirrored
  there so the two stay consistent. (Out of the assigned file set, but directly relevant.)

---

## 2. `src/pages/chat/page.tsx`

The change removes `KeyboardAvoidingView` (and the `Platform`/`KeyboardAvoidingView` imports)
and instead drives the footer position and content bottom-inset from a new
`useKeyboardHeight()` hook's `keyboardOffset`. The footer container is now a plain `View` with
`style={{ bottom: keyboardOffset }}`, and `keyboardOffset` is added to the empty-state
`paddingBottom` (line 79) and the `ChatHistory` `bottomInset` (line 87).

### Follows the standard
- Logic extracted into a page-scoped hook under `chat/hooks/` — this is exactly the Page
  Structure pattern (hooks/ holds reusable logic pulled out of `page.tsx`). Naming is correct:
  kebab-case file `use-keyboard-height.ts`, camelCase export `useKeyboardHeight`.
- Import ordering/grouping preserved; the new hook import sits correctly among the other
  `@/pages/chat/hooks/...` imports.
- `keyboardOffset` is applied consistently to all three layout consumers (empty-state padding,
  history inset, footer `bottom`), so the spacing math stays coherent across render branches.
- Styling split is consistent with the rest of the file: NativeWind classes for static layout
  (`absolute inset-x-0 bottom-0 z-50`), inline `style` for the dynamic numeric value.

### Deviates from the standard
- **Divergence from the sibling page.** `src/pages/task-workspace/page.tsx` (lines 3, 117–131)
  still uses `KeyboardAvoidingView` for the same "absolutely-positioned footer over a scroll
  area" problem. The two chat-like pages were clearly built from the same template; this diff
  changes only one of them, so the codebase now has two different solutions to an identical
  problem. The chat approach (manual `Keyboard` listeners + offset) is the more deliberate one,
  but the inconsistency is a real convention drift.

### Suggested improvement
- **(medium)** Reconcile the keyboard-handling approach across `chat/page.tsx` and
  `task-workspace/page.tsx`. Either migrate the workspace page to the same `useKeyboardHeight`
  hook, or document why chat needs the manual approach. Right now a future reader cannot tell
  which is the intended pattern.

---

## 3. `src/pages/chat/hooks/use-keyboard-height.ts` (new file)

```ts
const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
// subscribes, stores event.endCoordinates.height, returns
// keyboardOffset = keyboardHeight > 0 ? Math.max(keyboardHeight - insets.bottom, 0) : 0
```

### Follows the standard
- Correct location and naming per Page Structure: page-scoped hook in `chat/hooks/`,
  kebab-case filename, camelCase `useKeyboardHeight` export, returns a named object
  (`{ keyboardOffset }`) — matching the project's hook style (e.g. `useScrollToBottom` returns
  `{ listRef }`).
- Proper effect lifecycle: subscriptions created in `useEffect` and removed in the cleanup;
  platform-specific event names (`keyboardWillShow/Hide` on iOS, `keyboardDidShow/Hide` on
  Android) are the standard RN idiom.
- Subtracts `insets.bottom` (safe-area) from the raw keyboard height — correct, since the page
  uses `SafeAreaView edges={['top','bottom']}`, so the bottom inset is already accounted for and
  would otherwise be double-counted.

### Deviates from the standard
- **Raw `react-native` `Keyboard` / `Platform` use in a hook rather than behind a service.**
  The Mobile Services Layer design isolates native SDK integrations behind
  `src/services/{capability}-service.ts`. `Keyboard` is a core RN API (not a separate native SDK
  like `expo-notifications`), so this is a soft deviation, not a hard rule violation — but the
  same `Platform.OS` branching for keyboard events is now a candidate for a shared module if a
  second screen needs it (see the task-workspace divergence above). Severity is low.
- **Hook name vs. return value mismatch.** The hook is named `useKeyboardHeight` but it does not
  return a height — it returns `keyboardOffset` (height minus safe-area inset). The internal
  `keyboardHeight` state is never exposed. The name slightly oversells/mislabels the API.

### Suggested improvement
- **(low)** Rename to `useKeyboardOffset` (or expose `keyboardHeight` as well) so the export
  name matches what it returns. Aligns with the project's intent-named convention.
- **(low)** If the workspace page is migrated to this approach (see file 2), promote the hook to
  a shared location (`src/layout/hooks/`) instead of duplicating it under `chat/hooks/`, since
  `layout/hooks/` is where cross-page hooks like `use-connectivity` and `use-can-record` live.

---

## Summary

All three changes are individually correct and follow the project's conventions — the icon-color
fix is textbook-correct per `colors.ts`, and the new hook is well-placed and well-named for the
Page Structure design. The only real concern is **convention drift between the two sibling
chat/workspace pages**: this diff fixes the broken icon-color pattern and modernizes keyboard
handling in `chat` but leaves the parallel `task-workspace` footer/page on the old patterns.

| Finding | Severity |
|---|---|
| `workspace-footer.tsx` still uses non-functional `text-on-primary` on Send/Mic icons (mirror the fix) | low |
| `task-workspace/page.tsx` still uses `KeyboardAvoidingView`; reconcile keyboard approach | medium |
| Hook name `useKeyboardHeight` returns an offset, not a height | low |
| Consider promoting hook to `src/layout/hooks/` if reused | low |

No blocking issues. No changes were made (review is read-only).
