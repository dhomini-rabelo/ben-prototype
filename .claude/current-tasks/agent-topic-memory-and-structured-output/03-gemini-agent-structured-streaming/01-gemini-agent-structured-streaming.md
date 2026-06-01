# Plan 2 [Backend] — Gemini agent: structured output, one tool, streaming (DEEP PLAN)

## Scope / ownership

- OWNS ONLY: `project-backend/src/infra/services/gemini-agent-provider.ts`.
- Imports the already-implemented contracts from `project-backend/src/adapters/agent-provider.ts`:
  `AgentReply`, `StreamReplyPayload`, `AgentStreamResult`, `TopicKey`, `HistoryContextResult`, `ResolveHistoryContext`, `AgentService`.
- Does NOT touch the route (`chat.ts`), the adapter interface, entities, repositories, or use-cases. Does NOT register anything.

## Target signature (from Plan 1)

```ts
streamReply(payload: StreamReplyPayload): AgentStreamResult
```

where

```ts
type StreamReplyPayload = {
  userId: string
  message: string
  topicIndex: TopicKey[]
  resolveHistoryContext: ResolveHistoryContext // ({ topics }) => Promise<HistoryContextResult>
  onFinish?: (reply: AgentReply) => void | Promise<void>
}

type AgentReply = {
  message: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
  historyTopics: Array<{ topic: TopicKey; summary: string }>
}
```

`AgentStreamResult` only requires `pipeUIMessageStreamToResponse(res)`.

## AI SDK v6 API verification (read from installed `node_modules/ai/dist/index.d.ts`)

- `tool` and `Tool` are re-exported from `ai` (originate in `@ai-sdk/provider-utils`). `tool({ description, inputSchema, execute })` accepts a zod schema as `inputSchema` (FlexibleSchema).
- `Output.object({ schema })` (exported as `Output`, namespace member `object`) → `Output<OBJECT, DeepPartial<OBJECT>, never>`. Used via `experimental_output` on `generateText` / `streamText`.
  - IMPORTANT: when `experimental_output` is set, the model's RAW TEXT output IS the serialized JSON object. So `textStream` / `toUIMessageStream()` would stream JSON, not natural-language prose. This is the central tension.
- `generateText({ ..., experimental_output, stopWhen })` returns a result whose `result.experimental_output` is `InferCompleteOutput<OUTPUT>` (the fully typed object).
- `stepCountIs(n): StopCondition` and `stopWhen` (default `stepCountIs(1)` for one-shot). To allow exactly one optional tool call THEN a final answer, use `stopWhen: stepCountIs(2)`.
- `createUIMessageStream<UI_MESSAGE>({ execute, onError })` → `ReadableStream<InferUIMessageChunk<UI_MESSAGE>>`. `execute({ writer })` gets a `UIMessageStreamWriter` with `write(chunk)`.
- `pipeUIMessageStreamToResponse({ response, stream })` (standalone, from `ai`) pipes that stream to an Express/Node `ServerResponse` as SSE. (Express `Response` extends Node `ServerResponse`.)
- `UIMessageChunk` data-part shape: `{ type: 'data-<name>', id?, data, transient? }` (see `DataUIMessageChunk`). Text streaming chunks: `{ type:'text-start', id }`, `{ type:'text-delta', id, delta }`, `{ type:'text-end', id }`. Message envelope: `{ type:'start' }` ... `{ type:'finish' }` are added automatically by `createUIMessageStream`.

## Decision: streaming-vs-structured-output mechanism — and WHY

Considered options:

1. `streamText` + `experimental_output` + `result.toUIMessageStream()` directly.
   - REJECTED: the assistant text streamed to the client would be the raw JSON of the whole `AgentReply`, not the natural-language `message`. The existing web renders assistant text verbatim → it would show JSON. Breaks the non-breaking requirement.

2. Two model calls (one streamed prose, one structured) — REJECTED: doubles latency/cost and risks the prose and the structured drafts disagreeing.

3. CHOSEN — single structured generation behind a `createUIMessageStream` writer:
   - Run ONE `generateText` with `experimental_output: Output.object({ schema: agentReplySchema })` and the single `get-history-context` tool, `stopWhen: stepCountIs(2)` so the tool may run at most once before the model emits the final structured object.
   - `await result.experimental_output` → fully typed `AgentReply`.
   - Then, inside the `createUIMessageStream` `execute({ writer })`:
     - Stream the natural-language `reply.message` as a real text part: emit `text-start`, then `text-delta` chunks (word-chunked for a streaming feel), then `text-end`. The existing web consumes this exactly as today.
     - Emit the structured extras as typed data parts in the SAME message: `data-reminders`, `data-notes`, `data-tasks`, `data-topics`. These are additive; today's web ignores unknown parts.
   - Call `payload.onFinish?.(reply)` with the full `AgentReply` (after writing parts) so the route can persist.
   - Return `{ pipeUIMessageStreamToResponse: (res) => pipeUIMessageStreamToResponse({ response: res, stream }) }`.

