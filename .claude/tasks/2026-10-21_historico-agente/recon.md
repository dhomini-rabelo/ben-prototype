## Mapa de arquivos
packages/adapters/src/ports/agent-provider.ts | porta AgentService, GenerateReplyPayload, ResolveHistoryContext | 13-22, 52-58, 101-104
packages/infra/adapters/src/services/ben-agent-provider/index.ts | generateReply: fase context (tool) + fase format | 31-125 (tools 43-47, stopWhen 49, tool trace 67-73)
packages/infra/adapters/src/services/ben-agent-provider/generate-reply/history-context-tool.ts | MOLDE de tool (nome, descrição, zod, tool()) | 1-21
packages/infra/adapters/src/services/ben-agent-provider/generate-reply/system-prompt.ts | prompt da fase context; cita a tool | 4-33 (tool: 19)
packages/infra/adapters/src/services/ben-agent-provider/generate-reply/format-system-prompt.ts | prompt da fase format | 1-11
packages/infra/adapters/src/services/ben-agent-provider/trace-builders.ts | monta trace dos steps/tools | 107-145
packages/adapters/src/ports/agent-call-trace.ts | tipos do trace (phase context|format) | 1, 18-54
packages/infra/server-ben/src/routes/chat.ts | rota: monta payload e chama generateReply | 40-60, 96-116
packages/domain/chat/src/application/repositories/message.ts | contrato MessageRepository (so herda Repository) | 1-5
packages/domain/chat/src/enterprise/entities/message.ts | Message: userId, role user|ben, content, createdAt | 14-21
packages/domain/chat/src/application/use-cases/messages/list-messages.ts | use case paginado (desc, cursor, limit 20) | 7-36
packages/domain/base/src/repository/repository.ts | contrato + InMemory; CursorQueryFilters | 30-35, 84-87, 258-320
packages/infra/db/src/repos/sqlite/sqlite-repository.ts | cursor paginado via ROW_NUMBER+OFFSET | 167-209, 365-376
packages/infra/db/src/repos/sqlite/message.ts | SqliteMessageRepository (12 linhas, so config) | 8-14
packages/infra/db/prisma/schema.prisma | Message(id, props JSON, types) sem coluna de escopo | 12-18
packages/modules/tests/src/adapters/agent-service.ts | FakeAgentService (generateReply lanca 'not used') | 22-26
packages/domain/chat/src/application/use-cases/messages/persist-user-message.ts | persiste msg do usuario (createdAt now) | ~24

## Molde a espelhar
Tool existente `get-history-context` (history-context-tool.ts) + callback injetado no payload. Padrao:
`resolveHistoryContext: ({topics}) => getHistoryContextUseCase.execute({userId: request.userId, topics})` (chat.ts:113)
`tools: {'get-history-context': buildHistoryContextTool(payload.resolveHistoryContext)}` (index.ts:43-47)
`tool({description, inputSchema: z.object(...), execute})`; nome/descricao/schema exportados e reusados no trace (index.ts:67-73).
Use case molde: GetHistoryContextUseCase (packages/domain/topic/.../get-history-context.ts) e ListMessagesUseCase (paginacao).
Rota chat.ts so injeta use cases; dominio fica fora do adapter (adapter recebe callbacks).

## Footprint
chat.ts:109 | unico chamador de agentService.generateReply (e a unica construcao do payload)
index.ts:31 | unica implementacao real de generateReply
FakeAgentService.generateReply | nao usado em teste (lanca); generateTaskTurn e o usado (create-task-message)
ListMessagesUseCase | consumido pela rota de listagem de mensagens do mobile (nao aberta aqui)
`GenerateReplyPayload` so e construido em chat.ts:109-116 (grep nao achou outro)

## Armadilhas
- Escopo: Message NAO tem chat nem topic; so `userId` (message.ts:14-21). "Conversa" = todas as mensagens do usuario, ordenadas por createdAt. Unico escopo possivel hoje.
- chat.ts:96 persiste a mensagem ATUAL do usuario ANTES de chamar o agente: buscar "ultimas 10 antigas" depois dela inclui a mensagem atual (excluir por id ou buscar antes; persist-user-message retorna item, nao verificado se ID e usado).
- Agente hoje recebe so `prompt: payload.message` (index.ts:42), sem historico; historico precisa entrar como `messages`/bloco no prompt da fase context. Fase format recebe so `contextResult.text` (index.ts:87).
- `stopWhen: stepCountIs(2)` (index.ts:49) e prompt "UMA UNICA VEZ" (system-prompt.ts:19; tool description linha 8): nova tool exige revisar limite de steps e texto; senao o modelo nao consegue chamar 2 tools + responder.
- Trace: `tools` do trace e lista fixa de 1 tool (index.ts:67-73); precisa incluir a nova, senao o trace nao a mostra.
- Cursor paginado: `nextCursor` e opaco (base64 {orderBy,value,id}), resolvido por ROW_NUMBER (sqlite-repository.ts:365-376); ordem desc + cursor = mais antigas. Offset por id: mensagens novas inseridas entre chamadas deslocam? ROW_NUMBER e recalculado pelo id, entao estavel.
- Role 'ben' x 'user' (message.ts:5); content pode ser longo; trace JSON dentro de props (nao mandar ao agente).
- Port em packages/adapters nao pode importar domain (message e dominio): payload deve usar tipo proprio na porta.

## Sinal de teste
Use cases do chat: automatizado (Vitest, `messages/__tests__/list-messages.test.ts`, persist-*.test.ts, get-message-trace.test.ts; InMemoryMessageRepository + factory em `chat/src/application/__tests__/`).
Topic: `topic/.../__tests__/get-history-context.test.ts` (molde de teste de use case de contexto).
Adapter real (BenAgentProviderService, tool, prompt): sem testes encontrados (nao encontrado); precisa de stack rodando com OpenRouter/chave real para provar o comportamento do agente.
Rota chat.ts: teste nao encontrado.

## Veredito de complexidade
1. Uma frente so? sim: tudo backend (porta, adapter, rota, use case); mobile nao toca.
2. Footprint <= 6 arquivos? nao: porta, adapter index, tool nova, system-prompt, chat.ts, use case novo (+ teste, + possivel filtro de repo) passa de 6.
3. Molde claro? sim: history-context-tool.ts + ListMessagesUseCase.
4. Zero decisao aberta? nao: escopo (user), tamanho/formato do payload (role, truncamento), paginacao da tool (cursor vs offset), steps.
5. Zero logica nova? sim em geral (usa findManyWithCursorPagination); a exclusao da msg atual e trivial.
veredito: complexa — falham 2 (footprint > 6) e 4 (decisoes de formato/paginacao/steps em aberto)

## Sinal de particao
particao: nao (use case de listagem e tool sao irmaos de moldes existentes; um unico contrato novo pequeno, sem taxonomia consumida por terceiros).

## Lacunas que so o usuario responde
- Ordem e formato do contexto: hoje agente so ve a mensagem atual; ler 10 antigas como mensagens estruturadas (role user/assistant) ou texto no prompt; incluir ou nao mensagens de ben.
- Paginacao da tool: cursor opaco do repo (nextCursor) vs "antes de data/id" vs offset; tamanho da pagina por chamada (10?) e limite de chamadas.
- Escopo "antigas": mensagens do usuario inteiro (unico escopo existente; sem chat/topic na entidade); confirmar que e isso.
- Premissa assumida: "ultimas 10 antigas" = 10 mensagens mais recentes anteriores a atual, em ordem cronologica.
