# Plan 01 — Fix the broken chat-input voice (and send) icon

**Plan 1 [Frontend] (parallel)**: Fix the broken voice/mic icon (and the send icon) in the chat input footer.

- Runs in parallel with all other plans in this task. It owns only `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx` and touches no file owned by another plan, so there is no conflict.

## Goal

Image 1 shows the microphone icon in the chat input bar rendering "broken" (no fill / wrong color). Root cause: `chat-footer.tsx` renders the `Mic` and `Send` lucide icons with `className="text-on-primary"`, but `lucide-react-native` SVG icons do **not** inherit NativeWind `text-*` classes (documented in `src/layout/utils/colors.ts`). They must receive an explicit `color` hex prop instead — exactly as the working icons do in `chat-top-bar.tsx` (`color={primary}`) and `recording-bar.tsx` (`color={onPrimary}`).

The fix: replace the `className="text-on-primary"` on the `Mic` and `Send` icons with `color={onPrimary}` (imported from `@/layout/utils/colors`), keeping the existing button background and behavior.

## Files owned

- `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx`

## Reference (read-only, not owned)

- `project-mobile/src/layout/utils/colors.ts` — exports `onPrimary` and explains the lucide/NativeWind issue.
- `project-mobile/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx` and `project-mobile/src/layout/components/recording-bar.tsx` — correct usage of the `color` prop.
