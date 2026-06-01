# Plan: Voice & connectivity data layer (project-web)

Headless logic for the chat voice flow and offline detection, plus the transcription API client.
This is **Plan 2** of the `chat-missing-states` initiative and runs in parallel with the presentation
plan (Plan 3) and backend plan (Plan 1). It owns **only data/logic files** — no page, UI, or
component files, and it does **not** edit `use-chat.ts`, `page.tsx`, or `chat-input.tsx`.

## Context

The voice flow (per `docs/assemblyai-transcription.md`) is: the browser records a short audio clip
with `MediaRecorder`, uploads it to the backend as multipart form-data, the backend transcribes it
via AssemblyAI (async mode) and returns the text, and the frontend sends that text through the
existing `/chat` flow. This plan builds the three headless pieces that Plan 3 will consume:

1. `useMediaRecorder` — mic permission + recording lifecycle + elapsed time + resulting `Blob`.
2. `useConnectivity` — offline detection via `navigator.onLine` + `online`/`offline` events.
3. Transcription API client — `transcription` route constant, response model, and `transcribeAudio(blob)`.

The contract is **published by Plan 1** (`01-backend-transcription-endpoint`) and confirmed in its
plan's API-contract table:

| Aspect | Value |
| --- | --- |
| Method / path | `POST /transcription` |
| Auth | Required — sends `jwtauthenticationtoken` + `providerauthenticationtoken` headers |
| Body | `multipart/form-data`, single file field **`audio`** |
| Success | `200 OK` → `{ "text": string }` |
| Missing/empty audio | `400` → `{ "audio": ["VALIDATION#..."] }` |
| Unauthenticated | `401` |

The frontend therefore POSTs `FormData` with field name **`audio`** through the **authenticated**
axios client (`authClient`, which injects both auth headers and the `ngrok-skip-browser-warning`
default header) and reads `response.data.text`.

### Project conventions observed (from real files)

- API layer lives in `src/api/`: `client.ts` (axios instances), `routes.ts` (`API_ROUTES` const
  object), `types.ts` (generic wrappers), `models/*.ts` (plain exported `interface`s, no barrel file).
- `API_ROUTES` is a nested `as const` object grouped by domain (`auth`, `messages`, `chat`).
- Call functions are not yet centralized in `src/api/` — existing callers (`use-google-auth.ts`,
  `use-api-request.ts`) call the axios client inline. This plan introduces the first standalone
  call-function module (`src/api/transcription.ts`), keeping the same client/route imports those
  callers use (`basicClient`/`authClient` from `../api/client`, `API_ROUTES` from `../api/routes`).
- Hooks: kebab-case filenames, camelCase exported identifier, return an object. Async-status hooks
  model state as a discriminated `status` string union plus derived booleans
  (`use-google-auth.ts`: `'idle' | 'loading' | 'denied' | 'error'` → `isLoading`, `isPermissionDenied`).
- No comments in code (per `code-write-code` skill). Self-explanatory naming.
- Indentation/quotes vary slightly per file (some 2-space single-quote, some double-quote). Match the
  surrounding API-layer files: **double quotes + semicolons** for `src/api/*` (matches
  `routes.ts`/`message.ts`/`client.ts`), since the new hook files are new we use the same
  double-quote + semicolon style for consistency with the api layer they import from. `eslint --fix`
  (run by the global post-task rule) will normalize anything minor.

## Decisions

1. **MediaRecorder mime type = `audio/webm` (extension `.webm`).**
   - `audio/webm` (Opus) is the broadly supported `MediaRecorder` output in Chromium/Firefox and is
     accepted by AssemblyAI. Safari historically prefers `audio/mp4`; to stay robust we **probe**
     with `MediaRecorder.isTypeSupported('audio/webm')` and fall back to letting the browser pick the
     default (construct `MediaRecorder` with no `mimeType`) if `audio/webm` is unsupported. The final
     `Blob` is built using `recorder.mimeType` (the actual negotiated type) so the produced clip's
     type always matches what was recorded.
   - The backend (Plan 1) passes `req.file.mimetype` straight to AssemblyAI and AssemblyAI auto-detects
     the container, so the exact subtype does not need to be pinned client-side — we only need a
     well-formed audio blob. We document `audio/webm` as the expected default.
   - FormData field filename: `recording.webm` (cosmetic; backend reads by field name `audio`, not
     filename). When the negotiated type is not webm we still name it `recording.webm` for simplicity;
     this is acceptable because AssemblyAI detects format from bytes, not filename. (Noted as a minor
     known-limitation rather than branching the extension.)

