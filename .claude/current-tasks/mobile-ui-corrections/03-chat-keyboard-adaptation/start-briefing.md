# Plan 03 — Make the chat screen adapt to the on-screen keyboard

**Plan 1 [Frontend] (parallel)**: Make the chat screen layout adapt when the text keyboard opens, so the input bar and message history stay visible above the keyboard.

- Runs in parallel with all other plans. It owns the chat **screen layout** (`project-mobile/src/pages/chat/page.tsx`) and, if needed, the chat-history list component under `src/pages/chat/components/chat-history/`. It must NOT edit `chat-footer.tsx` (owned by Plan 01). No other plan touches `page.tsx` or `chat-history`, so there is no conflict.

## Goal

Image 4 shows that when the keyboard opens, the chat input footer is hidden behind the keyboard and the screen does not adapt. Root cause: in `page.tsx` the `KeyboardAvoidingView` only wraps the absolutely-positioned footer (`absolute inset-x-0 bottom-0`) with Android `behavior="height"`, which does not actually lift the footer above the keyboard on Android.

Fix the chat layout so that, when the keyboard opens, the input bar rises above it and the message history / empty state remain visible and scrollable above the input. Choose the correct, codebase-consistent keyboard-handling approach for Expo SDK 54 / RN 0.81 (e.g. a proper `KeyboardAvoidingView` configuration, `useKeyboard`/keyboard listeners adjusting bottom offset, or restructuring the absolute footer). Preserve the existing header/footer `onLayout` measuring (`headerHeight`/`footerHeight`) and the `bottomInset` passed to the history list. Keep behavior correct on both iOS and Android.

## Files owned

- `project-mobile/src/pages/chat/page.tsx`
- `project-mobile/src/pages/chat/components/chat-history/` (only if the keyboard fix requires it)

## Reference (read-only, not owned)

- `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx` — rendered inside the footer; do not edit (owned by Plan 01).
- `project-mobile/src/pages/chat/hooks/use-scroll-to-bottom.ts` — existing scroll behavior.
