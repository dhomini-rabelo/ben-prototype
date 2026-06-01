# Plan 4 — Web Chat Integration (wire voice/connectivity states into the chat page)

This is the **final, synchronous** plan of the `chat-missing-states` initiative. It assembles the
data layer (Plan 2) and the presentational components (Plan 3) into the live chat page so the five
missing states work end-to-end: **recording**, **transcribing**, **permission-denied**, **offline**,
and **error**.

It depends on Plan 1 (transcription contract), Plan 2 (hooks + API client), and Plan 3 (presentation
components). It **owns and edits only three files**, and may **import** symbols the other plans create:

- `project-web/src/pages/chat/hooks/use-chat.ts` (edit — own the voice/connectivity state machine)
- `project-web/src/pages/chat/page.tsx` (edit — render banner, recording bar, footers per state)
- `project-web/src/pages/chat/components/chat-input/chat-input.tsx` (edit — wire the mic button + recording mode)

It must **NOT** edit any other file. In particular it must NOT edit `message-bubble.tsx`,
`chat-history.tsx`, `chat-shell.tsx`, the Plan 3 components, or any `src/api/`/data-layer file.

---

## Context

### What exists today (read directly)

- `page.tsx` renders `ChatShell` (from `./components/chat-shell/chat-shell`, **not** the layout one)
  with a `footer={<ChatInput .../>}` and a body that switches between `ChatHistorySkeleton`,
  `ChatEmptyState`, and `ChatHistory`. `ChatInput` is passed `mode={isLoadingHistory ? "disabled" : "idle"}`.
- `use-chat.ts` returns `{ isLoadingHistory, messages, draft, isAwaitingReply, isEmpty,
  isFetchingOlder, bottomRef, topRef, handleDraftChange, handleSend }`. Sending happens via the
  AI-SDK `sendMessage({ text })` inside `handleSend()`, which reads `draft`, trims it, guards on
  `isAwaitingReply`, clears the draft, then sends.
- `chat-input.tsx` props: `value`, `placeholder`, `mode: "idle" | "composing" | "disabled" |
  "sending-disabled"`, `onChange`, `onSend`, `className`. The **mic button is currently unwired**
  (it has `aria-label="Voice input (press and hold)"` and no `onClick`). The mic shows only when
  `!hasText` (`hasText = mode === "composing" || value.length > 0`).
