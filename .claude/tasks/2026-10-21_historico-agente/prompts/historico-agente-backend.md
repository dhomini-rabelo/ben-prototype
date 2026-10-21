# Escopo — historico-agente-backend

Git: branch `feat/improve-ben`, commit-base `86cf204`. As tasks modelos-gpt6, preferencias-servidor e gasto-dolar são implementadas ANTES desta. O código pode já conter as mudanças delas no adapter do agente (`index.ts`: modelos, soma de `usage.cost` por step), na rota de chat (custo da mensagem, transcrição), na entidade Message (campo de custo) e na porta (`AgentModelSlug`, resultado com custo). Integre, não reverta. Se houver soma de custo por step, ela tem que continuar cobrindo os steps extras da fase context.

## Contrato
Na fase `context` de `generateReply`, o agente recebe as 15 mensagens (user + Ben) imediatamente anteriores à atual, em ordem cronológica, como mensagens estruturadas user/assistant. Ele também ganha a tool `get-older-messages`, que traz a próxima página de 15 mensagens mais antigas.

1. **Porta** `packages/adapters/src/ports/agent-provider.ts` (mesmo bloco de `ResolveHistoryContext`, l.15-22): adicione os tipos abaixo. Em `GenerateReplyPayload` (l.52-58), adicione `history: ConversationHistoryPage` e `resolveOlderMessages: ResolveOlderMessages`. Nada de importar domínio.
   - `ConversationMessageRole = 'user'|'assistant'`
   - `ConversationMessage = { role; content: string; createdAt: string }` (ISO)
   - `ConversationHistoryPage = { messages: ConversationMessage[]; nextCursor: string|null }`
   - `ResolveOlderMessages = (input:{cursor:string}) => Promise<ConversationHistoryPage>`
2. **Use case novo** `packages/domain/chat/src/application/use-cases/messages/list-message-history.ts`, `ListMessageHistoryUseCase(messageRepository)`. Moldes: `list-messages.ts:17-36` e `get-message-trace.ts:15-21`.
   - Exporta `MESSAGE_HISTORY_PAGE_SIZE = 15`.
   - Payload: `{ userId } & ({ beforeMessageId } | { cursor })`. Resposta: `CursorPaginationResponse<Message>`.
   - Com `beforeMessageId`: faça `messageRepository.get({ id: createID(beforeMessageId), userId: createID(userId) })`, que lança ResourceNotFound para âncora de outro usuário. Depois monte `encodeCursor({ orderBy:'createdAt', value: anchor.createdAt.toISOString(), id: anchor.id.toValue() })`, de `@ben/domain-base`.
   - Com `cursor`: use direto.
   - Chame `findManyWithCursorPagination({ userId }, { orderBy:'createdAt', order:'desc', limit: MESSAGE_HISTORY_PAGE_SIZE, cursor })` e devolva `items` INVERTIDO (cronológico), com `hasMore` e `nextCursor` do repositório.
   - Fato: as duas implementações resolvem cursor só pelo `id` (`domain/base/src/repository/repository.ts:335-343`, `infra/db/src/repos/sqlite/sqlite-repository.ts:365-376`). Por isso a página começa logo depois da âncora.
3. **Teste** `packages/domain/chat/src/application/use-cases/messages/__tests__/list-message-history.test.ts`. Molde: `list-messages.test.ts`, com `InMemoryMessageRepository`, `MessageFactory` e `minutesAfterBase`. Casos:
   - (a) exclui a âncora e as mais novas que ela;
   - (b) devolve no máximo 15, em ordem cronológica;
   - (c) o `nextCursor` traz as mais antigas sem sobreposição, e a última página tem `hasMore:false`, `nextCursor:null`;
   - (d) ignora mensagens de outro usuário;
   - (e) âncora de outro usuário lança `ResourceNotFoundError`.
4. **Presenter novo** `packages/infra/server-ben/src/presenters/agent-conversation-presenter.ts`. Padrão: classe estática como os vizinhos, com `toConversationMessage(message: Message): ConversationMessage` e `toHistoryPage(page: CursorPaginationResponse<Message>): ConversationHistoryPage`.
   - Role via `const conversationRoleByMessageRole: Record<MessageRole, ConversationMessageRole> = { user:'user', ben:'assistant' }`. `MessageRole` já é exportado de `domain/chat/src/enterprise/entities/message.ts:5`.
   - Só `content` e `createdAt.toISOString()`. Nunca mande trace, capture ou custo.