2. **Permission-detection strategy = derive from `getUserMedia` outcome, augmented by the Permissions
   API when available.**
   - Initial `permission` state is `"prompt"`.
   - On `start()`, call `navigator.mediaDevices.getUserMedia({ audio: true })`. Success → set
     `permission` to `"granted"` and begin recording. Rejection with `error.name === "NotAllowedError"`
     (or `"PermissionDeniedError"`, the legacy name) → set `permission` to `"denied"`. Other rejections
     (`NotFoundError`, etc.) → leave `permission` as-is and surface via `error`.
   - **Optionally** (best-effort, feature-detected) query `navigator.permissions.query({ name: "microphone" })`
     on mount to pre-populate `permission` (`granted`/`denied`/`prompt`) and subscribe to its
     `change` event so a permission revoked/granted in browser settings updates the hook without a
     re-record. This is wrapped in `try/catch` because the `"microphone"` permission name is not
     universally typed/supported (notably Firefox). The `getUserMedia` outcome remains the source of
     truth.
   - Rationale: the design needs a dedicated **permission-denied** state, and `NotAllowedError` is the
     reliable cross-browser signal for denial. The Permissions API is a progressive enhancement.

3. **Why a hook (not a context).**
   - The recorder and connectivity are **consumed by a single subtree** (the chat input area, owned by
     Plan 3). There is no cross-tree sharing requirement, and the existing pattern for page-scoped
     logic is a hook under `src/pages/<page>/hooks/` (e.g. `use-chat.ts`, `use-infinite-scroll-top.ts`).
     A context would add indirection with no consumer benefit. Connectivity is likewise local to the
     chat experience for now; if it later needs to be app-wide it can be lifted, but Plan 3 only needs
     a hook return value.

4. **`transcribeAudio` lives in a standalone module, not a hook.**
   - The briefing specifies a `transcribeAudio(blob)` **function** (not a hook). Plan 3 decides how to
     invoke it (likely inside its own mutation/async-status hook). Keeping it a plain async function in
     `src/api/transcription.ts` mirrors the api-layer separation (`client.ts` + `routes.ts` + `models/`)
     and lets errors **propagate** to the caller (briefing item 5: "Allow failures to propagate"). We do
     **not** swallow errors or wrap in try/catch here.

5. **Elapsed time = `seconds` integer driven by `setInterval(1000ms)`.**
   - Stored in state as `elapsedSeconds`. Started on record start, cleared on stop/cancel/unmount.
     Tracking seconds (not ms) matches the design's "Hearing you"/timer display granularity and avoids
     a high-frequency re-render. The interval is stored in a ref for cleanup.

6. **Cleanup discipline.**
   - All streams/tracks, the `MediaRecorder`, the interval, and (if used) the Permissions-API listener
     are released on `stop()`, `cancel()`, and component unmount (effect cleanup). `cancel()` discards
     the produced blob (does not resolve it) and stops every `MediaStreamTrack` so the mic indicator
     turns off. Refs hold the live `MediaRecorder`, `MediaStream`, and `chunks` array (mutable,
     non-rendering values).

## Existing code to reuse

- `authClient` — `project-web/src/api/client.ts`. The transcription POST goes through this instance so
  it carries `jwtauthenticationtoken` + `providerauthenticationtoken` (set in its request interceptor)
  and the `ngrok-skip-browser-warning` default header, and benefits from the 401 → logout response
  interceptor. **Do not** use `basicClient` (no auth) for this authed route.
- `API_ROUTES` — `project-web/src/api/routes.ts`. New `transcription` group added here.
- Model style — `project-web/src/api/models/message.ts` / `user.ts`: plain exported `interface`,
  no default export, no barrel. `transcription.ts` model follows this exactly.
- Async-status hook pattern — `project-web/src/layout/hooks/use-google-auth.ts`: `status` union in
  `useState`, exposed as derived booleans + a single action function. `useMediaRecorder` mirrors this.
- `useEffect` cleanup pattern — `use-chat.ts` / `use-infinite-scroll-top.ts` for listener/ref handling.

## Contracts / Tables

### `useMediaRecorder` return shape

