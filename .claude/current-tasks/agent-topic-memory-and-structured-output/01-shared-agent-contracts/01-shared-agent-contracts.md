# Deep Plan 1 [Backend] (sync) — Shared agent contracts

## Context

`project-backend` exposes the agent boundary through a single port file:
`src/adapters/agent-provider.ts`. Today it defines:

- `AgentStreamResult` — transport wrapper exposing `pipeUIMessageStreamToResponse(res)`.
- `StreamReplyOnFinishPayload = { text: string }` — what the finish callback currently receives.
- `StreamReplyPayload = { userId, message, onFinish? }` — the input to `streamReply`.
- `AgentService.streamReply(payload): AgentStreamResult` — the port.

This file is the contract that three downstream plans depend on:
- Plan 2 — topic-memory subsystem (use-cases/repositories that resolve history).
- Plan 2 — Gemini agent rewrite (`gemini-agent-provider.ts`).
- Plan 3 — route integration (`chat.ts`).

This plan owns **only** `src/adapters/agent-provider.ts`. It evolves the boundary so the
agent can (1) receive a topic index as system-prompt suggestions, (2) call an injected
history resolver at most once per turn, and (3) emit a structured reply alongside the
streamed text — all expressed as **types/interfaces only, no behavior**.

## Decisions

- **Types only.** No runtime code, no Zod schemas, no executors. The file stays a pure
  contract module (it already exports only `interface`/`type` plus the `Response` import).
- **Keep the `Response` import.** `AgentStreamResult.pipeUIMessageStreamToResponse(res: Response)`
  is preserved verbatim as the transport.
- **`TopicKey = string`** documented as `kind:category:slug` (e.g. `reminder:work:meeting`).
  Ids are `string` everywhere.
- **Remove `StreamReplyOnFinishPayload`.** `onFinish` now receives the full `AgentReply`,
  so the old `{ text }` payload type is no longer part of the contract. Removing it is
  intentional and matches the briefing ("evolve `onFinish` to receive the full structured
  reply"). Downstream files that referenced the old type are owned by Plans 2/3.
- **Draft shapes are the agent-output contract only** — minimal, no persistence concerns.
- **`historyTopics` is an array** — a turn may touch several topics.
- Keep the existing code style: `type` aliases for data shapes, `interface` for the service
  and the stream-result ports, matching the current file.

## Files to Modify

### `src/adapters/agent-provider.ts` (full new contents)

```ts
import { Response } from 'express'

export interface AgentStreamResult {
  pipeUIMessageStreamToResponse(res: Response): void
}

/**
 * Identifies a recurring subject for a user.
 * Documented shape: `kind:category:slug` (e.g. `reminder:work:meeting`).
 */
export type TopicKey = string

export type HistoryContextResult = Record<
  TopicKey,
  Array<{ id: string; summary: string }>
>

export type ResolveHistoryContext = (input: {
  topics: TopicKey[]
}) => Promise<HistoryContextResult>

export type ReminderDraft = {
  title: string
  remindAt?: string
  notes?: string
}

export type NoteDraft = {
  title: string
  body: string
}

export type TaskDraft = {
  title: string
  details?: string
}

export type AgentReply = {
  message: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
  historyTopics: Array<{ topic: TopicKey; summary: string }>
}

export type StreamReplyPayload = {
  userId: string
  message: string
  topicIndex: TopicKey[]
  resolveHistoryContext: ResolveHistoryContext
  onFinish?: (reply: AgentReply) => void | Promise<void>
}

export interface AgentService {
  streamReply(payload: StreamReplyPayload): AgentStreamResult
}
```

## Existing Code to Reuse

- `import { Response } from 'express'` and the `AgentStreamResult` interface are kept
  unchanged from the current file.
- The `AgentService` interface signature `streamReply(payload): AgentStreamResult` is
  unchanged; only the payload type evolves.

## Contracts / Tables

| Symbol | Kind | Shape |
| --- | --- | --- |
| `TopicKey` | type | `string` (`kind:category:slug`) |
| `HistoryContextResult` | type | `Record<TopicKey, Array<{ id: string; summary: string }>>` |
| `ResolveHistoryContext` | type | `(input: { topics: TopicKey[] }) => Promise<HistoryContextResult>` |
| `ReminderDraft` | type | `{ title: string; remindAt?: string; notes?: string }` |
| `NoteDraft` | type | `{ title: string; body: string }` |
| `TaskDraft` | type | `{ title: string; details?: string }` |
| `AgentReply` | type | `{ message, newReminders, newNotes, newTasks, historyTopics }` |
| `StreamReplyPayload` | type | `{ userId, message, topicIndex, resolveHistoryContext, onFinish? }` |
| `AgentStreamResult` | interface | `pipeUIMessageStreamToResponse(res: Response): void` (unchanged) |
| `AgentService` | interface | `streamReply(payload: StreamReplyPayload): AgentStreamResult` |

## Verification

- Run `npx tsc --noEmit` from `project-backend`.
- **Expected:** errors in `gemini-agent-provider.ts` and `chat.ts`, which still use the
  old `StreamReplyPayload`/`StreamReplyOnFinishPayload` signature. Those files are owned by
  Plans 2/3 and are intentionally not touched here.
- No errors should originate from `agent-provider.ts` itself.
