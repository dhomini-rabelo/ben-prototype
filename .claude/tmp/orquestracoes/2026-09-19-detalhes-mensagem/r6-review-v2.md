VEREDITO: RECUSADO

1 bloqueante. Os três bloqueantes da rodada 1 fecharam — conferi cada afirmação do planejador
abrindo `node_modules/ai/dist/index.d.ts` e `dist/index.js` e compilando um recorte real com `tsc`.
O ripple do `AgentCallStep` (`phase` + `stepNumber`) chegou em **todos** os passos de mobile.
O bloqueante novo é do próprio remédio do B2: o `prepareStep` como o plano manda escrever **não
compila**.

---

## Bloqueantes

### B1 (novo) — O `prepareStep` observador do passo 5 é erro de TypeScript

**Passo afetado:** 5 (instrumentação do `generateReply`). Também a nota de rodapé do passo 4 e o
texto de `## Correções da revisão (rodada 2) › B2`, que repetem a mesma afirmação como fato.

**O que está errado.** O passo 5 manda escrever, nas duas chamadas `generateText`:

```ts
prepareStep: ({ messages }) => {
  contextRecorder.push({ startedAt: new Date(), finishedAt: null, messages })
},
```

e blinda a escolha com uma nota obrigatória: *"O corpo é um bloco sem `return`, então devolve
`undefined`, e `undefined` significa 'use as settings de fora'. **Não** devolva um objeto aqui."*

A premissa "bloco sem `return` devolve `undefined`" é falsa em TypeScript: uma arrow com corpo em
bloco e nenhum `return` tem tipo de retorno inferido **`void`**, e `void` não é atribuível a
`PrepareStepResult<TOOLS> | PromiseLike<PrepareStepResult<TOOLS>>` — nem quando `PrepareStepResult`
inclui `| undefined`, porque `void` e `undefined` são tipos distintos para atribuição.

**Evidência — compilei o recorte contra o SDK real deste repo:**

`node_modules/ai/dist/index.d.ts:944-955` (o tipo do callback) e `:1023` (o `| undefined` que fecha
`PrepareStepResult`). Escrevi um arquivo com exatamente a forma do passo 5 dentro de
`/root/so/repos/ben-prototype/project-backend` e rodei
`npx tsc --noEmit --strict --target ES2024 --module ESNext --moduleResolution bundler --skipLibCheck --esModuleInterop`:

```
zz-prepare-step-check.ts(16,5): error TS2322: Type '({ messages }: { steps: StepResult<NoInfer<ToolSet>>[];
  stepNumber: number; model: LanguageModel; messages: ModelMessage[]; experimental_context: unknown; }) => void'
  is not assignable to type 'PrepareStepFunction<NoInfer<ToolSet>>'.
  Type 'void' is not assignable to type 'PrepareStepResult<NoInfer<ToolSet>> | PromiseLike<PrepareStepResult<NoInfer<ToolSet>>>'.
```

Acrescentando **uma linha** `return undefined` no fim do bloco, o mesmo arquivo compila `EXIT=0` —
e junto com ele compilam todas as outras leituras do passo 4 que eu exercitei no mesmo teste
(`step.usage.outputTokenDetails.reasoningTokens`, `step.request.body`, `step.response.id`,
`step.response.modelId`, `step.finishReason`, `[...(step.warnings ?? [])]`). Os arquivos temporários
foram removidos; nada do projeto foi tocado.

**Por que é bloqueante.** O item 5 da definição de pronto é `npx tsc --noEmit` limpo nos dois
projetos. O `sonnet` vai bater no TS2322 num ponto onde o plano afirma, com citação de linha, que
está tudo certo — então ele não vai suspeitar do plano, vai improvisar. As duas improvisações
naturais são as duas piores: `as any` / `as never` no callback (o plano proíbe `any` no passo 4, mas
não diz nada aqui), ou devolver um objeto para "satisfazer o tipo", que é exatamente o que o plano
proíbe porque mudaria o comportamento do agente. E é o mecanismo central do remédio do B2: se ele
desistir do `prepareStep`, `input.messages` volta a nascer vazio e o B2 reabre.

**O que mudar.** No passo 5, nas **duas** chamadas `generateText`, fechar o bloco com `return undefined`:

```ts
prepareStep: ({ messages }) => {
  contextRecorder.push({ startedAt: new Date(), finishedAt: null, messages })
  return undefined
},
```

e corrigir a nota de rodapé: o que devolve "use as settings de fora" é `undefined` **retornado
explicitamente**, não um bloco vazio. Mantém a proibição de devolver um objeto.

---

## Os três bloqueantes da rodada 1 — conferidos um a um

