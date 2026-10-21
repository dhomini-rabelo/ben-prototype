# Plano — contexto-memoria

Pedido (adendo do briefing): "o user sempre vai colocando a conversa atual nesse resumo de histórico de contexto, salvando a data da última mensagem e a data de expiração (`conversa:encontro-familiar:{data-ultima-mensagem}/{data-expiração}`). Também uma feature nova de memória no padrão de 2 pontos, ex.: `familia:nome-familiares` -> nome da mãe e do pai, salvos na conversa de encontro familiar."

Alvo:
- **Conversa atual.** O domínio `topic` ganha a entidade `Conversation`, uma por janela ativa de 24h. A chave renderizada dela é `conversa:{slug}:{lastMessageAt ISO}/{expiresAt ISO}`. A conversa ativa aparece sempre no resultado de `get-history-context` e no system prompt da fase context. A cada mensagem do usuário, o agente devolve `conversation { slug, summary }` (resumo cumulativo), e a rota grava esse resumo (cria ou atualiza).
- **Memória.** O domínio `topic` ganha a entidade `Memory` (chave `categoria:subcategoria`, valor livre, origem `conversationId`). O agente lê as memórias no system prompt e grava pelo campo `memories` da resposta, que a rota persiste com upsert por chave.

Um escopo (backend). O mobile não muda.

## Premissas assumidas
1. **Ordem.** Esta task roda DEPOIS de modelos-gpt6, preferencias-servidor, gasto-dolar e historico-agente. O código pode já conter as mudanças delas e o implementer deve integrá-las, sem reverter:
   - em `chat.ts`: `userMessage` guardado, `ListMessageHistoryUseCase`, custo;
   - no adapter (`index.ts`): `messages` em vez de `prompt`, `get-older-messages`, `CONTEXT_MAX_STEPS`, soma de custo;
   - em `system-prompt.ts`: seção `# Histórico da conversa`;
   - na porta: tipos de histórico e custo.
2. **Uma conversa ativa por usuário.** Ativa = `expiresAt > agora`. Se houver mais de uma, vale a de `lastMessageAt` mais recente. Expirada, ela some do contexto e a próxima mensagem cria uma nova.
3. **Expiração** = `lastMessageAt + CONVERSATION_TTL_MS`, com `CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000` (constante nomeada).
4. **`lastMessageAt`** = `createdAt` da mensagem do usuário persistida na rota (o `userMessage` que historico-agente já guarda). A atualização acontece depois da resposta do agente, porque slug e resumo vêm dele. "Atualizada a cada mensagem do usuário" = a cada chamada de `POST chat`.
5. **Slug.** O agente gera o slug, e o use case normaliza para kebab-case: minúsculas, sem acento, não-alfanumérico vira `-`, sem `-` nas pontas, e o fallback de vazio é `conversa`. O slug fica fixo enquanto a conversa está ativa: uma atualização troca só `summary`, `lastMessageAt` e `expiresAt` e ignora o slug que o agente mandou. Motivo: um LLM varia o slug entre turnos, e o slug é a identidade visível da conversa.
6. **Resumo cumulativo.** O agente recebe a chave e o resumo da conversa ativa no system prompt e devolve o resumo atualizado, cobrindo o turno atual. O servidor só grava o que recebe.
7. **`get-history-context`** (`GetHistoryContextUseCase`) passa a devolver SEMPRE a entrada da conversa ativa, `{ [chave conversa:…]: [{ id: conversation.id, summary }] }`, junto aos tópicos pedidos, mesmo que o agente não a peça. Sem conversa ativa, nada é acrescentado. Conversas expiradas nunca entram. O schema da tool não muda; muda só a descrição.
8. **Memória — forma mais enxuta (decisão do planner, que o adendo autoriza).**
   - **Gravação** pelo campo de saída estruturada `memories: [{ key, value }]` da resposta, persistido pela rota, no mesmo padrão de `historyTopics` e das captures. Não há tool de escrita. Motivo: dispensa steps extras (historico-agente já usa `CONTEXT_MAX_STEPS = 5`) e não tem efeito colateral no meio da geração.
   - **Leitura** pela seção `# Memórias do usuário` do system prompt da fase context, com todas as memórias do usuário (`- chave: valor`). Não há tool de leitura e as memórias não entram no `get-history-context`.
   - O agente devolve em `memories` só fatos novos ou alterados. Lista vazia é o caso comum.
