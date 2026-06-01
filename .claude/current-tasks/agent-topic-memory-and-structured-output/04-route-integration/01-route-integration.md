# Plan 3 [Backend] (sync) — Route integration & wiring — DEEP PLAN

This is the MERGE point. Plans 1 (contracts), 2 (topic-memory use-cases + repositories),
and 2 (rewritten Gemini agent) are already implemented. This plan only wires them together
in the `/chat` route and registers the new repository singletons.

## Owned files (touch ONLY these two)

1. `src/infra/http/repositories.ts`
2. `src/infra/http/routes/chat.ts`

## Verified facts (no guessing)

- `StreamReplyPayload` (src/adapters/agent-provider.ts) now requires:
  `{ userId, message, topicIndex: TopicKey[], resolveHistoryContext, onFinish?: (reply: AgentReply) => void | Promise<void> }`.
  - `AgentReply = { message, newReminders, newNotes, newTasks, historyTopics: Array<{ topic: TopicKey; summary: string }> }`.
  - `ResolveHistoryContext = (input: { topics: TopicKey[] }) => Promise<HistoryContextResult>`.
- `onFinish` now receives the full `AgentReply` (not `{ text }`). Current chat.ts uses `reply.text` — must change to `reply.message`.
- Use-case constructors:
  - `BuildTopicIndexUseCase(topicRepository: TopicRepository)` → `execute({ userId }): Promise<TopicKey[]>`.
  - `GetHistoryContextUseCase(topicSummaryRepository: TopicSummaryRepository)` → `execute({ userId, topics }): Promise<HistoryContextResult>`.
  - `PersistTopicSummariesUseCase(topicRepository, topicSummaryRepository)` → `execute({ userId, topics: Array<{topic,summary}>, messageId? })`.
- `PersistBenMessageUseCase.execute({ userId, content })` returns `Promise<Message>` (already updated by another plan).
- Message id accessor: `Entity` base exposes `get id(): ID`; `ID.toValue()` returns the string (confirmed by GetHistoryContextUseCase using `summary.id.toValue()`). So ben message id string = `benMessage.id.toValue()`.
- Repository classes: `InMemoryTopicRepository`, `InMemoryTopicSummaryRepository` (in src/adapters/repositories/).

## STEP 1 — repositories.ts

Add two singletons mirroring `messageRepository`:

```ts
import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'
import { InMemoryTopicRepository } from '@/adapters/repositories/in-memory-topic-repository'
import { InMemoryTopicSummaryRepository } from '@/adapters/repositories/in-memory-topic-summary-repository'

export const messageRepository = new InMemoryMessageRepository()
export const topicRepository = new InMemoryTopicRepository()
export const topicSummaryRepository = new InMemoryTopicSummaryRepository()
```

## STEP 2 — chat.ts

- Add imports for the three topic use-cases and the two new repositories.
- Instantiate at module scope (matching existing style):
  - `buildTopicIndexUseCase = new BuildTopicIndexUseCase(topicRepository)`
  - `getHistoryContextUseCase = new GetHistoryContextUseCase(topicSummaryRepository)`
  - `persistTopicSummariesUseCase = new PersistTopicSummariesUseCase(topicRepository, topicSummaryRepository)`
- In the handler, after persisting the user message:
  - `const topicIndex = await buildTopicIndexUseCase.execute({ userId: req.userId })`
- Update `agentService.streamReply(...)` call to pass `topicIndex`, `resolveHistoryContext`, and the new `onFinish`:
  ```ts
  const result = agentService.streamReply({
    userId: req.userId,
    message,
    topicIndex,
    resolveHistoryContext: ({ topics }) =>
      getHistoryContextUseCase.execute({ userId: req.userId, topics }),
    onFinish: async (reply) => {
      const benMessage = await persistBenMessageUseCase.execute({
        userId: req.userId,
        content: reply.message,
      })
      await persistTopicSummariesUseCase.execute({
        userId: req.userId,
        topics: reply.historyTopics,
        messageId: benMessage.id.toValue(),
      })
    },
  })
  ```
- Keep `result.pipeUIMessageStreamToResponse(res)`, the zod body schema, try/catch + next(err), and the
  `extractLatestUserMessageText` helper unchanged.

## Scope boundary

- Do NOT persist `newReminders/newNotes/newTasks` (Capture Card feature).
- Leave `PersistBenMessageUseCase`'s `capture: null` as is. Do not change the web.

## Verification

- `npx tsc --noEmit` from `project-backend` must be fully green (merge point).
- Do NOT run `npm run lint:fix`.
