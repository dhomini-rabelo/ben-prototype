# Implementation Plan 04 — Port the `src/api/` layer to `project-mobile`

> Code-level plan only. **Do not implement yet.** This plan ports the entire `project-web/src/api/` layer into `project-mobile/src/api/`, keeping the backend contract identical and rewriting only the two pieces that touch platform APIs: `client.ts` (token + 401 + base URL) and `requests/transcription.ts` (FormData from an RN file URI).

## Context & references read

- Decisions: `MOBILE-PORT-ANALYSIS.md` points **1** (auth interceptor: sync token from in-memory cache, 401 → navigation callback instead of `window.location`) and **3** (transcription FormData from a native file URI). Also the "copy quase intacto" section confirming `src/api/` migrates ~100%.
- Brief: `04-api-layer/start-briefing.md` + `04-api-layer/briefing/01-api-layer.md`.
- Design: `code-get-coding-designs` → **Web API Client Structure** (`client.ts` = axios instances + interceptors + queryClient; `routes.ts` = `API_ROUTES`; `models/` = full entity; `responses/` = list-item/operation DTOs; `requests/{feature}.ts` = `request{Action}` returning the unwrapped payload; all file/folder names kebab-case).
- `code-write-code`: keep the project's existing conventions; no comments; kebab-case files. **Note:** the frontend-code-preferences doc suggests `fetch{X}Request` naming, but every existing web request function is named `request{Action}` and the brief says copy intact — so the port **preserves the existing `request{Action}` names** for a 1:1 contract port. Do not rename.

### Cross-plan dependencies (do NOT create these here — owned elsewhere)

These are consumed by `client.ts` and must already exist (plans 01 + 02 run before / alongside):

- `src/core/env.ts` (plan 01) — typed reader over `expo-constants` `extra`. Exposes the backend base URL. Exact accessor name TBD by plan 01; this plan assumes a **named export `env`** with a backend-URL field (referenced below as `env.backendUrl`). If plan 01 names it differently (e.g. `getBackendUrl()`), adjust the single import line — no other change.
- `src/core/query-client.ts` (plan 01) — the shared `QueryClient` instance. **Plan 04 must NOT create a `QueryClient`.** Web's `client.ts` exported `queryClient`; on mobile that lives in `core/query-client.ts` to avoid an ownership conflict. `client.ts` here does **not** re-export it (no export-only/barrel re-export per the user's memory rule); consumers import `queryClient` directly from `@/core/query-client`.
- `src/storage/token-storage.ts` (plan 02) — provides the synchronous in-memory token accessors used by the request interceptor and the async writers used by the response/401 handlers:
  - `getCachedToken(): string | null` — synchronous JWT read (interceptor).
  - `setCachedToken(token: string | null)` — synchronous cache update.
  - `setStoredToken(token: string)` / `clearStoredToken(): Promise<void>` — async SecureStore writers.
- `src/core/routes.ts` (plan 01) — `ROUTES` map (expo-router paths). The 401 handler does **not** import this; navigation is delegated to a callback the app registers (see below), keeping `src/api/` free of any router dependency.

#### Open dependency note — provider token

Web's interceptor sends **two** headers: `jwtauthenticationtoken` (from `JWT_COOKIE`) and `providerauthenticationtoken` (from `PROVIDER_COOKIE`). Plan 02's documented cache API (`getCachedToken`) only covers the JWT. Two safe resolutions, in order of preference:

1. **Preferred:** assume plan 02 also exposes a synchronous provider-token cache accessor (e.g. `getCachedProviderToken(): string | null`) and async writers (`setStoredProviderToken` / cleared by `clearStoredToken`). The interceptor sends both headers exactly like web.
2. **Fallback (if plan 02 ships only the JWT cache):** send only `jwtauthenticationtoken` and add a `TODO` referencing plan 02 for the provider header, so the file still type-checks and the JWT path works.

Pick (1) if plan 02's final surface exposes the provider accessors; otherwise (2). The code block below is written for (1) and flags the exact lines to drop for (2).

---

## Target folder layout (`project-mobile/src/api/`)

```
src/api/
├── client.ts                 # REWRITE  (axios instances + interceptors, no QueryClient)
├── routes.ts                 # COPY INTACT
├── types.ts                  # COPY INTACT
├── models/
│   ├── user.ts               # COPY INTACT
│   ├── message.ts            # COPY INTACT
│   ├── task.ts               # COPY INTACT
│   ├── note.ts               # COPY INTACT
│   └── reminder.ts           # COPY INTACT
├── responses/
│   ├── agent-reply.ts        # COPY INTACT
│   ├── task.ts               # COPY INTACT
│   ├── transcription.ts      # COPY INTACT
│   └── captures.ts           # COPY INTACT
└── requests/
    ├── chat.ts               # COPY INTACT
    ├── tasks.ts              # COPY INTACT
    ├── notes.ts              # COPY INTACT
    ├── reminders.ts          # COPY INTACT
    └── transcription.ts      # REWRITE  (FormData from RN file URI)
```

