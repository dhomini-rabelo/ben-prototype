# Plan 2 [Backend] (parallel) — Topic-memory subsystem

**Plan 2 [Backend] (parallel)**: Build the conversation topic-memory subsystem that backs the `get-history-context` tool and the topic index.

## Why parallel

Depends only on the shared contracts from Plan 1. Owns its own new entity, repository, and use-case files. It does NOT touch the Gemini service (Plan 2 sibling) nor the route/repositories registration (Plan 3). Decoupled from the Gemini service: the route (Plan 3) wires these use-cases into the agent's injected resolver, so there is no direct dependency between the two parallel plans.

## Goal

Provide real data for the agent's topic features:
- a **topic index** (distinct `kind:category:slug` keys for a user) shown as suggestions in the system prompt,
- **per-topic summaries** returned by `get-history-context`,
- **persistence** of new topics + summaries AFTER the agent output (decision #7).

## Files this plan OWNS (create new)

Entities (`src/domain/entities/`):
- `topic.ts` — `Topic` entity: props `{ userId: string; key: string /* kind:category:slug */; createdAt: Date }`. Follow the existing `Entity` pattern (see `message.ts`, `user.ts`) with `create` / `reference`.
- `topic-summary.ts` — `TopicSummary` entity: props `{ userId: string; topicKey: string; summary: string; messageId: string | null; createdAt: Date }`. ids are **string**.

Repositories (`src/adapters/repositories/`):
- `topic-repository.ts` — `abstract class TopicRepository extends Repository<Topic>` (mirror `message-repository.ts`).
- `topic-summary-repository.ts` — `abstract class TopicSummaryRepository extends Repository<TopicSummary>`.
- `in-memory-topic-repository.ts` — extends `InMemoryRepository<Topic>` implements `TopicRepository` (mirror `in-memory-message-repository.ts`).
- `in-memory-topic-summary-repository.ts` — extends `InMemoryRepository<TopicSummary>` implements `TopicSummaryRepository`.

Use-cases (`src/domain/use-cases/topics/`):
- `build-topic-index.ts` — `BuildTopicIndexUseCase`: input `{ userId }` → output `TopicKey[]` (distinct topic keys for the user). Used by the route to fill `topicIndex`.
- `get-history-context.ts` — `GetHistoryContextUseCase`: input `{ userId; topics: string[] }` → output `Record<string, Array<{ id: string; summary: string }>>`. For each requested topic, returns its `TopicSummary` rows (`id` = summary id, `summary` = text). No cap/roll-up (decision #4). Shape MUST match `HistoryContextResult` from Plan 1.
- `persist-topic-summaries.ts` — `PersistTopicSummariesUseCase`: input `{ userId; topics: Array<{ topic: string; summary: string }>; messageId?: string }`. For each entry: find-or-create the `Topic` by `(userId, key)`, then create a `TopicSummary`. Runs AFTER agent output.

## Constraints

- Use the existing domain primitives in `src/modules/domain/` (`Entity`, `Repository`, `InMemoryRepository`, `UseCase`, query helpers). Read `in-memory-message-repository.ts` and `list-messages.ts` for the exact patterns (cursor pagination, `findMany`, `create`).
- Import the shared types (`TopicKey`, `HistoryContextResult`) from `src/adapters/agent-provider.ts` (Plan 1) where useful, so `GetHistoryContextUseCase`'s return type aligns.
- Do NOT register repositories in `src/infra/http/repositories.ts` — that file is owned by Plan 3.
- Do NOT touch `gemini-agent-provider.ts`, `chat.ts`, or `agent-provider.ts`.
- Do NOT run `npm run lint:fix`. Verify with `npx tsc --noEmit`.
