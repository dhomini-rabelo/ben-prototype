# Plan 19 — Voice ↔ Chat Integration (project-mobile) — Implementation Plan

> **Type:** SYNC. Runs ALONE, after plans 15 (chat-footer), 16 (chat page assembly), 17 (voice store), 18 (RecordingBar UI) are complete.
> **Edits existing files only** — no new files. Owned files belong to plans 15 and 16; this plan plugs voice into the seams they left.
> **No formatting step.** Verification: `npx tsc --noEmit`.

---

## 1. Objective

Connect the already-built voice flow into the existing mobile chat surface, mirroring `project-web`:

1. The chat footer's record button starts recording — gated so it only fires when capturing is allowed (mic not denied **and** device online).
2. The footer swaps to the `RecordingBar` overlay while `recording` (and the chat page already hides the task picker while recording, per plan 16).
3. The chat page registers a transcript handler so a finished transcription is sent as a chat message via the same path as a typed message.

This is a faithful port. The web behavior is the source of truth; we only adapt it to the seams plans 15/16 expose (footer `onStartRecording` prop + page transcript seam), rather than re-deriving any logic.

---

## 2. Source-of-truth references (project-web)

- Chat page transcript handler + recording-driven layout:
  `/home/fael/so/repos/ben-prototype/project-web/src/pages/chat/page.tsx` (lines 29–33, 50–51, 81)
- Footer recording-bar swap:
  `/home/fael/so/repos/ben-prototype/project-web/src/pages/chat/components/chat-footer/chat-footer.tsx` (lines 12, 16–18)
- Record-button gating (the web equivalent lives inside the shared action button):
  `/home/fael/so/repos/ben-prototype/project-web/src/layout/components/chat-input/chat-input-action-button.tsx` (lines 8, 12, 34–44)
- Gate hook:
  `/home/fael/so/repos/ben-prototype/project-web/src/layout/hooks/use-can-record.ts`
- Voice store public API (intact in mobile, plan 17):
  `/home/fael/so/repos/ben-prototype/project-web/src/layout/stores/voice-store/types.ts`
  - `startRecording: () => Promise<void>`, `setTranscriptHandler: (handler: (text: string) => void) => void`, `subscribeMicPermission: () => () => void`
- Status selector:
  `/home/fael/so/repos/ben-prototype/project-web/src/layout/stores/voice-store/select-voice-status.ts`
  - `selectVoiceStatus(state) → "idle" | "recording" | "transcribing" | "error"`
- Messages store sender:
  `/home/fael/so/repos/ben-prototype/project-web/src/pages/chat/stores/messages-store/types.ts`
  - `sendText: (content: string) => Promise<boolean>`

