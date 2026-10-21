APPROVED_WITH_RESALVAS

# Review r1 — historico-agente (backend)

Escopo revisado: diff `9f7b64c~1..9f7b64c` em `packages/` (8 arquivos), contra o contrato em `prompts/historico-agente-backend.md` e as premissas do briefing. Logs da task: `lint.log` (eslint sem erro), `typecheck.log` (todos os pacotes `Done`, 0 ocorrências de "error"), `test.log` (`list-message-history.test.ts (5 tests)` verde, demais pacotes verdes). Não reexecutei os comandos.

## Premissas do briefing sobre histórico

| Premissa | Status | Evidência |
| --- | --- | --- |
| 15 mensagens anteriores à atual, atual fora | ok | `chat.ts` grava a mensagem do usuário (`userMessageResult`) antes e usa o id dela como âncora; `list-message-history.ts` monta cursor da âncora e as duas implementações (`repository.ts:335-343`, `sqlite-repository.ts:365-376`) começam no índice seguinte ao id. `MESSAGE_HISTORY_PAGE_SIZE = 15`. Teste (a) cobre âncora e mais novas excluídas. |
| Ordem cronológica | ok | Busca `desc` e devolve `[...page.items].reverse()`; teste (b) confere `message-5..message-19`. |
| Estruturadas user/assistant | ok | `agent-conversation-presenter.ts` mapeia `user→user`, `ben→assistant` via `Record<MessageRole, ConversationMessageRole>`; adapter troca `prompt` por `messages: [...history, { role:'user', content: message }]`. Só `content`/`createdAt` saem do presenter (sem trace, capture, custo). |
| Tool pagina pelo cursor, 15 por página, a partir da mais antiga entregue | ok | `nextCursor` do repositório é construído do último item da página `desc` (= mais antiga entregue). `older-messages-tool.ts` começa em `history.nextCursor`, avança `cursor = page.nextCursor`, serializa chamadas numa fila de promise; sem cursor devolve página vazia sem chamar o callback. Teste (c) cobre a segunda página sem sobreposição e `hasMore:false`/`nextCursor:null`. |
| Steps ajustados | ok | `CONTEXT_MAX_STEPS = 5` (`index.ts:37`), `stopWhen: stepCountIs(CONTEXT_MAX_STEPS)` (l.68), `prepareStep` devolve `{ toolChoice: 'none' }` em `stepNumber === 4` (l.76). Comporta 1 `get-history-context` + 3 `get-older-messages` + texto final. Typecheck verde confirma a forma do retorno no `ai`. |

## Contrato do escopo

- Porta: 4 tipos e 2 campos novos em `GenerateReplyPayload`, sem import de domínio. ok.
- Use case: payload `{ userId } & ({ beforeMessageId } | { cursor })`, âncora via `messageRepository.get({ id, userId })` (ResourceNotFound para outro usuário, teste (e)), resposta `CursorPaginationResponse<Message>`. Segue o molde de `list-messages.ts` (inclusive os imports separados de `@ben/domain-base`). ok.
- Teste: 5 casos pedidos, mesmo diretório e molde de `list-messages.test.ts`. ok.
- Rota: use case instanciado junto dos outros, `history` montado antes de `generateReply`, `resolveOlderMessages` com `request.userId`. ok.
- Adapter: duas tools no `generateText` e no trace (`z.toJSONSchema(olderMessagesInputSchema)`); fase format e `generateTaskTurn` intocadas. ok.
- Custo (integração com gasto-dolar): o custo de `generateReply` sai do trace (`sumUsage` sobre `[...contextSteps, ...formatSteps]`), e `contextSteps` é construído de todos os `contextResult.steps`, então os steps extras da fase context entram na soma. ok.
- System prompt: seção `# Histórico da conversa` com o texto pedido; l.19 mantém "UMA ÚNICA VEZ" para `get-history-context` sem dizer que é a única tool. Descrição da tool contém "a próxima página de mensagens mais antigas da conversa", sem número. ok.
- Aceite 3 (histórico vazio): `history.messages = []` gera só a mensagem atual; `nextCursor = null` faz a tool devolver `{ messages: [], hasMore: false }`. ok.

## Ressalvas (registrar, não bloqueiam)

1. `packages/infra/adapters/src/services/ben-agent-provider/index.ts:68` — ao subir de `stepCountIs(2)` para 5, o limite de código que antes garantia no máximo uma rodada de `get-history-context` deixou de existir; "UMA ÚNICA VEZ" (system-prompt.ts:19) e "no máximo 3 chamadas" (system-prompt.ts:24) agora dependem só do prompt. Pior caso: o modelo chama `get-history-context` em até 4 steps. Consequência é custo/latência, não resposta errada. Se quiser garantia, um contador por tool no `prepareStep` com `activeTools` resolveria; fica como decisão futura.
2. `packages/infra/adapters/src/services/ben-agent-provider/index.ts:69-74` — o `contextRecorder` grava `messages` de cada step, que agora incluem até 15 mensagens de histórico (mais páginas antigas trazidas pela tool). O trace persistido em cada mensagem do Ben cresce na ordem de steps × mensagens. Comportamento consistente com o propósito do trace; registro só para acompanhar tamanho do banco/payload do trace no mobile.
3. Não consegui conferir no `.d.ts` do pacote `ai` que `stepNumber` é 0-based (não há `node_modules` acessível neste checkout). A leitura `stepNumber === CONTEXT_MAX_STEPS - 1` está certa se for 0-based, que é a semântica documentada do AI SDK (`stepNumber = steps.length`). Premissa assumida, não verificada localmente.

## Sem findings bloqueantes

Nenhum `CHANGES_REQUIRED`: critérios de aceite cobertos, padrões do repositório seguidos (presenter estático, use case no molde, teste ao lado dos vizinhos), `FakeAgentService` e `ListMessagesUseCase` intocados e typecheck verde.
