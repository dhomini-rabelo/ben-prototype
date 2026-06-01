# Plan: Backend AssemblyAI Transcription Endpoint

Auth-guarded `POST /transcription` that accepts a multipart audio upload, transcribes it via
AssemblyAI (async/pre-recorded mode), and returns `{ text: string }`. Built with the existing
ports-and-adapters layout: a `TranscriptionProvider` port in `adapters/`, an AssemblyAI adapter
in `infra/services/`, a use case in `domain/use-cases/`, and the route as the composition root.

## Context

- The backend (Express 5 + TypeScript + Zod, ESM, `@/*` path alias → `./src/*`) follows
  ports-and-adapters. Ports live in `src/adapters/` as `interface`s (e.g. `AuthProviderService`,
  `AgentService`) or `abstract class`es (e.g. `JwtService`). Adapter implementations live in
  `src/infra/services/` and `implements` the port (e.g. `FirebaseAuthProviderService`,
  `GeminiAgentProviderService`).
- Use cases (`src/domain/use-cases/<area>/<name>.ts`) `implements UseCase<Response>`, take their
  dependencies (ports) via constructor, expose a single `async execute(payload): Promise<Response>`,
  and define local `Payload` / `Response` interfaces.
- Routes (`src/infra/http/routes/*.ts`) are the **composition root**: they instantiate the concrete
  adapters + use case at module scope, parse input with Zod, call `useCase.execute(...)`, respond
  via `HttpStatus`, and forward errors with `next(err)` (never throw to Express directly). Auth
  routes read `req.userId`, populated by `authMiddleware`.
- `env.ts` validates all environment variables with a single Zod schema and throws on startup if
  any are missing.
- The error handler maps `ZodError` → 400, `ValidationError` → 400, `DomainError` → mapped status,
  everything else → 500 `{ message: 'Internal Server Error' }`.
- There is currently **no multipart/upload handling anywhere** in the backend (verified via grep:
  no `multer`, `multipart`, or `req.file`). `app.ts` only wires `json` + `urlencoded` body parsers
  (both `100mb`). This endpoint introduces the first file upload path.

## Open questions

None blocking. The contract (route `POST /transcription`, multipart field `audio`, response
`{ text: string }`) is fixed by the start-briefing and is treated as authoritative.

## Decisions

1. **Multipart handling = `multer` with `memoryStorage`.**
   - The AssemblyAI SDK's `transcribe()` accepts a `Buffer` directly (per `docs/assemblyai-transcription.md`).
     `memoryStorage` exposes the uploaded file as `req.file.buffer` — a `Buffer` we can hand straight
     to the adapter with **no temp files, no disk I/O, no cleanup**. Ben's clips are short (the doc
     notes async handles up to ~10h and "size is not a concern"), so holding one clip in memory is fine.
   - `multer` is the de-facto Express multipart middleware and pairs naturally with Express 5; the
     codebase has no existing upload convention to honor, so we pick the standard. Disk storage would
     add a temp-file lifecycle for zero benefit here.
   - Applied as **route-scoped middleware** (`upload.single('audio')`) rather than app-wide, so only
     `/transcription` parses multipart and the field name is enforced at the edge.
   - Add a `limits.fileSize` cap (10 MB) on the multer instance to bound memory per request.

2. **Port shape = `interface TranscriptionProvider`** (matches `AuthProviderService` / `AgentService`
   interface ports, not the `abstract class` `JwtService`). Method `transcribe(payload): Promise<Response>`
   taking a `Buffer` plus optional `mimeType`, returning `{ text: string }`.

3. **Empty / too-short audio is rejected as a `ValidationError`** (→ 400 via the existing error handler),
   not a 500. The doc warns audio shorter than 160 ms fails; we cannot measure duration cheaply, but we
   **can** reject a missing file and an empty/near-empty buffer before calling AssemblyAI. AssemblyAI's
   own `status: 'error'` (corrupt/unsupported/too-short that slips through) is surfaced as a thrown
   `Error` from the adapter → 500. This keeps client mistakes (no audio) distinct from provider failures.

4. **No presenter needed.** The response is a flat `{ text: string }` with no domain entity to map
   (unlike `UserPresenter`). The route builds the JSON inline, consistent with how `chat.ts` returns
   ad-hoc shapes. The briefing lists the presenter as optional ("if a presenter helps") — it does not.

5. **Adapter constructs its own `AssemblyAI` client at module scope** from `env.ASSEMBLYAI_API_KEY`,
   mirroring `gemini-agent-provider.ts` (which builds the Google client at module scope from env).