> **Key architectural note (why mobile differs from web):** In web, the record button's `onClick={startRecording}` and `useCanRecord()` gating live **inside the shared `ChatInputActionButton`**. Plan 15 for mobile deliberately did **not** wire voice into the shared input; instead it gave the footer's record `IconButton` an `onStartRecording` prop (left unwired/disabled). So in mobile the wiring lives in the **chat-footer** (plan 15's file), not in the shared chat-input. This plan therefore wires `onStartRecording` and the `RecordingBar` swap in the footer, and the transcript handler in the page — exactly the two seams plans 15/16 left open.

---

## 3. Owned files (edited, not created)

| File | Owner plan | This plan's edit |
|---|---|---|
| `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx` | 15 | Read `voiceStatus`; render `RecordingBar` while recording; supply `onStartRecording` → `startRecording`, gated by `useCanRecord`. |
| `project-mobile/src/pages/chat/page.tsx` | 16 | In an effect, register `setTranscriptHandler((text) => useMessagesStore.getState().sendText(text))`; (subscribe mic permission if plan 16 didn't already). |

> If plan 15 placed the footer's record-button gating logic in a footer sub-component (e.g. `chat-input-action-button.tsx` / a footer action button rather than the root `chat-footer.tsx`), apply the `onStartRecording`/`useCanRecord` edit in **that** sub-component instead — follow the seam plan 15 actually left. The diffs below assume the seam is the footer root + its action button; adjust the file target to wherever the `onStartRecording` prop is declared. **Do not** re-introduce voice logic into the shared `layout/components/chat-input` primitive (plan 15 kept it voice-agnostic on purpose).

Dependencies relied on (do not edit): voice store + `useCanRecord` (plan 17), `RecordingBar` (plan 18), messages store (plan 10/12).

---

## 4. Implementation steps

### Step A — Footer: swap to RecordingBar while recording, wire `onStartRecording`

Goal: reproduce `chat-footer.tsx` (web lines 12, 16–18) + the action-button gating (web `chat-input-action-button.tsx` lines 8, 12, 34–44), adapted to the mobile footer's `onStartRecording` seam.

Target: `project-mobile/src/pages/chat/components/chat-footer/chat-footer.tsx` (the file plan 15 owns; the record-button gating may instead belong in the footer's action-button sub-component — see note in §3).

Concrete shape (RN/NativeWind; adjust JSX wrappers to whatever plan 15 produced — the load-bearing parts are the `voiceStatus` read, the recording branch, and the gated `onStartRecording`):

```tsx
// at top of chat-footer.tsx — add imports
import { RecordingBar } from "@/layout/components/recording-bar";
import { useCanRecord } from "@/pages/chat/hooks/use-can-record";
import { selectVoiceStatus, useVoiceStore } from "@/layout/stores/voice-store";
```

```tsx
function ChatFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const startRecording = useVoiceStore((store) => store.startRecording);
  const canRecord = useCanRecord();
  const { state: historyState } = useMessageListData();
  const { draft, handleDraftChange, handleSend } = useChatInput();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={historyState.isLoading}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input />
      <ChatInput.ActionButton
        onStartRecording={startRecording}
        canRecord={canRecord}
      />
    </ChatInput.Root>
  );
}
```

Notes:
- `voiceStatus === "recording"` is the only condition that replaces the input with the bar — identical to web (web `chat-footer.tsx:16`). `transcribing`/`error` keep the normal input shown (web shows those as message-footer bubbles in history, not in the footer); the simple briefing's "overlay remains visible through transcription/error" is satisfied at the **page** level via `hasVoiceBubble` (Step C), not by the footer.
- `onStartRecording` must be invoked by the record `IconButton` only when there's no draft text (the web `ActionButton` switches to Send when `draft.length > 0`). If plan 15's `ChatInput.ActionButton` already implements the hasText→Send / noText→record branch (it should, mirroring web), then this plan only needs to feed it `onStartRecording` + `canRecord`; the button stays `disabled` when `!canRecord` (web `chat-input-action-button.tsx:39`).
- **If** plan 15's action button takes `onStartRecording` but NOT a `canRecord` prop (i.e. it disables itself off a default/no-op), pass the gating through whatever prop plan 15 declared. The invariant to preserve: record `IconButton` is disabled / inert unless `canRecord === true`, and pressing it calls `useVoiceStore.getState().startRecording()`.

Exact call wiring (the load-bearing line, however the props are threaded):

```tsx
onStartRecording={() => {
  if (!canRecord) return;
  void useVoiceStore.getState().startRecording();
}}
```

> Prefer the store-selector form `const startRecording = useVoiceStore((s) => s.startRecording)` and pass it directly when the button already gates on `canRecord`; use the `getState()` inline guard form only if the button cannot itself gate. Pick whichever matches plan 15's action-button prop contract — do not change that contract.

### Step B — Confirm the footer-level "recording" hides the task picker

This is already owned by plan 16's `page.tsx` (web `page.tsx:50,81`: `isRecording = voiceStatus === "recording"` → `{!isRecording && <ActiveTaskPicker />}`). Plan 16's briefing explicitly says "Show the task picker only when the user is not recording." **No edit needed here unless** plan 16 left it as a seam keyed off the transcript wiring; verify `page.tsx` reads `selectVoiceStatus` and already gates the picker. If plan 16 omitted it, add it as part of Step C.

### Step C — Chat page: register the transcript handler

Goal: reproduce web `page.tsx:29–33`. Send a finished transcription as a chat message via `sendText`, the same path a typed message uses.

Target: `project-mobile/src/pages/chat/page.tsx` (plan 16 owns it and left a clearly-marked seam for this).

Replace the seam (a marked comment / placeholder from plan 16) with:

```tsx
import { useMessagesStore } from "./stores/messages-store";
import { useVoiceStore } from "@/layout/stores/voice-store";
// (selectVoiceStatus / useCanRecord only if the page also gates the picker — see below)

useEffect(() => {
  useVoiceStore.getState().setTranscriptHandler((text) => {
    void useMessagesStore.getState().sendText(text);
  });
}, []);
```

Notes:
- Use `useMessagesStore.getState().sendText` (not a subscribed selector) — matches web exactly and avoids re-registering the handler on every store change. The effect has an empty dep array; it runs once when the chat screen mounts/becomes active.
- `sendText` returns `Promise<boolean>`; we `void` it — the voice store does not await delivery, identical to web.
- **Gating note (briefing item 3, "registration only applies while recording is permitted"):** Web registers the handler unconditionally and gates *starting* a recording via `useCanRecord` on the button. Since no transcription can complete without a recording having started (which is already gated), the registration itself needs no `useCanRecord` guard to be correct. The start-briefing line "gate with `useCanRecord`" refers to the **record-button** gate (Step A), which is the same effective gate web uses. **Do not** wrap `setTranscriptHandler` in a `useCanRecord` condition — that would diverge from web and could leave the handler unset if permission flips mid-session. Keep the gate on the button (Step A); register the handler unconditionally on mount (this step).
- `subscribeMicPermission`: web calls `useVoiceStore.getState().subscribeMicPermission()` in a separate mount effect (web `page.tsx:35`). If plan 16 already added this in the page, leave it. If NOT, add it here so `micPermission` (and therefore `useCanRecord`) is live:
  ```tsx
  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);
  ```
  (Plan 17's `subscribeMicPermission` returns an unsubscribe fn; returning it from the effect cleans up on unmount — same as web.)
- If Step B found the picker gate missing, add to the page (web `page.tsx:50,81`):
  ```tsx
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const isRecording = voiceStatus === "recording";
  // ...
  {!isRecording && <ActiveTaskPicker />}
  ```

### Step D — Page empty-state vs history during voice (parity check)

Web keeps history visible (instead of the empty state) while a voice bubble is active: `hasVoiceBubble = voiceStatus === "transcribing" || voiceStatus === "error"` and renders `<ChatHistory />` instead of `<ChatEmptyState />` when `historyState.isEmpty && !hasVoiceBubble` is false (web `page.tsx:51,68–74`). Plan 16's briefing item 3 says it already "accounts for transcribing and error voice states when choosing between empty state and history." **Verify** plan 16's `page.tsx` contains this `hasVoiceBubble` logic. If present: no edit. If plan 16 left it as part of the voice seam: add it now mirroring the web lines above. This is the mechanism that satisfies the simple-briefing requirement "the overlay remains visible through the transcription phase and any transcription error" (realized as the transcribing/error message-footer bubbles in history, not a footer overlay).

---

## 5. Idle revert (briefing item 2: "When voice returns to idle, the footer reverts to the normal text input")

No explicit code needed: it falls out of `voiceStatus`. When the store returns `isRecording=false` and `transcription` back to `idle`, `selectVoiceStatus` → `"idle"`, the footer's `voiceStatus === "recording"` branch is false, and `ChatInput.Root` renders again. The page's `isRecording`/`hasVoiceBubble` also flip back. This is purely reactive via the existing store selectors — confirm, don't add state.

---

## 6. Edge cases & invariants to preserve

- **Draft present → Send, not record.** The action button must keep its send behavior when `draft.length > 0` (web `chat-input-action-button.tsx:20–32`). This plan must not break that branch; it only feeds `onStartRecording`/`canRecord` for the no-text branch.
- **Disabled while loading.** `disabled={historyState.isLoading}` stays; a disabled footer must not start recording (web button: `disabled={disabled || !canRecord}`).
- **No duplicate handler registration.** `setTranscriptHandler` effect uses `[]` deps. Registering twice would still be harmless (it overwrites), but keep it once on mount to match web.
- **Stale transcription runs** are handled inside the voice store (`transcriptionRunId`, plan 17) — not this plan's concern.
- **Offline mid-recording / permission revoked:** governed by the store + `useCanRecord` (live via `subscribeMicPermission`); button re-disables reactively. No extra handling here.
- **One concern per store/component** (react-single-responsibility): we do not add voice state to the messages store or chat state; the footer reads voice via `useVoiceStore`, sends via `useMessagesStore` — composed at the call site, not merged.

---

## 7. Conventions

- kebab-case file names (unchanged — editing existing files).
- One component per file (no new components introduced).
- No barrel/export-only files added.
- Imports use the concrete module path (`@/layout/stores/voice-store`, `@/layout/components/recording-bar`, `@/pages/chat/hooks/use-can-record`) — matching plans 17/18 placements (note: `use-can-record` lives under `pages/chat/hooks/` in mobile per plan 17, NOT `layout/hooks/` as in web).
- No code comments; the seam comments left by plans 15/16 are removed when wired.

---

## 8. Verification

Run from the mobile project root once it exists:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Manual / behavioral acceptance (briefing item 4):
- No draft text + `canRecord` → press record → `voiceStatus` becomes `recording` → footer shows `RecordingBar`, page hides task picker.
- Stop recording → `transcribing` → (page shows transcribing bubble in history) → on success the transcript is delivered to `setTranscriptHandler` → appears as a sent chat message via `sendText`.
- On transcription failure → `error` state surfaces (history bubble), footer reverts to input.
- Return to `idle` → footer shows normal `ChatInput`, task picker reappears.
- Draft text present → button is Send and does not start recording.

---

## 9. Risk / assumptions log

- **Assumption:** plan 15's footer action button exposes `onStartRecording` (and ideally a `canRecord`/`disabled`-for-record prop). Confirm the exact prop names against plan 15's output before editing; thread the gate through whatever it declared. The invariant (press → `startRecording`, disabled unless `canRecord`) is fixed; the prop plumbing is not.
- **Assumption:** plan 16's `page.tsx` already implements task-picker gating and `hasVoiceBubble` empty-vs-history logic (its briefing claims both). Steps B and D are verify-then-maybe-add, not unconditional edits.
- **Assumption:** plan 17 keeps `setTranscriptHandler`, `startRecording`, `subscribeMicPermission`, `micPermission`, and `selectVoiceStatus` with identical signatures to web (its briefing says "copy intact"). If any name changed, update the call sites accordingly.
- `use-can-record` import path: `@/pages/chat/hooks/use-can-record` (plan 17), not the web `@/layout/hooks/use-can-record`.
