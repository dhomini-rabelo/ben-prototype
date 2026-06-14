# Plan: Use OpenRouter (gpt-oss-120b) as Ben's agent provider via the Vercel AI SDK

## Context

`project-backend` currently runs Ben's agent on Google Gemini (`gemini-2.5-flash-lite`) through the Vercel AI SDK. We want to switch the agent to **OpenRouter** running the open-weight **`openai/gpt-oss-120b`** model, and have OpenRouter route each request to the **fastest providers by throughput, excluding Cerebras**.

All of Ben's prompt/schema/tool logic is model-agnostic — only the `model` instance is Gemini-specific. So the change is small: generalize the agent service to accept any Vercel AI SDK `LanguageModel`, add an OpenRouter model configured with throughput routing, and wire the routes to it.

### Research findings (verified)

**1. OpenRouter adapter for the Vercel AI SDK** — official package [`@openrouter/ai-sdk-provider`](https://github.com/OpenRouterTeam/ai-sdk-provider) (npm). It is a standard AI SDK provider, fully compatible with the project's existing `generateText` + `Output.object` + `tools` usage:
```ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })
const model = openrouter('openai/gpt-oss-120b', { /* settings */ })
```

**2. Provider routing spec** ([OpenRouter docs](https://openrouter.ai/docs/guides/routing/provider-selection)) — routing is controlled by a `provider` object in the request body. Through the AI SDK provider it is passed via **`extraBody`** on the model factory (same mechanism the README documents for `reasoning`). Relevant fields:
- `sort`: `"price" | "throughput" | "latency"` — `"throughput"` ranks providers fastest-first and disables load balancing.
- `ignore`: `string[]` — blacklist of provider slugs (use `["cerebras"]`).
- `require_parameters`: `boolean` — only route to providers that support all request params (tools + structured output). Recommended so a fast-but-limited provider isn't picked for our tool-calling / `Output.object` calls.

Final config: `extraBody: { provider: { sort: 'throughput', ignore: ['cerebras'], require_parameters: true } }`.

**3. Fastest gpt-oss-120b providers excluding Cerebras** (Artificial Analysis benchmarks): SambaNova ≈691 t/s → Fireworks ≈620–637 t/s → Together ≈536 t/s → Groq ≈476 t/s. `sort: 'throughput'` selects among these automatically; `ignore: ['cerebras']` drops the (otherwise #1) Cerebras endpoint per the requirement.

## Approach (confirmed with user)

- **Replace** Gemini in the routes with OpenRouter gpt-oss-120b.
- **Parameterize the model**: the agent service takes a `LanguageModel` in its constructor (no prompt/schema/tool duplication). Rename the provider folder to a generic, model-neutral name and provide small model-builder files for Gemini and OpenRouter.

## Changes

### 1. Add the dependency
- `project-backend/package.json` → add `@openrouter/ai-sdk-provider` (latest, AI SDK v5+/v6 compatible). Install with `npm install`.

### 2. Add the env var — [src/infra/services/env.ts](project-backend/src/infra/services/env.ts)
- Add `OPENROUTER_API_KEY: z.string()` to `envSchema`. Keep `GOOGLE_GENERATIVE_AI_API_KEY` (still used by the Gemini model builder).
- Add `OPENROUTER_API_KEY=` to the env files used by the runtime (`.env`, `.env.development`, `.env.test`). User must supply a real key for the dev/prod files; a dummy value is fine for `.env.test`.

### 3. Rename + generalize the provider folder
Rename `src/infra/services/gemini-agent-provider/` → `src/infra/services/ben-agent-provider/` (use `git mv` to preserve history). All subfiles (`ben-system-prompt.ts`, `generate-reply/*`, `generate-task-turn/*`) move unchanged — they are model-agnostic.

In the new [ben-agent-provider/index.ts](project-backend/src/infra/services/gemini-agent-provider/index.ts):
- Remove the module-level `createGoogleGenerativeAI` / `const model = google(...)` setup.
- Rename the class `GeminiAgentProviderService` → `BenAgentProviderService` and give it a constructor that injects the model:
  ```ts
  import type { LanguageModel } from 'ai'
  export class BenAgentProviderService implements AgentService {
    constructor(private readonly model: LanguageModel) {}
    // generateReply / generateTaskTurn: replace bare `model` with `this.model`
  }
  ```
- The `generateText` / `Output.object` / tool wiring stays identical.

### 4. Model builders — new `ben-agent-provider/models.ts`
Shared-setup file at the folder root (per the Service Structure design). Exports the configured models:
```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { env } from '@/infra/services/env'

const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })
export const geminiModel = google('gemini-2.5-flash-lite')

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY })
export const openRouterModel = openrouter('openai/gpt-oss-120b', {
  extraBody: {
    provider: { sort: 'throughput', ignore: ['cerebras'], require_parameters: true },
  },
})
```
(Keeping `geminiModel` means the swap is a one-line constructor-arg change later; it costs nothing.)

### 5. Wire the routes to OpenRouter
- [src/infra/http/routes/chat.ts](project-backend/src/infra/http/routes/chat.ts) — replace the import of `GeminiAgentProviderService` and `const agentService = new GeminiAgentProviderService()` (line 37) with:
  ```ts
  import { BenAgentProviderService } from '@/infra/services/ben-agent-provider'
  import { openRouterModel } from '@/infra/services/ben-agent-provider/models'
  const agentService = new BenAgentProviderService(openRouterModel)
  ```
- [src/infra/http/routes/tasks/create-task-message.ts](project-backend/src/infra/http/routes/tasks/create-task-message.ts) — same import swap; pass `new BenAgentProviderService(openRouterModel)` into `new CreateTaskMessageUseCase(taskRepository, ...)`.

No changes to `src/adapters/agent-provider.ts` (the `AgentService` port) or any use-case — they depend only on the interface.

### 6. Docs (optional but recommended)
- Update [docs/vercel-ai-sdk.md](docs/vercel-ai-sdk.md) to note the OpenRouter provider, the `openai/gpt-oss-120b` model, and the throughput/ignore-Cerebras routing config.

## Verification

1. `cd project-backend && npm install` — confirm `@openrouter/ai-sdk-provider` resolves.
2. Set a real `OPENROUTER_API_KEY` in `.env.development`.
3. `cd project-backend && npx tsc --noEmit` — type-check passes (verifies the `LanguageModel` constructor type and OpenRouter model typing).
4. `cd project-backend && npm run lint:fix`.
5. Run the backend (dev runner) and exercise the chat endpoint with an authenticated request (or via project-web). Confirm:
   - A coherent Ben reply is returned (proves gpt-oss-120b handled the prompt).
   - Tool calling (`get-history-context`) and structured `Output.object` parsing still work end-to-end (proves `require_parameters: true` routed to a capable provider).
6. (Optional) Inspect the OpenRouter dashboard / response metadata to confirm requests are served by a high-throughput non-Cerebras provider (e.g. SambaNova/Fireworks/Together/Groq).

## Risks / notes

- **Structured output + tools across providers**: not every gpt-oss-120b endpoint supports tools and `response_format` identically. `require_parameters: true` mitigates this by routing only to capable providers. If a provider still misbehaves, fall back to pinning order via `provider.order: ['fireworks', 'together', ...]` or `only: [...]`.
- **AI SDK version**: project uses `ai@^6`. Install the latest `@openrouter/ai-sdk-provider` (v5+ line) which targets the same `LanguageModelV2` interface; if a peer-dep mismatch appears at install/type-check, adjust to the matching provider version.
- Keep `GOOGLE_GENERATIVE_AI_API_KEY` required in env since `geminiModel` is still constructed at import time.
