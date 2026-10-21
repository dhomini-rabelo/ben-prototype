APPROVED_WITH_RESALVAS

# Review r1 — contexto-memoria (backend)

Escopo revisado: commit 8c48a8b (implement-backend) contra o contrato `prompts/contexto-memoria-backend.md`, o `plan.md` (commit 22eb685), o briefing e o briefing-adendo da run `2026-10-21-modelos-gasto-historico`.

Evidência de verificação (não reexecutei a suíte):
- `lint.log`, `typecheck.log` e `test.log` estão verdes. O typecheck inclui `packages/modules/tests`, então `FakeAgentService` compila.
- `prisma migrate status` em `packages/infra/db`: "2 migrations found … Database schema is up to date!". A migration `20261021215717_add_conversations_and_memories` está aplicada no SQLite de dev.
- O SQLite compara `Date` dentro de `props`: `sqlite-repository.ts:461` trata `GreaterQuery` em campo de tipo `date` comparando strings ISO. A premissa do implementer sobre `findActiveConversation` no SQLite se apoia no código.

## Checagens do adendo (vinculante)

| Item | Resultado | Onde |
| --- | --- | --- |
| Chave `conversa:{slug}:{ISO}/{ISO}` | OK. `toConversationKey` é a única fonte do formato e é usada pelo use case e pelo presenter. | `domain/topic/src/application/utils/conversations.ts:24-26` |
| Expiração de 24h | OK. `CONVERSATION_TTL_MS = 24*60*60*1000`; `expiresAt = lastMessageAt + TTL`; a conversa ativa exige `expiresAt > now`. Expirada não entra no resultado e a próxima mensagem cria outra (teste c). | `conversations.ts:6,16`; `record-conversation.ts:31-33` |
| Conversa atual no `get-history-context` | OK. É acrescentada sempre que há conversa ativa e não entra quando expirada ou de outro usuário (testes a/b/c). | `get-history-context.ts:36-56` |
| Atualização a cada mensagem | OK. `chat.ts:192` grava com `lastMessageAt = userMessage.createdAt` depois da resposta do agente. O slug fica fixo enquanto a conversa está ativa. | `record-conversation.ts:35-48` |
| Memória `categoria:subcategoria` | OK. Exatamente 2 segmentos, cada um em kebab-case. Chave inválida e valor vazio são descartados. | `save-memories.ts:43-54` |
| Upsert de memória | OK. Faz `findFirst({ userId, key })` e depois `update` ou `create`; não toca a mesma chave de outro usuário (teste e). | `save-memories.ts:56-88` |
| Origem da memória | OK. `conversationId` recebe o id da conversa gravada no mesmo turno. | `chat.ts:199-203` |
| Migration | OK. Tabelas `conversations` e `memories` no padrão `id/props/types`, aplicada no SQLite de dev. | `prisma/migrations/20261021215717_add_conversations_and_memories/migration.sql` |

### Desvio "memória via campo `memories`, sem tools" frente a "escrita pelo agente"

Aceitável, com ressalva. O pedido é que a memória seja escrita pelo agente, e é o agente quem decide a chave e o valor. Ele os devolve no campo `memories` da saída estruturada, e a rota só persiste, no mesmo padrão de `historyTopics`. O próprio adendo deixa a forma a cargo do planner ("decide a forma mais enxuta e a documenta"), e o `plan.md:24-25` documenta o motivo: evitar steps extras com `CONTEXT_MAX_STEPS = 5` e evitar efeito colateral no meio da geração.

Ressalvas do desvio, para registro (não bloqueiam):
- A gravação depende de duas fases. A fase context precisa citar a memória no texto, e só então a fase format a extrai (`format-system-prompt.ts`: "as memórias citadas"). Se o texto da fase context omitir a memória, ela se perde em silêncio. Uma tool `save-memory` gravaria sem depender dessa extração. O system test deve confirmar o exemplo `familia:nome-familiares`.
- A leitura é só pelo prompt: todas as memórias do usuário entram em toda mensagem (`load-agent-context.ts`, sem limite). O custo em tokens cresce sem teto à medida que as memórias acumulam. Não há tool de leitura sob demanda.

## Ressalvas (não bloqueiam)

1. **Aceite 3 não exercitado.** A presença de `# Conversa atual` e `# Memórias do usuário` no trace da fase context, e de `conversa:…` no `get-history-context` em runtime, não foi verificada; o implementer declarou isso em `r9-impl-contexto.md`. Fica para o system test.
2. **Presenter alterado contra o contrato.** Em `packages/infra/server-ben/src/presenters/agent-reply-presenter.ts:10`, o contrato dizia "AgentReplyPresenter não muda", mas o tipo de retorno passou a ser `Omit<AgentReply, 'conversation' | 'memories'>`. A mudança é necessária, porque os campos novos são obrigatórios em `AgentReply` e o presenter escolhe os campos explicitamente. A resposta HTTP continua idêntica e o mobile não muda.
3. **Ordenação em JS.** Em `packages/domain/topic/src/application/use-cases/context/load-agent-context.ts:36`, as memórias são ordenadas com `.sort` em JS. O repositório já aceita `{ orderBy: 'key', order: 'asc' }` em `findMany`, o que deixaria a ordenação no banco, como `findActiveConversation` já faz. Melhoria menor.
4. **Literal duplicado na factory.** Em `packages/domain/topic/src/application/__tests__/factories/conversation.ts:24`, `24 * 60 * 60 * 1000` está duplicado. O certo é usar `CONVERSATION_TTL_MS` para manter uma única fonte do TTL.
5. **Falha depois da persistência.** Em `packages/infra/server-ben/src/routes/chat.ts:192-203`, a conversa e as memórias são gravadas depois de `persistBenMessageUseCase`. Se uma dessas gravações falhar, a rota responde erro com a mensagem do Ben já persistida. O contrato pedia "grave DEPOIS da resposta do agente", então não é bug do contrato; registro apenas o comportamento em falha.
6. **Estrutura de `execute`.** `RecordConversationUseCase.execute` (`record-conversation.ts:35-48`) resolve create/update num ternário inline. O padrão `use-case-structure.md` prefere passos privados nomeados (`updateActive` e `createNew`). É estilo e não bloqueia.

## Completude vs contrato

- Todos os arquivos listados existem: entidades, repositórios (contratos, in-memory e sqlite), utils, os 3 use cases novos, o `get-history-context` ajustado, os test doubles, os exports em `domain/topic/src/index.ts` e `infra/db/src/index.ts`, `repositories.ts`, o presenter novo, a rota, a porta, o schema, os prompts e a descrição da tool.
- Todos os casos de teste pedidos estão presentes: load-agent-context (a, b); record-conversation (a a d); save-memories (a a e); get-history-context (a, b, c).
- `generateTaskTurn`, `BuildTopicIndexUseCase`, `PersistTopicSummariesUseCase`, as tools e `CONTEXT_MAX_STEPS` não foram tocados no diff.
