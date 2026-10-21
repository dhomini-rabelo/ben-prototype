# Recon — gasto-dolar (base 86cf204, feat/improve-ben)

## Mapa de arquivos
packages/adapters/src/ports/agent-call-trace.ts | AgentCallUsage/Trace types (tokens, sem custo) | 24-29, 62-74
packages/adapters/src/ports/agent-provider.ts | GenerateReplyResult {reply, trace}; modelo | não lido por inteiro
packages/infra/adapters/src/services/ben-agent-provider/models.ts | resolveOpenRouterModel (extraBody; sem usage.include) | 17-30
packages/infra/adapters/src/services/ben-agent-provider/trace-builders.ts | buildUsage/sumUsage/buildAgentCallTrace | 72-100, 156-179
packages/infra/adapters/src/services/ben-agent-provider/index.ts | generateReply (2 generateText: context+format); generateTaskTurn sem trace | 33-132, 134-141
packages/domain/chat/src/enterprise/entities/message.ts | MessageProps {..., trace, createdAt} | 14-21
packages/domain/chat/src/application/use-cases/messages/persist-ben-message.ts | grava msg ben com trace | 10-38
packages/domain/chat/src/application/use-cases/messages/__tests__/persist-ben-message.test.ts | teste do use case | -
packages/domain/chat/src/application/__tests__/factories/message.ts (createMessageData) | factory de Message | topo
packages/infra/db/prisma/schema.prisma | Message{id,props,types} JSON; sem colunas | 11-17
packages/infra/db/src/repos/sqlite/message.ts | repo genérico SqliteRepository | 1-14
packages/infra/server-ben/src/routes/chat.ts | POST chat: gera reply, persiste msg ben | 109-140
packages/infra/server-ben/src/presenters/message-presenter.ts | omite userId/trace no HTTP | 7-27
packages/infra/server-ben/src/presenters/agent-reply-presenter.ts | resposta do chat (messageId, capture) | 4-20
packages/infra/server-ben/src/presenters/message-trace-presenter.ts | expõe trace (rota messages) | não lido
packages/domain/user/src/enterprise/entities/user.ts | UserProps (agentModelSlug/agentEffort) | 4-14
packages/domain/user/src/application/use-cases/agent-preferences/{get,update}-agent-preferences.ts | prefs do agente por usuário | -
packages/domain/user/src/application/utils/agent-models.ts | AGENT_MODELS (slug,label,efforts); SEM preço | 9-30
packages/infra/mobile/ben/src/api/models/message.ts | Message do app (sem custo) | 11-18
packages/infra/mobile/ben/src/api/models/message-trace.ts | espelho do trace/usage | 24-30
packages/infra/mobile/ben/src/pages/chat/utils/chat-messages.ts | BenMessageMetadata {capture, createdAt} | 4-9
packages/infra/mobile/ben/src/pages/chat/hooks/use-chat-messages.ts | API Message -> BenUiMessage.metadata | 12
packages/infra/mobile/ben/src/pages/chat/stores/messages-store/{message-builders,dispatch-reply}.ts | msg ben de resposta nova | builders 14-30; dispatch 17
packages/infra/mobile/ben/src/pages/chat/components/chat-history/chat-history.tsx | renderItem: bolha + MessageTracePressable | 37-80
packages/infra/mobile/ben/src/pages/chat/components/message-bubble/message-bubble.tsx | prop `footer` renderizada sob a bolha | 11-17, 78-80
packages/infra/mobile/ben/src/pages/chat/components/message-trace-sheet/message-trace-meta-strip.tsx | chips modelo/effort/latência/status | 13-67
packages/infra/mobile/ben/src/layout/components/menu-settings/{settings-view,settings-sheet,language-section}.tsx | seções das configurações | view 18-69
packages/infra/mobile/ben/src/layout/stores/language-store.ts + src/storage/language-storage.ts | pref local zustand+storage | store 1-27
packages/infra/mobile/ben/src/core/auth-bootstrap.ts | hydrate das stores no boot (language) | ~20-25 (via plano language-switch)
packages/infra/mobile/ben/src/layout/components/ui/ | sem componente Switch (só segmented-control, button...) | ls

## Molde a espelhar
Settings toggle: language-switch (local). `language-section.tsx` + `language-store.ts` (zustand, `set` + `void setStored*`) + `language-storage.ts` + hydrate em `auth-bootstrap.ts` + prop `*Section?: ReactNode` em settings-sheet/view (plano 2026-10-11_language-switch, "Arquitetura (escopo A)"). Serve para um flag só de UI. Alternativa server-side: agent-preferences (user props + use case + rota). Forma de persistir o custo: não há molde exato; o mais próximo é o campo `trace` em MessageProps (JSON em `props`, sem migration).

