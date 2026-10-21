# Plano — gasto-dolar (base 86cf204, feat/improve-ben)

Objetivo: salvar o custo em USD de cada interação (resposta do Ben via `usage.cost` do OpenRouter, somado por step e fase; transcrição de voz via duração x preço/hora público da AssemblyAI) e exibi-lo no rodapé de cada resposta do Ben quando a preferência "mostrar gasto em dólar" do usuário estiver ligada.

Ordem das tasks do lote: modelos-gpt6 -> preferencias-servidor -> **gasto-dolar** -> historico-agente. O código vigente pode já conter as mudanças de modelos-gpt6 (models.ts, catálogo) e de preferencias-servidor (User, rotas de preferências, settings, stores de preferência): integrar, nunca reverter.

## Premissas assumidas
1. **Fonte do custo LLM**: `providerMetadata.openrouter.usage.cost` de cada step do `generateText` (tipo `OpenRouterUsageAccounting.cost?: number`, `node_modules/@openrouter/ai-sdk-provider/dist/index.d.ts:455-470`). Habilitar `usage: { include: true }` nas settings do `openrouter(...)` em `models.ts` (o SDK envia `usage` no body, `dist/index.js:3588`). Step sem `cost` numérico = `null`, nunca 0 inventado.
2. **Custo vive no trace**: `AgentCallUsage` ganha `costUsd: number | null`; `buildUsage` lê o custo do step e `sumUsage` soma (null + null = null, mesma regra `add` dos tokens). `trace.totalUsage.costUsd` é a soma das fases context + format.
3. **Mensagem guarda o próprio custo**: `MessageProps` ganha `costUsd: number | null` (user = custo da transcrição, null se digitada; ben = `trace.totalUsage.costUsd`) e `interactionCostUsd: number | null` (só ben; = soma não nula de `costUsd` da ben + `costUsd` da mensagem do usuário que a disparou; null se ambos null; user sempre null). Denormalização deliberada: o rodapé lê um campo só e funciona na paginação e na resposta nova, sem parear mensagens no cliente.
4. **PersistBenMessageUseCase deriva** `costUsd` de `payload.trace?.totalUsage.costUsd ?? null` (fonte única) e recebe `triggerCostUsd?: number | null` para calcular `interactionCostUsd` (método privado). PersistUserMessageUseCase recebe `costUsd?: number | null`.
5. **Ligação voz -> chat**: a rota de transcrição devolve `{ text, costUsd }`; o app repassa esse valor no body do POST chat como `transcriptionCostUsd` (opcional, `z.number().finite().nonnegative().nullable().optional()`); a rota grava no `costUsd` da mensagem do usuário. Valor ecoado pelo cliente: aceitável no protótipo (só exibição, dado do próprio usuário). Versão confiável fica em "fora do escopo".
6. **Preço da AssemblyAI** (fonte: https://www.assemblyai.com/pricing.md, consultada em 2026-10-21): pre-recorded `universal-3-5-pro` US$ 0,21/h, `universal-2` US$ 0,15/h. O request atual não fixa modelo e a AssemblyAI não documenta o padrão. Decisão: NÃO mudar o request; mapa `Record<string, number>` de preço/h por id de modelo no adapter (com a URL e a data em comentário), modelo lido da resposta do transcript (`speech_model` ou o campo que a resposta realmente popula; o implementer confirma nos tipos de `assemblyai` 4.41.5, `dist/types/openapi.generated.d.ts:2094` `audio_duration?: number | null` em segundos, `:2759`/`:2763` modelos). Custo = `audio_duration / 3600 * preço`. Duração ausente ou modelo fora do mapa = `null`. Se o modelo vier com outro nome (ex.: `universal`, `best`), só entra no mapa com preço confirmado na fonte; nunca inventar.
7. **Turns de tarefa**: `generateTaskTurn` passa a devolver `{ reply, costUsd }` (espelho de `GenerateReplyResult`), `CreateTaskMessageUseCase` devolve `costUsd`, a rota de task message inclui `costUsd` no JSON e o tipo mobile da resposta ganha o campo. Não há mensagem do Ben persistida para turn de tarefa (fica em `lastBenReply` em memória, `task-chat-store.ts:37`), então não há onde salvar nem rodapé onde exibir: persistir/exibir custo de task turn fica fora do escopo. A transcrição de voz no task workspace também não é salva (handler ignora o custo).
8. **Flag de exibição (dependência de preferencias-servidor)**: assumido um boolean no usuário exposto pela API, nome provisório `showUsdCost`, desligado por padrão. O implementer mobile confirma o nome e a fonte real (store/hook criados por preferencias-servidor; `grep -rn "Usd\|usd\|Cost" packages/infra/mobile/ben/src`) e só lê; não cria storage nem switch.
9. **Exibição**: rodapé sob a bolha do Ben (`footer` do `MessageBubble`) com `interactionCostUsd` formatado em USD via `Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 })` (en `$0.0123`, pt-BR `US$ 0,0123`); valor > 0 e < 0,0001 mostra `< ` + formato de 0,0001. Locale = idioma atual do app (fonte vigente do idioma). Sem valor (null/undefined, msgs antigas) ou flag desligada: sem rodapé. Bolha em estado de erro mantém o `SendRetryFooter` (só msgs user). Durante a animação de digitação o rodapé pode aparecer já com o valor.
10. Sem migration: props são JSON (`schema.prisma:11-17`); mensagens antigas vêm sem os campos -> presenter usa `?? null`.
11. Chip de custo no sheet do trace e custo por step na UI ficam fora; o campo `costUsd` entra só no tipo espelho mobile do trace (`api/models/message-trace.ts:24-30`) para fidelidade do contrato.

## Convenções aplicáveis
- Backend: `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `backend-adapters-and-services-structure.md`, `backend-http-layer-structure.md`; `.claude/skills/code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-presenter,http-route-handler,backend-code-preferences}.md`; `coding-patterns/automated-testing.md`.
- Mobile: `.claude/skills/code-get-coding-designs/designs/{mobile-app-structure,page-structure,page-stores-structure,feature-state-components-structure,api-client-structure}.md`; `.claude/skills/code-write-code/coding-patterns/frontend/{react-components,minimum-props-strategies,frontend-code-preferences}.md`; `.claude/skills/code-get-project-context/mobile/design/design-rules.md`.
- Gerais: `.claude/skills/code-write-code/general-coding-practices.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/lint.md`.

## Melhorias estruturais (dentro dos contratos)
- `MessagePresenter.toHttp` já é tipado por `Omit<Serialize<WithID<MessageProps>>, ...>`: os campos novos viram erro de tipo até serem serializados (expor `costUsd` e `interactionCostUsd`); manter esse tipo.
- `AgentReplyPresenter.toHttp`: adicionar `interactionCostUsd` ao tipo de retorno e ao objeto (recebe a `Message` ben persistida ou o número), para a resposta nova não esquecer o custo.
- `generateTaskTurn` devolve um tipo resultado (`GenerateTaskTurnResult = { reply: TaskTurnReply; costUsd: number | null }`) em vez de misturar metadado no `TaskTurnReply` (saída do LLM).
- `sumUsage` continua montando `AgentCallUsage` literal completo: um campo novo no usage quebra a compilação até ser somado.

## Melhorias estruturais sugeridas (fora do escopo)
- Ligação voz -> chat confiável: a rota de transcrição gravar um registro com id e o chat receber o id (não o valor).
- Persistir custo de turn de tarefa (ex.: acumulado no Task) e exibir no workspace.
- Chip de custo no `message-trace-meta-strip.tsx`.
- Fixar `speech_models` explicitamente no request da AssemblyAI (recomendação do próprio pricing.md) para o preço não depender do default da conta.

## Escopos (sequenciais)
1. `prompts/backend.md` — adapters, domínio chat/task/transcription, presenters e rotas, testes.
2. `prompts/mobile.md` — contrato mobile, envio do custo da transcrição, rodapé com custo. Começa depois do commit do backend.

## Critérios de aceite (globais)
- POST chat grava na msg ben `costUsd` (soma dos steps) e `interactionCostUsd`; com `transcriptionCostUsd` no body, a msg user tem `costUsd` e a ben soma os dois.
- GET de mensagens e a resposta do POST chat expõem os campos; msgs antigas vêm `null`.
- POST transcription devolve `{ text, costUsd }` (null quando a duração ou o preço faltam).
- Rodapé aparece só em msg ben com `interactionCostUsd` numérico e flag ligada; some com a flag desligada; en/pt-BR formatados.
- `pnpm lint:fix`, `pnpm typecheck`, `pnpm test` verdes na raiz.

## Modo de teste de sistema recomendado
Browser (web :8081, iPhone 390x844) com servidor real: enviar texto e voz (se o ambiente permitir áudio), alternar a flag, conferir rodapé e o JSON das rotas; mais os testes de use case.

## Fora do escopo
Settings/switch/armazenamento da flag (preferencias-servidor); retrocálculo de custo para mensagens antigas; tabela de preço própria para LLM; push/PR.
