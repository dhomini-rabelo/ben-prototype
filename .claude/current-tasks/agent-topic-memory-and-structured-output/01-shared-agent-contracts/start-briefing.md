# Plan 1 [Backend] (sync) — Shared agent contracts

**Plan 1 [Backend] (sync)**: Define the shared contracts that the topic-memory subsystem (Plan 2), the Gemini agent rewrite (Plan 2), and the route integration (Plan 3) all depend on.

## Why sync / first

Every other plan consumes these types and the evolved `AgentService` interface. It must finish before any parallel work starts. It owns `src/adapters/agent-provider.ts` exclusively.

## Goal

Evolve the agent boundary in `src/adapters/agent-provider.ts` so the agent can:
1. Receive a **topic index** (existing `kind:category:slug` keys for the user) as suggestions in its system prompt.
2. Use **one tool** (`get-history-context`) **at most once** per turn — its executor is **injected** as a resolver function on the stream payload (so the Gemini service does NOT depend on Plan 2's use-cases).
3. Produce a **structured output** alongside the streamed text reply.

## Contract to define (in `src/adapters/agent-provider.ts`)

- **Topic taxonomy**: `type TopicKey = string` documented as `kind:category:slug` (e.g. `reminder:work:meeting`). ids are **string**.
- **History-context resolver** (the injected tool executor):
  - input: `{ topics: TopicKey[] }`
  - output: `HistoryContextResult = Record<TopicKey, Array<{ id: string; summary: string }>>`
  - type: `type ResolveHistoryContext = (input: { topics: TopicKey[] }) => Promise<HistoryContextResult>`
- **Structured agent output** (`AgentReply`):
  - `message: string` — natural-language reply (this is what streams to the UI as text)
  - `newReminders: ReminderDraft[]`
  - `newNotes: NoteDraft[]`
  - `newTasks: TaskDraft[]`
  - `historyTopics: Array<{ topic: TopicKey; summary: string }>` — topics this turn relates to (an ARRAY; a turn may touch several), each with this turn's short summary. The agent reuses a topic from the suggested index when it matches, else creates a new `kind:category:slug`.
  - Draft shapes are the **agent output contract only** (persistence of Notes/Reminders/Tasks is the separate Capture Card feature). Keep them minimal:
    - `ReminderDraft = { title: string; remindAt?: string; notes?: string }`
    - `NoteDraft = { title: string; body: string }`
    - `TaskDraft = { title: string; details?: string }`
- **Evolved `streamReply` payload** (`StreamReplyPayload`):
  - keep `userId`, `message`
  - add `topicIndex: TopicKey[]` — existing topic keys, passed by the route, rendered into the system prompt as suggestions
  - add `resolveHistoryContext: ResolveHistoryContext` — injected tool executor
  - evolve `onFinish` to receive the full structured reply: `onFinish?: (reply: AgentReply) => void | Promise<void>` (it currently receives `{ text }`)
- Keep `AgentStreamResult` / `pipeUIMessageStreamToResponse(res)` as the transport.

## Constraints

- TypeScript types/interfaces only — no implementation here. Do not touch the Gemini service, the route, entities, repositories, or use-cases.
- Follow existing code style (the file already exports interfaces/types).
- Do NOT run `npm run lint:fix` (formatting is handled once at the end).
- Verify with `npx tsc --noEmit` from `project-backend` (expect downstream files that consume the OLD signature to error until Plans 2/3 land — note that, don't try to fix files you don't own).
