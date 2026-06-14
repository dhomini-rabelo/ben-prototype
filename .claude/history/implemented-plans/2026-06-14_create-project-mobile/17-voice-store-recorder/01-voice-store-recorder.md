# Plan 17 — Voice store + recorder (expo-av)

> Code-level plan only. **Do not implement yet.** This plan ports `project-web`'s voice-recording
> store into `project-mobile`, **preserving the voice state machine intact** (`index.ts`, `types.ts`,
> `select-voice-status.ts`) and **rewriting only the two platform pieces** — `recorder.ts` over
> `expo-av` `Audio.Recording`, and `mic-permission.ts` over `Audio.requestPermissionsAsync()` /
> `getPermissionsAsync()`. It also ports the recording-gate hook (`use-can-record.ts`) and the
> microphone-permission hook (`use-microphone-permission.ts`).

## Context & references read

- **Decisions:** `MOBILE-PORT-ANALYSIS.md` point **3** — "Gravador de voz: reescrever só `recorder.ts`
  sobre `expo-av`: `Audio.Recording`, permissão via `Audio.requestPermissionsAsync()`, exportar
  `.m4a`/`.caf` e mandar no `FormData`. Toda a máquina de estados de voz (timer, `transcriptionRunId`,
  `setTranscriptHandler`) é preservada." Also the "Reescritas" line: **microphone permission
  (`navigator.permissions`) → handled by `expo-av`**, and the additional-libs row requiring
  `app.json` mic config (`NSMicrophoneUsageDescription`, Android `RECORD_AUDIO`).
- `docs/assemblyai-transcription.md` — the transcribe step rejects audio **shorter than 160 ms**;
  guard against empty/very short clips before uploading.
- **Brief:** `17-voice-store-recorder/start-briefing.md` + `briefing/01-voice-store-recorder.md`.
  Owned files, and the note that `use-can-record` lives in **`src/layout/hooks/`** (cross-page),
  while `use-microphone-permission` lives in **`src/pages/chat/hooks/`**.
- **Web reference (read in full):** `project-web/src/layout/stores/voice-store/`
  (`index.ts`, `types.ts`, `recorder.ts`, `mic-permission.ts`, `select-voice-status.ts`),
  `src/layout/hooks/use-can-record.ts`, `src/pages/chat/hooks/use-microphone-permission.ts`,
  `src/pages/chat/hooks/use-media-recorder.ts` (the older per-component recorder — **not ported**;
  it duplicates `recorder.ts` and is superseded by the store).
- **Design (`code-get-coding-designs`):** `web-page-stores-structure` — the voice store is a
  cross-page global store under `src/layout/stores/`, **already split into a folder** because it is
  non-trivial (recorder + permission + status selector). Keep that exact folder shape on mobile.
- **`code-write-code` / frontend preferences:** kebab-case file names, **no comments**,
  self-explanatory code, one component per file, no barrel/export-only files (import concrete
  modules directly), keep existing patterns.

### Cross-plan dependencies (consumed, NOT created here)

- **Plan 04 — `src/api/requests/transcription.ts`:** `requestTranscribeAudio(audioUri: string)
  => Promise<TranscriptionResponse>` where `TranscriptionResponse = { text: string }`. **Signature
  changed from web:** web took a `Blob`; mobile takes a **file URI string**. This store passes the
  `expo-av` recording's local file URI straight into it. Import: `@/api/requests/transcription`.
- **Plan 07 — `src/layout/stores/connectivity-store.ts`:** `useConnectivityStore` exposes
  `isOffline: boolean` (copied intact from web). Used by `startRecording`'s offline gate and by
  `use-can-record`. Import: `@/layout/stores/connectivity-store`.
- **Plan 01 — `expo-av`:** must be installed (`npx expo install expo-av`) and the mic permission
  strings configured in `app.json` (`ios.infoPlist.NSMicrophoneUsageDescription`, Android
  `RECORD_AUDIO`). The `@/*` path alias (tsconfig paths + babel module-resolver) is also from plan 01.
  **This plan does not touch `app.json` or install commands** — it only assumes they exist. If
  `expo-av` is absent when this runs, `tsc` will fail on the import; install it first.

