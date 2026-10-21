# Escopo — contexto-memoria-backend

Git: branch `feat/improve-ben`. HEAD no planejamento: `f53f556`. As tasks modelos-gpt6, preferencias-servidor, gasto-dolar e historico-agente são implementadas ANTES desta, então o código pode já conter as mudanças delas. Integre, não reverta:
- em `chat.ts`: `userMessage` guardado, `ListMessageHistoryUseCase`, custo;
- em `index.ts`: `messages`, `get-older-messages`, `CONTEXT_MAX_STEPS`, custo por step;
- em `system-prompt.ts`: seção `# Histórico da conversa`;
- na porta: tipos de histórico e custo.

Leia o código vigente antes de editar.

## Contrato
1. **Conversa atual.**
   - Entidade nova `Conversation` no domínio `topic`. A chave renderizada é `conversa:{slug}:{lastMessageAt ISO}/{expiresAt ISO}`, com expiração = última mensagem + 24h.
   - Fica sempre no resultado de `get-history-context` e no system prompt da fase context.
   - É criada ou atualizada a cada `POST chat` com o `conversation { slug, summary }` que o agente devolve.
2. **Memória.**
   - Entidade nova `Memory` (chave `categoria:subcategoria`, valor, origem `conversationId`).
   - Leitura: seção do system prompt. Gravação: campo `memories` da resposta estruturada, persistido pela rota com upsert por chave. NÃO há tools novas.

## Decisões vinculantes
- Uma conversa ativa por usuário: `expiresAt > agora`, e a mais recente por `lastMessageAt`. `CONVERSATION_TTL_MS = 24*60*60*1000`.
- `lastMessageAt` = `userMessage.createdAt` (a mensagem do usuário persistida na rota). Grave DEPOIS da resposta do agente.
- O slug é normalizado para kebab-case (minúsculas, sem acento, não-alfanumérico vira `-`, sem `-` nas pontas, fallback `conversa`) e fica FIXO enquanto a conversa está ativa. Uma atualização troca só `summary`, `lastMessageAt` e `expiresAt`.
- Chave de memória: exatamente 2 segmentos `:`, cada um em kebab-case. Se não for válida depois de normalizar, é descartada. Valor vazio também é descartado. Upsert por (userId, key) atualiza `value`, `conversationId` e `updatedAt`.
- `get-history-context` acrescenta sempre `{ [toConversationKey(ativa)]: [{ id, summary }] }`. Conversa expirada nunca entra.
- Só `generateReply`. `generateTaskTurn` não muda. `AgentReplyPresenter` não muda, então a resposta HTTP fica igual.

## Arquivos (molde → novo)
**Domínio `packages/domain/topic/src`**
- **Entidades** (molde `enterprise/entities/topic-summary.ts:1-19`):
  - `enterprise/entities/conversation.ts` → `ConversationProps { userId: ID; slug; summary; lastMessageAt: Date; expiresAt: Date; createdAt: Date }`;
  - `enterprise/entities/memory.ts` → `MemoryProps { userId: ID; key; value; conversationId: ID | null; createdAt: Date; updatedAt: Date }`.
- **Repositórios** (molde `application/repositories/topic-summary.ts`): `application/repositories/conversation.ts` e `memory.ts`.
- **`application/utils/conversations.ts`**:
  - `CONVERSATION_TTL_MS`;
  - `findActiveConversation(repo, userId: string, now: Date)`, via `findMany({ userId: createID(userId), expiresAt: new GreaterQuery({ input: now }) }, { orderBy:'lastMessageAt', order:'desc', limit:1 })`. `GreaterQuery` vem de `@ben/domain-base` e é suportado em InMemory e SQLite. Se o SQLite não comparar `Date` dentro de props, filtre no util e diga isso no relatório;
  - `toConversationKey(conversation)`.
- **`application/utils/keys.ts`**: `toKebabSlug(text): string`.
- **Use cases** (molde `use-cases/topics/get-history-context.ts` + `.claude/skills/code-write-code/coding-patterns/backend/use-case-response-structure.md`):
  - `use-cases/context/load-agent-context.ts`: `LoadAgentContextUseCase(conversationRepository, memoryRepository)`. Recebe `{ userId }` e devolve `{ activeConversation: Conversation | null; memories: Memory[] }` (memórias ordenadas por `key`).
  - `use-cases/conversations/record-conversation.ts`: `RecordConversationUseCase(conversationRepository)`. Recebe `{ userId; slug; summary; lastMessageAt: Date }` e devolve `ItemResponse<Conversation>`. Atualiza a ativa ou cria uma nova.
  - `use-cases/memories/save-memories.ts`: `SaveMemoriesUseCase(memoryRepository)`. Recebe `{ userId; memories: Array<{ key; value }>; conversationId: string | null }` e devolve `ListingResponse<Memory>`. Faz upsert via `findFirst({ userId, key })` + `update`/`create`.
  - `use-cases/topics/get-history-context.ts`: o construtor passa a receber `(topicSummaryRepository, conversationRepository)`, e o use case acrescenta a conversa ativa.
  - Exporte tudo em `src/index.ts`.
- **Test doubles** (molde `application/__tests__/{repositories,factories}/topic-summary.ts`): `application/__tests__/repositories/{conversation,memory}.ts` e `application/__tests__/factories/{conversation,memory}.ts`.
- **Testes**, ao lado de cada use case. Molde `use-cases/topics/__tests__/get-history-context.test.ts`. Datas com `vi.setSystemTime` ou relativas a `new Date()`.
  - `context/__tests__/load-agent-context.test.ts`:
    - (a) devolve a ativa mais recente e só as memórias do usuário;
    - (b) expirada → `null`.
  - `conversations/__tests__/record-conversation.test.ts`:
    - (a) sem ativa, cria com slug normalizado e `expiresAt = lastMessageAt + 24h`;
    - (b) ativa, atualiza e mantém o slug;
    - (c) expirada, cria uma nova;
    - (d) ignora a de outro usuário.
  - `memories/__tests__/save-memories.test.ts`:
    - (a) cria com `conversationId`;
    - (b) a mesma chave atualiza sem duplicar;
    - (c) `Família:Nome Familiares` → `familia:nome-familiares`;
    - (d) descarta chave sem 2 segmentos e valor vazio;
    - (e) não toca a mesma chave de outro usuário.
  - `topics/__tests__/get-history-context.test.ts`: ajuste o construtor e acrescente:
    - (a) inclui a ativa `conversa:…` sem ser pedida;
    - (b) não inclui expirada;
    - (c) não inclui a de outro usuário.

**Persistência**
- `packages/infra/db/prisma/schema.prisma`: modelos `Conversation` (`conversations`) e `Memory` (`memories`), iguais a `TopicSummary` (l.52-58).
- Migration nova: `pnpm --filter @ben/infra-db migrate:dev --name add-conversations-and-memories`. Se o comando não rodar sem interação, crie a pasta `prisma/migrations/<timestamp>_add_conversations_and_memories/migration.sql` no padrão do `init` e aplique com `migrate:deploy`.
- Repositórios (molde `topic-summary.ts`): `src/repos/in-memory/{conversation,memory}.ts` e `src/repos/sqlite/{conversation,memory}.ts`, mais os exports em `packages/infra/db/src/index.ts`.
- `packages/infra/server-ben/src/repositories.ts`: `conversationRepository` e `memoryRepository` (molde l.50-52).

**Porta** `packages/adapters/src/ports/agent-provider.ts`
- Tipos novos: `ActiveConversation = { key; summary }`, `UserMemory = { key; value }`, `ConversationUpdate = { slug; summary }`.
- `AgentReply` ganha `conversation: ConversationUpdate` e `memories: UserMemory[]`.
- `GenerateReplyPayload` ganha `activeConversation: ActiveConversation | null` e `memories: UserMemory[]`.

**Adapter** `packages/infra/adapters/src/services/ben-agent-provider/`
- `generate-reply/schemas.ts`: `agentReplySchema` ganha `conversation: z.object({ slug: z.string(), summary: z.string() })` e `memories: z.array(z.object({ key: z.string(), value: z.string() }))`. Confira se `to-agent-reply.ts` compila (o spread já repassa).
- `generate-reply/system-prompt.ts`: `buildSystemPrompt({ topicIndex, activeConversation, memories })`, com duas seções novas:
  - `# Conversa atual`: chave + resumo, ou, sem conversa ativa, "crie um slug kebab-case curto do assunto";
  - `# Memórias do usuário`: `- chave: valor`, ou "(nenhuma memória ainda)".

  Em `# Formato de saída esperado`, acrescente:
  - `conversation`: reutilize o slug existente; o resumo é cumulativo da conversa inteira, incluindo este turno;
  - `memories`: só fatos duradouros novos ou alterados, chave `categoria:subcategoria` kebab-case (ex. `familia:nome-familiares` → "Mãe: Maria; Pai: João"), vazia quando não houver.

  Diga também que `get-history-context` sempre traz a conversa atual. Preserve a seção de histórico de historico-agente.
