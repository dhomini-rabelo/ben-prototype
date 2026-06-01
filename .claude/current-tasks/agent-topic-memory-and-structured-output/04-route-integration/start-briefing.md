# Plan 3 [Backend] (sync) — Route integration & wiring

**Plan 3 [Backend] (sync)**: Wire the topic-memory subsystem (Plan 2) and the rewritten Gemini agent (Plan 2) together in the `/chat` route, and register the new repositories. Runs last, alone — it merges the parallel outputs.

## Why sync / last

Depends on Plan 1 (contracts), Plan 2 topic-memory (use-cases + repositories), and Plan 2 Gemini agent (new `streamReply`). It touches the shared wiring files (`chat.ts`, `repositories.ts`) that no parallel plan owns, so it must run alone and last to avoid conflicts.

## Files this plan OWNS

- `src/infra/http/repositories.ts` — register the new in-memory repositories as shared singletons (mirror the existing `messageRepository` singleton): `topicRepository = new InMemoryTopicRepository()`, `topicSummaryRepository = new InMemoryTopicSummaryRepository()`.
- `src/infra/http/routes/chat.ts` — integrate the new flow.

## Integration in `chat.ts`

Current flow: parse body → extract latest user text → `PersistUserMessageUseCase` → `agentService.streamReply({ userId, message, onFinish: persist ben message })` → `pipeUIMessageStreamToResponse`.

New flow:
1. Instantiate the new use-cases with the registered repositories: `BuildTopicIndexUseCase`, `GetHistoryContextUseCase`, `PersistTopicSummariesUseCase` (from Plan 2 topic-memory).
2. After persisting the user message, build the topic index: `const topicIndex = await buildTopicIndexUseCase.execute({ userId })`.
3. Call the agent with the new payload (Plan 1 signature):
   - `topicIndex`
   - `resolveHistoryContext: ({ topics }) => getHistoryContextUseCase.execute({ userId, topics })`
   - `onFinish: async (reply) => { await persistBenMessageUseCase.execute({ userId, content: reply.message }); await persistTopicSummariesUseCase.execute({ userId, topics: reply.historyTopics, messageId: <ben message id> }); }`
4. Keep `result.pipeUIMessageStreamToResponse(res)`.

## Scope boundary (do NOT cross)

- This task PREPARES the agent. The structured `newReminders/newNotes/newTasks` drafts are emitted by the agent and streamed as data parts, but **persisting them into Note/Reminder/Task entities is the separate Capture Card feature** — do NOT create those entities/repos or persist drafts here. Persist only the ben message + topic summaries.
- `PersistBenMessageUseCase` currently sets `capture: null` — leave as is; linking captures is Capture Card work.
- Do NOT change the web. Adding data parts to the stream is non-breaking for the current web client.

## Constraints

- Match existing route style (use-case instantiation at module scope, `try/catch` + `next(err)`, zod body schema unchanged).
- Do NOT run `npm run lint:fix`. After implementing, verify the whole backend compiles with `npx tsc --noEmit` from `project-backend` (this is the merge point — it should now be green).