> **expo-av vs expo-audio:** the analysis explicitly chose **`expo-av`** (`Audio.Recording`). The
> newer `expo-audio` is a different API; do **not** use it here — stay on `expo-av` to match the
> decision and plan 01's dependency.

## Owned files (the only files this plan creates/touches)

```
project-mobile/src/layout/stores/voice-store/index.ts                 # COPY INTACT (state machine)
project-mobile/src/layout/stores/voice-store/types.ts                 # COPY INTACT
project-mobile/src/layout/stores/voice-store/select-voice-status.ts   # COPY INTACT
project-mobile/src/layout/stores/voice-store/recorder.ts              # REWRITE (expo-av)
project-mobile/src/layout/stores/voice-store/mic-permission.ts        # REWRITE (expo-av perms)
project-mobile/src/layout/hooks/use-can-record.ts                     # PORT (copy intact)
project-mobile/src/pages/chat/hooks/use-microphone-permission.ts      # PORT (rewrite over expo-av)
```

**Parallel-safety:** this plan touches **only** the files above. It does not modify the API layer,
the connectivity store, `app.json`, or any UI. The RecordingBar UI (plan 18) and voice/chat
integration (plan 19) depend on this plan and run in later slots.

---

## Per-file actions

### 1. COPY INTACT — `types.ts`

Byte-for-byte from `project-web/src/layout/stores/voice-store/types.ts`. No platform types here; the
public store shape is identical across web and mobile.

```ts
export type TranscriptionStatus = "idle" | "pending" | "error";
export type VoiceStatus = "idle" | "recording" | "transcribing" | "error";
export type MicPermission = "granted" | "denied" | "prompt";

export interface VoiceStore {
  transcription: TranscriptionStatus;
  isRecording: boolean;
  recorderError: string | null;
  micPermission: MicPermission;
  recordingSeconds: number;

  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  cancelTranscribing: () => void;
  retryVoice: () => void;
  dismissError: () => void;
  subscribeMicPermission: () => () => void;
  setTranscriptHandler: (handler: (text: string) => void) => void;
}
```

### 2. COPY INTACT — `select-voice-status.ts`

Byte-for-byte from web. Pure function over store state; no platform dependency.

```ts
import type { VoiceStatus, VoiceStore } from "./types";

export function selectVoiceStatus(state: VoiceStore): VoiceStatus {
  if (state.isRecording) {
    return "recording";
  }
  if (state.transcription === "pending") {
    return "transcribing";
  }
  if (state.transcription === "error" || state.recorderError) {
    return "error";
  }
  return "idle";
}
```

### 3. COPY INTACT — `index.ts` (the state machine — preserved exactly)

This is the **state machine the brief requires kept intact**: `timer`, `transcriptionRunId`,
`onTranscript`/`setTranscriptHandler`, the run-id staleness guard, the 1-second counter cleared on
stop/cancel/teardown, the offline+denied gate, and the recorder-callback wiring.

**Only difference from web — exactly one line:** the recorder's `onStop` callback now receives a
**file URI `string`** instead of a `Blob`, and that string is passed to `requestTranscribeAudio`
(whose own signature changed to `string` in plan 04). Everything else is identical. The
`@/...` imports resolve the same way they do on web.