WHY this is the right tradeoff: it guarantees a single, internally consistent generation (prose + drafts come from the same object), keeps the assistant text path byte-compatible with the current web (real `text-*` chunks), and adds the structured payload purely additively as `data-*` parts. The only cost is that prose is "chunked after completion" rather than token-streamed — acceptable for short Ben replies and required because `experimental_output` occupies the model's text channel.

## Typed UI message type

Define a local `BenUIMessage` so `writer.write` is type-checked against our data parts:

```ts
type BenUIMessage = UIMessage<
  unknown,
  {
    reminders: AgentReply['newReminders']
    notes: AgentReply['newNotes']
    tasks: AgentReply['newTasks']
    topics: AgentReply['historyTopics']
  }
>
```

`createUIMessageStream<BenUIMessage>` then types `writer.write` to accept `data-reminders | data-notes | data-tasks | data-topics` plus the standard text chunks.

## Zod schemas (zod v4, structured output matching AgentReply)

```ts
const reminderDraftSchema = z.object({
  title: z.string(),
  remindAt: z.string().optional(),
  notes: z.string().optional(),
})
const noteDraftSchema = z.object({ title: z.string(), body: z.string() })
const taskDraftSchema = z.object({ title: z.string(), details: z.string().optional() })
const historyTopicSchema = z.object({ topic: z.string(), summary: z.string() })

const agentReplySchema = z.object({
  message: z.string(),
  newReminders: z.array(reminderDraftSchema),
  newNotes: z.array(noteDraftSchema),
  newTasks: z.array(taskDraftSchema),
  historyTopics: z.array(historyTopicSchema),
})
```

## The single tool

```ts
const getHistoryContext = tool({
  description:
    'Busque o histórico relacionado a um conjunto de tópicos antes de responder. Use no máximo uma vez por mensagem.',
  inputSchema: z.object({ topics: z.array(z.string()) }),
  execute: ({ topics }) => payload.resolveHistoryContext({ topics }),
})
```

Constrain to at most one use: `stopWhen: stepCountIs(2)` + `toolChoice: 'auto'`. Step 1 = optional single tool call; step 2 = final structured answer. The model cannot call it twice because after the tool result it must produce the final object (step budget exhausted).

## System prompt

Keep the EXISTING `BEN_SYSTEM_PROMPT` lines verbatim (persona, voice, "mano", rules, examples). Append a topic-memory section built from `payload.topicIndex`:

- Render the index as suggestions.
- Instruct: reuse an existing topic key when the message matches one; otherwise create a new `kind:category:slug`.
- Instruct: you MAY call `get-history-context` ONCE with the topics you need detail on, before replying; analyze the user message to decide which topics.
- Instruct to fill `historyTopics` with the topics this turn relates to (each with a short summary) and propose `newReminders` / `newNotes` / `newTasks`.

Built per-call (depends on `topicIndex`), so `BEN_SYSTEM_PROMPT` becomes the static base and a `buildSystemPrompt(topicIndex)` helper appends the dynamic block.

## Implementation outline

```ts
streamReply(payload): AgentStreamResult {
  const stream = createUIMessageStream<BenUIMessage>({
    execute: async ({ writer }) => {
      const result = await generateText({
        model,
        system: buildSystemPrompt(payload.topicIndex),
        prompt: payload.message,
        tools: { 'get-history-context': getHistoryContext(payload.resolveHistoryContext) },
        toolChoice: 'auto',
        stopWhen: stepCountIs(2),
        experimental_output: Output.object({ schema: agentReplySchema }),
      })

      const reply = result.experimental_output as AgentReply

      const textId = generateId()
      writer.write({ type: 'text-start', id: textId })
      for (const chunk of chunkText(reply.message)) {
        writer.write({ type: 'text-delta', id: textId, delta: chunk })
      }
      writer.write({ type: 'text-end', id: textId })

      writer.write({ type: 'data-reminders', data: reply.newReminders })
      writer.write({ type: 'data-notes', data: reply.newNotes })
      writer.write({ type: 'data-tasks', data: reply.newTasks })
      writer.write({ type: 'data-topics', data: reply.historyTopics })

      await payload.onFinish?.(reply)
    },
  })

  return {
    pipeUIMessageStreamToResponse: (res) =>
      pipeUIMessageStreamToResponse({ response: res, stream }),
  }
}
```

`chunkText` splits on spaces keeping the trailing space, for a token-like streaming feel. `generateId` imported from `ai`.

## Verification

- `npx tsc --noEmit` from `project-backend`. Expect ONE pre-existing error in `chat.ts` (old `onFinish?.({ text })` call shape; owned by Plan 3). Our file must add zero new errors.
- Do NOT run `npm run lint:fix`.