5. **Rota** `packages/infra/server-ben/src/routes/chat.ts`:
   - Guarde o `item` de `persistUserMessageUseCase.execute` (l.96).
   - Instancie `ListMessageHistoryUseCase(messageRepository)` junto dos outros (l.40-60).
   - Antes de `generateReply` (l.109), monte `history = AgentConversationPresenter.toHistoryPage(await listMessageHistoryUseCase.execute({ userId, beforeMessageId: userMessage.id.toValue() }))`.
   - Passe também `resolveOlderMessages: async ({ cursor }) => AgentConversationPresenter.toHistoryPage(await …execute({ userId: request.userId, cursor }))`. Molde: `resolveHistoryContext` em l.113-114.
6. **Tool nova** `packages/infra/adapters/src/services/ben-agent-provider/generate-reply/older-messages-tool.ts`. Molde: `history-context-tool.ts:1-21`.
   - Exporta `OLDER_MESSAGES_TOOL_NAME='get-older-messages'`, `OLDER_MESSAGES_TOOL_DESCRIPTION` (pt-BR; diz "a próxima página de mensagens mais antigas da conversa", sem número), `olderMessagesInputSchema = z.object({})` e `buildOlderMessagesTool({ initialCursor, resolveOlderMessages })`.
   - Estado por chamada de `generateReply`: `let cursor = initialCursor`. Serialize as execuções numa cadeia de promise (`queue = queue.then(next)`), para que chamadas paralelas não repitam a página.
   - Sem cursor: devolva `{ messages: [], hasMore: false }` sem chamar o callback. Com cursor: chame o callback, avance `cursor = page.nextCursor` e devolva `{ messages: page.messages, hasMore: page.nextCursor !== null }`.
7. **Adapter** `packages/infra/adapters/src/services/ben-agent-provider/index.ts`:
   - Em `generateReply`, troque `prompt: payload.message` (l.42) por `messages: [...payload.history.messages.map(({role, content}) => ({ role, content })), { role:'user', content: payload.message }]`.
   - Registre `'get-older-messages': buildOlderMessagesTool(...)` em `tools` (l.43-47), com `initialCursor: payload.history.nextCursor`.
   - Use `const CONTEXT_MAX_STEPS = 5` em `stopWhen: stepCountIs(CONTEXT_MAX_STEPS)` (l.49).
   - No `prepareStep` (l.50-57), continue gravando o step e devolva `{ toolChoice: 'none' }` quando `stepNumber === CONTEXT_MAX_STEPS - 1`. Isso garante texto final; confirme a forma do retorno nos tipos do pacote `ai` ^6.
   - Adicione a entrada da tool nova na lista `tools` do trace (l.67-73), com `z.toJSONSchema(olderMessagesInputSchema)`.
   - Fase format e `generateTaskTurn`: não mexa.
8. **System prompt** `generate-reply/system-prompt.ts`: adicione a seção `# Histórico da conversa`. Ela diz que as mensagens anteriores (usuário e Ben) vêm antes da mensagem atual. Diz também para chamar `get-older-messages` só quando a resposta depender de algo que não está ali: cada chamada traz a próxima página de mensagens mais antigas, no máximo 3 chamadas. A l.19 mantém UMA vez para `get-history-context`, sem sugerir que é a única tool.

## Seguir (só caminhos)
- `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `backend-adapters-and-services-structure.md`, `backend-http-layer-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/backend/use-case-structure.md`, `use-case-response-structure.md`, `http-route-handler.md`, `http-presenter.md`, `backend-code-preferences.md`
- `.claude/skills/code-write-code/coding-patterns/automated-testing.md`

## Não quebrar
- `chat.ts:109` é o único chamador de `generateReply`. `index.ts:31` é a única implementação. `GenerateReplyPayload` só é construído em `chat.ts`.
- `ListMessagesUseCase` (rota de listagem do mobile): não altere.
- `FakeAgentService` (`packages/modules/tests/src/adapters/agent-service.ts`) precisa continuar compilando.

## Aceite
1. Na raiz, nesta ordem, com saídas em arquivo em `.claude/tasks/2026-10-21_historico-agente/`: `pnpm lint:fix > lint.log 2>&1`, `pnpm typecheck > typecheck.log 2>&1`, `pnpm test > test.log 2>&1`. Todos verdes, e o teste novo com os 5 casos.
2. A fase context recebe o histórico (sem a atual duplicada) + a atual, e expõe as duas tools no `generateText` e no trace.
3. Com histórico vazio, funciona, e a tool devolve `{messages:[],hasMore:false}`.

## Arquivos que você POSSUI
`packages/adapters/src/ports/agent-provider.ts` (só os tipos acima), `list-message-history.ts` + teste, `agent-conversation-presenter.ts`, `routes/chat.ts`, `older-messages-tool.ts`, `ben-agent-provider/index.ts` (só `generateReply`), `generate-reply/system-prompt.ts`.

## Commit
Ao terminar e com os 3 comandos verdes, commite só os arquivos que tocou mais a pasta da task: `simple-loop(historico-agente): implement — histórico de 15 mensagens e tool get-older-messages`, terminando a mensagem com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Sem push.
