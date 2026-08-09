# Diff Review 2 — Menu settings/detail sheet overlay (project-mobile)

Scope: `git diff HEAD` for the three owned files, compared against the established
sheet pattern (`task-picker-sheet.tsx`, `menu-sheet.tsx`) and the project coding
designs/preferences skills. READ-ONLY review — no code changed.

---

## `src/layout/components/menu-settings/settings-sheet-overlay.tsx` (new file)

### Follows the standard
- **Correct location for a shared component.** It is consumed by the `menu` page for
  both the detail sheet and the settings sheet, and lives under
  `src/layout/components/menu-settings/`, matching the front-end preference "shared
  components live in `layout/components`".
- **kebab-case file name** (`settings-sheet-overlay.tsx`) — matches the naming convention.
- **Component declaration conventions** — named `export function`, destructured props,
  `type ...Props` alias. Consistent with `react-components.md` and the reference sheets.
- **Mirrors the reference sheet's animation skeleton.** `useSharedValue` +
  `useAnimatedStyle` + `withTiming` for `translateY`/`backdropOpacity`, a `Modal` with
  `transparent` + `animationType="none"` + `onRequestClose={onClose}`, the
  `flex-1 justify-end` container, the full-screen `Pressable` backdrop, and the
  `bg-inverse-surface/30` backdrop tint are all identical to `task-picker-sheet.tsx`.
  Good reuse of the established structure and theme tokens (no hardcoded colors).
- **Named animation constants** (`SLIDE_OFFSET`, `ANIMATION_DURATION`) are a small
  improvement over the reference's inline `220`/`80` literals; acceptable and readable.

### Deviates from the standard
1. **Naming: `*-overlay` is an ad-hoc suffix not used elsewhere; the established
   primitive is named `*-sheet`.** The two reference components are `TaskPickerSheet`
   and `MenuSheet`, and this component fills the exact same role (the animated
   bottom-sheet container). `settings-sheet-overlay.tsx` line 19 (`SettingsSheetOverlay`).
   It should follow the `*-sheet` vocabulary. The name is also misleading on two counts:
   it is **not settings-specific** (the menu page reuses it for the note/reminder
   *detail* sheet at `page.tsx:33`), and "overlay" is a new term not present in the
   sheet pattern.
2. **The exit is not animated, unlike the reference's intent.** On close
   (`settings-sheet-overlay.tsx:31-34`) `translateY` and `backdropOpacity` are set
   **instantly** (`translateY.value = SLIDE_OFFSET`, `backdropOpacity.value = 0`) with
   no `withTiming`. Combined with `Modal animationType="none"`, the sheet vanishes with
   no transition. The reference `TaskPickerSheet` only ever animates *in* (it also has no
   explicit exit), so this is not strictly a regression against the reference — but the
   slide-in animation here is effectively one-directional, which reads as half-finished.
   Flagged as an observation rather than a hard convention break.
3. **Gesture-to-dismiss and the drag handle are dropped.** `task-picker-sheet.tsx` wraps
   the sheet in `GestureHandlerRootView` + `GestureDetector` with a `Gesture.Pan()`
   swipe-down-to-close and renders the grab handle pill. This overlay has neither. The
   handle is partly mitigated because the detail path nests `MenuSheet` (which renders
   its own handle), but the **settings path** (`page.tsx:48-50`) passes `SettingsView`
   directly — `settings-view.tsx` renders `SettingsSheet`, so confirm that already
   provides a handle; if it does this is fine, otherwise the settings sheet has no handle.
   The missing swipe-to-dismiss is a genuine divergence from the reference interaction.
4. **`useEffect` dependency list includes the shared values.** `[isOpen, translateY,
   backdropOpacity]` (line 35) matches the reference exactly, so it is consistent — noted
   only because reanimated shared values are stable refs and add nothing; not a deviation.

### Suggested improvements
- **Rename to a `*-sheet` and drop the settings-specific framing** — e.g. a generic
  `BottomSheet`/`SheetOverlay` under `layout/components/ui` (it is a foundational
  container reused by multiple features), or at minimum `menu-sheet-overlay`. The current
  name implies settings-only ownership while it backs the detail sheet too. **Severity: medium.**
- **Decide on exit animation deliberately.** If a slide-out is wanted, animate the close
  branch with `withTiming` and defer `Modal` unmount until it finishes; if not, drop the
  one-sided slide and let it match the reference's behavior intentionally rather than by
  accident. **Severity: low.**
- **Consider adding swipe-to-dismiss + handle to match the reference sheet UX**, or
  consciously document that this overlay is the no-gesture variant. **Severity: low.**

