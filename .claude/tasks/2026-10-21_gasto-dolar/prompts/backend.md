# Escopo backend — gasto-dolar

Git: branch `feat/improve-ben`, commit-base `86cf204`. O código pode já conter as mudanças das tasks modelos-gpt6 (models.ts, catálogo de modelos) e preferencias-servidor (User, preferências, rotas): integre, não reverta. Leia o código vigente nas âncoras antes de editar.

## O que construir
1. **Port** `packages/adapters/src/ports/agent-call-trace.ts:24-29`: `AgentCallUsage.costUsd: number | null`. `packages/adapters/src/ports/agent-provider.ts:101-109`: novo `GenerateTaskTurnResult = { reply: TaskTurnReply; costUsd: number | null }`; `generateTaskTurn` passa a devolvê-lo. Port de transcrição (`TranscribeResponse`, arquivo que exporta `TranscribePayload` em `packages/adapters/src/ports/`): `costUsd: number | null`.
2. **OpenRouter** `packages/infra/adapters/src/services/ben-agent-provider/models.ts:17-30`: `usage: { include: true }` nas settings de `openrouter(...)`.
3. **trace-builders.ts** (mesma pasta): `StepResultLike` ganha `providerMetadata` (tipo do `ai`, ex. `ProviderMetadata | undefined`); helper privado lê `providerMetadata?.openrouter?.usage?.cost` com guarda `typeof === 'number'` (senão `null`); `buildUsage` (l.72) recebe o step/custo e preenche `costUsd`; `sumUsage` (l.81) soma `costUsd` com a mesma regra `add`. Exportar uma função que soma o custo de `result.steps` para o task turn (ex. `sumStepsCostUsd`).
4. **index.ts** (mesma pasta) `generateTaskTurn` (l.127-140): devolve `{ reply: toTaskTurnReply(result.output), costUsd: sumStepsCostUsd(result.steps) }`. `generateReply` não muda (o custo sai em `trace.totalUsage`).
5. **AssemblyAI** `packages/infra/adapters/src/services/assemblyai-transcription-provider*.ts`: mapa `Record<string, number>` de preço/hora USD por id de modelo, com comentário citando https://www.assemblyai.com/pricing.md (2026-10-21): `universal-3-5-pro` 0.21, `universal-2` 0.15. Não mude o request. Custo = `transcript.audio_duration / 3600 * preço` do modelo lido da resposta (`speech_model`, ou o campo de modelo que a resposta realmente popula — confirme em `node_modules/assemblyai/dist/types/openapi.generated.d.ts:2094,2759,2763`). Duração ausente ou modelo fora do mapa: `null`. Nunca invente preço.
6. **Transcription domain** `packages/domain/transcription/src/application/use-cases/transcription/transcribe-audio.ts`: `Response` e retorno com `costUsd`. Rota `packages/infra/server-ben/src/routes/transcription.ts`: JSON `{ text, costUsd }`. Ajuste o dublê do provider em `packages/modules/tests` se existir e o teste `__tests__/transcribe-audio.test.ts`.
7. **Message** `packages/domain/chat/src/enterprise/entities/message.ts:14-21`: `costUsd: number | null`, `interactionCostUsd: number | null`.
8. **Use cases** `packages/domain/chat/src/application/use-cases/messages/persist-user-message.ts`: payload `costUsd?: number | null` (grava `?? null`, `interactionCostUsd: null`). `persist-ben-message.ts:10-38`: `costUsd = payload.trace?.totalUsage.costUsd ?? null`; payload `triggerCostUsd?: number | null`; `interactionCostUsd` por método privado: soma dos não nulos, `null` se ambos nulos.
9. **Task** `packages/domain/task/src/application/use-cases/**/create-task-message.ts`: consumir `{ reply, costUsd }`, devolver `costUsd` no response. Rota `packages/infra/server-ben/src/routes/tasks/create-task-message.ts:47`: incluir `costUsd` no JSON. Não persistir.
10. **Chat route** `packages/infra/server-ben/src/routes/chat.ts`: `chatBodySchema` ganha `transcriptionCostUsd: z.number().finite().nonnegative().nullable().optional()`; passar `costUsd` ao persist user (l.96), guardar o resultado e passar `triggerCostUsd: userMessage.item.props.costUsd` ao persist ben (l.127); `AgentReplyPresenter.toHttp` recebe e expõe `interactionCostUsd`.
11. **Presenters** `packages/infra/server-ben/src/presenters/message-presenter.ts:7-27`: serializar `costUsd` e `interactionCostUsd` (`?? null`, mensagens antigas não têm os campos), mantendo o tipo `Omit<Serialize<WithID<MessageProps>>, …>`. `agent-reply-presenter.ts:4-20`: `interactionCostUsd: number | null` no tipo de retorno e no objeto.
12. **Dublês e factories**: `packages/modules/tests/src/adapters/agent-service.ts` (trace com `costUsd` no usage; `generateTaskTurn` devolve `{ reply, costUsd }`), `packages/domain/chat/src/application/__tests__/factories/message.ts` (`createMessageData` com os dois campos `null`).

## Testes (Vitest, ao lado do use case)
- `persist-ben-message.test.ts`: grava `costUsd` do trace; `interactionCostUsd` = soma com `triggerCostUsd`; só um lado presente; ambos ausentes -> `null`.
- `persist-user-message` (teste existente ou novo em `__tests__/`): grava `costUsd` e `null` por padrão.
- `create-task-message` e `transcribe-audio`: devolvem `costUsd`.
- Siga `.claude/skills/code-write-code/coding-patterns/automated-testing.md`.

## Convenções (só caminhos)
`.claude/skills/code-get-coding-designs/designs/{backend-domain-structure,backend-adapters-and-services-structure,backend-http-layer-structure}.md`; `.claude/skills/code-write-code/general-coding-practices.md`; `.claude/skills/code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-presenter,http-route-handler,backend-code-preferences}.md`; `coding-patterns/{general-code-preferences,lint}.md`.

## Não quebrar
- `generateReply` (duas fases, `stopWhen: stepCountIs(2)`), captures, topic summaries e o trace existente (`message-trace-presenter.ts`, rota messages).
- Mensagens antigas sem os campos novos (sem migration; props JSON).

## Aceite
- POST chat sem voz: msg ben com `costUsd` = `trace.totalUsage.costUsd` e `interactionCostUsd` igual; com `transcriptionCostUsd`: user com `costUsd` e ben somando.
- Resposta do POST chat com `interactionCostUsd`; GET mensagens com `costUsd`/`interactionCostUsd` (`null` nas antigas).
- POST transcription `{ text, costUsd }`; POST task message com `costUsd`.

## Arquivos que você possui
Os listados acima (ports, ben-agent-provider/{models,trace-builders,index}.ts, provider AssemblyAI, transcribe-audio + teste, message entity, persist-user/ben-message + testes, factory de message, create-task-message + teste, dublês em modules/tests, rotas chat/transcription/tasks/create-task-message, presenters message/agent-reply). Nada do mobile.

## Fechamento
Na raiz, nesta ordem, saídas em arquivo em `.claude/tasks/2026-10-21_gasto-dolar/`: `pnpm lint:fix > lint.log 2>&1`, `pnpm typecheck > typecheck.log 2>&1`, `pnpm test > test.log 2>&1`. Tudo verde, então commit só dos arquivos que você tocou mais a pasta da task: `simple-loop(gasto-dolar): implement — backend de custo em USD`. Sem push.
