# Start briefing

**Plan 1 [Backend] (sync)**: AssemblyAI transcription endpoint — defines the audio→text contract.

## Goal

Add an authenticated backend endpoint that receives a recorded audio clip and returns the transcribed text, using AssemblyAI (async/pre-recorded mode). Follow the ports-and-adapters pattern: a transcription **port** interface in `adapters/`, an AssemblyAI **adapter** in `infra/services/`, a use case, a route guarded by `authMiddleware`, and the `ASSEMBLYAI_API_KEY` added to the Zod env schema. See [`docs/assemblyai-transcription.md`](../../../../docs/assemblyai-transcription.md).

This plan runs **first** because it defines the HTTP contract (route, multipart field name, response shape) that the frontend plans consume.

## Contract (the shared interface)

- **Route**: `POST /transcription` (auth-guarded), multipart form-data, audio field name `audio`.
- **Response**: `{ "text": string }` on success; standard error-handler JSON on failure.

## Files owned (project-backend only)

- `src/adapters/transcription-provider.ts` (port interface)
- `src/infra/services/assemblyai-transcription-provider.ts` (adapter)
- `src/domain/use-cases/transcription/transcribe-audio.ts` (use case)
- `src/infra/http/routes/transcription.ts` (route + composition root)
- `src/infra/http/presenters/transcription-presenter.ts` (if a presenter helps)
- `src/infra/services/env.ts` (add `ASSEMBLYAI_API_KEY`)
- `src/infra/http/app.ts` (register the route)
- `package.json` (add `assemblyai`)