---

## `src/pages/menu/page.tsx`

### Follows the standard
- **Path-alias import** for the new component (`@/layout/components/menu-settings/...`)
  — matches the "use path-alias imports" preference.
- **Replaces two duplicated inline `<View className="absolute inset-x-0 bottom-0">`
  wrappers with a single reusable component**, which is the right direction: it removes
  copy-pasted positioning markup and centralizes the sheet presentation. Consistent with
  DRY/shared-component preferences.
- **Conditional children kept inline in JSX** (`{detailTarget && (...)}` at line 34),
  no `renderX()` helper — matches "do not build sub-UI through local renderX() functions".
- **Open/close wiring reads from the store** (`detailTarget != null`, `isSettingsOpen`,
  `closeDetail`, `closeSettings`) consistent with the existing store-driven page.

### Deviates from the standard
1. **Inconsistent children-guarding between the two usages.** The detail overlay guards
   its children with `{detailTarget && (...)}` (line 34) so the `MenuSheet`/detail only
   mount when open, but the settings overlay (lines 48-50) renders `<SettingsView>`
   **unconditionally** as a child whenever the `Menu` page is mounted — `SettingsView`
   (and its `useAuthStore` reads / `SettingsSheet`) is always instantiated even while the
   sheet is closed (the `Modal` just hides it). The detail path is the more correct
   pattern; the settings path should guard symmetrically (`{isSettingsOpen && ...}`) so
   the subtree is not built while hidden. **Concrete: `page.tsx:48-50`.**
2. **Naming leakage from the component.** Because the shared overlay is named
   `SettingsSheetOverlay`, the detail usage at `page.tsx:33` reads as a "settings" overlay
   wrapping a *note/reminder detail* — confusing at the call site. This is a downstream
   symptom of the naming deviation noted above.

### Suggested improvements
- **Guard the settings children the same way as the detail children**, i.e.
  `{isSettingsOpen && <SettingsView onClose={closeSettings} />}`, to avoid mounting the
  settings subtree (and its store subscriptions) while the sheet is closed and to match
  the sibling usage 3 lines above. **Severity: medium.**
- After the rename, update both call sites so the wrapper name reads sensibly for the
  detail case. **Severity: low** (follows from the rename).

---

## `src/layout/components/menu/menu-sidebar.tsx`

### Follows the standard
- **Correct safe-area handling.** Adds `useSafeAreaInsets()` and applies
  `style={{ paddingTop: insets.top }}` to the root `View` (lines 47, 58). This mirrors
  exactly how `menu-sheet.tsx` (`paddingBottom: insets.bottom`) and `task-picker-sheet.tsx`
  apply insets — via the `style` prop, since NativeWind cannot express dynamic inset
  values. Correct and consistent.
- **Import grouping/order preserved** — `react-native-safe-area-context` added in the
  third-party block, alias imports untouched. Matches existing ordering.
- **No other behavior touched**; the sidebar already follows the mobile icon-color
  pattern (`color={primary}` / `onSurfaceVariant` from `@/layout/utils/colors`), which the
  diff leaves intact.

### Deviates from the standard
- None observed. The change is minimal, idiomatic, and consistent with the inset pattern
  used across the sheet components.

### Suggested improvements
- None required. (Optional: the sidebar is a full-height drawer, so `paddingTop:
  insets.top` is appropriate; no change needed.) **Severity: n/a.**

---

## Summary of actionable items

| # | File / line | Issue | Severity |
|---|-------------|-------|----------|
| 1 | `settings-sheet-overlay.tsx:19` (+ both call sites in `page.tsx`) | Component named `*-overlay` and "settings"-scoped, but it is the generic bottom-sheet container also used for note/reminder detail; established vocabulary is `*-sheet`. Rename and relocate toward a generic sheet. | medium |
| 2 | `page.tsx:48-50` | Settings children rendered unconditionally while the detail path guards with `{detailTarget && ...}`; mount the settings subtree only when `isSettingsOpen`. | medium |
| 3 | `settings-sheet-overlay.tsx:31-34` | Close resets animation values instantly (no slide-out); slide is effectively one-directional. Decide intentionally. | low |
| 4 | `settings-sheet-overlay.tsx` | No swipe-to-dismiss / drag handle that the reference `TaskPickerSheet` provides; confirm `SettingsSheet` supplies a handle for the settings path. | low |
| — | `menu-sidebar.tsx` | Inset change is correct and idiomatic. | none |

No correctness bugs found; the deviations are naming/consistency and an asymmetric
conditional-mount. The safe-area change in `menu-sidebar.tsx` is clean.