| Field | Type | Meaning |
| --- | --- | --- |
| `permission` | `"granted" \| "denied" \| "prompt"` | Mic permission status; `"denied"` drives the permission-denied UI |
| `isRecording` | `boolean` | True while a clip is being captured |
| `elapsedSeconds` | `number` | Whole seconds since the current recording started (0 when idle) |
| `audioBlob` | `Blob \| null` | The finished clip after `stop()`; `null` while idle/recording/after `cancel()` |
| `error` | `string \| null` | Non-permission failures (e.g. no mic device); `null` otherwise |
| `start` | `() => Promise<void>` | Requests permission (if needed) and begins recording |
| `stop` | `() => void` | Stops recording; resolves `audioBlob` via the recorder's `onstop` |
| `cancel` | `() => void` | Aborts recording, discards the clip, releases the stream/tracks |
| `reset` | `() => void` | Clears `audioBlob`/`error`/`elapsedSeconds` to start a fresh session |

### `useMediaRecorder` permission state transitions

| Trigger | Resulting `permission` |
| --- | --- |
| Initial | `"prompt"` (or Permissions-API value if available) |
| `getUserMedia` resolves | `"granted"` |
| `getUserMedia` rejects `NotAllowedError`/`PermissionDeniedError` | `"denied"` |
| Permissions-API `change` event | mirrors `status.state` (`granted`/`denied`/`prompt`) |

### `useConnectivity` return shape

| Field | Type | Meaning |
| --- | --- | --- |
| `isOffline` | `boolean` | `true` when `navigator.onLine === false`; updates on `online`/`offline` events |

### Transcription API contract (consumed from Plan 1)

| Aspect | Value |
| --- | --- |
| Route constant | `API_ROUTES.transcription.create` → `"/transcription"` |
| Method | `POST` via `authClient` |
| Body | `FormData` with field `audio` = the recorded `Blob` (filename `recording.webm`) |
| Response | `{ text: string }` (`TranscriptionResponse`) |
| `transcribeAudio` return | `Promise<TranscriptionResponse>` → `{ text }` |

## Files to Create / Modify

### 1. MODIFY `src/api/routes.ts` — add `transcription` route

Add a `transcription` group to the existing `API_ROUTES` const, keeping the nested `as const` shape.

```ts
export const API_ROUTES = {
  auth: {
    loginOrRegister: "/auth/login-or-register",
  },
  messages: {
    list: "/messages/list",
  },
  chat: {
    send: "/chat",
  },
  transcription: {
    create: "/transcription",
  },
} as const;
```

### 2. CREATE `src/api/models/transcription.ts` — response model

Plain exported interface, matching `models/message.ts` style.

```ts
export interface TranscriptionResponse {
  text: string;
}
```

### 3. CREATE `src/api/transcription.ts` — `transcribeAudio` call function

Builds `FormData` with field `audio`, POSTs through `authClient`, returns `{ text }`. Errors propagate
(no try/catch). Filename is cosmetic; the backend reads the field name `audio`.

```ts
import { authClient } from "./client";
import type { TranscriptionResponse } from "./models/transcription";
import { API_ROUTES } from "./routes";

const AUDIO_FIELD_NAME = "audio";
const AUDIO_FILE_NAME = "recording.webm";

export async function transcribeAudio(
  audioBlob: Blob,
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append(AUDIO_FIELD_NAME, audioBlob, AUDIO_FILE_NAME);

  const response = await authClient.post<TranscriptionResponse>(
    API_ROUTES.transcription.create,
    formData,
  );

  return { text: response.data.text };
}
```

Notes:
- We do **not** manually set `Content-Type: multipart/form-data`; axios sets it (with the correct
  `boundary`) automatically when given a `FormData` body. Manually setting it would break the boundary.
- The `authClient` request interceptor still runs and injects the auth headers on top of the
  multipart `Content-Type`, so no header wiring is needed here.

### 4. CREATE `src/pages/chat/hooks/use-connectivity.ts`

```ts
import { useEffect, useState } from "react";

export function useConnectivity() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOffline,
  };
}
```

Notes:
- Initial state reads `navigator.onLine` synchronously so the first render is correct.
- Listeners are attached to `window` (where `online`/`offline` fire) and removed on cleanup.

### 5. CREATE `src/pages/chat/hooks/use-media-recorder.ts`