9. **Chave de memória.** Exatamente 2 segmentos separados por `:`, cada um normalizado em kebab-case (mesmo normalizador do slug). Chave sem 2 segmentos não vazios depois da normalização é descartada em silêncio. Valor vazio (trim) também é descartado.
10. **Upsert por (userId, key).** Se a chave já existe para o usuário, o use case atualiza `value`, `conversationId` e `updatedAt`. Senão, cria. As memórias de outros usuários não são tocadas.
11. **Origem da memória** = `conversationId` da conversa gravada no mesmo request (identidade, conforme `domain-ownership.md`). A origem não é mostrada ao agente.
12. **Escopo do fluxo.** Só `generateReply` (rota `chat.ts`). `generateTaskTurn` e `create-task-message` não mudam.
13. **HTTP.** `AgentReplyPresenter` escolhe os campos explicitamente, então `conversation` e `memories` NÃO vão para a resposta HTTP, e o mobile não muda.
14. **Persistência.** São duas tabelas novas no padrão `id/props/types` (`conversations`, `memories`), com migration Prisma local (autorizada no briefing). Topic e TopicSummary não mudam.
15. **Contexto do projeto.** Os `system-flows` do backend não descrevem este fluxo. O plano foi feito a partir do código: `get-history-context.ts`, `history-context-tool.ts`, `index.ts`, `system-prompt.ts`, `chat.ts` e `schema.prisma`.

