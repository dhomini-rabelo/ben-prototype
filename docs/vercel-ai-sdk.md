# Vercel AI SDK

Reference for integrating the **Vercel AI SDK** (AI SDK 6.x) with the **Google Generative AI (Gemini)** provider, targeting the **Gemini Flash Lite** model. This is the foundation for Ben's agent in `project-backend`.

## Overview

The AI SDK is a TypeScript toolkit that standardizes calling AI models across providers behind a single API. You pick a model from a provider and call a core function (`generateText`, `generateObject`, …); swapping providers only changes the `model` argument.

- Core package: `ai` — the provider-agnostic functions.
- Provider package: `@ai-sdk/google` — the Gemini models.

## Installation

Install both the core SDK and the Google provider in `project-backend`:

```bash
npm install ai @ai-sdk/google
```

The SDK relies on **Zod** for structured output schemas. `project-backend` already depends on `zod`, so no extra install is needed.

## Authentication

The Google provider reads the API key from the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable by default.

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
```

To pass the key explicitly (e.g. when wiring it through validated env config), create a custom provider instance:

```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})
```

## Models

The provider is created by calling `google(modelId)`. Available **Flash Lite** model IDs:

- `gemini-2.5-flash-lite` — the stable Flash Lite model (use this one).
- `gemini-2.5-flash-lite-preview-06-17` — a dated preview snapshot.

```ts
import { google } from '@ai-sdk/google'

const model = google('gemini-2.5-flash-lite')
```

## Core functions

### `generateText`

Generates a plain text completion. Best for free-form replies.

```ts
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const { text } = await generateText({
  model: google('gemini-2.5-flash-lite'),
  system: 'You are Ben, a concise personal assistant.',
  prompt: 'Remind me to call the dentist tomorrow.',
})
```

Key inputs:

1. `model` — the provider model instance.
2. `system` — optional system prompt that sets the agent's persona/rules.
3. `prompt` — a single user string, **or** use `messages` for a conversation.
4. `messages` — an array of `{ role, content }` turns (`'system' | 'user' | 'assistant'`).

### `generateObject`

Generates **structured, validated** output against a Zod schema. Best when the agent must return typed data (e.g. classifying a message into a capture).

```ts
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const { object } = await generateObject({
  model: google('gemini-2.5-flash-lite'),
  schema: z.object({
    kind: z.enum(['note', 'reminder', 'task']),
    title: z.string(),
  }),
  prompt: 'Classify this message: "Buy milk on the way home".',
})
```

The returned `object` is fully typed from the schema and already validated by the SDK.

### Streaming variants

- `streamText` — streams text tokens as they are produced; the returned result exposes helpers to pipe the stream to an HTTP response.
- `streamObject` — streams a partial object as the structured output is generated.

Ben's chat uses **streaming**: the backend streams Ben's reply token-by-token, and the frontend renders it live.

## Streaming from Express

The `streamText` result object exposes pipe helpers for a Node.js response:

- `result.pipeUIMessageStreamToResponse(res)` — streams the **UI message protocol** (structured parts/metadata). Use this when the frontend consumes the stream with `@ai-sdk/react`'s `useChat`.
- `result.pipeTextStreamToResponse(res)` — streams plain text only.

```ts
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

app.post('/chat', async (req, res) => {
  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system: 'You are Ben, a concise personal assistant.',
    messages: req.body.messages, // UIMessage[] from the client
    onFinish: ({ text }) => {
      // persist the assistant reply once the stream completes
    },
  })

  result.pipeUIMessageStreamToResponse(res)
})
```

The `onFinish` callback fires after the stream completes and gives the full `text`, which is where the assistant message is persisted.

## Consuming the stream on the frontend

The `@ai-sdk/react` package provides the `useChat` hook, which manages the message list, streaming state, and the connection to a custom backend.

```ts
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({
    api: 'https://api.example.com/chat',
    headers: { Authorization: `Bearer ${token}` }, // auth headers
  }),
})
```

Install it alongside the core SDK in the frontend:

```bash
npm install @ai-sdk/react ai
```

Key points:

1. `messages` are **UIMessage** objects with a `parts` array (each part is `text`, a tool call, a file, etc.). Read text via `message.parts` where `part.type === 'text'`.
2. `sendMessage({ text })` sends a user turn and streams the assistant reply back.
3. `useChat` accepts an initial message list, so server-loaded history can seed the conversation.
4. Custom `headers` / `body` / `credentials` on the transport carry auth (this project authenticates requests with a JWT).

## Usage in this project

The backend follows a ports-and-adapters design. The agent should be exposed through an **adapter** (a port interface plus a Gemini implementation) so the HTTP layer depends on the abstraction, not on the SDK directly. This keeps the SDK swappable.

The first integration is **reply-only**: the agent streams Ben's text reply for the latest user message (no capture classification yet, no multi-turn context). The flow is:

1. The frontend's `useChat` POSTs to `/chat` with the message(s).
2. The route persists the user message, then calls the agent to `streamText` a reply.
3. The stream is piped to the response via `pipeUIMessageStreamToResponse`.
4. `onFinish` persists Ben's message.
5. `/messages/list` still loads paginated history to seed `useChat`.

Relevant files:

- `project-backend/src/infra/http/routes/chat.ts` — the new streaming chat route (to be created).
- `project-backend/src/infra/services/env.ts` — where the `GOOGLE_GENERATIVE_AI_API_KEY` env var should be validated.
- `project-backend/src/domain/utils/messages.ts` — current mock reply/capture helpers being replaced.

## References

- Overview: https://ai-sdk.dev/docs/foundations/overview
- Google provider: https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai
