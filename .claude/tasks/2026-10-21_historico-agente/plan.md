# Plano — historico-agente

Briefing task 4: na fase `context` do `generateReply`, o agente recebe as 15 mensagens mais recentes do usuário e do Ben anteriores à atual, em ordem cronológica e como mensagens estruturadas user/assistant. Ele também ganha a tool `get-older-messages`, que pagina mensagens mais antigas de 15 em 15. Limite de steps e system prompt passam a comportar a tool. Um escopo (backend).

## Premissas assumidas
1. **15 é vinculante** (resposta do usuário substitui o "10" do pedido). Constante única `MESSAGE_HISTORY_PAGE_SIZE = 15` no use case, reusada pela página inicial e pela tool.
2. **Escopo "conversa"** = todas as mensagens do `userId`, ordenadas por `createdAt`. Message não tem chat/tópico (briefing, "Fora do escopo").
3. **Exclusão da mensagem atual por âncora, não por filtro.** A rota continua persistindo a mensagem do usuário antes do agente (chat.ts:96) e passa a usar o `item` retornado. O novo use case lê a âncora com `messageRepository.get({ id, userId })`, que lança ResourceNotFound se ela for de outro usuário. Depois monta com `encodeCursor` (`@ben/domain-base`, repository/cursor.ts) um cursor `{orderBy:'createdAt', value: createdAt ISO, id}` e chama `findManyWithCursorPagination` em ordem `desc`. As duas implementações resolvem o cursor só pelo `id` (InMemory repository.ts:335-343; SQLite sqlite-repository.ts:365-376), então a página começa logo depois da atual: só mensagens mais antigas, e mensagens mais novas que a atual ficam de fora.
4. **Ordem**: o repositório entrega em `desc`, e o use case inverte para que `items` saia **cronológico** (mais antiga primeiro). O `nextCursor` do repositório continua apontando para a próxima página mais antiga.
5. **Paginação da tool com estado no adapter, não no LLM.** A tool não recebe input (`z.object({})`). Por chamada de `generateReply`, o adapter guarda `olderCursor`, que começa em `payload.history.nextCursor`. Cada execução pede a página seguinte via callback `resolveOlderMessages({ cursor })` e avança o cursor. Execuções são serializadas numa cadeia de promise, para que chamadas paralelas no mesmo step não repitam a página. Sem cursor, devolve `{ messages: [], hasMore: false }` sem chamar o callback. Motivo: o LLM nunca manipula cursor opaco (um cursor corrompido faria `decodeCursor` lançar exceção), e "a partir da mais antiga já entregue" sai de graça.
6. **Formato para o modelo**:
   - Histórico inicial vira `ModelMessage` `{ role: 'user'|'assistant', content }`, seguido da mensagem atual `{ role:'user', content: payload.message }`, passado via `messages` (sai o `prompt`) na fase context.
   - A saída da tool é `{ messages: [{ role, content, createdAt ISO }], hasMore }`, em ordem cronológica.
   - Role `ben` → `assistant`. Só `content`: trace, capture e custo nunca vão ao modelo. Sem truncamento de conteúdo.
7. **Fase format inalterada**: continua recebendo só `contextResult.text` (index.ts:87).
8. **Steps**:
   - `stopWhen: stepCountIs(CONTEXT_MAX_STEPS)` com `CONTEXT_MAX_STEPS = 5`. Isso cobre `get-history-context` uma vez, até 3 páginas de `get-older-messages` e a resposta final.
   - No último step permitido, o `prepareStep` devolve `{ toolChoice: 'none' }` (além de gravar o step como hoje), o que garante texto final para a fase format.
   - O prompt limita a 3 chamadas de `get-older-messages`.
9. **Datas**: `createdAt` vai só na saída da tool. O histórico inicial é texto puro.
10. **`generateTaskTurn` não muda** (turnos de tarefa têm resumo próprio). O histórico vale só para `generateReply`.
11. Contexto do projeto (`backend/system-flows`) está vazio para este fluxo. O plano foi feito do código.