- `chat-shell.tsx` (the page's own one) slots: `children`, `footer` (required), `peek?`,
  `topBanner?`, `bodyClassName?`. `topBanner` renders inside the fixed header under the brand row.
  `footer` renders in the fixed bottom footer, below `peek`. A `ResizeObserver` measures footer
  height to pad the body, so swapping the footer content (input ↔ recording bar) reflows correctly.
- `message-bubble.tsx` **DOES accept a `footer?: ReactNode` prop** (renders it below the bubble).
  **However**, the message list is rendered by `chat-history.tsx`, which constructs each
  `MessageBubble` itself and does **not** forward a footer, and **`chat-history.tsx` is not owned by
  this plan**. See Decision 4 for how this constrains footer placement.

### What the upstream plans publish (consume these EXACT symbols — do not invent APIs)

**Plan 2 — data layer** (`project-web/src/pages/chat/hooks/*` + `src/api/transcription.ts`):

- `useMediaRecorder()` from `./use-media-recorder` returns:
  `{ permission, isRecording, elapsedSeconds, audioBlob, error, start, stop, cancel, reset }`
  - `permission: "granted" | "denied" | "prompt"` (type `MicPermission` exported from the same file)
  - `isRecording: boolean`
  - `elapsedSeconds: number` (whole seconds, 0 when idle)
  - `audioBlob: Blob | null` (set after `stop()` resolves via `onstop`; `null` while idle/recording/after `cancel`)
  - `error: string | null` (non-permission mic failures, e.g. no device)
  - `start: () => Promise<void>` · `stop: () => void` · `cancel: () => void` · `reset: () => void`
- `useConnectivity()` from `./use-connectivity` returns `{ isOffline: boolean }`.
- `transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse>` from `../../../api/transcription`,
  where `TranscriptionResponse = { text: string }` (model at `../../../api/models/transcription`).
  Errors **propagate** (no internal try/catch) — this plan must catch them.

**Plan 3 — presentation** (props-in components, no data):

- `ChatBanner` from `../../layout/components/chat-banner` (relative to `pages/chat/page.tsx`:
  `../../layout/components/chat-banner`). Props:
  `{ tone?: "info"|"warn"|"error"; icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode; action?: { label: string; onClick?: () => void }; dismissible?: boolean;
  onDismiss?: () => void; className?: string }`.
- `RecordingBar` from `./components/recording-bar/recording-bar`. Props:
  `{ elapsedSeconds: number; maxSeconds?: number; onCancel?: () => void; className?: string }`.
  (Per Plan 3 the red mic button's `onClick` is wired to `onCancel`; there is **no** separate "stop"
  prop — see Decision 5 for how this plan reconciles stop vs cancel.)
- `TranscribingFooter` from `./components/message-footers/transcribing-footer`. Props:
  `{ onCancel?: () => void; className?: string }`.
- `RetryFooter` from `./components/message-footers/retry-footer`. Props:
  `{ onRetry?: () => void; className?: string }`.

**Plan 1 — backend contract**: `POST /transcription`, multipart field `audio`, `200 → { text }`,
`400` on empty/missing audio, `401` unauthenticated. The frontend never calls the backend directly
here — it goes through `transcribeAudio` (Plan 2). On any non-2xx, `transcribeAudio` throws → this
plan transitions to the `error` voice state.

---

## Decisions

### 1. The voice state machine lives in `use-chat.ts`

A discriminated `voiceStatus` union plus derived booleans, mirroring the existing async-status hook
convention in the repo (`use-google-auth.ts`):

```ts
type VoiceStatus = "idle" | "recording" | "transcribing" | "error";
```

`use-chat.ts` owns this `voiceStatus` state, composes `useMediaRecorder()` and `useConnectivity()`,
and exposes everything `page.tsx`/`chat-input.tsx` need. The hooks themselves stay pure (Plan 2);
this plan only orchestrates them. Permission and offline are **not** part of the `voiceStatus` union —
they are **independent, derived flags** (`permission` comes from the recorder, `isOffline` from
connectivity) because a user can be e.g. `recording` while also being warned about a stale offline
banner, or be `idle` with permission denied. Keeping them orthogonal avoids an exploded union.

### 2. Where each banner/footer renders (given ChatShell slots)

| UI piece | ChatShell slot | Condition | Component |
| --- | --- | --- | --- |
| Offline banner | `topBanner` | `isOffline` | `ChatBanner` tone `warn` |
| Permission-denied banner | `topBanner` | `permission === "denied"` (and not offline) | `ChatBanner` tone `warn`, `dismissible` |
| Error banner | `topBanner` | `voiceStatus === "error"` (and not offline) | `ChatBanner` tone `error`, `action: { label: "Retry", onClick: retryVoice }`, `dismissible` |
| Recording bar | `footer` (replaces `ChatInput`) | `voiceStatus === "recording"` | `RecordingBar` |
| Transcribing footer | `footer` (above `ChatInput`, via `peek`-style stacking) | `voiceStatus === "transcribing"` | `TranscribingFooter` |
| Text input | `footer` | always except while `recording` | `ChatInput` |

- **`topBanner` precedence** (only one banner shows at a time): `offline` > `error` > `permission-denied`.
  Offline is the most actionable/global signal; error is transient and dismissible; permission-denied
  is the most passive. A single `topBanner={renderBanner()}` expression in `page.tsx` resolves this
  with a clear if/else-if chain (no nested banners).
- **Recording replaces the input** in the `footer` slot (you cannot type and record simultaneously),
  matching the design `chat-recording` source where the recording bar IS the footer. `ChatShell`'s
  `ResizeObserver` re-measures, so the body padding adjusts automatically.
- **Transcribing footer placement (see Decision 4)**: rendered in the `footer` slot **stacked above**
  the `ChatInput` (so the user still sees the disabled input), inside a small wrapper `<div className="flex flex-col gap-2">`. This is in `page.tsx`, an owned file, and needs no edit to `chat-shell.tsx` (it already renders whatever node it is handed in `footer`).

### 3. How transcribed text enters the send flow

`handleSend()` currently reads `draft`, trims, guards `isAwaitingReply`, clears `draft`, and calls
`sendMessage({ text })`. To avoid duplicating the AI-SDK send logic and to keep a single send path,
this plan extracts a private `sendText(content: string)` helper inside `use-chat.ts`:

```ts
function sendText(content: string) {
  const trimmed = content.trim();
  if (!trimmed || isAwaitingReply || isOffline) {
    return;
  }
  sendMessage({ text: trimmed });
}
```

- `handleSend()` becomes: `sendText(draft); setDraft("")` (only clears the draft on the text path).
- The transcription success path calls `sendText(text)` directly with the transcribed string —
  **the transcribed text never touches `draft`**, so it cannot collide with whatever the user typed,
  and the existing AI-SDK `sendMessage` flow (transport, streaming, `isAwaitingReply`) is reused
  unchanged.
- `isOffline` is now also a send guard (Decision 6).

### 4. message-bubble supports `footer`, but we still render footers at the page/footer level

`message-bubble.tsx` accepts a `footer` prop, **but the only consumer that builds bubbles
(`chat-history.tsx`) does not forward one, and neither file is owned by this plan.** Per the task
constraints, this plan must NOT edit `message-bubble.tsx` or `chat-history.tsx`. Threading a
transcribing/retry footer onto "the last user bubble" would require editing `chat-history.tsx`
(to accept and place a per-message footer) — out of scope.

**Decision:** render `TranscribingFooter` and `RetryFooter` at the **page/footer level** (in the
`footer` slot, owned via `page.tsx`), as a transient status indicator just above the chat input —
not attached to a specific message bubble. This is fully achievable with owned files only.

- `TranscribingFooter` → shown in the footer stack while `voiceStatus === "transcribing"`.
- `RetryFooter` → the retry affordance for the `error` state is delivered through the **`ChatBanner`
  `action` prop** (`{ label: "Retry", onClick: retryVoice }`), which is the canonical, always-visible
  error retry. `RetryFooter` is therefore **not required** for the error path and is intentionally not
  rendered, to avoid two competing retry controls. (It remains available for a future message-attached
  retry once `chat-history.tsx` is owned/extended; noted as a deliberate non-use here so we do not
  edit unowned files.)

> Explicit trade-off: the design mock attaches "Hearing you"/"Tap to retry" under the latest user
> bubble. Because the bubble list is owned by another file, this plan places the transcribing
> indicator in the footer area instead. Visual parity with the exact mock is therefore approximate
> for footer placement; the banner-based retry is functionally equivalent and visible.

### 5. Stop vs. cancel for the recording bar

Plan 3's `RecordingBar` exposes a single `onCancel` (wired to the red mic button per its plan). The
chat flow needs the red mic button to **stop and transcribe** (the primary action), while
slide-to-cancel discards. Since Plan 3 only gives us `onCancel`, this plan wires `RecordingBar`'s
`onCancel` to **`stopRecording`** (stop + proceed to transcription) — the tap on the active mic
button is the natural "I'm done, send it" gesture, matching the design where tapping the lit mic ends
capture. True discard (slide-up-to-cancel) is documented as a follow-up: the `RecordingBar`'s hint
text reads "Slide up to cancel" but Plan 3 ships no gesture handler, so this plan additionally exposes
a `cancelRecording` action and may bind it to a future gesture; for now the only interactive control
is the mic button = stop+transcribe. (No edit to `RecordingBar` — we only pass the prop.)

> Open question OQ-1 (below) flags this `onCancel`-name-vs-stop-behavior mismatch for confirmation.

### 6. Offline behavior — disable sending, show banner

When `isOffline`:
- The offline `ChatBanner` shows in `topBanner`.
- `ChatInput` mode becomes `"sending-disabled"` (keeps the field editable/composable so the user can
  draft, but disables the send/mic buttons — exactly what that mode already does in `chat-input.tsx`).
- `sendText` early-returns when `isOffline` (Decision 3), so even an Enter keypress is a no-op.
- The mic/recording entry point is disabled while offline (you can't transcribe without network).

This is the "reflect queued/disabled sending" requirement: we **disable** (not queue) sending while
offline, which is the simpler honest behavior given no queue infra exists. Documented as such.

### 7. Permission-denied — keep text input usable

When `permission === "denied"`:
- The warn `ChatBanner` shows (lower precedence than offline/error).
- The text input stays in its normal `idle`/`composing` mode (fully usable) — only the **mic entry
  point** is suppressed. `chat-input.tsx` gains a `canRecord` prop (Decision 8) that, when `false`,
  renders the **Send** button styling path is unchanged, but the mic button becomes a no-op/disabled
  so tapping it does nothing (it cannot start a denied recording). The user types normally.

### 8. `chat-input.tsx` changes — add `onStartRecording` + recording wiring, keep compose/send

- Add props: `onStartRecording?: () => void` and `canRecord?: boolean` (default `true`).
- The mic button (shown when `!hasText`) gets `onClick={onStartRecording}` and is `disabled` when
  `disabled || mode === "sending-disabled" || !canRecord`.
- Existing `mode` union is extended with **no new value** for recording, because while recording the
  page swaps the whole footer to `RecordingBar` (Decision 2) — `ChatInput` is unmounted during
  recording, so it needs no `"recording"` mode. (This keeps the `mode` union and existing behavior
  intact; the only behavioral change is the mic button wiring + `canRecord` gate.)
- All existing send/compose behavior (Enter-to-send, text vs. mic button swap, disabled styling) is
  preserved verbatim.

---

## State-transition table

Voice state machine (`voiceStatus`), driven by recorder/connectivity signals and user actions:

| From | Trigger | Action performed | To |
| --- | --- | --- | --- |
| `idle` | user taps mic (`onStartRecording`), `permission !== "denied"`, `!isOffline` | `recorder.reset()` then `await recorder.start()` | `recording` (if start succeeds) |
| `idle` | user taps mic but `recorder.start()` hits `NotAllowedError` | recorder sets `permission="denied"` | `idle` (permission banner shows) |
| `idle` | user taps mic but `recorder.start()` sets `recorder.error` (no device, etc.) | — | `error` |
| `recording` | user taps active mic (`RecordingBar.onCancel` → `stopRecording`) | `recorder.stop()` | `transcribing` (when `audioBlob` arrives) |
| `recording` | `cancelRecording` invoked | `recorder.cancel()` (discards blob) | `idle` |
| `recording` | `recorder.error` becomes set during capture | `recorder.cancel()` | `error` |
| `transcribing` | `transcribeAudio(blob)` resolves `{ text }` | `sendText(text)`, `recorder.reset()` | `idle` |
| `transcribing` | `transcribeAudio(blob)` rejects | `recorder.reset()` | `error` |
| `transcribing` | user taps `TranscribingFooter.onCancel` | abort flag set, ignore in-flight result, `recorder.reset()` | `idle` |
| `error` | user taps banner `action` "Retry" (`retryVoice`) | `recorder.reset()`, set `idle`, then immediately `startRecording()` | `recording` (or back to `error`/`idle` per start outcome) |
| `error` | user dismisses error banner (`onDismiss`) | `recorder.reset()` | `idle` |
| any | `isOffline` becomes `true` | sending disabled, offline banner (orthogonal flag — does not change `voiceStatus`) | unchanged |
| any | `permission` becomes `"denied"` | permission banner (orthogonal flag) | unchanged |

The `recording → transcribing` and `transcribing → idle/error` edges are driven by **effects** that
watch `recorder.audioBlob` and the in-flight transcription promise (Decision: see `use-chat.ts` code).

---

## Files to Modify

### A. `project-web/src/pages/chat/hooks/use-chat.ts`

Add the voice/connectivity orchestration. New imports, new state (`voiceStatus`), composed hooks,
the `sendText` extraction, the recording/transcription effects + actions, and an extended return.

**New imports (top of file):**

```ts
import { transcribeAudio } from "../../../api/transcription";
import { useConnectivity } from "./use-connectivity";
import { useMediaRecorder } from "./use-media-recorder";
```

**Add the voice status type** (module scope, above `useChat`):

```ts
type VoiceStatus = "idle" | "recording" | "transcribing" | "error";
```

**Inside `useChat`,** after the existing `useState`/refs and before `handleSend`, compose the hooks
and own the state:

```ts
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const recorder = useMediaRecorder();
  const { isOffline } = useConnectivity();
  const transcriptionRunIdRef = useRef(0);
```

**Replace `handleSend` with the `sendText` extraction:**

```ts
  function sendText(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isAwaitingReply || isOffline) {
      return;
    }
    sendMessage({ text: trimmed });
  }

  function handleSend() {
    sendText(draft);
    setDraft("");
  }
```

> Note: `setDraft("")` runs unconditionally on the text path (matching prior UX where the field
> clears on Enter/Send tap). If you prefer to only clear on a successful send, gate it on the same
> guard; kept as-is to minimize behavior change.

**Add the voice actions** (after `handleSend`):

```ts
  async function startRecording() {
    if (recorder.permission === "denied" || isOffline) {
      return;
    }
    recorder.reset();
    await recorder.start();
    if (recorder.permission !== "denied") {
      setVoiceStatus("recording");
    }
  }

  function stopRecording() {
    recorder.stop();
  }

  function cancelRecording() {
    recorder.cancel();
    setVoiceStatus("idle");
  }

  function cancelTranscribing() {
    transcriptionRunIdRef.current += 1;
    recorder.reset();
    setVoiceStatus("idle");
  }

  function retryVoice() {
    recorder.reset();
    setVoiceStatus("idle");
    void startRecording();
  }

  function dismissError() {
    recorder.reset();
    setVoiceStatus("idle");
  }
```

> The `startRecording` `permission`-recheck after `await` handles the case where `getUserMedia`
> rejected with `NotAllowedError` (Plan 2 sets `recorder.permission = "denied"` and does not begin
> recording): we then stay out of `recording`. The dedicated mic-`error` case is caught by the effect
> below (Plan 2 sets `recorder.error` for non-permission failures).

**Add the effects that move the machine on recorder signals** (after the existing scroll effect):

```ts
  useEffect(() => {
    if (voiceStatus === "recording" && recorder.error) {
      recorder.cancel();
      setVoiceStatus("error");
    }
  }, [voiceStatus, recorder.error]);

  useEffect(() => {
    if (voiceStatus !== "recording" || recorder.isRecording || !recorder.audioBlob) {
      return;
    }

    const blob = recorder.audioBlob;
    const runId = transcriptionRunIdRef.current + 1;
    transcriptionRunIdRef.current = runId;
    setVoiceStatus("transcribing");

    transcribeAudio(blob)
      .then(({ text }) => {
        if (transcriptionRunIdRef.current !== runId) {
          return;
        }
        sendText(text);
        recorder.reset();
        setVoiceStatus("idle");
      })
      .catch(() => {
        if (transcriptionRunIdRef.current !== runId) {
          return;
        }
        recorder.reset();
        setVoiceStatus("error");
      });
  }, [voiceStatus, recorder.isRecording, recorder.audioBlob]);
```

> Why a `runId` ref: `cancelTranscribing()` bumps the ref so a resolved/rejected in-flight promise is
> ignored (Plan 2's `transcribeAudio` cannot be aborted; we drop its result instead). The
> `recording → transcribing` transition fires only when capture has fully stopped
> (`!recorder.isRecording`) **and** a blob is present — guaranteeing we read the finished clip Plan 2
> produces in `recorder.onstop`. `sendText` is intentionally not in the dep array (stable per-render
> closure reading current `draft`/`isOffline`; the effect captures the values at fire time, which is
> correct for a one-shot transcription send). If `react-hooks/exhaustive-deps` complains, wrap
> `sendText` in `useCallback` or read the needed values via refs — both acceptable; keep deps honest.

**Extend the return object:**

```ts
  return {
    isLoadingHistory: historyState.isLoading,
    messages,
    draft,
    isAwaitingReply,
    isEmpty: !historyState.isLoading && messages.length === 0,
    isFetchingOlder: historyState.isFetchingNextPage,
    bottomRef,
    topRef,
    handleDraftChange,
    handleSend,
    voiceStatus,
    isOffline,
    micPermission: recorder.permission,
    recordingSeconds: recorder.elapsedSeconds,
    canRecord: recorder.permission !== "denied" && !isOffline,
    startRecording,
    stopRecording,
    cancelRecording,
    cancelTranscribing,
    retryVoice,
    dismissError,
  };
```

> `recordingSeconds` is surfaced (not the whole recorder) so `page.tsx` passes only what `RecordingBar`
> needs (`elapsedSeconds`). The page never touches `MediaRecorder` directly — the hook is the seam.

### B. `project-web/src/pages/chat/page.tsx`

Render the banner (topBanner), swap footer between recording bar / input, and stack the transcribing
footer above the input. Banner precedence is resolved in a small local helper.

**New imports:**

```ts
import { TriangleAlert, WifiOff } from "lucide-react";
import { ChatBanner } from "../../layout/components/chat-banner";
import { RecordingBar } from "./components/recording-bar/recording-bar";
import { TranscribingFooter } from "./components/message-footers/transcribing-footer";
```

> `lucide-react` is already a dependency (used by `chat-input.tsx`). `TriangleAlert`/`WifiOff` are
> passed as the banner `icon`. If a chosen icon name is unavailable in the installed `lucide-react`
> version, substitute the nearest available (e.g. `AlertTriangle`); the icon is cosmetic and the
> banner `icon` prop is optional. Confirm at implementation time with `npx tsc --noEmit`.

**Replace the `return` body.** The new `Chat` render:

```tsx
export function Chat() {
  const navigate = useNavigate();
  const chat = useChat();

  useEffect(() => {
    if (!Cookies.get(JWT_COOKIE)) {
      navigate(ROUTES.login);
    }
  }, [navigate]);

  const isRecording = chat.voiceStatus === "recording";
  const isTranscribing = chat.voiceStatus === "transcribing";

  function renderTopBanner() {
    if (chat.isOffline) {
      return (
        <ChatBanner tone="warn" icon={WifiOff}>
          You're offline. Messages will send once you're back online.
        </ChatBanner>
      );
    }
    if (chat.voiceStatus === "error") {
      return (
        <ChatBanner
          tone="error"
          icon={TriangleAlert}
          action={{ label: "Retry", onClick: chat.retryVoice }}
          dismissible
          onDismiss={chat.dismissError}
        >
          Mic glitched. Tap retry to try again.
        </ChatBanner>
      );
    }
    if (chat.micPermission === "denied") {
      return (
        <ChatBanner tone="warn" icon={TriangleAlert} dismissible>
          Ben can't hear you yet. Enable mic access in your browser settings.
        </ChatBanner>
      );
    }
    return undefined;
  }

  function renderFooter() {
    if (isRecording) {
      return (
        <RecordingBar
          elapsedSeconds={chat.recordingSeconds}
          onCancel={chat.stopRecording}
        />
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {isTranscribing && (
          <TranscribingFooter onCancel={chat.cancelTranscribing} />
        )}
        <ChatInput
          value={chat.draft}
          mode={
            chat.isLoadingHistory
              ? "disabled"
              : chat.isOffline || isTranscribing
                ? "sending-disabled"
                : "idle"
          }
          canRecord={chat.canRecord}
          onChange={(event) => chat.handleDraftChange(event.target.value)}
          onSend={chat.handleSend}
          onStartRecording={chat.startRecording}
        />
      </div>
    );
  }

  return (
    <ChatShell
      topBanner={renderTopBanner()}
      footer={renderFooter()}
      bodyClassName={chat.isEmpty ? "px-6" : undefined}
    >
      {chat.isLoadingHistory ? (
        <ChatHistorySkeleton />
      ) : chat.isEmpty ? (
        <ChatEmptyState />
      ) : (
        <ChatHistory
          messages={chat.messages}
          isAwaitingReply={chat.isAwaitingReply}
          isFetchingOlder={chat.isFetchingOlder}
          bottomRef={chat.bottomRef}
          topRef={chat.topRef}
        />
      )}
    </ChatShell>
  );
}
```

> Notes:
> - The `peek` slot stays commented-out exactly as today (untouched).
> - While `transcribing`, the input is `sending-disabled` (can't double-send) and the transcribing
>   footer sits above it — both inside the single `footer` node, no `chat-shell.tsx` edit needed.
> - While `recording`, the footer is the `RecordingBar` only; `ChatInput` is unmounted (Decision 8).
> - `ChatShell.topBanner` accepts `undefined` (it guards `{topBanner && ...}`), so returning
>   `undefined` from `renderTopBanner()` hides the banner row cleanly.

### C. `project-web/src/pages/chat/components/chat-input/chat-input.tsx`

Add `onStartRecording` + `canRecord`, wire the mic button, preserve everything else.

**Extend the props type:**

```ts
type ChatInputProps = {
  value?: string;
  placeholder?: string;
  mode?: "idle" | "composing" | "disabled" | "sending-disabled";
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSend?: () => void;
  onStartRecording?: () => void;
  canRecord?: boolean;
  className?: string;
};
```

**Extend the destructure + defaults:**

```ts
export function ChatInput({
  value = "",
  placeholder = "Message Ben...",
  mode = "idle",
  onChange,
  onSend,
  onStartRecording,
  canRecord = true,
  className,
}: ChatInputProps) {
```

**Wire the mic button** (the `!hasText` branch). Replace the existing mic `<button>` with:

```tsx
        <button
          type="button"
          aria-label="Voice input"
          onClick={onStartRecording}
          disabled={disabled || mode === "sending-disabled" || !canRecord}
          className="ml-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-60"
        >
          <Mic className="size-5" />
        </button>
```

> Only two changes vs. today: added `onClick={onStartRecording}` and added `|| !canRecord` to the
> existing `disabled` expression, and simplified the `aria-label` ("press and hold" no longer applies
> since it's a tap-to-start; tap-the-recording-bar-mic-to-stop). The Send button branch, the input,
> the attach button, all classes, and `handleKeyDown` are unchanged.

---

## Existing code to reuse (concrete symbols)

| Symbol | From | Used by | Purpose |
| --- | --- | --- | --- |
| `useMediaRecorder` (`{ permission, isRecording, elapsedSeconds, audioBlob, error, start, stop, cancel, reset }`) | `./use-media-recorder` (Plan 2) | `use-chat.ts` | mic capture lifecycle + permission + timer + blob |
| `MicPermission` (`"granted"|"denied"|"prompt"`) | `./use-media-recorder` (Plan 2) | (type only, optional) | permission typing |
| `useConnectivity` (`{ isOffline }`) | `./use-connectivity` (Plan 2) | `use-chat.ts` | offline detection |
| `transcribeAudio(blob) → Promise<{ text }>` | `../../../api/transcription` (Plan 2) | `use-chat.ts` | upload clip, get text |
| `ChatBanner` | `../../layout/components/chat-banner` (Plan 3) | `page.tsx` | offline / permission / error banners |
| `RecordingBar` | `./components/recording-bar/recording-bar` (Plan 3) | `page.tsx` | recording footer (timer/waveform/hint) |
| `TranscribingFooter` | `./components/message-footers/transcribing-footer` (Plan 3) | `page.tsx` | "Hearing you" + cancel |
| `RetryFooter` | `./components/message-footers/retry-footer` (Plan 3) | (intentionally NOT used — Decision 4) | message-attached retry (future) |
| `sendMessage({ text })` (AI-SDK) | already in `use-chat.ts` (`useAiChat`) | `use-chat.ts` `sendText` | single send path for typed + transcribed text |
| `ChatShell` (`topBanner`/`footer`/`peek` slots) | `./components/chat-shell/chat-shell` | `page.tsx` | banner + footer composition (NOT edited) |
| `Mic` icon, `cn` | `lucide-react`, `../../../../layout/utils/styles` | `chat-input.tsx` | already imported, reused |

---

## Verification

### 1. Type check (authoritative)

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Must be clean. Watch for: the Plan 2/Plan 3 import paths resolving (`./use-media-recorder`,
`./use-connectivity`, `../../../api/transcription`, `../../layout/components/chat-banner`,
`./components/recording-bar/recording-bar`, `./components/message-footers/transcribing-footer`);
the `lucide-react` icon names (`WifiOff`, `TriangleAlert`/`AlertTriangle`) existing in the installed
version; the extended `ChatInput` props compiling at the call site; the `voiceStatus` union and the
extended `useChat` return type inferring correctly.

### 2. Manual click-through (run `npm run dev` in `project-web`, sign in, open chat)

**Recording (state 1):**
- Tap the mic button → browser permission prompt (first time). Allow → footer swaps to `RecordingBar`,
  the timer ticks up once/second (`recordingSeconds`), waveform animates, "Slide up to cancel" shows,
  the text input is gone. OS/tab mic indicator is lit.

**Transcribing (state 2):**
- Tap the active red mic in `RecordingBar` → capture stops (mic indicator off), footer returns to the
  input (now `sending-disabled`) with `TranscribingFooter` ("Hearing you" + dots) stacked above it.
- On success → the transcribed text appears as a **user** message in the history (via `sendText`),
  Ben's reply streams as normal, footer returns to a normal idle input.
- Tap the `TranscribingFooter` `X` mid-flight → returns to idle input immediately; even if the
  in-flight `transcribeAudio` later resolves, **no message is sent** (runId guard).

**Permission denied (state 3):**
- In browser site settings, block the mic (or deny the prompt). The recorder reports `permission ===
  "denied"`. → warn `ChatBanner` ("Ben can't hear you yet…") shows in the header; the **text input
  stays fully usable** (type + Enter sends); the mic button is disabled (tap does nothing).

**Offline (state 4):**
- DevTools → Network → Offline. → warn `ChatBanner` ("You're offline…") shows; input switches to
  `sending-disabled` (field still editable, Send/mic disabled); pressing Enter is a no-op
  (`sendText` guards on `isOffline`). Set back to Online → banner clears, sending re-enabled.

**Error (state 5):**
- Force a mic failure (e.g. no input device) → after `start()`, `recorder.error` set → error
  `ChatBanner` ("Mic glitched…") with **Retry** action + dismiss. -OR- force a transcription failure
  (stop the backend / return non-2xx) → after stop, the transcribing footer shows briefly, then
  `transcribeAudio` rejects → error banner.
- Tap **Retry** → `recorder.reset()` + immediately re-enters `recording` (or back to error if it
  fails again). Tap **dismiss (X)** → returns to idle input, no banner.

### 3. Precedence / regression checks

- Offline + permission-denied simultaneously → **only** the offline banner shows (precedence).
- Error + offline simultaneously → **only** offline banner shows.
- Normal typed message (no voice) still sends exactly as before (regression: `handleSend` → `sendText`
  → `sendMessage`, draft clears).
- History load skeleton/empty/streaming states render unchanged (no edits to those paths).

---

## Open questions

- **OQ-1 — `RecordingBar.onCancel` semantics.** Plan 3 ships `RecordingBar` with a single `onCancel`
  prop wired to the red mic button, but the chat flow needs that button to **stop-and-transcribe**
  (primary action), with slide-up the discard. This plan wires `onCancel` → `stopRecording`
  (stop + transcribe) and exposes a separate `cancelRecording` (discard) with no UI trigger yet
  (Plan 3 ships no slide gesture). Confirm: (a) is binding `onCancel` to stop-and-transcribe
  acceptable, or (b) should we ask Plan 3 to expose a distinct `onStop` vs `onCancel` so the red
  button stops and a real slide/secondary control cancels? If (b), that is a change to a Plan-3-owned
  file and must be coordinated, not done here.
- **OQ-2 — Transcribing footer placement.** The design mock attaches "Hearing you"/"Tap to retry"
  under the latest **user bubble** (via `MessageBubble.footer`), but `chat-history.tsx` (which builds
  the bubbles) is not owned by this plan. This plan renders the transcribing indicator in the footer
  area above the input instead, and delivers error-retry via the banner `action`. Confirm this
  placement is acceptable, or whether `chat-history.tsx` ownership should be added to this plan to
  achieve exact bubble-attached footers.
- **OQ-3 — Offline = disabled (not queued).** The briefing says "reflect queued/disabled sending." No
  message-queue infrastructure exists. This plan **disables** sending while offline (banner + guards).
  Confirm disabling is sufficient for v1, or whether an offline send queue is in scope (it would be a
  larger data-layer change beyond the three owned files).
