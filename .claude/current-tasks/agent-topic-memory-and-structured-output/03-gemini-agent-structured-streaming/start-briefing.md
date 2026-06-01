# Plan 2 [Backend] (parallel) — Gemini agent: structured output, one tool, streaming

**Plan 2 [Backend] (parallel)**: Rewrite `GeminiAgentProviderService` to implement the evolved `AgentService`: topic-aware system prompt, the single `get-history-context` tool (used at most once), structured output, and the streaming adaptation.

## Why parallel

Depends only on the shared contracts from Plan 1. Owns `src/infra/services/gemini-agent-provider.ts` exclusively. The tool executor is **injected** via `payload.resolveHistoryContext`, so this plan does NOT depend on Plan 2's topic-memory use-cases.

## Goal

Implement `streamReply(payload)` (new signature from Plan 1) using AI SDK v6 (`ai@^6`, `@ai-sdk/google@^3`) so that:

1. **System prompt** keeps the existing Ben persona (concise, Brazilian Portuguese, "mano") AND now includes the **topic index** (`payload.topicIndex`) rendered as suggestions, with instructions:
   - reuse an existing topic key when the message matches one; otherwise create a new `kind:category:slug`;
   - you MAY call `get-history-context` **once** with the subset of topics you need detail on, BEFORE replying; analyze the user message to decide which topics (decision #5).
2. **One tool** `get-history-context`:
   - input schema (zod): `{ topics: string[] }`
   - `execute` delegates to `payload.resolveHistoryContext({ topics })` and returns the `HistoryContextResult`.
   - Constrain to a single use (e.g. cap steps so the tool can run at most once, then the model must produce the final reply).
3. **Structured output** matching `AgentReply` from Plan 1: `message`, `newReminders`, `newNotes`, `newTasks`, `historyTopics[]` (the array form — decision #2). For drafts, the model proposes them; reuse-vs-new topic decision is the model's (decision #1: index passed as suggestion).
4. **Streaming adaptation (decision #3)** — the core tension to resolve here:
   - The web consumes a UI message stream (`@ai-sdk/react` `useChat` + `DefaultChatTransport`). The natural-language `message` MUST still stream as text so the existing chat keeps working and capture cards can appear optimistically.
   - Recommended approach (the deep plan finalizes the exact AI SDK v6 mechanism): stream the `message` as the assistant's text part, and emit `newReminders` / `newNotes` / `newTasks` / `historyTopics` as **typed data parts** (e.g. `data-captures`, `data-topics`) appended to the same UI message stream before finish. This is **non-breaking**: today's web ignores unknown parts and still renders the streamed text. Evaluate `streamText` + `experimental_output` (`Output.object`) and/or `createUIMessageStream` with a writer for the data parts; pick whichever cleanly yields BOTH streamed text and the structured payload, and document the choice in the deep plan.
   - `onFinish` must be called with the full `AgentReply` (so the route can persist the ben message + topic summaries).
   - `pipeUIMessageStreamToResponse(res)` remains the transport returned by `streamReply`.

## Constraints

- Keep the existing persona/voice from the current `BEN_SYSTEM_PROMPT` — extend it, don't discard it.
- Import types from `src/adapters/agent-provider.ts` (Plan 1). Use zod (`zod@^4`) for tool/output schemas (already a dependency).
- Owns ONLY `gemini-agent-provider.ts`. Do NOT touch the route, the adapter interface, entities, repositories, or use-cases. Do NOT register anything.
- If the streaming approach needs a helper, keep it inside this file.
- Do NOT run `npm run lint:fix`. Verify with `npx tsc --noEmit` (the route in `chat.ts` still calls the old shape until Plan 3 — note that; don't edit `chat.ts`).