## Convenções aplicáveis
- `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `domain-ownership.md`, `backend-adapters-and-services-structure.md`, `service-structure.md`, `backend-http-layer-structure.md`
- `.claude/skills/code-write-code/general-coding-practices.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/lint.md`
- `.claude/skills/code-write-code/coding-patterns/backend/domain-entity-declaration.md`, `use-case-structure.md`, `use-case-response-structure.md`, `http-route-handler.md`, `http-presenter.md`, `backend-code-preferences.md`
- `.claude/skills/code-write-code/coding-patterns/automated-testing.md`

## Desenho (alvo)
### Domínio `packages/domain/topic/src`
- **Entidades**, molde `enterprise/entities/topic-summary.ts`:
  - `enterprise/entities/conversation.ts`: `Conversation`, com `ConversationProps { userId: ID; slug: string; summary: string; lastMessageAt: Date; expiresAt: Date; createdAt: Date }`.
  - `enterprise/entities/memory.ts`: `Memory`, com `MemoryProps { userId: ID; key: string; value: string; conversationId: ID | null; createdAt: Date; updatedAt: Date }`.
- **Repositórios**, molde `application/repositories/topic-summary.ts`: `application/repositories/conversation.ts` (`ConversationRepository`) e `application/repositories/memory.ts` (`MemoryRepository`).
- **Utils**, usados por mais de um use case:
  - `application/utils/conversations.ts` exporta:
    - `CONVERSATION_TTL_MS`;
    - `findActiveConversation(conversationRepository, userId: string, now: Date): Promise<Conversation | null>`, com `findMany({ userId, expiresAt: new GreaterQuery({ input: now }) }, { orderBy:'lastMessageAt', order:'desc', limit:1 })`;
    - `toConversationKey(conversation): string`, que devolve `conversa:${slug}:${lastMessageAt.toISOString()}/${expiresAt.toISOString()}`.
  - `application/utils/keys.ts` exporta `toKebabSlug(text): string` (devolve `''` quando nada sobra; quem chama aplica o fallback).
- **Use cases**:
  - `use-cases/context/load-agent-context.ts`: `LoadAgentContextUseCase(conversationRepository, memoryRepository)`. Payload `{ userId }`. Response `{ activeConversation: Conversation | null; memories: Memory[] }`, com as memórias ordenadas por `key` asc.
  - `use-cases/conversations/record-conversation.ts`: `RecordConversationUseCase(conversationRepository)`. Payload `{ userId; slug; summary; lastMessageAt: Date }`. Response `ItemResponse<Conversation>`. Com conversa ativa (em `lastMessageAt`), faz `update(id, { summary, lastMessageAt, expiresAt })`. Senão, faz `create` com `toKebabSlug(slug) || 'conversa'`.
  - `use-cases/memories/save-memories.ts`: `SaveMemoriesUseCase(memoryRepository)`. Payload `{ userId; memories: Array<{ key; value }>; conversationId: string | null }`. Response `ListingResponse<Memory>` (as gravadas). Normaliza a chave (premissa 9) e faz upsert via `findFirst({ userId, key })` (premissa 10).
  - `use-cases/topics/get-history-context.ts` (alterado): o construtor passa a receber `(topicSummaryRepository, conversationRepository)` e acrescenta a entrada da conversa ativa (premissa 7).
  - `src/index.ts`: exporte as entidades, os repositórios e os use cases novos.
- **Testes** (Vitest), com repositórios InMemory e factories novos em `application/__tests__/{repositories,factories}/{conversation,memory}.ts` (molde `topic-summary.ts`), cada um ao lado do use case:
  - `context/__tests__/load-agent-context.test.ts`:
    - devolve a ativa mais recente e só as memórias do usuário;
    - expirada → `null`.
  - `conversations/__tests__/record-conversation.test.ts`:
    - sem ativa, cria com slug normalizado e `expiresAt = lastMessageAt + 24h`;
    - ativa, atualiza `summary`/`lastMessageAt`/`expiresAt` e mantém o slug;
    - expirada, cria uma nova;
    - ignora conversa de outro usuário.
  - `memories/__tests__/save-memories.test.ts`:
    - cria com `conversationId`;
    - upsert da mesma chave atualiza o valor sem duplicar;
    - normaliza `Família:Nome Familiares` para `familia:nome-familiares`;
    - descarta chave sem 2 segmentos e valor vazio;
    - não toca memória de outro usuário com a mesma chave.
  - `topics/__tests__/get-history-context.test.ts` (atualizar o construtor), com 3 casos novos:
    - inclui a conversa ativa com a chave `conversa:…` mesmo sem ser pedida;
    - não inclui expirada;
    - não inclui conversa de outro usuário.
  - Para as datas, use `vi.useFakeTimers()`/`vi.setSystemTime` ou datas relativas a `new Date()`.

### Persistência `packages/infra/db`
- `prisma/schema.prisma`: modelos `Conversation` (`@@map("conversations")`) e `Memory` (`@@map("memories")`), iguais a `TopicSummary`.
- Migration nova em `prisma/migrations/` (`prisma migrate dev --name add-conversations-and-memories`, com o SQL no padrão do `init`).
- Repositórios em `src/repos/in-memory/{conversation,memory}.ts` e `src/repos/sqlite/{conversation,memory}.ts`, molde `topic-summary.ts`, mais os exports em `src/index.ts`.
- `packages/infra/server-ben/src/repositories.ts`: `conversationRepository` e `memoryRepository`, no molde das linhas 50-52.

### Porta `packages/adapters/src/ports/agent-provider.ts`
- Tipos novos ao lado de `HistoryContextResult`:
  - `ActiveConversation = { key: string; summary: string }`;
  - `UserMemory = { key: string; value: string }`;
  - `ConversationUpdate = { slug: string; summary: string }`.
- `AgentReply` ganha `conversation: ConversationUpdate` e `memories: UserMemory[]`.
- `GenerateReplyPayload` ganha `activeConversation: ActiveConversation | null` e `memories: UserMemory[]`.

### Adapter `packages/infra/adapters/src/services/ben-agent-provider`
- `generate-reply/schemas.ts`: `agentReplySchema` ganha `conversation: z.object({ slug, summary })` e `memories: z.array(z.object({ key, value }))`. `to-agent-reply.ts` repassa os dois sem mudança (o spread já cobre, e o tipo confere).
- `generate-reply/system-prompt.ts`: `buildSystemPrompt` passa a receber um objeto `{ topicIndex, activeConversation, memories }`. Ele ganha duas seções:
  - `# Conversa atual`: chave e resumo, ou a instrução de criar um slug kebab-case curto do assunto quando não houver conversa ativa;
  - `# Memórias do usuário`: lista `- chave: valor`, ou "(nenhuma memória ainda)".

  Em `# Formato de saída esperado`, ele ganha:
  - `conversation`: o slug da conversa atual (reutilize o slug existente) e o resumo cumulativo da conversa, incluindo este turno;
  - `memories`: fatos duradouros novos ou alterados sobre o usuário, chave `categoria:subcategoria` em kebab-case (ex.: `familia:nome-familiares` → "Mãe: Maria; Pai: João"), lista vazia quando não houver.

  O texto também diz que `get-history-context` sempre inclui a conversa atual.
- `generate-reply/format-system-prompt.ts`: acrescente as linhas `conversation` e `memories`.
- `generate-reply/history-context-tool.ts`: a descrição passa a mencionar que o resultado sempre traz a conversa atual (chave `conversa:…`). Nome e schema ficam iguais.
- `index.ts`: passe `{ topicIndex, activeConversation, memories }` para `buildSystemPrompt`. Mais nada muda (tools, steps e trace ficam como historico-agente deixou).