**B1 (tool calls só do último step) — FECHADO.** Confirmei linha a linha:
`node_modules/ai/dist/index.d.ts:828-937` é o `StepResult`, com `toolCalls`, `toolResults`, `text`,
`finishReason`, `usage`, `warnings`, `request: LanguageModelRequestMetadata` e
`response: LanguageModelResponseMetadata & { messages, body }` próprios de cada ida;
`:1151` traz `readonly steps`. `LanguageModelRequestMetadata` (`:133-138`) é `{ body?: unknown }` e
`LanguageModelResponseMetadata` (`:140-157`) tem `id: string` e `modelId: string` não-opcionais — os
`?? null` que caíram no passo 4 caíram com razão, e o `?? null` que ficou em `requestBody` é o único
genuíno. `LanguageModelUsage` (`:267-330`) tem mesmo `outputTokenDetails.reasoningTokens`, e
`asLanguageModelUsage` (`dist/index.js:2595-2616`) **sempre** constrói o objeto `outputTokenDetails`,
então o acesso direto de `buildUsage` não estoura em runtime. O `StepResultLike` do passo 4 bate
estruturalmente: o meu teste de compilação acima exercitou todos esses campos e passou.

**B2 (mensagens hard-coded) — FECHADO no desenho, com a ressalva do bloqueante acima.** O pareamento
por índice que o planejador pediu para eu reconferir **se sustenta**, e eu abri o laço para
confirmar. Em `node_modules/ai/dist/index.js:4390-4398`, dentro do `do {`, a primeira coisa da volta
é `await prepareStep({ model, steps, stepNumber: steps.length, messages: stepInputMessages, … })`;
em `:4691-4712`, no fim da mesma volta, `const stepNumber = steps.length` e
`steps.push(currentStepResult)`, e só então `onStepFinish`. Logo:

- uma chamada de `prepareStep` por volta, um `push` por volta, na mesma ordem → `recorded[i]` é o
  `result.steps[i]`;
- os retries do provider ficam **dentro** da volta e não re-disparam `prepareStep` nem empurram step
  extra, então não existe o caso inverso (step empurrado sem `prepareStep`);
- se uma ida falhar no meio, o `recorded` fica com **uma entrada a mais no fim** e `result.steps`
  com uma a menos — mas o builder do passo 4 itera `result.steps` e indexa `recorded`, então a
  sobra é ignorada. Não fura;
- `onStepFinish` escreve no último elemento do recorder, que é sempre o da volta corrente. Correto.

