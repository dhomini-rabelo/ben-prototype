# AssemblyAI Transcription

Reference for integrating **AssemblyAI** speech-to-text into Ben. It powers the voice flow: the user records audio in the browser, and the audio is converted to text before it is sent to Ben's chat agent. The transcription runs in `project-backend`; the browser only records and uploads the audio.

## Overview

AssemblyAI is a speech-to-text API. You send it audio and it returns the transcribed text. It offers two transcription modes:

1. **Async (pre-recorded)** — you submit a finished audio file (or a URL), AssemblyAI queues a job, and you poll until it completes. Best for "record, then transcribe" flows.
2. **Streaming (real-time)** — you stream live audio over a WebSocket and receive partial transcripts within a few hundred milliseconds. Best for live voice agents.

Ben uses the **async mode**. The design has a discrete "recording" step followed by a "transcribing" step (the *Hearing you* indicator), which maps directly to recording a full audio clip and then transcribing it — not live streaming.

## Installation

Install the official Node.js SDK in `project-backend`:

```bash
npm install assemblyai
```

The SDK handles uploading local audio, submitting the transcript job, and polling for the result behind a single call.

## Authentication

AssemblyAI authenticates with a single API key passed in the `Authorization` header. **Never expose this key in the browser** — all AssemblyAI calls must run on the backend.

Store the key as a validated environment variable in `project-backend`:

```bash
ASSEMBLYAI_API_KEY=your-api-key
```

Add it to the Zod env schema in `project-backend/src/infra/services/env.ts`:

```ts
const envSchema = z.object({
  // ...existing vars
  ASSEMBLYAI_API_KEY: z.string(),
})
```

Then create the client with the explicit key:

```ts
import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({ apiKey: env.ASSEMBLYAI_API_KEY })
```

## Transcribing an audio file (SDK)

The simplest path uses `client.transcripts.transcribe()`. It uploads the audio, submits the job, **polls until done**, and resolves with the completed transcript:

```ts
const transcript = await client.transcripts.transcribe({
  audio: audioInput, // a Buffer, a readable stream, a local path, or a public URL
})

if (transcript.status === 'error') {
  // handle failure — transcript.error holds the message
  throw new Error(transcript.error)
}

const text = transcript.text // the transcribed text
```

Key points:

1. `audio` accepts a **Buffer/stream** (what an uploaded file becomes), a local file path, or a public URL.
2. `transcribe()` blocks until the job reaches a terminal status, so the caller gets the final text directly.
3. Use `client.transcripts.submit()` instead if you want to queue the job and poll yourself (non-blocking).

## REST API (no SDK)

If calling the REST API directly, the flow is three steps. Base URL: `https://api.assemblyai.com`. Auth header: `Authorization: YOUR_API_KEY`.

1. **Upload** the audio bytes to get a temporary URL.

    ```
    POST /v2/upload      → { upload_url }
    ```

2. **Submit** a transcript job referencing that URL.

    ```
    POST /v2/transcript  body: { audio_url } → { id, status }
    ```

3. **Poll** the job until it reaches a terminal status.

    ```
    GET /v2/transcript/:id → { status, text, error }
    ```

### Transcript status lifecycle

| Status | Meaning |
| --- | --- |
| `queued` | Job accepted, waiting to start. |
| `processing` | Transcription in progress. |
| `completed` | **Terminal** — `text` is ready. |
| `error` | **Terminal** — `error` holds the failure reason. |

Poll until `status` is `completed` or `error`. The SDK's `transcribe()` does this polling for you.

## Limits and failure cases

- Audio shorter than **160 ms** fails — guard against empty/very short recordings.
- Corrupted files or unsupported formats fail with `status: 'error'`.
- Async transcription handles files up to ~10 hours; Ben's clips are short, so size is not a concern.
- Rate-limit responses use HTTP `429`; check the `X-RateLimit-*` response headers.

## Usage in this project

The backend follows a ports-and-adapters design, so AssemblyAI is wired through an **adapter** (a port interface plus an AssemblyAI implementation) — the HTTP layer depends on the abstraction, not the SDK. This keeps the provider swappable.

The voice flow:

1. The browser records a short audio clip (`MediaRecorder`) and uploads it to the backend as multipart form data.
2. A backend route receives the audio file, calls the transcription adapter, and returns the resulting text.
3. The frontend takes that text and sends it as the user's chat message through the existing `/chat` flow.

Relevant integration points:

- `project-backend/src/adapters/` — the transcription **port** interface (to be created).
- `project-backend/src/infra/services/` — the AssemblyAI **adapter** implementation (to be created).
- `project-backend/src/infra/services/env.ts` — where `ASSEMBLYAI_API_KEY` is validated.
- `project-backend/src/infra/http/routes/` — the new transcription route (to be created), guarded by `authMiddleware`.

This separates cleanly from the chat agent: AssemblyAI only turns audio into text; the existing Gemini agent (see [`vercel-ai-sdk.md`](vercel-ai-sdk.md)) still produces Ben's reply.

## References

- AssemblyAI docs overview: https://www.assemblyai.com/docs/api-reference/overview
- Node.js SDK: https://github.com/AssemblyAI/assemblyai-node-sdk
- Pre-recorded speech-to-text: https://www.assemblyai.com/products/speech-to-text/