## API contract

| Aspect | Value |
| --- | --- |
| Method / path | `POST /transcription` |
| Auth | Required — `authMiddleware` (sends `jwtauthenticationtoken` + `providerauthenticationtoken` headers) |
| Body | `multipart/form-data`, single file field **`audio`** |
| Success | `200 OK` → `{ "text": string }` |
| Missing/empty audio | `400` → `{ "audio": ["VALIDATION#..."] }` (ValidationError shape) |
| Unauthenticated | `401` (from `authMiddleware` / error handler) |
| File too large (>10MB) | `413`-ish multer error surfaced via error handler (→ 500 unless mapped; acceptable) |
| Provider failure (`status: 'error'`) | `500` → `{ "message": "Internal Server Error" }` |

### AssemblyAI transcript status lifecycle (handled inside the adapter by `transcribe()` polling)

| Status | Meaning | Adapter action |
| --- | --- | --- |
| `queued` | accepted, waiting | keep polling (SDK internal) |
| `processing` | in progress | keep polling (SDK internal) |
| `completed` | terminal, `text` ready | return `{ text }` |
| `error` | terminal, `error` set | `throw new Error(transcript.error)` |

## Existing code to reuse

- `UseCase<Response>` — `src/modules/domain/use-case.ts` (use case base interface).
- `ValidationError` — `src/modules/domain/domain-errors.ts` (for empty-audio rejection → 400).
- `HttpStatus` — `src/modules/utils/http.ts` (`HttpStatus.OK`).
- `authMiddleware` — `src/infra/http/middlewares/auth.ts` (route guard; populates `req.userId`).
- `errorHandler` — `src/infra/http/middlewares/error-handler.ts` (already registered last in `app.ts`).
- `env` — `src/infra/services/env.ts` (extend with `ASSEMBLYAI_API_KEY`).
- Pattern references: `gemini-agent-provider.ts` (module-scope client from env), `auth.ts` (route as
  composition root), `chat.ts` (POST route with inline JSON response + `next(err)`).

## Files to create / modify

### 1. CREATE `src/adapters/transcription-provider.ts` (port)

```ts
export type TranscribePayload = {
  audio: Buffer
  mimeType?: string
}

export type TranscribeResponse = {
  text: string
}

export interface TranscriptionProvider {
  transcribe(payload: TranscribePayload): Promise<TranscribeResponse>
}
```

### 2. CREATE `src/infra/services/assemblyai-transcription-provider.ts` (adapter)

```ts
import {
  TranscribePayload,
  TranscribeResponse,
  TranscriptionProvider,
} from '@/adapters/transcription-provider'
import { AssemblyAI } from 'assemblyai'
import { env } from './env'

const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })

export class AssemblyAITranscriptionProvider implements TranscriptionProvider {
  async transcribe(payload: TranscribePayload): Promise<TranscribeResponse> {
    const transcript = await client.transcripts.transcribe({
      audio: payload.audio,
    })

    if (transcript.status === 'error') {
      throw new Error(transcript.error ?? 'AssemblyAI transcription failed')
    }

    return { text: transcript.text ?? '' }
  }
}
```

Notes:
- `transcribe()` accepts the `Buffer` directly and **blocks until a terminal status** (does its own
  polling), so no manual `submit()`/poll loop is needed.
- `transcript.text` is typed as `string | null`; coalesce to `''`.

### 3. CREATE `src/domain/use-cases/transcription/transcribe-audio.ts` (use case)

```ts
import { TranscriptionProvider } from '@/adapters/transcription-provider'
import { ValidationError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  audio: Buffer
  mimeType?: string
}

interface Response {
  text: string
}

export class TranscribeAudioUseCase implements UseCase<Response> {
  constructor(private transcriptionProvider: TranscriptionProvider) {}

  async execute(payload: Payload): Promise<Response> {
    if (!payload.audio || payload.audio.length === 0) {
      throw new ValidationError({
        errorField: 'audio',
        code: 'EMPTY_AUDIO',
      })
    }

    const { text } = await this.transcriptionProvider.transcribe({
      audio: payload.audio,
      mimeType: payload.mimeType,
    })

    return { text }
  }
}
```

Notes:
- Empty/missing buffer → `ValidationError` (→ 400, error handler renders `{ audio: ['EMPTY_AUDIO#'] }`).
- Provider failures propagate as thrown `Error` → 500.

### 4. CREATE `src/infra/http/routes/transcription.ts` (route + composition root)