```ts
import { create } from "zustand";
import { requestTranscribeAudio } from "@/api/requests/transcription";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { subscribeMicPermission } from "./mic-permission";
import {
  cancelRecorder,
  releaseRecorder,
  startRecorder,
  stopRecorder,
} from "./recorder";
import type { VoiceStore } from "./types";

export { selectVoiceStatus } from "./select-voice-status";
export type {
  MicPermission,
  TranscriptionStatus,
  VoiceStatus,
  VoiceStore,
} from "./types";

let timer: ReturnType<typeof setInterval> | null = null;
let transcriptionRunId = 0;
let onTranscript: (text: string) => void = () => {};

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  transcription: "idle",
  isRecording: false,
  recorderError: null,
  micPermission: "prompt",
  recordingSeconds: 0,

  setTranscriptHandler: (handler) => {
    onTranscript = handler;
  },

  startRecording: async () => {
    if (
      get().micPermission === "denied" ||
      useConnectivityStore.getState().isOffline
    ) {
      return;
    }

    set({ transcription: "idle", recorderError: null, recordingSeconds: 0 });

    const started = await startRecorder({
      onPermission: (permission) => set({ micPermission: permission }),
      onError: (message) => set({ recorderError: message }),
      onStop: (audioUri) => {
        clearTimer();
        set({ isRecording: false });

        const runId = ++transcriptionRunId;
        requestTranscribeAudio(audioUri)
          .then(({ text }) => {
            if (transcriptionRunId !== runId) {
              return;
            }
            onTranscript(text);
            set({ transcription: "idle" });
          })
          .catch(() => {
            if (transcriptionRunId !== runId) {
              return;
            }
            set({ transcription: "error" });
          });
      },
    });

    if (!started) {
      return;
    }

    set({ isRecording: true, recordingSeconds: 0 });
    timer = setInterval(() => {
      set((state) => ({ recordingSeconds: state.recordingSeconds + 1 }));
    }, 1000);
  },

  stopRecording: () => {
    set({ transcription: "pending" });
    stopRecorder();
  },

  cancelRecording: () => {
    transcriptionRunId += 1;
    cancelRecorder();
    clearTimer();
    set({ isRecording: false, recordingSeconds: 0, transcription: "idle" });
  },

  cancelTranscribing: () => {
    transcriptionRunId += 1;
    set({ recorderError: null, recordingSeconds: 0, transcription: "idle" });
  },

  retryVoice: () => {
    set({ transcription: "idle" });
    void get().startRecording();
  },

  dismissError: () => {
    set({ recorderError: null, recordingSeconds: 0, transcription: "idle" });
  },

  subscribeMicPermission: () => {
    const unsubscribe = subscribeMicPermission((permission) =>
      set({ micPermission: permission }),
    );

    return () => {
      unsubscribe();
      clearTimer();
      releaseRecorder();
    };
  },
}));
```

**Preserved guarantees (verify against web after writing):**

| Concern | Where | Preserved? |
|---|---|---|
| `timer` 1s counter, cleared on stop/cancel/teardown | `clearTimer()` in `onStop`, `cancelRecording`, teardown | ✅ identical |
| `transcriptionRunId` staleness guard | `++transcriptionRunId` in `onStop`; `+= 1` in cancel/cancelTranscribing | ✅ identical |
| Page-registered transcript destination | `onTranscript` / `setTranscriptHandler` | ✅ identical |
| Offline + denied gate | `startRecording` early return | ✅ identical |
| Status transitions (idle/pending/error) | unchanged `set` calls | ✅ identical |

> The **only** line that changed vs web is the `onStop` parameter name `blob` → `audioUri` (a string),
> which flows into the plan-04 `requestTranscribeAudio(audioUri: string)`. Callback **contract** in
> `recorder.ts` (below) is updated to match: `onStop: (uri: string) => void`.

### 4. REWRITE — `recorder.ts` (over `expo-av` `Audio.Recording`)

**Why rewrite (analysis point 3):** web uses `navigator.mediaDevices.getUserMedia` + `MediaRecorder`
+ in-memory `Blob` chunks. None of these exist in React Native. `expo-av` records to an on-device
file and exposes a **file URI** (`.m4a` on Android, `.caf`/`.m4a` on iOS via the `HIGH_QUALITY`
preset), which is exactly what plan-04's `requestTranscribeAudio(audioUri)` consumes.

**Exported surface kept identical to web** so `index.ts` calls them unchanged — only the `onStop`
payload type changes (`Blob` → `string`):