## Footprint
- "Interação" = par msg do usuário -> msg `ben` do POST chat (server-ben/routes/chat.ts:98-140); o trace/usage já é gravado só na msg `ben` (chat.ts:139 `trace`). Voz: transcrição AssemblyAI antes (transcription.ts), sem usage/custo no código (assemblyai-transcription-provider.ts:12-24 só devolve text).
- `generateTaskTurn` (index.ts:134-141, usado por domain/task create-task-message.ts:28-44) não devolve trace/usage: custo dessas interações hoje não é capturável.
- Tokens: já em `trace.totalUsage` (trace-builders.ts:156-179), persistido em `props.trace` (JSON). Custo USD: não existe campo. OpenRouter fornece `providerMetadata.openrouter.usage.cost` (node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts:455-470, 569-577) e a opção `usage: {include: true}` (d.ts:409-415); models.ts:17-30 não habilita isso. Não verifiquei se `cost` vem sem `include`.
- MessagePresenter.toHttp (message-presenter.ts:7) omite `trace`; mobile `Message` não tem custo -> exibir custo exige novo campo no presenter, no model mobile (message.ts), em `BenMessageMetadata` e em use-chat-messages.ts:12 / buildBenMessage; resposta nova vem de AgentReplyPresenter (sem custo).
- Onde mostrar: footer sob a bolha ben (`footer` prop do MessageBubble) em chat-history.tsx:46-52, ou chip em message-trace-meta-strip.tsx (sheet do trace, aberto por MessageTracePressable).
- Dados de preço existentes: nenhum (agent-models.ts sem preço; grep por price/pricing/cost só achou strings/trace).

## Armadilhas
- Prisma: props/types são JSON string; novo campo em MessageProps não exige migration (única migration: 20260913024102_init), mas msgs antigas virão sem o campo -> tratar undefined/null.
- Mudar MessageProps quebra `createMessageData` (factory) e testes persist-ben-message/get-message-trace; o dublê modules/tests/src/adapters/agent-service.ts monta o trace de teste.
- Mudar AgentCallUsage (port) exige espelhar em mobile api/models/message-trace.ts:24-30.
- Dois generateText por reply (context 2 steps + format): somar custo dos steps (sumUsage em trace-builders.ts:83 é o ponto).
- `slug` do modelo em agent-models.ts:17 hoje não bate com o nome da task modelos-gpt6 (dependência entre tasks).
- Strings do mobile devem ser Localized en/pt-BR (settings-strings.ts, message-trace-strings.ts).
- Formatação USD: não há util de moeda (não procurei a fundo).

## Sinal de teste
Automático: domain/chat use-cases (persist-ben-message.test.ts, get-message-trace.test.ts, list-messages.test.ts); domain/user agent-preferences/__tests__. Adapter OpenRouter/trace-builders: não encontrado. UI mobile (switch + custo na bolha): precisa stack rodando/browser (web :8081); sem testes automáticos de UI encontrados.

## Veredito de complexidade
1. Uma frente só? não — backend (captura/persistência/presenter) e mobile (switch + exibição).
2. Footprint <= 6 arquivos? não — ~15 arquivos (adapters, entity, use case, presenter, mobile model/store/storage/UI/strings).
3. Molde claro? sim — language-switch para o toggle; porém captura do custo sem molde.
4. Zero decisão em aberto? não — origem do custo (cost do OpenRouter vs tabela de preços), onde exibir.
5. Zero lógica nova? não — somar custo por steps/fases, tratar ausência.
veredito: complexa — falham 1, 2, 4 e 5

## Sinal de partição
partição: não (nenhum módulo novo com suíte própria; mudança atravessa camadas). Linha natural se o planner quiser dividir: backend (cost em trace/Message + presenter) | mobile (switch + exibição).

## Lacunas que só o usuário responde
- Fonte do preço: código não tem preços; leituras: (a) `usage.cost` retornado pelo OpenRouter (habilitar `usage.include`), (b) tabela de preço/token própria em agent-models.ts.
- Onde aparece o gasto: hoje só há bolha (footer) e sheet de trace; leituras: footer em cada msg ben, chip no trace sheet, ou ambos.
- Switch: local no aparelho (molde language) ou salvo no usuário no servidor (molde agent-preferences)?
- "Cada interação": só msg ben do chat (única com trace) ou também transcrição de voz (AssemblyAI) e turns de tarefa (sem trace)?
- Msgs antigas sem custo: ocultar ou mostrar "—"?