```ts
import { TranscribeAudioUseCase } from '@/domain/use-cases/transcription/transcribe-audio'
import { AssemblyAITranscriptionProvider } from '@/infra/services/assemblyai-transcription-provider'
import { ValidationError } from '@/modules/domain/domain-errors'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const transcriptionProvider = new AssemblyAITranscriptionProvider()
const transcribeAudioUseCase = new TranscribeAudioUseCase(transcriptionProvider)

export async function transcription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new ValidationError({ errorField: 'audio', code: 'REQUIRED' })
    }

    const result = await transcribeAudioUseCase.execute({
      audio: req.file.buffer,
      mimeType: req.file.mimetype,
    })

    return res.status(HttpStatus.OK).json({ text: result.text })
  } catch (err) {
    next(err)
  }
}
```

Notes:
- `req.file` (typed by `@types/multer`'s `Express.Multer.File` global augmentation) is populated by
  the `upload.single('audio')` middleware wired in `app.ts` (step 6). Missing file → `ValidationError`.
- Mirrors `auth.ts`: concrete deps instantiated at module scope, `try/catch` + `next(err)`.

### 5. MODIFY `src/infra/services/env.ts` (add env var)

Add to `envSchema` (after `GOOGLE_GENERATIVE_AI_API_KEY`):

```ts
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  ASSEMBLYAI_API_KEY: z.string(),
})
```

Also add to `.env.example` (so local setup stays in sync):

```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
```

### 6. MODIFY `src/infra/http/app.ts` (register route + multer)

Add the multer import and a memory-storage instance, then register the route with `authMiddleware`
followed by the upload middleware:

```ts
import { transcription } from '@/infra/http/routes/transcription'
// ...other route imports
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})
```

Register alongside the other auth-guarded routes (after `app.post('/chat', ...)`):

```ts
app.post(
  '/transcription',
  authMiddleware,
  upload.single('audio'),
  transcription,
)
```

Notes:
- `authMiddleware` runs **before** multer, so unauthenticated requests are rejected before any
  multipart parsing/buffering.
- The existing `json`/`urlencoded` global parsers do not interfere — multipart bodies are handled
  exclusively by the route-scoped multer middleware.

### 7. MODIFY `package.json` (add dependencies)

Add to `dependencies`:

```
"assemblyai": "^4.16.1",
"multer": "^2.0.2",
```

Add to `devDependencies`:

```
"@types/multer": "^2.0.0",
```

Then run `npm install` in `project-backend` to materialize `node_modules` and `package-lock.json`.
(Pin to the latest stable majors available at install time; the carets above are the expected
majors — `assemblyai` v4 exposes `client.transcripts.transcribe(...)`, `multer` v2 is the current
maintained line.)

## Verification

1. **Install** — `cd project-backend && npm install` (pulls `assemblyai`, `multer`, `@types/multer`).
2. **Type check** — `cd project-backend && npx tsc --noEmit` → no errors. Confirms the
   `Express.Multer.File` augmentation makes `req.file` typed, the port/adapter/use-case generics line
   up, and the SDK types resolve.
3. **Env guard** — start without `ASSEMBLYAI_API_KEY` set → process throws "Invalid environment
   variables!" on boot (Zod). Set it and the server boots.
4. **Smoke (happy path)** — with the dev server running and a valid JWT, send a multipart request:
   ```bash
   curl -X POST http://localhost:3333/transcription \
     -H "jwtauthenticationtoken: <jwt>" \
     -H "providerauthenticationtoken: <provider-token>" \
     -F "audio=@sample.wav"
   ```
   → `200` `{ "text": "..." }`.
5. **Error paths**
   - No `audio` field → `400` with `{ "audio": ["REQUIRED#"] }` (route-level `ValidationError`).
   - Empty/zero-byte file → `400` `{ "audio": ["EMPTY_AUDIO#"] }` (use-case `ValidationError`).
   - No auth headers → `401` (authMiddleware → error handler), and multer never runs.
   - Corrupt/unsupported audio that AssemblyAI rejects (`status: 'error'`) → adapter throws →
     `500` `{ "message": "Internal Server Error" }` (logged by error handler).

## Ownership / parallelism

All changed files live under `project-backend/` and are owned by this plan:
`src/adapters/transcription-provider.ts`, `src/infra/services/assemblyai-transcription-provider.ts`,
`src/domain/use-cases/transcription/transcribe-audio.ts`, `src/infra/http/routes/transcription.ts`,
`src/infra/services/env.ts`, `.env.example`, `src/infra/http/app.ts`, `package.json`. No files owned
by other (frontend) plans are touched. This plan publishes the contract the frontend plans consume.