A expectativa da §10.2 ("a ida 2 da fase `context` tem 3 messages: `user`, `assistant` com a tool
call, `tool` com o resultado") também confere com o laço: `stepInputMessages = [...initialMessages,
...responseMessages]`, e `responseMessages` recebe a mensagem de assistant e a de tool entre as
voltas. E `messages` não inclui o system prompt, que o plano guarda à parte em `input.systemPrompt` —
coerente.

**B3 (porta 3000 → 3333) — FECHADO.** Os três `curl` da §10.2 vão para `3333` e a linha acima deles
cita a origem do valor. Não reabri `server.ts`/`.env.example`; a evidência é a do `r3-review.md`.

---

## O ripple — percorrido passo a passo, nenhum passo de UI ficou na forma antiga

Confiro aqui os passos de mobile contra o contrato novo da §3.1 (`AgentCallStep` = uma ida, com
`phase` e `stepNumber`; `AgentCallMessage = { role, text, content }`):

| Passo | Fala a forma nova? | Onde se vê |
|---|---|---|
| 19 — modelo do cliente | **Sim** | manda replicar "os tipos da §3.1", que já são os novos |
| 21 — hook | **Sim** (neutro) | só `ItemResponse<MessageTrace>`; não toca em step |
| 35 — meta strip | **Sim** | `trace.modelId`, `trace.latencyMs`, `trace.status` — campos do trace, não do step |
| 36 — aba Input | **Sim** | `Step ${step.stepNumber + 1} · ${step.phase}`; `step.input.messages` descrita como "o que o SDK entregou ao provider naquela ida"; `message.text` renderizado e `message.content` só via `CodeBlock` quando não é string; item 7 usa `step.input.requestBody` |
| 37 — aba Output | **Sim** | item 5 reescrito: a seção some na ida sem tool call e aparece na ida que chamou, com o texto explicando que sumir em todas é observação |
| 38 — casco | **Sim** | mapeia `trace.steps`; segmented control agora em `state.isLoading \|\| trace` com `disabled` |
| 30/31/32/33/34/39 | **N/A** | menu, store, pressable, skeleton e montagem não conhecem a forma do step |

O ponto 4 que o planejador pediu para reconferir (passo 36, item 3) está certo: o corpo renderiza
`message.text` num `Typography`, e `message.content` só entra em `CodeBlock`, guardado por
`typeof message.content !== 'string'`. Não sobrou nenhum `{message.content}` solto em passo nenhum.

Os rótulos e o roteiro do browser tester (§10.3, itens 5 e 8) também foram atualizados: falam de
"Step 1 · context", de três chips na meta strip e do segmented control presente no loading.

O estado vazio (passo 38, ramo `trace == null`) não depende da forma do step e continua válido.

---

## Não bloqueantes

1. **§2, desvio D5, contradiz o passo 23.** A tabela diz que `BenMessageMetadata.createdAt` é
   "**Obrigatório**, implementado"; o passo 23 manda escrever `createdAt?: string`, opcional. Os
   consumidores (passo 33, `item.metadata?.createdAt ?? null`; passo 32, que não renderiza a linha
   quando é `null`) tratam a ausência, então nada quebra — mas a tabela e o passo dizem coisas
   diferentes sobre o mesmo campo. Alinhe o texto de D5 com o passo.

2. **`MenuSheet` mora em outra pasta e o passo 38 não diz qual.** O caminho real é
   `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu/menu-sheet.tsx`
   (`export function MenuSheet({ children, className })`, linha 11) — pasta `menu/`, não
   `menu-settings/`, que é onde vive o `SettingsSheetOverlay` do passo 17. Todo outro componente do
   plano vem com caminho absoluto; este veio só pelo nome. Custa uma linha e evita o `sonnet`
   procurar no lugar errado ou criar um segundo.

3. **`StepResult` já tem `stepNumber` próprio, e ele não serve aqui.** `index.d.ts:828-831`
   (`readonly stepNumber: number`, zero-based **por chamada**). O passo 4 calcula
   `params.firstStepNumber + index`, que é o certo, porque a fase `format` recomeçaria do 0. Se o
   `sonnet` "simplificar" para `step.stepNumber`, a UI vai mostrar Step 1, Step 2, Step 1. Vale uma
   frase no passo 4 dizendo por que o campo do SDK foi ignorado de propósito.

4. **§10.2, `trace.modelId` é `openai/gpt-5.6-luna`.** Esse campo vem de
   `steps[último].response.modelId`, que é o id **devolvido pelo provider**, não o configurado; o
   OpenRouter pode normalizar a string. Se a verificação falhar só nisso, não é sinal de bug no
   trace. Transforme em "não vazio" ou deixe a ressalva escrita.

5. **Plano B do passo 16 usa `navigator.clipboard` sem falar de tipagem.** É caminho condicional
   (só se `npx expo install` falhar), mas em `project-mobile` o lib `dom` pode não estar nos
   `types`, e aí o fallback também não compila. Se o caminho for usado, o `sonnet` precisa saber que
   pode ter de mexer em tipos — ou o passo deve dizer para parar e reportar em vez de improvisar.

6. **Item 7 do passo 36 (`requestBody ?? step.input`) faz o `CodeBlock` recursar no próprio input.**
   Funciona (`step.input` é serializável), mas o fallback mostra um objeto que contém o system
   prompt inteiro repetido dentro da seção "Raw request JSON". Não quebra nada; só é ruído no caso
   raro de provider sem corpo HTTP.

---

## Premissas que assumi (não podia perguntar)

1. "Bloqueante" = o `sonnet`, executando o plano letra por letra, produz algo que não compila, que
   contradiz o briefing, ou que o obriga a improvisar num ponto onde o plano afirma certeza. O B1
   novo é os três ao mesmo tempo.
2. O aviso sobre `.env` está fora do meu escopo por instrução explícita do orquestrador
   (`r4-ambiente.md` resolveu). Não entrou no veredito.

## O que não deu para verificar (teto de janela em `status=handoff`)

- **Passos 6 a 14 (backend: entidade, use-cases, presenter, rota, `POST /chat`)** — não reabri nesta
  rodada. O `r3-review.md` os aprovou na rodada 1 e as "Correções da rodada 2" não os tocaram, salvo
  o campo `trace` no `MessageProps` (passo 6), que só depende do tipo da §3.1.
- **Passos 26 a 29 e 34 (primitivos e skeleton) contra os tokens reais do tema** — li o texto dos
  passos e confirmei `Typography`/`variantClasses`/`cn()` e `ItemDetailError`/`ItemDetailGone`, mas
  não fui atrás de cada classe (`bg-surface-container-high`, `bg-surface-error`, `text-text-error`)
  no `tailwind.config.js`. `bg-surface-error`/`text-text-error` aparecem no `ItemDetailError` real,
  então pelo menos essas existem.
- **`r1-design.md` não foi relido integralmente nesta rodada.** Julguei o ripple contra o contrato
  da §3.1 do próprio plano e contra a tabela de desvios já validada na rodada 1. O único desvio de
  design que a rodada 1 apontou (segmented control no loading) está corrigido no passo 38.
- **Não rodei `npx tsc --noEmit` nos dois projetos**, só o recorte isolado descrito no B1.
