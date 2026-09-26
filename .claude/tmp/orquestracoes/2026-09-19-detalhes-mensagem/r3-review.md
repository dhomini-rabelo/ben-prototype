# r3 — Revisão do plano `r2-plano.md`

VEREDITO: RECUSADO

3 achados bloqueantes. Todos têm evidência de arquivo aberto e linha real. O resto do plano —
contratos de tipo, presenter, rota, store, componentes, tokens, os cinco desvios declarados —
confere com o repo e está bom.

---

## Bloqueantes

### B1 — O trace só captura as tool calls do **último** step; a seção "Tool calls" vai nascer vazia

**Passos afetados:** 4 (`buildAgentCallStep`), 5 (instrumentação do `generateReply`), 37 (aba Output,
item 5).

**O que está errado.** O passo 4 monta `output.toolCalls` e `output.toolResults` a partir de
`result.toolCalls` / `result.toolResults` do retorno de `generateText`. No AI SDK v6 esses campos são
**do último step**, não do agregado da chamada.

Evidência:

- `/root/so/repos/ben-prototype/project-backend/node_modules/ai/dist/index.d.ts:1075-1077`
  ```
  /**
   * The tool calls that were made in the last step.
   */
  readonly toolCalls: Array<TypedToolCall<TOOLS>>;
  ```
  Mesmo comentário em `:1088-1090` para `toolResults` e em `:1055-1057` para `text`.
- `/root/so/repos/ben-prototype/project-backend/node_modules/ai/dist/index.d.ts:1146-1152` —
  `readonly steps: Array<StepResult<TOOLS>>` é o campo que carrega **todos** os steps.
- `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts:30` —
  `stopWhen: stepCountIs(2)`.

Com `stepCountIs(2)`, o fluxo normal é: step 1 o modelo chama `get-history-context`, a tool executa;
step 2 o modelo produz o texto. Logo `contextResult.toolCalls` no fim é `[]` no caso exato que o
usuário quer inspecionar. O passo 37 item 5 diz "a seção **não é renderizada** quando
`step.output.toolCalls.length === 0`" — ou seja, a seção simplesmente some.

Isso fere o briefing de frente: "a resposta crua (texto, **tool calls**, tokens, modelo, latência)".
E a §10.2 do plano não pega o erro: ela manda conferir `input.tools[0].name`, que é a *definição* da
tool, não a chamada.

**O que precisa mudar.** No passo 4, `buildAgentCallStep` deve ler as tool calls e os tool results de
`result.steps`, não do topo do resultado:

```ts
toolCalls: result.steps.flatMap((s) => s.toolCalls).map(…)
toolResults: result.steps.flatMap((s) => s.toolResults).map(…)
```

e `GenerateTextResultLike` precisa ganhar `steps: readonly { toolCalls: …; toolResults: … }[]`.
Acrescentar à §10.2 uma verificação explícita: no step `context`, `output.toolCalls` tem ≥ 1 entrada
com `toolName === 'get-history-context'` e `output.toolResults` tem o resultado correspondente.

---

### B2 — `step.input.messages` é hard-coded e nunca mostra o que o modelo realmente viu

**Passos afetados:** 5 (construção de `AgentCallStepInput`), 36 (aba Input, seção "Messages").

**O que está errado.** O passo 5 escreve, para o step `context`:

```ts
messages: [{ role: 'user', content: payload.message }],
```

Isso não é o payload; é uma reconstrução manual de **uma** entrada. Consequências concretas:

1. A seção "Messages" do passo 36 — que o `r1-design.md` §3.4 justifica com "que contexto o modelo
   realmente viu?" — vai renderizar sempre exatamente 1 linha, em qualquer conversa. O `meta` dela
   (`String(step.input.messages.length)`) será sempre `1`.
2. Na segunda ida ao provider dentro do step `context` (a que existe por causa de
   `stopWhen: stepCountIs(2)`), o modelo recebe também a mensagem de assistant com a tool call e a
   mensagem de tool com o resultado. Nada disso aparece no trace.
3. O próprio exemplo do plano na §3.4 do `r1` / §10.2 (`POST /chat · 12 messages · 3 tools`) é
   impossível de acontecer.

Evidência de que o backend hoje manda só uma string:
`/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts:97-103` —
`agentService.generateReply({ userId, message, topicIndex, resolveHistoryContext })`, onde `message`
é o texto da última mensagem do usuário (`extractLatestUserMessageText`, linhas 58-75). E
`/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts:20-31`
usa `prompt: payload.message`, não `messages: […]`.

**O que precisa mudar.** Uma das duas, e o plano tem de escolher e escrever qual:

- **(a)** Capturar as mensagens reais por step a partir de `result.steps[i].request` /
  `result.steps[i].content` (ou de `result.request.body`, que é o corpo enviado ao provider), e
  passar a montar um `AgentCallStep` por step real do SDK em vez de um por chamada `generateText`.
- **(b)** Manter a reconstrução manual, mas então **dizer no plano, em texto** que o Ben não envia
  histórico ao modelo (só a última mensagem) e renomear a seção de "Messages" para algo honesto
  ("Prompt"), removendo do §10.2 a promessa de `12 messages`. Sem isso, o implementador entrega uma
  tela que afirma mostrar o contexto e mostra uma linha só.

---

### B3 — A porta do backend nas provas de API está errada (3000 em vez de 3333)

**Passo afetado:** §10.2 "Prova de API" (os três `curl`).

**O que está errado.** Os três comandos batem em `http://localhost:3000`. O servidor escuta em
`env.API_PORT`:

- `/root/so/repos/ben-prototype/project-backend/src/infra/http/server.ts:5` — `app.listen(env.API_PORT, …)`
- `/root/so/repos/ben-prototype/project-backend/.env.example:1` — `API_PORT=3333`

E o próprio R7 do plano manda criar o `.env` a partir do `.env.example`, ou seja, a porta será 3333.
Os três `curl` vão falhar com "connection refused" e o implementador `sonnet` vai gastar tempo
suspeitando da rota nova.

**O que precisa mudar.** Trocar `3000` por `3333` nos três comandos da §10.2, ou usar
`http://localhost:${API_PORT}` com uma linha dizendo de onde vem o valor. O `cors` do
`app.ts:33-43` também não lista `http://localhost:3000`, o que confirma que 3000 não é a porta de
nada neste repo.

---

## Não bloqueantes

1. **Passo 17 — contagem errada.** O plano diz "usa `offset` nos três lugares onde hoje está
   `SLIDE_OFFSET` (`useSharedValue(offset)` e as **duas** atribuições do `useEffect`)". Em
   `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/settings-sheet-overlay.tsx`
   `SLIDE_OFFSET` aparece em exatamente **dois** lugares: linha 24 (`useSharedValue`) e linha 32
   (uma única atribuição no `else`). A linha 29 é `withTiming(0, …)`. O implementador vai procurar
   uma terceira ocorrência que não existe.

2. **Desvio de design não declarado — segmented control durante o loading.** `r1-design.md` §3.7
   pede: "O segmented control já aparece, **desabilitado**". O passo 38 renderiza
   `{trace && <SegmentedControl …>}`, então durante o loading ele **não existe**, e o header pula de
   1 faixa para 3 quando o fetch termina. Não está na tabela §2 de desvios conscientes. Ou declare,
   ou renderize desabilitado.

3. **`?? null` morto em três pontos do passo 4.** `result.response.modelId` e `result.response.id`
   são `string` não-opcional (`node_modules/ai/dist/index.d.ts:144` e `:152`) e `result.finishReason`
   é `FinishReason`, também não-nulo (`:1102-1103`). Os `?? null` não quebram nada (o eslint do
   backend não liga `@typescript-eslint/no-unnecessary-condition` — ver `eslint.config.js`), mas são
   ruído. Mesma coisa no passo 28: `JSON.stringify(x, null, 2) ?? 'null'` — `JSON.stringify(null)`
   devolve a string `'null'`, nunca `undefined`.

4. **`clipboard-service.ts` sem irmão `.web.ts`.** Os quatro serviços existentes em
   `/root/so/repos/ben-prototype/project-mobile/src/services/` têm todos um par
   (`audio-service.ts` + `audio-service.web.ts`, etc.), e
   `.claude/skills/code-get-coding-designs/designs/mobile-services-layer-structure.md` documenta o
   padrão. Aqui o par não é necessário (`expo-clipboard` suporta web), mas vale uma linha no passo 16
   dizendo isso, senão o implementador cria um `.web.ts` no-op por mimetismo e o copiar para de
   funcionar justamente na plataforma que o browser tester usa.

5. **Passo 33 cita `function renderItem(…)`.** No arquivo real
   (`/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/chat-history/chat-history.tsx:35`)
   é `const renderItem = ({ item }: { item: BenUiMessage }) => {`. O passo também abrevia o corpo
   como `const bubble = <MessageBubble …>{…}</MessageBubble>` — o `{…}` esconde 18 linhas de JSX
   (o `CaptureCard`, linhas 49-65) que o implementador vai ter de mover intactas. Vale explicitar
   "mantenha o conteúdo do `MessageBubble` exatamente como está, só extraia para uma variável".

