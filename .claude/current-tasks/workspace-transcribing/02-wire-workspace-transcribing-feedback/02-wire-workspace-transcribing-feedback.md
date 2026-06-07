# Plan 02 — Wire transcribing voice feedback into the Workspace Sub-Thread Banner

## Context

The Task Workspace screen reuses the same shared voice-capture pipeline as the Chat screen
(`useVoiceStore` in `project-web/src/layout/stores/voice-store`), but its Sub-Thread Banner
consumer never reads voice state. As a result, while the user's audio is being transcribed the
workspace shows nothing, whereas Chat shows a "Hearing you" pending bubble and a retry-on-error
bubble.

This plan brings the workspace banner to parity with Chat by reading the global
`selectVoiceStatus` selector and rendering the new `user-pending` Sub-Thread Banner variant while
transcribing, plus an `error` variant whose retry restarts voice capture. No store, footer, or
selector changes are required — the recording feedback (`RecordingBar`) and the Send-disable
while transcribing are already wired elsewhere.

**This plan modifies exactly one file:**
`project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`

### What I confirmed by reading the code (no guessing)

- **Voice selector**: `selectVoiceStatus` is exported from
  `project-web/src/layout/stores/voice-store/index.ts` (re-exported from `./select-voice-status`).
  It returns `VoiceStatus = "idle" | "recording" | "transcribing" | "error"`
  (`voice-store/types.ts`). Derivation (`select-voice-status.ts`): `recording` when `isRecording`,
  `transcribing` when `transcription === "pending"`, `error` when `transcription === "error"` or
  `recorderError`, else `idle`.
- **Voice retry action name (CONFIRMED, not guessed)**: `retryVoice` — defined in
  `voice-store/index.ts` (`retryVoice: () => { set({ transcription: "idle" }); void get().startRecording(); }`)
  and typed on `VoiceStore` in `voice-store/types.ts`. The Chat error footer
  (`pages/chat/components/message-footers/retry-footer.tsx`) calls exactly this action:
  `const retryVoice = useVoiceStore((store) => store.retryVoice)` → `onClick={retryVoice}`.
- **Chat parity** (`pages/chat/components/chat-history/chat-history.tsx`): reads
  `const voiceStatus = useVoiceStore(selectVoiceStatus)` and renders, at the TOP of its feedback
  chain, `transcribing` (pending bubble) then `error` (retry bubble) BEFORE the `isAwaitingReply`
  (Ben typing) state. Error copy used: `couldn't catch that — tap to retry or type it instead`.
- **Plan 01 variant** (READ-ONLY) — `pages/task-workspace/components/sub-thread-banner/sub-thread-banner.tsx`:
  Plan 01 is adding a `"user-pending"` value to the `variant` union. The current props shape is
  `{ variant?: "ben-reply" | "ben-typing" | "error"; text?: string; onRetry?: () => void }`. The
  `error` variant already renders an `onRetry` button. I consume `variant="user-pending"` with no
  text and `variant="error"` with `text` + `onRetry`; I do NOT modify this file.

## Decisions

1. **Read voice status via the shared selector**, not raw fields, matching Chat:
   `const voiceStatus = useVoiceStore(selectVoiceStatus)`. This keeps the "transcribing"/"error"
   derivation in one place.
2. **Voice branches go at the TOP of the priority chain**, above the existing
   `pendingDiff → isAwaitingReply → sendError → lastBenReply` chain, so transcription feedback wins
   over Ben-side states — exactly mirroring `chat-history.tsx` (voice bubbles render before the
   `isAwaitingReply` typing indicator).
3. **Order within voice branches: `transcribing` then `error`**, matching Chat.
4. **Error retry uses `retryVoice`, NOT `sendText`.** A failed *transcription* means we never got
   text, so re-sending the draft is wrong — we must restart capture. I subscribe to
   `retryVoice` from the store the same way `retry-footer.tsx` does and pass it as `onRetry`. The
   existing `sendError` branch keeps using `sendText(draft)` (that path is a Ben send failure, a
   different concern) — left untouched.
5. **Reuse the `SubThreadBanner` `error` variant for the voice error** (it already renders the
   retry button via `onRetry`), so no new component is needed. Error copy mirrors Chat's intent,
   adapted to the banner's shorter single-line format:
   `"Couldn't catch that — tap to retry"` (the banner truncates text and already pairs it with a
   "retry" button, so the longer "or type it instead" tail is dropped to fit the banner; the
   workspace footer still lets the user type).
6. **`user-pending` renders with no `text`/`onRetry`** — Plan 01's variant supplies its own
   "Hearing you" pending presentation, the same way `ben-typing` needs no text today.

## Files to Modify

### `project-web/src/pages/task-workspace/components/workspace-sub-thread-banner.tsx`

