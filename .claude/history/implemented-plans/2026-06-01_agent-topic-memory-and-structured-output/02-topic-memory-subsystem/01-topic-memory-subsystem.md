# Plan 2 [Backend] — Topic-memory subsystem (Deep Plan)

## Context

Build the conversation topic-memory subsystem that backs the agent's `get-history-context`
tool and the topic index. This plan owns only NEW files (entities, repositories,
use-cases). It does NOT wire into routes, the Gemini service, or repository registration —
those are owned by sibling plans (Plan 1 contracts, Plan 3 wiring).

Shared contracts already implemented in `src/adapters/agent-provider.ts`:

- `type TopicKey = string` (documented shape `kind:category:slug`).
- `type HistoryContextResult = Record<TopicKey, Array<{ id: string; summary: string }>>`.

The subsystem must:

1. Model a `Topic` (recurring subject per user, identified by its `key`).
2. Model a `TopicSummary` (stored summary of what was discussed about a topic).
3. Provide repositories (abstract + in-memory) mirroring the `Message` repository pattern.
4. `BuildTopicIndexUseCase` — distinct topic keys for a user as `TopicKey[]`.
5. `GetHistoryContextUseCase` — per-topic summaries as `HistoryContextResult`.
6. `PersistTopicSummariesUseCase` — find-or-create topics, then create summaries.

## Decisions

- **Mirror existing conventions exactly.** Entities follow `message.ts`/`user.ts`
  (`Entity<Props>` + static `create` / `reference`). Repositories follow
  `message-repository.ts` (abstract empty subclass) and `in-memory-message-repository.ts`
  (`extends InMemoryRepository<T> implements TRepository`, `protected entity = T as unknown as EntityWithStatic<T>`).
- **Use-cases** follow `list-messages.ts` / `persist-user-message.ts`: `implements UseCase<Response>`,
  constructor-injected repository, `Payload` / `Response` local interfaces.
- **Entity ids are strings at the boundary** via `entity.id.toValue()`. `TopicSummary.id`
  surfaces as the `id` field of `HistoryContextResult` entries.
- **Topic index distinctness**: `findMany({ userId })` then dedupe `key` values into a `Set`.
- **History context**: for each requested topic key, `findMany({ userId, topicKey })`, map to
  `{ id: summary.id.toValue(), summary: props.summary }`. No cap / no roll-up (decision #4).
  Always returns an entry per requested topic (empty array when none) — keeps shape stable.
- **Persist**: for each `{ topic, summary }`, `findFirst({ userId, key })` on TopicRepository;
  if null, `create`. Then `TopicSummaryRepository.create` with `messageId ?? null`.
- **Import shared types** (`TopicKey`, `HistoryContextResult`) from `@/adapters/agent-provider`
  so `GetHistoryContextUseCase`'s return type aligns with Plan 1.
- Do NOT register repos in `repositories.ts`; do NOT touch agent-provider/gemini/chat.

## Files to Create

### Entities
- `src/domain/entities/topic.ts`
- `src/domain/entities/topic-summary.ts`

### Repositories
- `src/adapters/repositories/topic-repository.ts`
- `src/adapters/repositories/topic-summary-repository.ts`
- `src/adapters/repositories/in-memory-topic-repository.ts`
- `src/adapters/repositories/in-memory-topic-summary-repository.ts`

### Use-cases
- `src/domain/use-cases/topics/build-topic-index.ts`
- `src/domain/use-cases/topics/get-history-context.ts`
- `src/domain/use-cases/topics/persist-topic-summaries.ts`

## Existing Code to Reuse

- `Entity` / `EntityWithStatic` from `@/modules/domain/entity/entity`, `ID` from `.../entity/id`.
- `Repository` / `InMemoryRepository` from `@/modules/domain/repository/repository`
  (provides `create`, `findFirst`, `findMany`, cursor pagination, etc.).
- `UseCase` from `@/modules/domain/use-case`.
- Shared types from `@/adapters/agent-provider`.

## Code Blocks

### topic.ts
```ts
import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface TopicProps {
  userId: string
  key: string
  createdAt: Date
}

export class Topic extends Entity<TopicProps> {
  static create(props: TopicProps) {
    return new Topic(props)
  }

  static reference(id: ID, props: TopicProps) {
    return new Topic(props, id)
  }
}
```

### topic-summary.ts
```ts
import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface TopicSummaryProps {
  userId: string
  topicKey: string
  summary: string
  messageId: string | null
  createdAt: Date
}

export class TopicSummary extends Entity<TopicSummaryProps> {
  static create(props: TopicSummaryProps) {
    return new TopicSummary(props)
  }

  static reference(id: ID, props: TopicSummaryProps) {
    return new TopicSummary(props, id)
  }
}
```

### topic-repository.ts / topic-summary-repository.ts
```ts
export abstract class TopicRepository extends Repository<Topic> {}
export abstract class TopicSummaryRepository extends Repository<TopicSummary> {}
```

### in-memory variants (mirror in-memory-message-repository.ts)
```ts
export class InMemoryTopicRepository
  extends InMemoryRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
}
```

### build-topic-index.ts
```ts
async execute({ userId }: Payload): Promise<TopicKey[]> {
  const topics = await this.topicRepository.findMany({ userId })
  return [...new Set(topics.map((t) => t.props.key))]
}
```

### get-history-context.ts
```ts
async execute({ userId, topics }: Payload): Promise<HistoryContextResult> {
  const result: HistoryContextResult = {}
  for (const topic of topics) {
    const summaries = await this.topicSummaryRepository.findMany({
      userId,
      topicKey: topic,
    })
    result[topic] = summaries.map((s) => ({
      id: s.id.toValue(),
      summary: s.props.summary,
    }))
  }
  return result
}
```

### persist-topic-summaries.ts
```ts
async execute({ userId, topics, messageId }: Payload): Promise<void> {
  for (const { topic, summary } of topics) {
    const existing = await this.topicRepository.findFirst({ userId, key: topic })
    if (!existing) {
      await this.topicRepository.create({ userId, key: topic, createdAt: new Date() })
    }
    await this.topicSummaryRepository.create({
      userId,
      topicKey: topic,
      summary,
      messageId: messageId ?? null,
      createdAt: new Date(),
    })
  }
}
```

## Verification

- From `project-backend`: `npx tsc --noEmit`.
- New files must add no errors. Pre-existing downstream errors in
  `gemini-agent-provider.ts` and `chat.ts` are expected (owned by other plans).
- No edits to `repositories.ts`, `agent-provider.ts`, `gemini-agent-provider.ts`, `chat.ts`.