6. **Passo 39 — `useEffect(() => reset, [reset])`.** O precedente citado
   (`/root/so/repos/ben-prototype/project-mobile/src/pages/menu/page.tsx:24`) é
   `useEffect(() => () => reset(), [reset])`. As duas formas são equivalentes; use a do precedente
   para não abrir uma segunda convenção.

7. **Dedup do passo 24 não cobre a mensagem do usuário.** O filtro por id remove a duplicata da bolha
   do **Ben** (que passa a usar o id real). A bolha do usuário continua com `randomUUID()`
   (`message-builders.ts:7`) e vai duplicar num refetch do histórico. O plano reconhece isso ("que
   hoje já existiria visualmente, só que com ids diferentes"), então é pré-existente — mas como o
   passo 25 mexe em `buildUserMessage` de qualquer jeito (para acrescentar `createdAt`), passar o id
   real do usuário custaria um campo a mais na resposta do `POST /chat` e fecharia o buraco de vez.
   Fora do escopo; fica registrado.

8. **`z.toJSONSchema` e o risco R4 não existem.** Rodei
   `node -e "const {z}=require('zod'); z.toJSONSchema(z.object({topics:z.array(z.string())}))"` em
   `project-backend` e ele devolve o JSON Schema draft 2020-12 corretamente. R4 pode sair do plano.

9. **`AlertTriangle`, `expo-clipboard`, `.env`, migração — tudo confirmado.** `AlertTriangle` não
   existe em `lucide-react-native@0.544` e `CircleAlert`, `FileInput`, `FileOutput`, `Cpu`, `Braces`,
   `Wrench`, `ScrollText`, `MessageSquare`, `Copy`, `Check`, `ChevronDown`, `ChevronRight`, `X` todos
   existem (grep em `node_modules/lucide-react-native/dist/lucide-react-native.d.ts`).
   `expo-clipboard` realmente não está no `package.json`. Não existe `.env` em `project-backend` nem
   em `project-mobile`, só `.env.example` nos dois. A tabela `messages` é
   `id TEXT PRIMARY KEY, props TEXT, types TEXT`
   (`prisma/migrations/20260913024102_init/migration.sql:2-6`), logo a ausência de migração está
   certa. `SqliteRepository.serializeValue` (`sqlite-repository.ts:271-305`) percorre recursivamente,
   registra `Date`/`ID` em `types` e lança em `ValueObject` (linhas 286-290) — a "regra dura" da §3.1
   do plano está correta e é necessária.

---

## Os seis pontos frágeis que o planejador marcou — veredito de cada um

| Ponto | Veredito |
|---|---|
| `messageId` no `POST /chat` + deduplicação | **OK.** `dispatch-reply.ts:17` usa `buildBenMessage('', reply.capture)` e `message-builders.ts:13-23` gera `randomUUID()`; sem o `messageId` o long-press cairia em 404. `chat.ts:114-126` já persiste a mensagem do Ben antes da resposta, então `benMessageResult.item.id` está disponível. A dedup do passo 24 é necessária e correta para a bolha do Ben (ver não-bloqueante 7 para o resto) |
| Ausência de migração no sqlite | **OK**, verificado acima |
| Trace de dois steps (`context` e `format`) | **Problema** — é a raiz de B1 e B2. A decisão de ter dois `AgentCallStep` não é o erro; o erro é preencher cada um a partir do resultado agregado em vez de `result.steps` |
| Falha do modelo não persistida | **OK como premissa.** `chat.ts:97` não tem try/catch em volta do `generateReply`, então um throw propaga e nenhuma `Message` do Ben é criada — não há bolha para long-pressar. Escrever `status: 'ok'` sempre e já ter a banda de erro no cliente é barato e mantém o contrato aberto. Não é atalho |
| Altura do sheet em pixels (D3) | **OK e bem justificado.** `SettingsSheetOverlay` envolve o filho num `Animated.View className="w-full"` (linha 59) sem altura; `h-[90%]` no `MenuSheet` não resolveria contra pai de altura automática |
| R7 (`.env`, banco, porta 8081) | **Parcialmente OK.** A constatação é verdadeira (nenhum `.env` nos dois projetos). Mas contém o erro de porta do B3, e a conclusão — "o item 6 fica bloqueado por falta de ambiente" — significa que a definição de pronto do briefing não fecha só com este plano. Isso não é corrigível no plano; registre no relatório e avise o orquestrador antes de chamar o browser tester |

---

## Os cinco desvios declarados na §2 do plano

| # | Veredito | Evidência |
|---|---|---|
| D1 — store em arquivo único | **Justificado.** `.claude/skills/code-write-code/coding-patterns/frontend-code-preferences.md`, seção "Do not over-split a small store", diz exatamente isso. Precedente: `src/layout/stores/menu-store.ts` (44 linhas, um arquivo) |
| D2 — `CodeBlock` sem degradê | **Justificado.** `expo-linear-gradient` não está no `package.json` de `project-mobile` |
| D3 — altura por `style` | **Justificado**, ver tabela acima |
| D4 — variante `code` no `Typography` + `'code'` no `cn()` | **Justificado.** `src/layout/utils/styles.ts:6-17` lista os tokens de `font-size` um a um (`wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`); sem acrescentar `'code'` o `tailwind-merge` não resolveria o conflito. `typography.tsx:14-21` confirma que `label-caps` aplica `uppercase` |
| D5 — `createdAt` obrigatório no metadata | **Justificado** e barato. `chat-messages.ts:4-6` hoje só tem `capture?` |

---

## Definição de pronto do briefing — de quais passos sai cada item

| # | Item | Sai de | Fecha? |
|---|---|---|---|
| 1 | Long-press na bolha do Ben abre menu com exatamente "Ver input" e "Ver output" | 30 (store), 31 (item), 32 (menu + os dois itens, sem mais nada), 33 (gatilho só quando `isBen`), 39 (montagem na página) | **Sim** |
| 2 | Cada item abre bottom sheet quase full-screen, navegável: seções, scroll, copiar | 15 (token `code`), 16 (clipboard), 17 (`slideOffset`), 26-29 (segmented, copy, code-block, collapsible), 34-38 (skeleton, meta strip, abas, casco), 39 | **Sim**, com a ressalva de que a seção "Messages" (36.3) e a "Tool calls" (37.5) vão vir degradadas enquanto B1 e B2 não forem corrigidos |
| 3 | Long-press em mensagem do usuário não abre o menu | 33 — `if (!isBen) return bubble` | **Sim** |
| 4 | Backend persiste input/output brutos no sqlite, expõe por rota, mensagem antiga mostra vazio | 1-8 (tipos, porta, instrumentação, entidade, use-cases de persistência), 10-13 (use-case de leitura, presenter, rota, `POST /chat`), 9 (esconder da listagem), 38 (`ItemDetailGone` + id mono) | **Parcialmente** — persiste e expõe, e o vazio fecha; mas "brutos, completos" não se sustenta com B1 e B2 |
| 5 | `lint:fix` e `tsc --noEmit` passam nos dois projetos | 14 (backend), 40 (mobile), §10.1 | **Sim.** Comandos conferidos: backend `eslint ./src --ext .ts --fix`, mobile `eslint . --fix` |
| 6 | Screenshot do menu e do sheet, pelo browser tester | §10.3, itens 4, 5 e 8 | **Condicionado a R7.** Não há `.env` em nenhum dos dois projetos; sem as chaves o backend não sobe (`src/infra/services/env.ts:29-32` lança em env inválido) e não há como autenticar. O plano admite isso e manda pedir ao usuário |
| 7 | Commit e push em `feat/update-model-and-add-logs` | §10.4 | **Sim** |

---

## Premissas que assumi (não podia perguntar)

1. "Bloqueante" = o implementador `sonnet` entrega algo que contradiz o briefing ou que falha na
   execução. Por isso B1 e B2 entraram: nenhum dos dois quebra o `tsc`, mas os dois entregam
   "input e output brutos, completos" sem as tool calls e sem o contexto — que é literalmente o que
   o usuário pediu para poder ver "se o bot está se comportando bem".
2. O item 6 da definição de pronto depender de chaves que não estão no repo é limitação de ambiente,
   não defeito do plano — logo, não bloqueante.

## O que não deu tempo de verificar (teto de janela em `status=handoff`)

- `src/pages/chat/stores/messages-store/animate-reply.ts` — não abri; o plano diz que não muda, e a
  chamada `animateReply(set, get, benMessage.id, reply.message)` continua idêntica, então o risco é
  baixo.
- `src/layout/hooks/use-api-cursor-paginated.ts` — não abri; só importa para o passo 24, e o campo
  usado lá (`historyState.items`) já está exercido em `use-chat-messages.ts:21`.
- `.claude/skills/code-write-code/coding-patterns/general-code-preferences.md` e
  `backend-code-preferences.md` — não abri integralmente; as afirmações do plano sobre ownership
  composta (`id + userId`) batem com o precedente real `get-note-detail.ts:16-19`, que eu abri.
- Não rodei `npx tsc --noEmit` em nenhum dos dois projetos.