Add the voice-store import (`selectVoiceStatus`, `useVoiceStore`), read `voiceStatus` and
`retryVoice`, and prepend the two voice branches.

**Final file (exact):**

```tsx
import { useAtomValue } from "jotai";
import { memo } from "react";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { taskDraftAtom } from "@/pages/task-workspace/states/task-workspace-state";
import { useTaskChatStore } from "@/pages/task-workspace/stores/task-chat-store";
import { SubThreadBanner } from "./sub-thread-banner/sub-thread-banner";

function WorkspaceSubThreadBannerComponent() {
  const task = useWorkspaceTask();
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const retryVoice = useVoiceStore((store) => store.retryVoice);
  const isAwaitingReply = useTaskChatStore((store) => store.isAwaitingReply);
  const sendError = useTaskChatStore((store) => store.sendError);
  const lastBenReply = useTaskChatStore((store) => store.lastBenReply);
  const sendText = useTaskChatStore((store) => store.sendText);
  const draft = useAtomValue(taskDraftAtom);

  if (voiceStatus === "transcribing") {
    return <SubThreadBanner variant="user-pending" />;
  }
  if (voiceStatus === "error") {
    return (
      <SubThreadBanner
        variant="error"
        text="Couldn't catch that — tap to retry"
        onRetry={retryVoice}
      />
    );
  }

  if (task?.pendingDiff) {
    return null;
  }
  if (isAwaitingReply) {
    return <SubThreadBanner variant="ben-typing" />;
  }
  if (sendError) {
    return (
      <SubThreadBanner
        variant="error"
        text="Ben didn't reply — tap to retry"
        onRetry={() => void sendText(draft)}
      />
    );
  }
  if (lastBenReply) {
    return <SubThreadBanner text={lastBenReply} />;
  }
  return null;
}

export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent);
```

**Diff summary:**

- Add import: `import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";`
  (placed to satisfy the existing import grouping — Chat's `chat-history.tsx` and `page.tsx`
  both group this `@/layout/stores/voice-store` import alongside the other `@/...` imports).
- Add two selectors inside the component:
  `const voiceStatus = useVoiceStore(selectVoiceStatus);`
  `const retryVoice = useVoiceStore((store) => store.retryVoice);`
- Prepend the `transcribing` and `error` voice branches at the top of the return chain.
- Leave the four existing branches (`pendingDiff`, `isAwaitingReply`, `sendError`, `lastBenReply`)
  byte-for-byte unchanged below the voice branches.

## Existing Code to Reuse

- `selectVoiceStatus`, `useVoiceStore`, `retryVoice` — from
  `@/layout/stores/voice-store` (`index.ts`). Same trio Chat consumes.
- `SubThreadBanner` `error` variant with `onRetry` — already renders the retry button; reused for
  the voice error rather than adding a new component.
- `SubThreadBanner` `user-pending` variant — provided by Plan 01 (read-only here).

## Patterns / Conventions Applied

- **Selector-per-value Zustand reads** (`useVoiceStore((store) => store.retryVoice)`), matching
  `retry-footer.tsx` and the existing `useTaskChatStore` reads in this file.
- **No new boolean props / no variant logic in JSX** — variant resolution stays inside
  `SubThreadBanner`'s variant map (component-variant-maps pattern); the consumer only picks the
  variant string.
- **One component per file** preserved; no barrel/export-only file added.
- **File ownership respected** — only `workspace-sub-thread-banner.tsx` changes; no edits to
  `sub-thread-banner.tsx`, the voice-store, the footer, or `task-chat-store`.

## Cross-flow impact

- The new branches short-circuit BEFORE the Ben-side branches, so during transcribing/error the
  Ben-typing / send-error / last-reply banners are suppressed — this is the intended parity
  behavior (transcription feedback wins). Once `voiceStatus` returns to `idle` (transcription
  completes → store calls the registered transcript handler → `sendText` → `isAwaitingReply`), the
  existing `ben-typing` branch takes over automatically. No change to that handoff.
- No impact on the workspace footer `RecordingBar` (recording state) or the shared
  `ChatInput.ActionButton` (Send disabled while transcribing) — both already handled outside this
  file.

## Verification

After implementation (run from the `project-web` project root):

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Expect no new type errors. The `variant="user-pending"` usage depends on Plan 01 having widened
the `SubThreadBanner` variant union; if Plan 01 has not yet landed, `tsc` will flag `user-pending`
as not assignable — that is the expected ordering dependency (this plan runs after Plan 01).

Manual parity check (workspace screen): start a voice capture and stop it → banner shows the
"Hearing you" `user-pending` indicator while transcribing; on a transcription failure the banner
shows the error variant and tapping retry restarts capture (calls `retryVoice`), not a text resend.

(No `npm run lint:fix` here — formatting runs once after all parallel plans finish.)