The `@/*` path alias (`@/api/...`, `@/core/...`, `@/storage/...`) is set up by plan 01 (tsconfig paths + babel module-resolver), so every import below resolves identically to web.

---

## Per-file actions

### COPY INTACT — contract files (no edits)

These depend only on TypeScript types and the `@/api/*` alias; nothing platform-specific. Copy byte-for-byte from `project-web/src/api/`:

| File | Notes |
|---|---|
| `routes.ts` | `API_ROUTES` map, parameterized routes as functions. Identical backend contract. |
| `types.ts` | `Pagination<T>`, `CursorPaginationResponse<T>`, `ItemResponse<T>`, `ListingResponse<T>`. |
| `models/user.ts` | `User`. (Also consumed type-only by plan 02's user-storage mapping; structurally compatible.) |
| `models/message.ts` | `MessageRole`, `CaptureKind`, `MessageCapture`, `Message`. |
| `models/task.ts` | `TaskContentType`, `TaskStatus`, `TodoItemDiff`, `TodoItem`, `TodoItemWithDiff`, `TaskDiffChanges`, `PendingDiff`, `Task`. |
| `models/note.ts` | `Note`, `NoteListItem`. |
| `models/reminder.ts` | `ReminderStatus`, `Reminder`, `ReminderListItem`. |
| `responses/agent-reply.ts` | `ReminderDraft`, `NoteDraft`, `TaskDraft`, `HistoryTopic`, `CaptureView`, `AgentReply`. |
| `responses/task.ts` | `TaskListItem`, `TaskMessageReply`. |
| `responses/transcription.ts` | `TranscriptionResponse` (`{ text: string }`). |
| `responses/captures.ts` | `CapturesCountsResponse`. |
| `requests/chat.ts` | `requestSendChatMessage(text)` → `authClient.post(API_ROUTES.chat.send, …)`. |
| `requests/tasks.ts` | All 9 `request*` task functions. |
| `requests/notes.ts` | `requestListNotes`, `requestGetNoteDetail`. |
| `requests/reminders.ts` | `requestListReminders`, `requestGetReminderDetail`. |

All of these already import via `@/api/...` (alias), so they need **zero** changes. The only reason any of them compiles differently on mobile is `client.ts`, whose **exported surface stays identical** (`basicClient`, `authClient`, `JWT_COOKIE`, `PROVIDER_COOKIE`, `BASE_URL`) — see below — so the copy-intact request files keep resolving `authClient` exactly as before.

### REWRITE — `client.ts`

**Why rewrite (analysis point 1):** web reads cookies synchronously via `js-cookie` and does `location.pathname = ROUTES.login` on 401. On RN there is no `js-cookie` and no `window.location`. The token is read from the **in-memory cache** (`getCachedToken`, populated at boot by plan 02), the base URL comes from `src/core/env`, and the 401 redirect becomes an app-registered **navigation callback** (`setUnauthorizedHandler`).

**Exported surface kept identical to web** so copy-intact files keep working:
- `BASE_URL` (now from `env`, not `import.meta.env`)
- `JWT_COOKIE`, `PROVIDER_COOKIE` (kept for parity — now SecureStore key names, matching plan 02's keys `@ben/jwttoken` / `@ben/authprovidertoken`)
- `basicClient`, `authClient`

**Removed vs web:** the `QueryClient` export (moves to `@/core/query-client`, plan 01) and the `import Cookies from "js-cookie"` / `import { ROUTES } from "@/core/routes"` lines.

**Added vs web:** `setUnauthorizedHandler(fn)` registration export with a default no-op, invoked on 401 (the app's navigation layer — plan 09 auth flow — registers the real callback that routes to login).

```ts
import axios, { type AxiosError } from "axios";

import { env } from "@/core/env";
import {
  getCachedToken,
  getCachedProviderToken,
  setCachedToken,
  setStoredToken,
  clearStoredToken,
} from "@/storage/token-storage";

export const BASE_URL = env.backendUrl;

export const JWT_COOKIE = "@ben/jwttoken";
export const PROVIDER_COOKIE = "@ben/authprovidertoken";

const defaultHeaders = { "ngrok-skip-browser-warning": "true" };

export const basicClient = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
});

export const authClient = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
});

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

authClient.interceptors.request.use((config) => {
  config.headers.set("jwtauthenticationtoken", getCachedToken() ?? "");
  config.headers.set(
    "providerauthenticationtoken",
    getCachedProviderToken() ?? "",
  );
  return config;
});

authClient.interceptors.response.use(
  function onFulfilled(response) {
    const updatedToken = response.headers["updatedjwtauthenticationtoken"];
    if (updatedToken) {
      setCachedToken(updatedToken);
      void setStoredToken(updatedToken);
    }
    return response;
  },
  function onRejected(error: AxiosError) {
    if (error.response?.status === 401) {
      setCachedToken(null);
      void clearStoredToken();
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);
```

Notes on the rewrite, line-for-line vs web:
- **Request interceptor:** `Cookies.get(JWT_COOKIE)` → `getCachedToken()` (synchronous, never blocks the request on async SecureStore). Same header names. The provider-token line uses `getCachedProviderToken()` — **resolution (1)** above. If plan 02 ships only the JWT cache (**resolution 2**), drop the `getCachedProviderToken` import and the `providerauthenticationtoken` `config.headers.set(...)` call, leaving a `// TODO(plan-02): provider token cache` marker.
- **`onFulfilled` (token refresh):** `Cookies.set(JWT_COOKIE, updatedToken)` → update the synchronous cache (`setCachedToken`) **and** persist async (`setStoredToken`). Updating the cache first guarantees the very next request sees the refreshed token without awaiting SecureStore. `void` marks the fire-and-forget persistence intentionally.
- **`onRejected` (401):** `Cookies.remove(...)` ×2 + `location.pathname = ROUTES.login` → clear the cache synchronously, fire-and-forget `clearStoredToken()` (which plan 02 clears both JWT + provider together), then invoke `unauthorizedHandler()`. No router import inside `src/api/` — the app registers the navigation via `setUnauthorizedHandler` at boot/auth-wiring (plan 09).
- **No `QueryClient`** is created or exported here.

### REWRITE — `requests/transcription.ts`

**Why rewrite (analysis point 3):** web builds the multipart body from a `Blob` (`recording.webm`). RN has no `Blob` from the recorder; `expo-av` produces a **file URI**, and RN's `FormData` accepts a `{ uri, name, type }` object as the file part. The field name (`audio`), route (`API_ROUTES.transcription.create`), and returned shape (`{ text }`) stay identical to web.

The function takes a **file URI string** (the recording's local path from the voice store / `expo-av`, plan 17) instead of a `Blob`. Per the brief, default file name `recording.m4a` and MIME `audio/m4a` (m4a/caf are what expo-av exports on iOS/Android).

```ts
import { authClient } from "@/api/client";
import type { TranscriptionResponse } from "@/api/responses/transcription";
import { API_ROUTES } from "@/api/routes";

const AUDIO_FIELD_NAME = "audio";
const AUDIO_FILE_NAME = "recording.m4a";
const AUDIO_MIME_TYPE = "audio/m4a";

export async function requestTranscribeAudio(
  audioUri: string,
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append(AUDIO_FIELD_NAME, {
    uri: audioUri,
    name: AUDIO_FILE_NAME,
    type: AUDIO_MIME_TYPE,
  } as unknown as Blob);

  const response = await authClient.post<TranscriptionResponse>(
    API_ROUTES.transcription.create,
    formData,
  );

  return { text: response.data.text };
}
```

Notes:
- **Signature change:** `audioBlob: Blob` → `audioUri: string`. The voice-store/recorder plan (17) and any caller must pass the recorded file URI. This is the only public-API behavior change in the whole port; it is intentional and required by the platform.
- **`as unknown as Blob` cast:** RN's runtime `FormData.append` accepts the `{ uri, name, type }` object, but the DOM/axios `FormData` type signature only types the value as `string | Blob`. The cast is the standard RN idiom to satisfy TS without changing runtime behavior. (If plan 01's tsconfig pulls in `@types/react-native` / `expo` lib that widens `FormData`, the cast may be droppable — keep it unless `tsc` proves it unnecessary; it is harmless.)
- Field name, route, and `{ text }` unwrap are unchanged → backend contract identical.

---

## Things explicitly NOT done here

- **No `QueryClient`** created/exported (owned by `@/core/query-client`, plan 01).
- **No re-export/barrel file** for `queryClient` or anything else (per the user's no-export-only-files rule); consumers import directly.
- **No router import** in `src/api/`; 401 navigation is delegated via `setUnauthorizedHandler`.
- **No formatting step.** (Prettier exists in mobile per plan 01, but this plan's verification is type-check only, per the task.)
- **No changes outside `src/api/`** — parallel-safe. `src/core/*` and `src/storage/*` are read-only dependencies owned by plans 01/02.
- **No renaming** of `request{Action}` functions despite the `fetch…Request` preference note — the brief mandates a copy-intact contract port.

## Implementation order (when executed)

1. Create `src/api/` and copy the 13 intact files verbatim from `project-web/src/api/`.
2. Write the rewritten `client.ts`.
3. Write the rewritten `requests/transcription.ts`.
4. Reconcile the provider-token import against plan 02's final surface (resolution 1 vs 2).

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass. (Assumes plans 01 + 02 have landed `src/core/env.ts`, `src/core/query-client.ts`, and `src/storage/token-storage.ts`; if `tsc` fails solely on a differing accessor name from `env`/token-storage, adjust only the import line in `client.ts` to match their final exports — no logic change.)