- `startRecorder(callbacks): Promise<boolean>`
- `stopRecorder(): void`
- `cancelRecorder(): void`
- `releaseRecorder(): void`  *(now `async` internally but kept callable as fire-and-forget, same as web)*

**Behavior mapping web → expo-av:**

| Web (`MediaRecorder`) | Mobile (`expo-av`) |
|---|---|
| `getUserMedia({ audio: true })` throws `NotAllowedError` on denied | `Audio.requestPermissionsAsync()` returns `{ granted: false }` → `onPermission("denied")` |
| permission OK → `onPermission("granted")` | `granted: true` → `onPermission("granted")` |
| `new MediaRecorder(stream)` + `.start()` | `Audio.Recording.createAsync(HIGH_QUALITY)` (prepares + starts) |
| `recorder.stop()` → `onstop` builds `Blob` | `stopAndUnloadAsync()` → read `getURI()` → `onStop(uri)` |
| `cancel()` nulls `onstop`, stops, releases | stop + unload, **skip** `onStop`, release |
| `stream.getTracks().forEach(stop)` | `stopAndUnloadAsync()` + restore audio mode |
| generic capture failure → `onError(...)` | any thrown error (non-permission) → `onError(...)` |
| — | **min-duration guard** (AssemblyAI rejects <160 ms) → `onError(...)`, no upload |

**Module-level singleton** mirrors web's single `recorder`/`stream`/`chunks` module state (the store
relies on a single shared recorder; only one capture screen is mounted at a time).

```ts
import { Audio } from "expo-av";
import type { MicPermission } from "./types";

const MIN_RECORDING_MILLIS = 500;
const CAPTURE_ERROR_MESSAGE = "Could not access the microphone.";

interface RecorderCallbacks {
  onPermission: (permission: MicPermission) => void;
  onError: (message: string) => void;
  onStop: (audioUri: string) => void;
}

let recording: Audio.Recording | null = null;
let activeCallbacks: RecorderCallbacks | null = null;
let isCancelled = false;

async function resetAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });
}

export async function releaseRecorder() {
  const current = recording;
  recording = null;
  activeCallbacks = null;
  if (current) {
    try {
      await current.stopAndUnloadAsync();
    } catch {
      // already unloaded
    }
  }
  await resetAudioMode();
}

export async function startRecorder(
  callbacks: RecorderCallbacks,
): Promise<boolean> {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    callbacks.onPermission("denied");
    return false;
  }
  callbacks.onPermission("granted");

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: created } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    recording = created;
    activeCallbacks = callbacks;
    isCancelled = false;
    return true;
  } catch {
    callbacks.onError(CAPTURE_ERROR_MESSAGE);
    await releaseRecorder();
    return false;
  }
}

export async function stopRecorder() {
  const current = recording;
  const callbacks = activeCallbacks;
  if (!current || !callbacks) {
    return;
  }

  recording = null;
  activeCallbacks = null;

  try {
    const status = await current.stopAndUnloadAsync();
    const uri = current.getURI();

    if (isCancelled) {
      return;
    }

    const durationMillis = status.durationMillis ?? 0;
    if (!uri || durationMillis < MIN_RECORDING_MILLIS) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE);
      return;
    }

    callbacks.onStop(uri);
  } catch {
    if (!isCancelled) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE);
    }
  } finally {
    await resetAudioMode();
  }
}

export function cancelRecorder() {
  isCancelled = true;
  void releaseRecorder();
}
```

**Notes & rationale:**

- **`stopRecorder` is async but called synchronously** by the store (`stopRecorder();` with no
  `await`), exactly like web's fire-and-forget `recorder.stop()`. The `onStop` callback is what
  resumes the state machine — identical control flow to web's `onstop` event.
- **`releaseRecorder` / `cancelRecorder` are async-internally but fire-and-forget** at the call
  sites (`releaseRecorder()` in teardown, `cancelRecorder()` in `cancelRecording`), matching web's
  synchronous signatures so `index.ts` compiles **without any change to those call sites**. Returning
  a floating promise is acceptable here and avoids changing the preserved state machine.