### Presenter `packages/infra/server-ben/src/presenters/agent-memory-context-presenter.ts` (novo)
- `AgentMemoryContextPresenter`, classe estática no padrão dos vizinhos:
  - `toActiveConversation(conversation: Conversation): ActiveConversation` (`key` via `toConversationKey`);
  - `toUserMemory(memory: Memory): UserMemory`.

### Rota `packages/infra/server-ben/src/routes/chat.ts`
- Instancie `LoadAgentContextUseCase`, `RecordConversationUseCase` e `SaveMemoriesUseCase`. `GetHistoryContextUseCase` passa a receber também `conversationRepository`.
- Antes de `generateReply`, chame `loadAgentContextUseCase.execute({ userId })` e passe ao payload `activeConversation` (presenter, ou `null`) e `memories` (presenter).
- Depois de `persistTopicSummariesUseCase`, chame:
  - `recordConversationUseCase.execute({ userId, slug: reply.conversation.slug, summary: reply.conversation.summary, lastMessageAt: userMessage.createdAt })`;
  - `saveMemoriesUseCase.execute({ userId, memories: reply.memories, conversationId: conversation.item.id.toValue() })`.
- A resposta HTTP não muda.

## Melhorias estruturais (no contrato)
- `toConversationKey` é a fonte única do formato `conversa:…`, usada por `GetHistoryContextUseCase` e pelo presenter. O formato da chave não se duplica.
- `findActiveConversation` é a fonte única da regra "ativa = `expiresAt > agora`, mais recente". Ela é usada por load-agent-context, record-conversation e get-history-context, para que os três não divirjam.
- `UserMemory` serve tanto para a entrada (payload) quanto para a saída (`AgentReply.memories`), num tipo só. Assim, mudar o formato de uma memória quebra os dois lados juntos.

## Melhorias estruturais sugeridas (fora do escopo)
- Tipar a chave de memória como template literal (`` `${string}:${string}` ``) na porta e no domínio.
- Limitar ou paginar `# Memórias do usuário` quando a lista crescer, por exemplo com uma tool de leitura por categoria.
- `AgentReplyPresenter` escolhe campos à mão. Um tipo `Omit<AgentReply, …>` explícito faria um campo novo do reply exigir uma decisão de exposição.

## Fora do escopo
- Mobile e tela de memórias.
- Tools de escrita/leitura de memória (premissa 8).
- `generateTaskTurn`.
- Edição ou remoção de memória pelo usuário.
- Histórico de conversas expiradas no contexto.
- Mudanças em Topic/TopicSummary/BuildTopicIndex.
- Retroprocessar mensagens antigas.

## Critérios de aceite
1. Na raiz, `pnpm lint:fix`, `pnpm typecheck` e `pnpm test` passam, com os testes novos e alterados descritos acima.
2. A migration aplica no SQLite de desenvolvimento, criando as tabelas `conversations` e `memories`.
3. Com o stack rodando (server-ben em porta ≠ 8081):
   - **Mensagem 1** ("vou num encontro familiar sábado, minha mãe é Maria e meu pai é João"):
     - grava uma `Conversation` com slug kebab-case e `expiresAt = lastMessageAt + 24h`;
     - grava a `Memory` `familia:…` com o valor contendo Maria e João e `conversationId` da conversa.
   - **Mensagem 2** dentro de 24h:
     - atualiza a mesma conversa (mesmo slug, `lastMessageAt` novo, resumo cumulativo);
     - o trace da fase context mostra `# Conversa atual` com a chave `conversa:{slug}:{ISO}/{ISO}` e `# Memórias do usuário` com a memória;
     - se `get-history-context` for chamado, o resultado traz a entrada `conversa:…`.
   - **Pergunta** "qual o nome dos meus pais?": responde com Maria e João a partir das memórias.
4. Conversa expirada (simulável ajustando `expiresAt` no banco) não aparece no prompt nem no `get-history-context`, e a próxima mensagem cria uma conversa nova.

## Modo de system test recomendado
Automatizado (Vitest) para os 4 use cases + manual com o stack real (server-ben em porta ≠ 8081 + OpenRouter), lendo o trace da mensagem e o SQLite. Só o modelo real prova slug, resumo cumulativo e extração de memória.