- `generate-reply/format-system-prompt.ts`: linhas de `conversation` e `memories`.
- `generate-reply/history-context-tool.ts`: a descrição menciona que o resultado sempre inclui a conversa atual (`conversa:…`). Nome e schema não mudam.
- `index.ts`: só a chamada de `buildSystemPrompt` muda.

**Presenter novo** `packages/infra/server-ben/src/presenters/agent-memory-context-presenter.ts`: classe estática `AgentMemoryContextPresenter` com `toActiveConversation(conversation): ActiveConversation` (key via `toConversationKey`) e `toUserMemory(memory): UserMemory`.

**Rota** `packages/infra/server-ben/src/routes/chat.ts`
- Instancie os 3 use cases novos. `GetHistoryContextUseCase(topicSummaryRepository, conversationRepository)`.
- Antes de `generateReply`, use `loadAgentContextUseCase.execute({ userId })` para passar `activeConversation` e `memories` (via presenter).
- Depois de `persistTopicSummariesUseCase`, chame:
  - `recordConversationUseCase.execute({ userId, slug: reply.conversation.slug, summary: reply.conversation.summary, lastMessageAt: userMessage.createdAt })`;
  - `saveMemoriesUseCase.execute({ userId, memories: reply.memories, conversationId: conversation.item.id.toValue() })`.

## Seguir (só caminhos)
- `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `domain-ownership.md`, `backend-adapters-and-services-structure.md`, `service-structure.md`, `backend-http-layer-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/lint.md`, `coding-patterns/automated-testing.md`
- `.claude/skills/code-write-code/coding-patterns/backend/domain-entity-declaration.md`, `use-case-structure.md`, `use-case-response-structure.md`, `http-route-handler.md`, `http-presenter.md`, `backend-code-preferences.md`

## Segurança estrutural (no contrato)
- `toConversationKey` é a única fonte do formato `conversa:…`.
- `findActiveConversation` é a única fonte da regra de conversa ativa, usada pelos 3 use cases.
- `UserMemory` é o mesmo tipo na entrada (payload) e na saída (reply).

## Não quebrar
- `chat.ts` é o único chamador de `generateReply` e o único construtor de `GenerateReplyPayload`. `index.ts` é a única implementação.
- `FakeAgentService` (`packages/modules/tests/src/adapters/agent-service.ts`) precisa continuar compilando.
- `BuildTopicIndexUseCase`, `PersistTopicSummariesUseCase`, `AgentReplyPresenter` e `generateTaskTurn` ficam inalterados.
- As tools, `CONTEXT_MAX_STEPS` e o trace que historico-agente deixou continuam como estão.

## Aceite
1. Na raiz, nesta ordem, com saídas em `.claude/tasks/2026-10-21_contexto-memoria/`: `pnpm lint:fix > lint.log 2>&1`, `pnpm typecheck > typecheck.log 2>&1`, `pnpm test > test.log 2>&1`. Todos verdes, com os casos acima.
2. A migration aplica no SQLite de desenvolvimento.
3. O trace da fase context mostra `# Conversa atual` e `# Memórias do usuário`. O `get-history-context` traz a entrada `conversa:…` quando há conversa ativa.

## Arquivos que você POSSUI
- `packages/domain/topic/src/**` (os novos e os alterados acima);
- `schema.prisma` + migration nova;
- `packages/infra/db/src/repos/{in-memory,sqlite}/{conversation,memory}.ts` + `packages/infra/db/src/index.ts`;
- `packages/infra/server-ben/src/repositories.ts`;
- `agent-memory-context-presenter.ts`;
- `routes/chat.ts`;
- `agent-provider.ts` (só os tipos acima);
- `generate-reply/{schemas,system-prompt,format-system-prompt,history-context-tool}.ts`;
- `ben-agent-provider/index.ts` (só a chamada de `buildSystemPrompt`).

## Commit
Com os 3 comandos verdes, commite só os arquivos que você tocou mais a pasta da task: `simple-loop(contexto-memoria): implement — conversa atual no histórico de contexto e memória chave:valor`. Termine a mensagem com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Antes, espere o `.git/index.lock` sumir: `timeout 60 bash -c 'until [ ! -e .git/index.lock ]; do sleep 1; done'`. Sem push.