## Convenções aplicáveis
- `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `backend-adapters-and-services-structure.md`, `backend-http-layer-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/backend/use-case-structure.md`, `use-case-response-structure.md`, `http-route-handler.md`, `http-presenter.md`, `backend-code-preferences.md`
- `.claude/skills/code-write-code/coding-patterns/automated-testing.md`

## Desenho (alvo)
### Porta — `packages/adapters/src/ports/agent-provider.ts`
Novos tipos, ao lado de `ResolveHistoryContext` (linhas 15-22):
- `ConversationMessageRole = 'user' | 'assistant'`
- `ConversationMessage = { role: ConversationMessageRole; content: string; createdAt: string }`
- `ConversationHistoryPage = { messages: ConversationMessage[]; nextCursor: string | null }`
- `ResolveOlderMessages = (input: { cursor: string }) => Promise<ConversationHistoryPage>`

`GenerateReplyPayload` (52-58) ganha `history: ConversationHistoryPage` e `resolveOlderMessages: ResolveOlderMessages`. A porta não importa domínio.

### Domínio — `packages/domain/chat/src/application/use-cases/messages/list-message-history.ts` (novo)
- `ListMessageHistoryUseCase(messageRepository)`, molde `list-messages.ts` + `get-message-trace.ts`.
- Payload: `{ userId: string } & ({ beforeMessageId: string } | { cursor: string })`.
- Resposta: `CursorPaginationResponse<Message>`, com `items` cronológico.
- Exporta `MESSAGE_HISTORY_PAGE_SIZE = 15`.
- Com `beforeMessageId`: `get({ id, userId })` → cursor da âncora (premissa 3). Com `cursor`: usa direto. Filtro sempre `{ userId }`, `orderBy:'createdAt'`, `order:'desc'`, `limit: 15`, e depois inverte `items`.
- Teste `messages/__tests__/list-message-history.test.ts`, molde `list-messages.test.ts`, com 5 casos:
  - Exclui a âncora e as mensagens mais novas que ela.
  - Devolve no máximo 15, em ordem cronológica.
  - O `nextCursor` continua para as mais antigas sem sobrepor a página anterior, e a última página tem `hasMore:false` e `nextCursor:null`.
  - Ignora mensagens de outro usuário.
  - Âncora de outro usuário lança ResourceNotFoundError.

### Rota — `packages/infra/server-ben/src/routes/chat.ts`
- Guarda o `item` de `persistUserMessageUseCase.execute` (linha 96).
- Instancia `ListMessageHistoryUseCase(messageRepository)` ao lado dos outros (40-60).
- Monta `history` com `{ userId, beforeMessageId: userMessage.id.toValue() }`.
- Passa `resolveOlderMessages: ({ cursor }) => …execute({ userId, cursor })`.
- Os dois resultados passam pelo presenter novo.

### Presenter — `packages/infra/server-ben/src/presenters/agent-conversation-presenter.ts` (novo)
- `AgentConversationPresenter.toHistoryPage(page: CursorPaginationResponse<Message>): ConversationHistoryPage`.
- `toConversationMessage(message)`: `createdAt.toISOString()`, role via mapa tipado.

### Adapter — `packages/infra/adapters/src/services/ben-agent-provider/`
- `generate-reply/older-messages-tool.ts` (novo), molde `history-context-tool.ts`: exporta `OLDER_MESSAGES_TOOL_NAME = 'get-older-messages'`, `OLDER_MESSAGES_TOOL_DESCRIPTION`, `olderMessagesInputSchema = z.object({})` e `buildOlderMessagesTool({ initialCursor, resolveOlderMessages })`. A função faz o estado e a serialização da premissa 5 e devolve `{ messages, hasMore }`.
- `index.ts`:
  - `messages` no lugar de `prompt` (linha 42).
  - Segunda tool em `tools` (43-47).
  - `stopWhen: stepCountIs(CONTEXT_MAX_STEPS)` (49).
  - `prepareStep` com `toolChoice:'none'` no último step (50-57).
  - Segunda entrada na lista `tools` do trace (67-73).
- `generate-reply/system-prompt.ts`: nova seção `# Histórico da conversa`. Ela explica que as mensagens anteriores vêm antes da atual, quando usar `get-older-messages` (só se a resposta depender de algo que não está ali), que cada chamada traz a próxima página de mensagens mais antigas e que o limite é 3 chamadas. A linha 19 continua dizendo UMA vez para `get-history-context`, mas sem sugerir que é a única tool.

## Melhorias estruturais (no contrato)
- O mapa `Record<MessageRole, ConversationMessageRole>` no presenter faz um role novo em `MessageRole` (message.ts:5) virar erro de tipo, em vez de cair calado no role errado.
- `MESSAGE_HISTORY_PAGE_SIZE` é a única fonte do tamanho de página (o adapter não importa domínio). A descrição da tool e o system prompt não citam número: dizem "a próxima página de mensagens mais antigas". Assim, mudar o tamanho não deixa texto desatualizado.
- Nome, descrição e schema da tool são exportados e reusados no trace (padrão existente), para que o trace não divirja da tool real.

## Melhorias estruturais sugeridas (fora do escopo)
- A lista `tools` do trace (index.ts:67-73) poderia ser derivada de um único registro `{ name → { tool, description, schema } }` usado tanto em `generateText` quanto no trace.
- `FakeAgentService.generateReply` lança 'not used'. Um teste da rota de chat exigiria um fake real.

## Fora do escopo
- `generateTaskTurn`, a fase format, o mobile, escopo de conversa novo (chat/tópico), truncamento/sumarização de histórico, migration (nenhuma é necessária) e mudanças em `ListMessagesUseCase`.

## Critérios de aceite
1. `pnpm lint:fix`, `pnpm typecheck` e `pnpm test` passam na raiz. O teste novo do use case tem os 5 casos acima.
2. Com o stack rodando e uma conversa com mais de 15 mensagens anteriores, o trace da fase context mostra:
   - as 15 mensagens anteriores (user/assistant, cronológicas, sem a atual duplicada) antes da mensagem atual;
   - as duas tools listadas.
3. Ao perguntar algo dito mais de 15 mensagens atrás, o agente chama `get-older-messages`. O trace mostra a página mais antiga seguinte (15 mensagens, sem sobreposição), e a resposta final existe (a fase format recebe texto não vazio).
4. Uma conversa sem mensagens anteriores funciona (histórico vazio, e a tool devolve `{messages:[],hasMore:false}`).

## Modo de system test recomendado
Automatizado (Vitest) para o use case + manual com o stack real (server-ben + OpenRouter), lendo o trace da mensagem via rota de trace. O comportamento do agente e o uso da tool só se provam com o modelo real.