- **`isCancelled` flag** replaces web's "null the `onstop` handler" trick: when `cancelRecorder`
  runs, a concurrent/late `stopRecorder` must **not** fire `onStop` (and must not surface an error),
  mirroring web where cancel detaches the stop handler before stopping. `cancelRecording` in the
  store also bumps `transcriptionRunId`, so even a racing late result is ignored — double safety,
  same as web.
- **Min-duration guard (160 ms in AssemblyAI; we use a safer 500 ms):** prevents uploading an empty
  tap-record-tap clip that the transcription provider rejects. On a too-short clip we surface
  `onError`, which the store maps to the `error` voice status (no transcription request fired).
- **`HIGH_QUALITY` preset** produces `.m4a` (Android) / `.caf`-or-`.m4a` (iOS) — matches plan-04's
  default upload name `recording.m4a` / MIME `audio/m4a`. The store passes the raw `getURI()` string;
  plan 04 wraps it as `{ uri, name, type }` in `FormData`.
- **Audio mode** is enabled (`allowsRecordingIOS: true`) before recording and restored to `false`
  after stop/cancel/release so playback and the silent switch behave normally afterward.
- **No `useMediaRecorder` port:** web's `src/pages/chat/hooks/use-media-recorder.ts` is a legacy
  component-local duplicate of this module and is **not** in scope; the store-owned `recorder.ts`
  fully replaces it.

### 5. REWRITE — `mic-permission.ts` (over `expo-av` permission APIs)

**Why rewrite (analysis "Reescritas"):** web uses `navigator.permissions.query({ name: "microphone" })`
and listens to its `change` event. RN has no Permissions API. `expo-av` exposes
`Audio.getPermissionsAsync()` / `requestPermissionsAsync()` returning a `PermissionResponse`
(`{ granted, canAskAgain, status, ... }`), but **no change-event stream**.

**Mapping native permission → the store's three `MicPermission` states:**

| `expo-av` `PermissionResponse` | `MicPermission` |
|---|---|
| `status === "granted"` (`granted: true`) | `"granted"` |
| `status === "denied"` && `canAskAgain === false` | `"denied"` |
| `status === "denied"` && `canAskAgain === true` (or `"undetermined"`) | `"prompt"` |

Rationale: on RN, an "askable" denial is functionally a **prompt** (the OS dialog will appear on the
next request) — only a permanently blocked permission is a hard `"denied"`, matching how the store's
gate (`micPermission === "denied"`) should behave (block recording only when it can never succeed).

**Subscription contract preserved:** web's `subscribeMicPermission(onChange) => unsubscribe`. Since
`expo-av` has no live change events, the mobile version reads the **current** permission once
(async), pushes it to `onChange`, and returns a **no-op unsubscribe** — fulfilling the same contract
the store's `subscribeMicPermission` action expects. A guard flag prevents pushing after unsubscribe.

```ts
import { Audio } from "expo-av";
import type { PermissionResponse } from "expo-modules-core";
import type { MicPermission } from "./types";

function toMicPermission(response: PermissionResponse): MicPermission {
  if (response.granted) {
    return "granted";
  }
  if (response.status === "denied" && !response.canAskAgain) {
    return "denied";
  }
  return "prompt";
}

export function subscribeMicPermission(
  onChange: (permission: MicPermission) => void,
): () => void {
  let active = true;

  Audio.getPermissionsAsync()
    .then((response) => {
      if (active) {
        onChange(toMicPermission(response));
      }
    })
    .catch(() => undefined);

  return () => {
    active = false;
  };
}
```

**Notes:**

- `PermissionResponse` is re-exported by `expo-av` (from `expo-modules-core`). If `tsc` cannot
  resolve the `expo-modules-core` import path on plan-01's setup, fall back to
  `Awaited<ReturnType<typeof Audio.getPermissionsAsync>>` as the parameter type — same shape, no new
  dependency. Prefer the explicit import; switch only if `tsc` fails.