```ts
import { useEffect, useRef, useState } from "react";

export type MicPermission = "granted" | "denied" | "prompt";

const PREFERRED_MIME_TYPE = "audio/webm";

function isPermissionDeniedError(error: unknown): boolean {
  const name = (error as { name?: string }).name ?? "";
  return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function resolveMimeType(): string | undefined {
  if (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported(PREFERRED_MIME_TYPE)
  ) {
    return PREFERRED_MIME_TYPE;
  }
  return undefined;
}

export function useMediaRecorder() {
  const [permission, setPermission] = useState<MicPermission>("prompt");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimer() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }

  function reset() {
    setAudioBlob(null);
    setError(null);
    setElapsedSeconds(0);
  }

  async function start() {
    reset();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (caughtError) {
      if (isPermissionDeniedError(caughtError)) {
        setPermission("denied");
      } else {
        setError("Could not access the microphone.");
      }
      return;
    }

    setPermission("granted");
    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = resolveMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      setAudioBlob(blob);
      clearTimer();
      releaseStream();
      setIsRecording(false);
    };

    recorder.start();
    setIsRecording(true);
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function cancel() {
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }
    clearTimer();
    releaseStream();
    setIsRecording(false);
    setElapsedSeconds(0);
    setAudioBlob(null);
  }

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    function handleChange() {
      if (permissionStatus) {
        setPermission(permissionStatus.state as MicPermission);
      }
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setPermission(status.state as MicPermission);
        status.addEventListener("change", handleChange);
      })
      .catch(() => undefined);

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseStream();
    };
  }, []);

  return {
    permission,
    isRecording,
    elapsedSeconds,
    audioBlob,
    error,
    start,
    stop,
    cancel,
    reset,
  };
}
```

Notes / behavior details:
- `start()` calls `reset()` first so a re-record starts clean (briefing: "Reset state cleanly between
  recordings").
- The finished `Blob` is produced in `recorder.onstop` using `recorder.mimeType` (the negotiated type),
  so the blob's `type` always matches the actual recording. Plan 3 reads `audioBlob` once `isRecording`
  flips to `false`.
- `cancel()` nulls `recorder.onstop` before stopping so the blob is never set, then releases tracks.
- The Permissions-API effect is fully feature-detected and `catch`-guarded (Firefox lacks the
  `"microphone"` name); `getUserMedia` remains the source of truth for `permission`.
- Both effects have empty dep arrays; the inner functions read refs (mutable, not stale-closure-prone).
- `setInterval` return type uses `ReturnType<typeof setInterval>` (browser `number`) to avoid the
  Node `Timeout` typing mismatch under the project's `@types/node` dependency.

## Verification

1. **Type check (authoritative):**
   ```bash
   cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
   ```
   Must pass with zero errors. Watch specifically for: `MediaRecorder`/`MediaStream`/`PermissionStatus`
   DOM lib types resolving (they ship with TS's `dom` lib — confirm `tsconfig` includes `"DOM"`),
   the `PermissionName` cast on `"microphone"`, and the `setInterval` return type.

2. **Manual mic test (run `npm run dev` in `project-web`, exercise via Plan 3 once integrated, or a
   throwaway harness):**
   - First record attempt → browser shows the mic permission prompt; `permission` stays `"prompt"`
     until the user answers.
   - Allow → `permission === "granted"`, `isRecording === true`, `elapsedSeconds` ticks up once/second,
     mic indicator (tab/OS) is lit.
   - `stop()` → `isRecording === false`, mic indicator turns off (tracks stopped), `audioBlob` is a
     non-empty `Blob` whose `type` starts with `audio/` (expect `audio/webm` in Chromium).
   - `cancel()` mid-recording → `isRecording === false`, `audioBlob === null`, mic indicator off.
   - Deny the permission prompt (or pre-deny in site settings) → `start()` rejects with
     `NotAllowedError` → `permission === "denied"`, no recording starts.
   - Verify the produced blob round-trips: `URL.createObjectURL(audioBlob)` plays back in an `<audio>`.

3. **Transcription client test:**
   - With the backend (Plan 1) running, call `transcribeAudio(blob)` with a real recorded clip and
     confirm a `{ text }` resolves, and that the request in DevTools is `POST /transcription`,
     `Content-Type: multipart/form-data; boundary=...`, carries `jwtauthenticationtoken` +
     `providerauthenticationtoken` headers, and has a single form field `audio`.
   - Confirm a rejected request (e.g. empty blob → 400, or 401) **propagates** as a thrown error from
     `transcribeAudio` (does not resolve).

4. **Offline toggle test:**
   - Render a component using `useConnectivity`. In DevTools Network panel set "Offline" → `isOffline`
     becomes `true`; set back to "Online" → `isOffline` becomes `false`, without a reload.
   - Initial load while offline → `isOffline` is `true` on first render (synchronous `navigator.onLine`).

## Open questions

None blocking. The route (`POST /transcription`), upload field (`audio`), and response shape
(`{ text: string }`) are fixed by Plan 1's published contract and the AssemblyAI doc. The `audio/webm`
mime choice is a frontend decision documented above; the backend forwards whatever `mimetype` arrives
to AssemblyAI, so it imposes no additional constraint.
