# Plan 16 — Chat page assembly + route

**Plan 9 [Frontend] (sync)**: Assemble the chat page from the parallel chat pieces and register its route.

- Runs **alone** after all the parallel chat component plans (12–15). It composes pieces owned by four different plans into the page and owns the new route file, so it must not run in parallel.

## Goal

Compose the chat screen (`ChatTopBar`, `ChatTopBanner`, `ChatHistory`, `ChatFooter`, capture cards, task picker, typing indicator) into `page.tsx`, add `KeyboardAvoidingView` + safe areas (analysis "diferenças conceituais"), wire connectivity, and register the expo-router screen.

## Scope / owned files

- `project-mobile/src/pages/chat/page.tsx` — `Chat` component assembling the parts; `KeyboardAvoidingView`, `SafeAreaView`, `useConnectivity()`. The voice transcript handler registration is added later by plan 19; here leave a clearly marked seam (or omit voice wiring).
- `project-mobile/app/(protected)/chat.tsx` — route rendering `Chat`.

## Verification

`npx tsc --noEmit` passes; chat screen renders end-to-end (text send works; voice not yet wired).