- No live updates is acceptable: the store also learns the real result via `startRecorder`'s
  `onPermission` callback (granted/denied) on the next recording attempt, so the UI converges.

### 6. PORT — `use-can-record.ts` (COPY INTACT) → `src/layout/hooks/`

Cross-page gate hook. Platform-agnostic: it only reads two Zustand stores. Copy byte-for-byte; both
imports resolve on mobile (`connectivity-store` from plan 07, `voice-store` from this plan). Lives in
**`src/layout/hooks/`** (per the brief's clarification), not under `pages/chat/hooks/`.

```ts
import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { useVoiceStore } from "@/layout/stores/voice-store";

export function useCanRecord(): boolean {
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  return micPermission !== "denied" && !isOffline;
}
```

### 7. PORT — `use-microphone-permission.ts` (REWRITE over expo-av) → `src/pages/chat/hooks/`

Web's hook wraps `navigator.permissions.query` in `useEffect` + `useState`. The mobile version reads
the current permission via `Audio.getPermissionsAsync()` on mount, mapping to the same three
`MicPermission` states, and keeps the **identical return shape** `{ permission, setPermission }` so
any consumer screen (plan 19) is unchanged. The mounted-guard prevents a post-unmount `setState`.

```ts
import { Audio } from "expo-av";
import type { PermissionResponse } from "expo-modules-core";
import { useEffect, useState } from "react";

export type MicPermission = "granted" | "denied" | "prompt";

function toMicPermission(response: PermissionResponse): MicPermission {
  if (response.granted) {
    return "granted";
  }
  if (response.status === "denied" && !response.canAskAgain) {
    return "denied";
  }
  return "prompt";
}

export function useMicrophonePermission() {
  const [permission, setPermission] = useState<MicPermission>("prompt");

  useEffect(() => {
    let active = true;

    Audio.getPermissionsAsync()
      .then((response) => {
        if (active) {
          setPermission(toMicPermission(response));
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return { permission, setPermission };
}
```

**Notes:**

- Keeps `export type MicPermission` and the `{ permission, setPermission }` return so it is a
  drop-in for web's hook (the `voice-store/types.ts` `MicPermission` is structurally identical; this
  hook keeps its own local copy exactly as web does, to avoid a cross-import).
- Same `PermissionResponse` import fallback as `mic-permission.ts` if `tsc` cannot resolve it.

---

## Execution order (within this plan)

1. `types.ts`, `select-voice-status.ts` (no deps).
2. `mic-permission.ts`, `recorder.ts` (depend on `expo-av` + `types.ts`).
3. `index.ts` (depends on 1+2 and on plan-04 `requestTranscribeAudio` + plan-07 connectivity store).
4. `use-can-record.ts`, `use-microphone-permission.ts` (depend on the store / `expo-av`).

## Verification

- **No formatting/lint step** for this plan.
- `cd project-mobile && npx tsc --noEmit` passes.
- Manual cross-check (no runtime here): diff `index.ts`, `types.ts`, `select-voice-status.ts`
  against web — they must differ **only** in the `onStop` payload name (`blob` → `audioUri`) inside
  `index.ts`; `types.ts` and `select-voice-status.ts` must be byte-for-byte identical.

## Risks / open items

- **`expo-av` availability:** if plan 01 has not installed `expo-av`, `tsc` fails on the import —
  install (`npx expo install expo-av`) and add the mic permission strings to `app.json` first. Out of
  scope for this plan's files but a hard prerequisite.
- **`expo-modules-core` type import:** documented fallback above if the path doesn't resolve.
- **`expo-av` deprecation:** Expo is steering toward `expo-audio`. The analysis fixed the decision on
  `expo-av` for this port; revisit only if a later SDK upgrade removes `expo-av` — would be a
  separate task touching only `recorder.ts` + `mic-permission.ts`.
