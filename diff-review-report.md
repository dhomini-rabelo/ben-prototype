# Diff Review Decision Document — mobile UI corrections

Review of the current `project-mobile` git diff (five parallel UI fixes) against the project's
conventions, consolidated from three parallel review sub-agents (`.claude/reports/diff-review-1..3.md`)
plus a direct verification of the Expo SDK 54 edge-to-edge behavior in `node_modules`.

## Context

The diff implements four reported corrections: broken chat-input icons, hiding the Android
navigation bar, chat keyboard adaptation, menu header safe-area, and a dimmed backdrop for the
settings sheet. All files type-check (`tsc --noEmit`) and lint clean.

## Verified ground truth — Expo SDK 54 edge-to-edge

A factual conflict between reports was resolved by reading `node_modules`:

- `react-native-is-edge-to-edge`'s `isEdgeToEdge()` returns `true` (SDK 54.0.35 enforces edge-to-edge);
  `react-native-edge-to-edge` and `expo-system-ui` are not separately installed, but that does **not**
  mean edge-to-edge is off.
- In `expo-navigation-bar`, `setBehaviorAsync` / `setBackgroundColorAsync` / `setPositionAsync` are
  **gated** by `isEdgeToEdge()` → they `console.warn` and return without acting.
- `setVisibilityAsync` is **not** gated — it calls the native module directly, so hiding the bar works.

## Decisions

### Implemented (high-confidence, in-scope)

| # | Project / file | Improvement | Severity | Decision |
|---|---|---|---|---|
| 1 | `src/services/system-ui-service.ts` | Remove the `setBehaviorAsync('overlay-swipe')` call — under enforced edge-to-edge it is a no-op that logs a warning on every Android launch. Keep `setVisibilityAsync('hidden')` (works). Rewrite the comment that falsely claimed "edge-to-edge is disabled" to state the real behavior. | high | **implement** |
| 2 | `src/pages/menu/page.tsx` | Guard the settings overlay children with `{isSettingsOpen && <SettingsView … />}`, matching the detail overlay sibling, so `useAuthStore`/`SettingsSheet` are not instantiated while hidden. | medium | **implement** |

### Skipped (documented follow-ups)

| # | Project / file | Improvement | Severity | Decision & rationale |
|---|---|---|---|---|
| 3 | `app/_layout.tsx` + deps | Switch to `react-native-edge-to-edge`'s `SystemBars hidden={{ navigationBar: true }}` | — | **skip** — `setVisibilityAsync('hidden')` already hides the bar under edge-to-edge (verified ungated); only adopt `SystemBars` if on-device testing shows the bar still appears. Kept as the documented fallback. |
| 4 | `task-workspace/components/workspace-footer/workspace-footer.tsx` | Same broken `text-on-primary` on `Send`/`Mic` lucide icons as the chat footer | low | **skip (out of scope)** — `task-workspace` is not one of the four reported screens. Fix is identical to Plan 01 and ready to apply; recommended as an immediate follow-up. |
| 5 | `task-workspace/page.tsx` | Still uses the ineffective `KeyboardAvoidingView`; reconcile with the new `useKeyboardHeight` approach | medium | **skip (out of scope)** — different, unrequested screen. Recommended follow-up: promote `useKeyboardHeight` to `src/layout/hooks/` and reuse. |
| 6 | `src/layout/components/menu-settings/settings-sheet-overlay.tsx` | Rename to a generic `*-sheet` and relocate to shared UI primitives (it also hosts the note/reminder detail sheet) | medium | **skip** — works correctly and lives in a defensible location; rename/relocate is a larger, lower-value churn for a prototype. Follow-up. |
| 7 | `settings-sheet-overlay.tsx` | Add an exit/close animation (currently slides in but unmounts instantly) | low | **skip** — matches the chosen reference `task-picker-sheet.tsx`, which also has no exit animation. Apply uniformly to both if desired later. |
| 8 | `src/pages/chat/hooks/use-keyboard-height.ts` | Rename `useKeyboardHeight` → `useKeyboardOffset` (returns an offset, not a raw height) | low | **skip** — cosmetic naming nit. |

## Items confirmed already on-standard (no action)

- Plan 01 chat-footer icon fix — textbook-correct per the documented `lucide-react-native` color convention.
- Plan 03 `use-keyboard-height` hook — correct location/return shape; the `insets.bottom` subtraction is
  internally consistent with the `SafeAreaView edges={['bottom']}` padding.
- Plan 04 menu-sidebar safe-area inset — mirrors `menu-list-shell.tsx` exactly; no double-padding.
- Plan 02/05 service-layer + modal-backdrop patterns — faithfully follow `notifications-service` and
  `task-picker-sheet`.
