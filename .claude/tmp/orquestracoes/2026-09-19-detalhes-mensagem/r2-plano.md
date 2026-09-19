# r2 — Plano de implementação: long-press na mensagem do Ben → "Ver input" / "Ver output" → bottom sheet com o trace da chamada ao modelo

Escrito para um implementador `sonnet` que **não viu** nenhum outro arquivo desta orquestração.
Todo caminho é absoluto. Todo nome de arquivo, função, campo e componente citado aqui foi lido no
repo real antes de ser escrito. Execute os passos **na ordem**; cada um tem uma verificação.

Referências que você **não precisa** abrir (já destiladas aqui): `briefing.md`, `r1-design.md`,
`r0-backend-dados.md`, `r0-mobile-chat.md` na mesma pasta. Se algo neste plano conflitar com o
design, **este plano vence** — os desvios estão listados na seção "Desvios conscientes do r1".

---

## 0. Resumo em cinco linhas

1. O backend passa a **capturar** o payload e a resposta crua de **cada ida ao provider** dentro das
   duas chamadas `generateText` do `BenAgentProviderService.generateReply` — são até três idas —, e
   grava isso como `trace` dentro de `MessageProps` da mensagem do Ben.
2. **Não há migração de banco**: a tabela `messages` do sqlite é genérica (`id`, `props`, `types`) e
   guarda `props` como JSON. Linhas antigas simplesmente não têm a chave `trace`.
3. Uma rota nova, `GET /messages/:id/trace`, devolve o trace por mensagem (200 com `trace: null`
   quando a mensagem é antiga; 404 quando o id não existe ou não é do usuário).
4. No mobile, long-press na bolha do Ben abre um menu flutuante ancorado com dois itens; cada item
   abre um bottom sheet de 90 % de altura com abas `Input | Output`, seções colapsáveis, JSON
   legível e botões de copiar.
5. `POST /chat` passa a devolver `messageId` para que a resposta recém-recebida (otimista, hoje com
   um `randomUUID()` de cliente) carregue o id real e possa ser inspecionada sem recarregar o app.

---

## 1. Premissas assumidas (não havia com quem confirmar; não pergunte, execute)

1. **Escopo da captura = fluxo de chat.** Só `generateReply` (rota `POST /chat`) é instrumentado.
   `generateTaskTurn` (workspace de tarefa) fica **sem** trace: as mensagens do workspace não são
   entidades `Message` (verificado: os únicos dois pontos que criam `Message` são
   `PersistUserMessageUseCase` e `PersistBenMessageUseCase`), e o long-press pedido é o da tela de
   chat.
2. **Falha da chamada ao modelo não é persistida.** Hoje, se `generateText` lança, a rota `POST /chat`
   propaga o erro e **nenhuma** mensagem do Ben é gravada — logo não existe mensagem para
   long-pressar. Os campos `status` e `error` existem no contrato e são sempre escritos como
   `'ok'` / `null` nesta iteração; o cliente implementa a banda de erro do design assim mesmo
   (custo zero, e permite persistir falhas depois sem mudar contrato). Capturar falhas exigiria
   gravar uma mensagem falsa do Ben — mudança de comportamento de produto, fora do escopo.
3. **Duas chamadas ao modelo, até três idas ao provider, um trace.** `generateReply` faz **duas**
   chamadas `generateText`: a fase `context` (com tools e `stopWhen: stepCountIs(2)`, logo até duas
   idas ao provider) e a fase `format` (com `Output.object`, uma ida). Um `AgentCallStep` do trace é
   **uma ida ao provider**, marcada com a fase a que pertence; a UI renderiza as seções do design
   uma vez por step, com um cabeçalho `Step N · fase`. Capturar por ida é o que permite ver as tool
   calls e o contexto real — ver o passo 4.
4. **`messageId` na resposta do `POST /chat`.** Sem isso, a bolha recém-criada tem id de cliente e o
   long-press nela cairia em 404. Isso não estava no design (é plumbing de dados) e é obrigatório
   para a definição de pronto ser verificável no app rodando.
5. **Idioma.** "Ver input" e "Ver output" em português (contrato do briefing). Todo o resto da copy
   nova em inglês, como o resto do app.
6. **Tema do menu:** claro (`surface-container-lowest`), não escuro. O Ben tem paleta única clara.

---

## 2. Desvios conscientes do r1 (design)

| # | O que o design pediu | O que este plano manda fazer | Por quê |
|---|---|---|---|
| D1 | Store em pasta `message-trace-store/index.ts` + `types.ts` | **Arquivo único** `src/pages/chat/stores/message-trace-store.ts` | `.claude/skills/code-write-code/coding-patterns/frontend-code-preferences.md` proíbe explicitamente pasta de store com só dois arquivos. Precedente idêntico: `src/layout/stores/menu-store.ts` |
| D2 | `CodeBlock` com degradê de fade no rodapé | **Sem degradê**; só `numberOfLines` + botão "Show more" | Gradiente em RN exige `expo-linear-gradient`, que não está instalado. Nova dependência só para decoração não se paga; o botão já sinaliza o corte |
| D3 | `MenuSheet className="h-[90%]"` | `<View style={{ height: windowHeight * 0.9 }}><MenuSheet className="flex-1">` | `h-[90%]` resolve contra o pai, e o pai (`Animated.View className="w-full"` do `SettingsSheetOverlay`) tem altura automática — a porcentagem não resolveria |
| D4 | `text-code` aplicado direto via className | Também **uma variante `code` no `Typography`** e a entrada `'code'` no grupo `font-size` do `cn()` | `src/layout/utils/styles.ts` lista explicitamente os tokens de `font-size` para o `tailwind-merge`; sem adicionar `'code'` lá, `cn('text-code', 'text-body-md')` não faz merge correto |
| D5 | `BenMessageMetadata.createdAt` "opcional" | Mantido **opcional** (`createdAt?: string`, passo 23), implementado | O timestamp do menu é o que correlaciona com o log do backend, e o custo é de 3 linhas; opcional porque mensagens já em memória antes da mudança não o têm, e os consumidores (`item.metadata?.createdAt ?? null`, passo 33; passo 32, que oculta a linha quando é `null`) já toleram a ausência |

---

## 3. O contrato de dados (decidido; copie os nomes exatamente)

### 3.1 Backend — tipos do trace

Arquivo novo: `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts`
(espelha `src/adapters/capture-view.ts`, que já é um arquivo de tipos puros no lado da porta).

```ts
export type AgentCallPhase = 'context' | 'format'

export type AgentCallStatus = 'ok' | 'error'

export type AgentCallMessage = {
  role: string
  text: string
  content: unknown
}

export type AgentCallToolDefinition = {
  name: string
  description: string
  inputSchema: unknown
}

export type AgentCallToolCall = {
  toolCallId: string
  toolName: string
  input: unknown
}

export type AgentCallToolResult = {
  toolCallId: string
  toolName: string
  output: unknown
}

export type AgentCallUsage = {
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  reasoningTokens: number | null
}

export type AgentCallStepInput = {
  systemPrompt: string
  messages: AgentCallMessage[]
  tools: AgentCallToolDefinition[]
  outputSchema: unknown | null
  requestBody: unknown | null
}

export type AgentCallStepOutput = {
  text: string
  object: unknown | null
  toolCalls: AgentCallToolCall[]
  toolResults: AgentCallToolResult[]
  finishReason: string
  warnings: unknown[]
}

export type AgentCallStep = {
  phase: AgentCallPhase
  stepNumber: number
  input: AgentCallStepInput
  output: AgentCallStepOutput
  modelId: string
  responseId: string
  usage: AgentCallUsage
  startedAt: string
  finishedAt: string
  latencyMs: number
}

export type AgentCallTrace = {
  status: AgentCallStatus
  error: string | null
  modelId: string | null
  startedAt: string
  finishedAt: string
  latencyMs: number
  totalUsage: AgentCallUsage
  steps: AgentCallStep[]
}
```

**Regra dura:** dentro de um `AgentCallTrace` só podem existir `string`, `number`, `boolean`, `null`,
arrays e objetos planos. **Nunca** um `Date` e **nunca** um `ID`. Motivo técnico verificado: o
`SqliteRepository.toInfra` (`src/infra/services/repositories/sqlite-repository.ts`, método privado
`serializeValue`) percorre recursivamente `props` e registra no mapa `types` todo caminho que for
`Date`/`ID`, e **lança erro** em qualquer `ValueObject`. Timestamps do trace são ISO strings
(`new Date().toISOString()`).

### 3.2 Backend — entidade

`MessageProps` ganha **um** campo: `trace: AgentCallTrace | null`.

### 3.3 Backend — resposta da rota nova

`GET /messages/:id/trace` → `200`:

```json
{ "item": { "id": "…", "role": "ben", "createdAt": "2026-09-19T18:41:02.881Z", "trace": { … } } }
```

- Mensagem existe mas nunca teve trace (linha antiga, ou mensagem do usuário): `200` com
  `"trace": null`.
- Id inexistente **ou** de outro usuário: `404` com `{"message":"RESOURCE_NOT_FOUND"}` (vem de graça
  do `ResourceNotFoundError` que `repository.get` lança + `errorHandler`).
- Sem headers de auth: `400`/`401` pelo `authMiddleware`, igual a todas as outras rotas.

### 3.4 Backend — `POST /chat`

A resposta ganha **um** campo: `messageId: string` (id da mensagem do Ben persistida).

### 3.5 Mobile — espelho dos tipos

`/root/so/repos/ben-prototype/project-mobile/src/api/models/message-trace.ts` replica **exatamente**
os tipos da §3.1 (mesmos nomes de tipo e de campo), mais:

```ts
export interface MessageTrace {
  id: string
  role: MessageRole
  createdAt: string
  trace: AgentCallTrace | null
}
```

---

## 4. Passos — BACKEND

Diretório de trabalho: `/root/so/repos/ben-prototype/project-backend`.

### Passo 1 — Criar os tipos do trace

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-call-trace.ts`
**O que:** exatamente o bloco de código da §3.1.
**Verificação:** `npx tsc --noEmit` continua passando (arquivo isolado, ninguém importa ainda).

### Passo 2 — Estender a porta do agente

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/adapters/agent-provider.ts`
**O que:**
- `import { AgentCallTrace } from '@/adapters/agent-call-trace'` no topo.
- Adicionar, logo depois do type `AgentReply`:
  ```ts
  export type GenerateReplyResult = {
    reply: AgentReply
    trace: AgentCallTrace
  }
  ```
- Na interface `AgentService`, trocar a assinatura para:
  ```ts
  generateReply(payload: GenerateReplyPayload): Promise<GenerateReplyResult>
  ```
  `generateTaskTurn` **não muda**.

**Verificação:** `npx tsc --noEmit` agora **falha** em dois lugares esperados
(`src/infra/services/ben-agent-provider/index.ts` e `src/infra/http/routes/chat.ts`). Isso é o
sinal de que a mudança de contrato foi propagada pelo compilador; os passos 4 e 13 fecham os dois.

### Passo 3 — Expor o schema da tool para o trace

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/generate-reply/history-context-tool.ts`
**O que:** extrair para o escopo do módulo o que hoje está inline dentro de `tool({...})`, sem mudar
comportamento:

```ts
import { ResolveHistoryContext } from '@/adapters/agent-provider'
import { tool } from 'ai'
import { z } from 'zod'

export const HISTORY_CONTEXT_TOOL_NAME = 'get-history-context'

export const HISTORY_CONTEXT_TOOL_DESCRIPTION =
  'Busque o histórico relacionado a um conjunto de tópicos antes de responder. Use no máximo uma vez por mensagem.'

export const historyContextInputSchema = z.object({
  topics: z.array(z.string()),
})

export const buildHistoryContextTool = (
  resolveHistoryContext: ResolveHistoryContext,
) =>
  tool({
    description: HISTORY_CONTEXT_TOOL_DESCRIPTION,
    inputSchema: historyContextInputSchema,
    execute: ({ topics }) => resolveHistoryContext({ topics }),
  })
```

**Verificação:** `npx tsc --noEmit` não introduz erro novo neste arquivo.

### Passo 4 — Escrever os construtores do trace

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/trace-builders.ts`

Fica na raiz da pasta do serviço porque é helper compartilhado pelas duas fases — é o que manda
`.claude/skills/code-get-coding-designs/designs/service-structure.md`.

**Leia estes três parágrafos antes de escrever o arquivo; eles são a razão de o builder ter a forma
que tem.**

Um `AgentCallStep` é **uma ida ao provider**, não uma chamada `generateText`. A chamada de contexto
usa `stopWhen: stepCountIs(2)`, então faz **até duas** idas. Os campos do topo do retorno de
`generateText` — `text`, `toolCalls`, `toolResults`, `finishReason`, `usage` — são **só da última
ida**: está escrito nos comentários do tipo, `node_modules/ai/dist/index.d.ts:1049-1116`
("in the last step"). Quem carrega todas é `result.steps`
(`node_modules/ai/dist/index.d.ts:1151-1154`: `readonly steps: Array<StepResult<TOOLS>>`), e cada
`StepResult` (`node_modules/ai/dist/index.d.ts:828-937`) tem os seus próprios `toolCalls`,
`toolResults`, `text`, `finishReason`, `usage`, `warnings`, `request.body` e `response.id|modelId`.
Ler do topo faria a seção "Tool calls" nascer vazia no caso exato que interessa: no fluxo normal a
tool é chamada na ida 1 e o texto sai na ida 2.

As **mensagens** que o modelo viu em cada ida não estão no resultado; elas chegam pelo callback
`prepareStep`, que o SDK invoca no começo de cada ida com
`messages: Array<ModelMessage>` = "The messages that will be sent to the model for the current step"
(`node_modules/ai/dist/index.d.ts:960-981`). Quem grava é o `generateReply` (passo 5); este arquivo
só recebe o que foi gravado. O pareamento é **por índice**: `prepareStep` é chamado no topo do laço
e `steps.push(...)` no fim da mesma volta (`node_modules/ai/dist/index.js:4394` e `:4712`), logo
`recorded[i]` corresponde a `result.steps[i]`.

**Não importe `ModelMessage`.** Ele não é re-exportado por `ai` e `@ai-sdk/provider-utils` não é
dependência direta deste projeto (conferido no `package.json`). Tipe as mensagens gravadas
estruturalmente, como abaixo — `ModelMessage[]` é atribuível a isso.

```ts
import {
  AgentCallMessage,
  AgentCallPhase,
  AgentCallStep,
  AgentCallToolDefinition,
  AgentCallTrace,
  AgentCallUsage,
} from '@/adapters/agent-call-trace'

type UsageLike = {
  inputTokens: number | undefined
  outputTokens: number | undefined
  totalTokens: number | undefined
  outputTokenDetails: { reasoningTokens: number | undefined }
}

type StepResultLike = {
  text: string
  toolCalls: readonly { toolCallId: string; toolName: string; input: unknown }[]
  toolResults: readonly {
    toolCallId: string
    toolName: string
    output: unknown
  }[]
  finishReason: string
  usage: UsageLike
  warnings: readonly unknown[] | undefined
  request: { body?: unknown }
  response: { id: string; modelId: string }
}

type GenerateTextResultLike = {
  steps: readonly StepResultLike[]
}

export type RecordedStep = {
  startedAt: Date
  finishedAt: Date | null
  messages: readonly { role: string; content: unknown }[]
}

function flattenContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return JSON.stringify(content ?? null, null, 2)

  return content
    .map((part) => {
      const candidate = part as { type?: string; text?: string }
      if (candidate.type === 'text' || candidate.type === 'reasoning') {
        return candidate.text ?? ''
      }
      return JSON.stringify(part, null, 2)
    })
    .join('\n')
}

function buildMessages(
  messages: readonly { role: string; content: unknown }[],
): AgentCallMessage[] {
  return messages.map((message) => ({
    role: message.role,
    text: flattenContent(message.content),
    content: message.content,
  }))
}

function buildUsage(usage: UsageLike): AgentCallUsage {
  return {
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
    reasoningTokens: usage.outputTokenDetails.reasoningTokens ?? null,
  }
}

function sumUsage(steps: AgentCallStep[]): AgentCallUsage {
  const add = (a: number | null, b: number | null) =>
    a === null && b === null ? null : (a ?? 0) + (b ?? 0)

  return steps.reduce<AgentCallUsage>(
    (acc, step) => ({
      inputTokens: add(acc.inputTokens, step.usage.inputTokens),
      outputTokens: add(acc.outputTokens, step.usage.outputTokens),
      totalTokens: add(acc.totalTokens, step.usage.totalTokens),
      reasoningTokens: add(acc.reasoningTokens, step.usage.reasoningTokens),
    }),
    {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      reasoningTokens: null,
    },
  )
}

export function buildAgentCallSteps(params: {
  phase: AgentCallPhase
  systemPrompt: string
  tools: AgentCallToolDefinition[]
  outputSchema: unknown | null
  object: unknown | null
  result: GenerateTextResultLike
  recorded: readonly RecordedStep[]
  firstStepNumber: number
  fallbackAt: Date
}): AgentCallStep[] {
  const lastIndex = params.result.steps.length - 1

  return params.result.steps.map((step, index) => {
    const recorded = params.recorded[index]
    const startedAt = recorded?.startedAt ?? params.fallbackAt
    const finishedAt =
      recorded?.finishedAt ??
      params.recorded[index + 1]?.startedAt ??
      params.fallbackAt

    return {
      phase: params.phase,
      stepNumber: params.firstStepNumber + index,
      input: {
        systemPrompt: params.systemPrompt,
        messages: buildMessages(recorded?.messages ?? []),
        tools: params.tools,
        outputSchema: params.outputSchema,
        requestBody: step.request.body ?? null,
      },
      output: {
        text: step.text,
        object: index === lastIndex ? params.object : null,
        toolCalls: step.toolCalls.map((toolCall) => ({
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          input: toolCall.input,
        })),
        toolResults: step.toolResults.map((toolResult) => ({
          toolCallId: toolResult.toolCallId,
          toolName: toolResult.toolName,
          output: toolResult.output,
        })),
        finishReason: step.finishReason,
        warnings: [...(step.warnings ?? [])],
      },
      modelId: step.response.modelId,
      responseId: step.response.id,
      usage: buildUsage(step.usage),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      latencyMs: finishedAt.getTime() - startedAt.getTime(),
    }
  })
}

export function buildAgentCallTrace(params: {
  steps: AgentCallStep[]
  startedAt: Date
  finishedAt: Date
}): AgentCallTrace {
  return {
    status: 'ok',
    error: null,
    modelId: params.steps[params.steps.length - 1]?.modelId ?? null,
    startedAt: params.startedAt.toISOString(),
    finishedAt: params.finishedAt.toISOString(),
    latencyMs: params.finishedAt.getTime() - params.startedAt.getTime(),
    totalUsage: sumUsage(params.steps),
    steps: params.steps,
  }
}
```

Três decisões deste arquivo, para você não "consertar" por engano:

- `object` só entra no **último** step da fase, porque `result.output` é o produto da chamada
  inteira, não de uma ida isolada. Nas outras idas é `null`.
- `stepNumber` vem de `params.firstStepNumber + index`, **não** de `step.stepNumber` do próprio SDK.
  `StepResult` já tem um `stepNumber` (`node_modules/ai/dist/index.d.ts:828-831`), mas é zero-based
  **por chamada** `generateText` — usá-lo faria a fase `format` recomeçar do 0 e a UI mostraria
  "Step 1 · context, Step 2 · context, Step 1 · format" em vez da numeração contínua que o passo 5
  monta com `firstStepNumber: contextSteps.length`. Não "simplifique" para `step.stepNumber`.
- `modelId` e `responseId` são `string` sem `?? null`: em
  `node_modules/ai/dist/index.d.ts:140-152` os dois são obrigatórios em
  `LanguageModelResponseMetadata`. O mesmo vale para `finishReason`, que é `FinishReason`
  (`:1101-1103`), nunca nulo.
- `requestBody` é `step.request.body` (`node_modules/ai/dist/index.d.ts:133-138`: "Request HTTP body
  that was sent to the provider API"). É o corpo literal que saiu para o OpenRouter — a prova mais
  crua do que o modelo recebeu. Pode vir `undefined` em provider sem HTTP; por isso o `?? null`,
  que aqui **não** é morto.

Se o `tsc` reclamar do formato de `StepResultLike` contra o retorno real de `generateText`,
**não** afrouxe para `any`: ajuste o tipo estrutural ao que o compilador aponta.

**Verificação:** `npx tsc --noEmit` não acusa erro **dentro deste arquivo**.

### Passo 5 — Instrumentar `generateReply`

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/index.ts`
**O que:**
- Remover **os quatro** `console.log` e os dois comentários `// keeping for debugging` (linhas 33-42 e
  51-55 do arquivo atual). Eles viram o dado persistido; manter os dois é ruído em stdout de produção.
- Importar `z` de `zod`, `buildAgentCallSteps`/`buildAgentCallTrace`/`RecordedStep` de
  `./trace-builders`, e de `./generate-reply/history-context-tool` importar também
  `HISTORY_CONTEXT_TOOL_NAME`, `HISTORY_CONTEXT_TOOL_DESCRIPTION` e `historyContextInputSchema`.
  `agentReplySchema` e `buildHistoryContextTool` já estão importados.
- `generateReply` passa a retornar `Promise<GenerateReplyResult>`:

```ts
async generateReply(payload: GenerateReplyPayload): Promise<GenerateReplyResult> {
  const traceStartedAt = new Date()
  const contextSystemPrompt = buildSystemPrompt(payload.topicIndex)
  const contextRecorder: RecordedStep[] = []

  const contextResult = await generateText({
    model: this.model,
    system: contextSystemPrompt,
    prompt: payload.message,
    tools: {
      'get-history-context': buildHistoryContextTool(
        payload.resolveHistoryContext,
      ),
    },
    toolChoice: 'auto',
    stopWhen: stepCountIs(2),
    prepareStep: ({ messages }) => {
      contextRecorder.push({
        startedAt: new Date(),
        finishedAt: null,
        messages,
      })
      return undefined
    },
    onStepFinish: () => {
      const current = contextRecorder[contextRecorder.length - 1]
      if (current) current.finishedAt = new Date()
    },
  })

  const contextSteps = buildAgentCallSteps({
    phase: 'context',
    systemPrompt: contextSystemPrompt,
    tools: [
      {
        name: HISTORY_CONTEXT_TOOL_NAME,
        description: HISTORY_CONTEXT_TOOL_DESCRIPTION,
        inputSchema: z.toJSONSchema(historyContextInputSchema),
      },
    ],
    outputSchema: null,
    object: null,
    result: contextResult,
    recorded: contextRecorder,
    firstStepNumber: 0,
    fallbackAt: new Date(),
  })

  const formatSystemPrompt = buildFormatSystemPrompt()
  const formatRecorder: RecordedStep[] = []

  const result = await generateText({
    model: this.model,
    system: formatSystemPrompt,
    prompt: contextResult.text,
    output: Output.object({ schema: agentReplySchema }),
    prepareStep: ({ messages }) => {
      formatRecorder.push({
        startedAt: new Date(),
        finishedAt: null,
        messages,
      })
      return undefined
    },
    onStepFinish: () => {
      const current = formatRecorder[formatRecorder.length - 1]
      if (current) current.finishedAt = new Date()
    },
  })

  const formatSteps = buildAgentCallSteps({
    phase: 'format',
    systemPrompt: formatSystemPrompt,
    tools: [],
    outputSchema: z.toJSONSchema(agentReplySchema),
    object: result.output,
    result,
    recorded: formatRecorder,
    firstStepNumber: contextSteps.length,
    fallbackAt: new Date(),
  })

  return {
    reply: result.output,
    trace: buildAgentCallTrace({
      steps: [...contextSteps, ...formatSteps],
      startedAt: traceStartedAt,
      finishedAt: new Date(),
    }),
  }
}
```

Quatro notas de implementação:

- **`prepareStep` é observador, não configurador.** Um bloco sem `return` tem tipo de retorno
  inferido `void`, e `void` **não** compila contra `PrepareStepResult<TOOLS> | PromiseLike<…> |
  undefined` (`tsc` acusa TS2322) — por isso as duas chamadas acima terminam o corpo com
  `return undefined` explícito. É esse `undefined` retornado, não um bloco vazio, que significa "use
  as settings de fora" (`node_modules/ai/dist/index.d.ts:955-958` e
  `node_modules/ai/dist/index.js:4394-4427`). Nada do comportamento do agente muda. **Não** devolva um
  objeto aqui.
- **Um recorder por chamada `generateText`.** Os dois arrays são locais ao método, então duas
  requisições concorrentes não se misturam.
- **A chave de `tools` continua sendo a string literal `'get-history-context'`.** A constante
  `HISTORY_CONTEXT_TOOL_NAME` (passo 3) é usada só para preencher o trace; assim não há risco de o
  `tsc` estreitar mal o `ToolSet` por causa de chave computada.
- **`z.toJSONSchema` funciona** neste repo (zod 4; verificado em runtime com
  `node -e "const {z}=require('zod'); z.toJSONSchema(z.object({topics:z.array(z.string())}))"` dentro
  de `project-backend`, que devolve JSON Schema draft 2020-12). Não há plano B e você não precisa de
  um.

**Quantos steps o trace vai ter.** No fluxo normal, **três**: `context` #1 (o modelo chama
`get-history-context`), `context` #2 (o modelo escreve o texto com o histórico em mãos) e `format`
#3. Se o modelo decidir **não** chamar a tool, a fase `context` termina numa ida só e o trace tem
**dois** steps. As duas coisas são observação legítima — não trate a contagem como invariante.

**Verificação:** `npx tsc --noEmit` — o erro que restava neste arquivo (passo 2) some.

### Passo 6 — Campo `trace` na entidade `Message`

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/domain/entities/message.ts`
**O que:** importar `AgentCallTrace` de `@/adapters/agent-call-trace` e acrescentar a `MessageProps`,
**depois de `capture`**:
```ts
  trace: AgentCallTrace | null
```
Nada mais muda no arquivo.

**Verificação:** `npx tsc --noEmit` agora acusa erro em **três** lugares esperados:
`persist-user-message.ts`, `persist-ben-message.ts` (falta a prop no `create`) e
`message-presenter.ts` (o `Omit<Serialize<WithID<MessageProps>>, 'userId'>` exige que a prop nova
seja serializada ou omitida — é exatamente o mecanismo descrito em
`.claude/skills/code-write-code/coding-patterns/http-presenter.md`). Os passos 7, 8 e 9 fecham os três.

### Passo 7 — `PersistUserMessageUseCase`

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/messages/persist-user-message.ts`
**O que:** no objeto passado a `this.messageRepository.create({...})`, acrescentar `trace: null,`
depois de `capture: null,`. O `Payload` **não** muda.

### Passo 8 — `PersistBenMessageUseCase`

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/messages/persist-ben-message.ts`
**O que:**
- `import { AgentCallTrace } from '@/adapters/agent-call-trace'`.
- `Payload` ganha `trace?: AgentCallTrace | null`.
- No `create({...})`, acrescentar `trace: payload.trace ?? null,`.

### Passo 9 — Esconder o trace da listagem de mensagens

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/message-presenter.ts`
**O que:** o trace **não** vai em `GET /messages/list` (inflaria cada página do histórico). Trocar o
tipo de retorno de `toHttp` para:
```ts
  ): OverWrite<
    Omit<Serialize<WithID<MessageProps>>, 'userId' | 'trace'>,
    { capture: CaptureView | null }
  > {
```
O corpo do método **não** muda.

**Verificação:** `cd /root/so/repos/ben-prototype/project-backend && npx tsc --noEmit` — restam só os
erros de `chat.ts` (fechado no passo 13).

### Passo 10 — Use-case de leitura do trace

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-backend/src/domain/use-cases/messages/get-message-trace.ts`

```ts
import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  messageId: string
}

export class GetMessageTraceUseCase implements UseCase<ItemResponse<Message>> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Message>> {
    const item = await this.messageRepository.get({
      id: createID(payload.messageId),
      userId: createID(payload.userId),
    })

    return { item }
  }
}
```

A consulta composta `id + userId` é a regra de ownership de
`.claude/skills/code-write-code/coding-patterns/backend-code-preferences.md`; `get` lança
`ResourceNotFoundError`, que o `errorHandler` mapeia para 404. É o mesmo desenho de
`src/domain/use-cases/captures/get-note-detail.ts`.

### Passo 11 — Presenter do trace

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/message-trace-presenter.ts`

```ts
import { Message, MessageProps } from '@/domain/entities/message'
import { Serialize, WithID } from '@/modules/domain/types'

export class MessageTracePresenter {
  static toHttp(
    message: Message,
  ): Omit<Serialize<WithID<MessageProps>>, 'userId' | 'content' | 'capture'> {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      createdAt: message.props.createdAt.toISOString(),
      trace: message.props.trace ?? null,
    }
  }
}
```

O `?? null` **não é decoração**: linhas gravadas antes desta feature não têm a chave `trace` no JSON
de `props`, então `message.props.trace` é `undefined` em runtime mesmo o tipo dizendo
`AgentCallTrace | null`. Sem o `?? null`, a rota devolveria a chave ausente e o cliente veria
`undefined`.

### Passo 12 — Rota HTTP

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/messages/get-message-trace.ts`

```ts
import { GetMessageTraceUseCase } from '@/domain/use-cases/messages/get-message-trace'
import { MessageTracePresenter } from '@/infra/http/presenters/message-trace-presenter'
import { messageRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const messageParamsSchema = z.object({
  id: z.string(),
})

const getMessageTraceUseCase = new GetMessageTraceUseCase(messageRepository)

export async function getMessageTrace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getMessageTraceUseCase.execute({
      userId: req.userId,
      messageId: messageParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: MessageTracePresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/http/app.ts`
**O que:** importar `getMessageTrace` e registrar **logo abaixo** da linha
`app.get('/messages/list', authMiddleware, listMessages)`:
```ts
app.get('/messages/:id/trace', authMiddleware, getMessageTrace)
```

### Passo 13 — `POST /chat`: passar o trace e devolver o `messageId`

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/http/routes/chat.ts`
**O que:**
1. Trocar
   ```ts
   const reply = await agentService.generateReply({ … })
   ```
   por
   ```ts
   const { reply, trace } = await agentService.generateReply({ … })
   ```
   (o objeto de argumentos não muda).
2. Em `persistBenMessageUseCase.execute({...})`, acrescentar `trace,` depois de `capture: …`.
3. Trocar a resposta final por:
   ```ts
   return res
     .status(HttpStatus.OK)
     .json(
       AgentReplyPresenter.toHttp(
         reply,
         primaryCapture,
         benMessageResult.item.id.toValue(),
       ),
     )
   ```

**Arquivo:** `/root/so/repos/ben-prototype/project-backend/src/infra/http/presenters/agent-reply-presenter.ts`
**O que:** terceiro parâmetro `messageId: string`, tipo de retorno
`AgentReply & { capture: CaptureView | null; messageId: string }`, e `messageId,` no objeto devolvido.

### Passo 14 — Fechar o backend

```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix
cd /root/so/repos/ben-prototype/project-backend && npx tsc --noEmit
```
**Verificação:** ambos passam sem erro. **Não** rode `prisma migrate`: a tabela `messages` é
`id TEXT PRIMARY KEY, props TEXT, types TEXT` (ver
`prisma/migrations/20260913024102_init/migration.sql`) e `props` guarda o JSON inteiro de
`MessageProps`; um campo novo não altera o schema físico. Linhas antigas continuam legíveis: o
`toDomain` faz `JSON.parse(row.props)` e simplesmente não encontra a chave `trace`.

---

## 5. Passos — MOBILE: tokens, dependências e props novas

Diretório de trabalho: `/root/so/repos/ben-prototype/project-mobile`.

### Passo 15 — Token de fonte `code`

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/tailwind.config.js`
**O que:** em `theme.extend.fontSize`, depois de `'label-caps'`:
```js
        code: ['13px', { lineHeight: '20px', fontWeight: '400' }],
```

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/layout/utils/styles.ts`
**O que:** acrescentar `'code'` ao array `text: [...]` do grupo `font-size` (sem isso o
`tailwind-merge` não reconhece `text-code` como classe de tamanho de fonte e o `cn()` não resolve
conflitos corretamente).

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/typography.tsx`
**O que:** acrescentar `'code'` à union `TypographyVariant` e
`code: 'text-code font-mono'` ao mapa `variantClasses`.

**Arquivo:** `/root/so/repos/ben-prototype/.claude/agents-docs/design-advisor/design.md`
**O que:** no bloco `typography:` do frontmatter, acrescentar a entrada `code` descrevendo
JetBrains Mono 13/20, **preservando o formato das entradas vizinhas** (leia o bloco antes de editar e
copie o estilo; não reformate o arquivo).

**Verificação:** `npx tsc --noEmit` passa.

### Passo 16 — Clipboard

```bash
cd /root/so/repos/ben-prototype/project-mobile && npx expo install expo-clipboard
```
Não existe clipboard no projeto hoje (`expo-clipboard` não está no `package.json` e não há nenhum
`Clipboard` em `src/`); o `Clipboard` do core do React Native foi removido, não é opção.

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/services/clipboard-service.ts`
(a pasta `src/services/` é, por convenção do repo, o único lugar que importa SDK nativo — ver
`.claude/skills/code-get-coding-designs/designs/mobile-services-layer-structure.md` e o precedente
`notifications-service.ts`):

```ts
import * as Clipboard from 'expo-clipboard'

export async function copyTextToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text)
}
```

**Não crie um `clipboard-service.web.ts`.** Os quatro serviços que já existem em `src/services/` têm
par `.web.ts` porque o SDK nativo deles quebra no navegador; `expo-clipboard` suporta web, e um
`.web.ts` no-op criado por mimetismo mataria o copiar justamente na plataforma em que o browser
tester roda.

**Se e só se o `npx expo install` falhar por falta de rede:** não instale nada e crie o serviço com a
API web, que é o que o teste na porta 8081 exerce:
```ts
export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
```
e **registre isso explicitamente no relatório final** como pendência (quebra em nativo).
`navigator` vem da lib `dom`, que pode não estar em `tsconfig.json` › `compilerOptions.types` de
`project-mobile`; se `npx tsc --noEmit` acusar erro por causa disso, **não invente** um `as any` ou um
ambient `declare` — pare e registre no relatório que este caminho (só ativado por falta de rede) exige
mexer em `tsconfig.json`, e que decisão é do orquestrador/usuário, não sua.

**Verificação:** `npx tsc --noEmit` passa.

### Passo 17 — `slideOffset` no overlay

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-settings/settings-sheet-overlay.tsx`
**O que:** `SettingsSheetOverlayProps` ganha `slideOffset?: number`; o componente passa a fazer
`const offset = slideOffset ?? SLIDE_OFFSET` e usa `offset` nos **dois** lugares onde hoje está
`SLIDE_OFFSET`: a linha 24 (`useSharedValue(SLIDE_OFFSET)`) e a linha 32
(`translateY.value = SLIDE_OFFSET`, no `else`). A linha 29 é `withTiming(0, …)` e **não** muda — não
procure uma terceira ocorrência. Inclua `offset` no array de dependências do `useEffect`. A constante `SLIDE_OFFSET = 600` continua existindo como default.
**Verificação:** a tela de menu (`/menu`) continua abrindo detalhe de nota e settings normalmente
(checado no passo de browser, no fim).

### Passo 18 — `message` no `ItemDetailGone`

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu-detail/item-detail-gone.tsx`
**O que:** aceitar `{ message }: { message?: string }` e renderizar
`{message ?? "this one's gone — must've been cleared elsewhere."}` (mantenha o escape de aspas como
está hoje: `must&apos;ve`). Retrocompatível: as duas chamadas existentes (`note-detail.tsx`,
`reminder-detail.tsx`) não mudam.

---

## 6. Passos — MOBILE: contratos e dados

### Passo 19 — Modelo do trace no cliente

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/api/models/message-trace.ts`
**O que:** os tipos da §3.1 (mesmos nomes) + a interface `MessageTrace` da §3.5, importando
`MessageRole` de `@/api/models/message`. Use `interface` para os objetos e `type` para as unions,
como nos outros arquivos de `src/api/models/`.

### Passo 20 — Rota no mapa de rotas

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/api/routes.ts`
**O que:** em `messages`, acrescentar:
```ts
    trace: (id: string) => `/messages/${id}/trace`,
```

### Passo 21 — Hook de busca

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/layout/hooks/api/use-message-trace-data.ts`

```ts
import type { MessageTrace } from '@/api/models/message-trace'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useMessageTraceData(messageId: string) {
  return useAPIRequest<ItemResponse<MessageTrace>>({
    url: API_ROUTES.messages.trace(messageId),
  })
}
```

Cópia exata da forma de `src/layout/hooks/api/use-note-detail-data.ts`.

**Quando o trace é buscado: na abertura do sheet, não no long-press e não junto do histórico.**
Justificativa, que vale escrever no PR:
- junto do histórico multiplicaria cada página de 20 mensagens pelo tamanho de dois payloads de
  modelo — o `GET /messages/list` deixaria de ser barato para todo mundo, por causa de uma
  ferramenta de debug usada de vez em quando;
- no long-press seria fetch em gesto exploratório: abrir o menu e fechar sem escolher nada já teria
  pago a requisição;
- na abertura do sheet o custo é pago exatamente quando alguém pediu para ver. O `useAPIRequest` tem
  `staleTime` de 5 min, então reabrir a mesma mensagem (o caso comum: ver input, fechar, ver output)
  é instantâneo e sem rede.

O hook é montado pelo `MessageTraceSheet`, que só existe quando o sheet está aberto (§7, passo 31).

### Passo 22 — `messageId` na resposta do chat

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/api/responses/agent-reply.ts`
**O que:** `AgentReply` ganha `messageId: string`.

### Passo 23 — `createdAt` no metadata da mensagem de UI

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/utils/chat-messages.ts`
**O que:** `BenMessageMetadata` passa a ser:
```ts
export type BenMessageMetadata = {
  capture?: MessageCapture
  createdAt?: string
}
```

### Passo 24 — Histórico → UI: `createdAt` e deduplicação

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/hooks/use-chat-messages.ts`
**O que:**
1. `mapHistoryToUiMessages` passa a montar sempre o metadata:
   ```ts
   metadata: { capture: message.capture, createdAt: message.createdAt },
   ```
   (`capture` opcional continua podendo ser `undefined` — o tipo já permite).
2. No `useMemo`, filtrar do histórico as mensagens cujo id já está em `sessionMessages`:
   ```ts
   const sessionIds = new Set(sessionMessages.map((message) => message.id))
   const historyOldestFirst = [...historyState.items].reverse()
   return [
     ...mapHistoryToUiMessages(historyOldestFirst).filter(
       (message) => !sessionIds.has(message.id),
     ),
     ...sessionMessages,
   ]
   ```
   **Por que isso é obrigatório:** a partir do passo 25 a bolha otimista do Ben passa a usar o id real
   do backend. Se o `GET /messages/list` for refetchado enquanto a sessão ainda está viva
   (React Query refaz a query no foco da janela), a mesma mensagem apareceria duas vezes na
   `FlatList` — agora com a **mesma** `key`. O filtro elimina a duplicata (que hoje já existiria
   visualmente, só que com ids diferentes).

### Passo 25 — Bolha otimista com o id real

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/stores/messages-store/message-builders.ts`
**O que:**
```ts
export function buildUserMessage(text: string): BenUiMessage {
  return {
    id: randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text }],
    metadata: { createdAt: new Date().toISOString() },
  }
}

export function buildBenMessage(
  id: string,
  text: string,
  capture?: CaptureView | null,
): BenUiMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
    metadata: { capture: capture ?? undefined, createdAt: new Date().toISOString() },
  }
}
```

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/stores/messages-store/dispatch-reply.ts`
**O que:** trocar `buildBenMessage('', reply.capture)` por
`buildBenMessage(reply.messageId, '', reply.capture)`. O resto do arquivo (incluindo
`animateReply(set, get, benMessage.id, reply.message)`) não muda.

**Verificação dos passos 19-25:** `npx tsc --noEmit` passa.

---

## 7. Passos — MOBILE: primitivos de UI

Todos em `/root/so/repos/ben-prototype/project-mobile/src/layout/components/ui/` (a pasta já é a
reserva de primitivos genéricos: `button`, `icon-button`, `typography`). **Nenhum deles pode ter
`w-full`, `max-w-*` ou margem de página embutidos** — regra do repo: primitivo é genérico, o call
site aplica o espaçamento via `className`.

Ícones: `lucide-react-native` **não herda** classe de cor do NativeWind, então toda cor de ícone vem
como prop `color` com um hex de `@/layout/utils/colors` (`onSurfaceVariant`, `textError`, …). É o
padrão `mobile-icon-colors` do repo. `AlertTriangle` **não existe** nesta versão do lucide — use
`CircleAlert`.

### Passo 26 — `segmented-control.tsx`

```tsx
type SegmentedControlOption<Value extends string> = {
  value: Value
  label: string
}

type SegmentedControlProps<Value extends string> = {
  value: Value
  options: SegmentedControlOption<Value>[]
  onChange: (value: Value) => void
  disabled?: boolean
  className?: string
}
```
- Container: `flex-row rounded-lg bg-surface-container p-1`, mais `opacity-60` quando `disabled`,
  mais o `className` recebido, via `cn()`.
- Cada segmento: `Pressable` com `accessibilityRole="tab"`, `disabled={disabled}`,
  `accessibilityState={{ selected: isActive, disabled }}`, `accessibilityLabel={option.label}`,
  className `h-11 flex-1 items-center justify-center rounded-md` + `bg-surface-container-lowest`
  quando ativo.
- `disabled` existe por causa do estado de carregamento do sheet (passo 38): o design pede o
  controle **presente e desabilitado** enquanto o trace carrega.
- Rótulo: `<Typography variant="button-text" className={isActive ? 'text-on-surface' : 'text-on-surface-variant'}>`.

**Verificação:** `npx tsc --noEmit`.

### Passo 27 — `copy-button.tsx`

```tsx
type CopyButtonProps = { value: string }
```
- `useState(false)` para `isCopied`; ao pressionar, `void copyTextToClipboard(value).catch(() => {})`,
  `setIsCopied(true)` e um `setTimeout(() => setIsCopied(false), 1500)` guardado em `useRef` e
  limpo no `useEffect` de unmount.
- Render: `<IconButton label={isCopied ? 'Copied' : 'Copy'} className="size-11" onPress={…}>` com
  `{isCopied ? <Check size={16} color={onSurfaceVariant} /> : <Copy size={16} color={onSurfaceVariant} />}`.
  A mudança é de **forma**, não só de cor — exigência de acessibilidade do design.

### Passo 28 — `code-block.tsx`

```tsx
type CodeBlockProps = { value: unknown; showCopy?: boolean }
```
- `const text = useMemo(() => JSON.stringify(value ?? null, null, 2), [value])`
  (o `value ?? null` já cobre `JSON.stringify(undefined)`; **não** acrescente um `?? 'null'` depois
  da chamada — `JSON.stringify(null)` devolve a string `'null'`, nunca `undefined`).
- Container: `rounded-lg bg-surface-container-low p-3 gap-2`. Sem borda, sem sombra — camada tonal.
- Texto: `<Typography variant="code" className="text-on-surface" selectable numberOfLines={isExpanded ? undefined : MAX_LINES}>` com `const MAX_LINES = 16`.
- **Sem scroll horizontal** e sem `whiteSpace: nowrap`: soft-wrap. Scroll horizontal dentro de scroll
  vertical é armadilha de gesto em celular.
- Botão `Pressable` `h-11 self-start` com `<Typography variant="label-caps" className="text-on-surface-variant">{isExpanded ? 'Show less' : 'Show more'}</Typography>`,
  renderizado **só** quando `text.split('\n').length > MAX_LINES`.
- Quando `showCopy` (default `true`), um `<CopyButton value={text} />` no canto superior direito
  (container `flex-row items-start justify-between gap-2`, o texto num `View className="flex-1"`).
- Sem syntax highlighting.

### Passo 29 — `collapsible-section.tsx`

```tsx
type CollapsibleSectionProps = {
  title: string
  icon?: ComponentType<{ size?: number; color?: string }>
  meta?: string
  preview?: string
  defaultOpen?: boolean
  copyValue?: string
  children: ReactNode
  className?: string
}
```
- Estado local `isOpen` inicializado com `defaultOpen ?? false`.
- Header: `Pressable` `min-h-12 flex-row items-center gap-2 py-2`, `accessibilityRole="button"`,
  `accessibilityState={{ expanded: isOpen }}`. Conteúdo: chevron
  (`isOpen ? <ChevronDown size={16} color={onSurfaceVariant} /> : <ChevronRight size={16} … />`),
  ícone opcional (`size={16}`), `<Typography variant="label-caps" className="flex-1 text-on-surface-variant">{title}</Typography>`,
  `meta` em `<Typography variant="label-caps" className="normal-case text-on-surface-variant/70">`,
  e `{copyValue != null && <CopyButton value={copyValue} />}`.
- Fechada e com `preview`: `<Typography variant="body-md" numberOfLines={2} className="text-on-surface-variant">{preview}</Typography>`.
- Aberta: `<View className="gap-2 pb-2">{children}</View>`.
- Divisor: `<View className="h-px bg-outline-variant/40" />` **no fim**, sempre.

**Verificação dos passos 26-29:** `cd /root/so/repos/ben-prototype/project-mobile && npx tsc --noEmit`
e `npm run lint:fix` sem erro.

---

## 8. Passos — MOBILE: a feature

### Passo 30 — Store

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/stores/message-trace-store.ts`
(arquivo único — ver desvio D1; espelha a forma de `src/layout/stores/menu-store.ts`).

```ts
import { create } from 'zustand'

export type MessageTraceTab = 'input' | 'output'

export type MessageAnchor = {
  x: number
  y: number
  width: number
  height: number
}

export type MessageActionsTarget = {
  messageId: string
  createdAt: string | null
  anchor: MessageAnchor
}

export type MessageTraceTarget = {
  messageId: string
  createdAt: string | null
  tab: MessageTraceTab
}

interface MessageTraceStore {
  actionsTarget: MessageActionsTarget | null
  traceTarget: MessageTraceTarget | null
  openActions: (target: MessageActionsTarget) => void
  closeActions: () => void
  openTrace: (tab: MessageTraceTab) => void
  closeTrace: () => void
  reset: () => void
}

const INITIAL_STATE = {
  actionsTarget: null as MessageActionsTarget | null,
  traceTarget: null as MessageTraceTarget | null,
}

export const useMessageTraceStore = create<MessageTraceStore>((set, get) => ({
  ...INITIAL_STATE,
  openActions: (target) => set({ actionsTarget: target }),
  closeActions: () => set({ actionsTarget: null }),
  openTrace: (tab) => {
    const target = get().actionsTarget
    if (!target) return
    set({
      actionsTarget: null,
      traceTarget: {
        messageId: target.messageId,
        createdAt: target.createdAt,
        tab,
      },
    })
  },
  closeTrace: () => set({ traceTarget: null }),
  reset: () => set(INITIAL_STATE),
}))
```

### Passo 31 — Item do menu

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-actions-menu/message-actions-menu-item.tsx`

```tsx
type MessageActionsMenuItemProps = {
  label: string
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  onPress: () => void
}
```
Render: `Pressable` com `accessibilityRole="button"`, className
`min-h-12 flex-row items-center gap-3 rounded-xl px-3 active:bg-surface-container-low`,
ícone `size={18} strokeWidth={1.75} color={onSurfaceVariant}` e
`<Typography variant="body-md" className="text-on-surface">{label}</Typography>`.

### Passo 32 — O menu flutuante

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-actions-menu/message-actions-menu.tsx`

Sem props: lê tudo da store. Estrutura:

```tsx
const MENU_WIDTH = 240
const MENU_GAP = 8
const SCREEN_PADDING = 16
const MENU_HEIGHT_ESTIMATE = 140

export function MessageActionsMenu() {
  const actionsTarget = useMessageTraceStore((store) => store.actionsTarget)
  const closeActions = useMessageTraceStore((store) => store.closeActions)
  const openTrace = useMessageTraceStore((store) => store.openTrace)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  …
}
```

- Envelope: `<Modal visible={actionsTarget != null} transparent animationType="none" onRequestClose={closeActions}>`.
- Backdrop: `<Pressable className="absolute inset-0" onPress={closeActions}>` com
  `<Animated.View style={backdropStyle} className="absolute inset-0 bg-inverse-surface/25" />`
  (mais leve que o `/30` dos sheets, de propósito: a conversa atrás tem de continuar legível).
- Card: `Animated.View` com `style={[cardStyle, positionStyle]}` e className
  `rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-1 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`.
  A borda é **obrigatória**: o fundo do chat é `#f9f9f9` e o card é `#ffffff`.
- Posicionamento (cálculo exato, sem medir o card):
  ```ts
  const anchor = actionsTarget?.anchor
  const left = anchor
    ? Math.min(
        Math.max(anchor.x, SCREEN_PADDING),
        width - MENU_WIDTH - SCREEN_PADDING,
      )
    : SCREEN_PADDING
  const shouldFlip = anchor
    ? anchor.y + anchor.height + MENU_GAP + MENU_HEIGHT_ESTIMATE >
      height - insets.bottom - SCREEN_PADDING
    : false
  const positionStyle = shouldFlip
    ? { position: 'absolute' as const, left, width: MENU_WIDTH, bottom: height - (anchor?.y ?? 0) + MENU_GAP }
    : { position: 'absolute' as const, left, width: MENU_WIDTH, top: (anchor?.y ?? 0) + (anchor?.height ?? 0) + MENU_GAP }
  ```
  Usar `bottom` no caso invertido evita depender da altura real do card.
- Animação, com `react-native-reanimated` (mesmo vocabulário do `SettingsSheetOverlay`):
  entrada `withTiming(1, { duration: 160 })` em `opacity` do backdrop e em `opacity`+`scale`
  (`0.92 → 1`) do card; saída `withTiming(0, { duration: 120 })`. Para desmontar só depois da saída,
  mantenha um `useState` local `isVisible` sincronizado por `useEffect`: abre imediatamente, e no
  fechamento agenda `setTimeout(() => setIsVisible(false), 120)` (limpe o timer no cleanup).
  Se isso custar mais de ~20 linhas, **aceite fechar sem animação de saída** e siga — o requisito
  duro é abrir/fechar, não o easing.
- Topo do card: `<Typography variant="label-caps" className="px-3 pt-2 pb-1 text-on-surface-variant">`
  com `absoluteDateTime(actionsTarget.createdAt)` de `@/layout/utils/format-time`. Se
  `createdAt` for `null`, **não renderize a linha**.
- Os dois itens, nesta ordem, sem divisor entre eles:
  - `<MessageActionsMenuItem label="Ver input" icon={FileInput} onPress={() => openTrace('input')} />`
  - `<MessageActionsMenuItem label="Ver output" icon={FileOutput} onPress={() => openTrace('output')} />`
- **Os dois itens ficam sempre habilitados**, mesmo sem trace: o cliente não sabe se há trace antes
  de buscar, e um item morto não explica nada — o estado vazio do sheet explica.

**Verificação:** `npx tsc --noEmit`. Visual só no passo 39.

### Passo 33 — Ligar o long-press na bolha do Ben

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/chat-history/chat-history.tsx`
**O que:** `MessageBubble` **não ganha prop nenhuma** e o arquivo
`src/pages/chat/components/message-bubble/message-bubble.tsx` **não é tocado**. O `Pressable` envolve
a bolha por fora, dentro do `renderItem`, e **só quando `isBen`**.

```tsx
const renderItem = ({ item }: { item: BenUiMessage }) => {
  …
  const bubble = (
    <MessageBubble from={…} state={…} footer={…} className="mb-4">
      …
    </MessageBubble>
  )

  if (!isBen) return bubble

  return (
    <MessageTracePressable
      messageId={item.id}
      createdAt={item.metadata?.createdAt ?? null}
    >
      {bubble}
    </MessageTracePressable>
  )
}
```

**Mova o `MessageBubble` inteiro para a variável `bubble` sem tocar no conteúdo.** No arquivo real
ele ocupa as linhas 42-66 e carrega 18 linhas de `CaptureCard` (49-65) que têm de ir intactas: o
`…` acima é só abreviação deste plano. A extração é mecânica — nenhuma prop, nenhum filho, nenhuma
condição muda. O `renderItem` é um `const` com arrow function (linha 35), não uma `function`.

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/chat-history/message-trace-pressable.tsx`

```tsx
type MessageTracePressableProps = {
  messageId: string
  createdAt: string | null
  children: ReactNode
}
```
Corpo:
- `const viewRef = useRef<View>(null)`.
- `function openMenu(anchor: MessageAnchor)` → `void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})`
  e `useMessageTraceStore.getState().openActions({ messageId, createdAt, anchor })`.
  O `void … .catch(() => {})` **não é opcional**: `expo-haptics` quebra no Expo web, e é exatamente
  assim que `src/layout/components/recording-bar.tsx:50` já lida com isso.
- `function handleLongPress(event?: GestureResponderEvent)`:
  ```tsx
  const fallback: MessageAnchor = {
    x: event?.nativeEvent.pageX ?? 0,
    y: event?.nativeEvent.pageY ?? 0,
    width: 0,
    height: 0,
  }

  if (!viewRef.current) {
    openMenu(fallback)
    return
  }

  viewRef.current.measureInWindow((x, y, width, height) => {
    const isValid = width > 0 && height > 0 && y >= 0
    openMenu(isValid ? { x, y, width, height } : fallback)
  })
  ```
- Render:
  ```tsx
  <Pressable
    ref={viewRef}
    className="w-full"
    onLongPress={handleLongPress}
    accessibilityHint="Long press to inspect the model call"
    accessibilityActions={[{ name: 'longpress', label: 'Inspect model call' }]}
    onAccessibilityAction={(event) => {
      if (event.nativeEvent.actionName === 'longpress') handleLongPress()
    }}
  >
    {children}
  </Pressable>
  ```
- **Não** defina `delayLongPress` (o default do RN, 500 ms, é o tempo do context menu do iOS) e
  **não** defina `onPress` (criaria affordance falsa).
- `className="w-full"` é necessário para não quebrar o `w-full flex-row` que é a raiz do `MessageBubble`.

**Verificação:** `npx tsc --noEmit` e `npm run lint:fix`.

### Passo 34 — Skeleton do sheet

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-trace-sheet/message-trace-loading.tsx`
Mesma linguagem de `src/layout/components/menu-detail/item-detail-loading.tsx`: `View`s
`animate-pulse rounded bg-outline-variant/40`, dentro de `<View className="gap-3 px-5 pb-5">`:
uma barra `h-8 w-2/3` (meta strip), três `h-4 w-1/3` (headers de seção) intercaladas com duas linhas
`h-4 w-full` e uma `h-4 w-5/6`. **Sem spinner.**

### Passo 35 — Meta strip

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-trace-sheet/message-trace-meta-strip.tsx`

```tsx
type MessageTraceMetaStripProps = { trace: AgentCallTrace }
```
- Container `flex-row flex-wrap gap-2 px-5 pb-3`.
- Três chips, cada um `flex-row items-center gap-1 rounded-full px-2 py-1` +
  `<Typography variant="label-caps" className="normal-case text-on-surface-variant">`:
  1. modelo: `trace.modelId ?? 'unknown model'`, fundo `bg-surface-container`;
  2. latência: `${(trace.latencyMs / 1000).toFixed(1)}s`, fundo `bg-surface-container`;
  3. status: `trace.status`. Quando `'error'`: fundo `bg-surface-error`, texto `text-text-error` e
     `<CircleAlert size={12} color={textError} />` antes do rótulo. Cor nunca sozinha.

### Passo 36 — Aba INPUT

**Arquivo (novo):** `.../message-trace-sheet/message-trace-input-step.tsx`
```tsx
type MessageTraceInputStepProps = { step: AgentCallStep }
```
Na ordem, de cima para baixo:
1. Cabeçalho do step: `<Typography variant="label-caps" className="pt-2 text-on-surface-variant">{`Step ${step.stepNumber + 1} · ${step.phase}`}</Typography>`.
2. **Request summary**, sempre visível, não colapsável:
   `<Typography variant="code" className="text-on-surface-variant">` com
   `` `${step.input.messages.length} messages · ${step.input.tools.length} tools · ${totalChars} chars` ``,
   onde `totalChars = step.input.systemPrompt.length` mais a soma de `message.text.length` das
   messages. O número agora é real: `step.input.messages` é o que o SDK entregou ao provider naquela
   ida, não uma reconstrução manual.
3. **Messages** — `CollapsibleSection title="Messages" icon={MessageSquare} defaultOpen meta={String(step.input.messages.length)}`.
   Corpo: para cada mensagem, um `CollapsibleSection` aninhado com `title={message.role}`,
   `meta={`${message.text.length} chars`}`, `preview={message.text}`, `copyValue={message.text}`, corpo
   `<Typography variant="body-md" selectable className="text-on-surface">{message.text}</Typography>`
   e, logo abaixo, `{typeof message.content !== 'string' && <CodeBlock value={message.content} />}`.
   **Renderize `message.text`, nunca `message.content` direto:** `content` é `unknown` e na ida 2 da
   fase `context` é um array de partes (tool-call, tool-result) — passá-lo a um `Text` quebra. O
   `text` é a versão achatada que o backend gravou; o `CodeBlock` mostra o bruto ao lado.
   Ordem: a mesma do array (mais antiga primeiro), **não** invertida.
   É esta seção que responde "que contexto o modelo realmente viu?": na ida 2 ela traz a mensagem do
   assistant com a tool call e a mensagem `tool` com o histórico devolvido.
4. **System prompt** — `CollapsibleSection title="System prompt" icon={ScrollText}`,
   `meta={`${step.input.systemPrompt.length} chars`}`, `copyValue={step.input.systemPrompt}`,
   **colapsada** (`defaultOpen` ausente). Corpo: `<Typography variant="body-md" selectable>`.
5. **Tools** — só renderize a seção quando `step.input.tools.length > 0`.
   `CollapsibleSection title="Tools" icon={Wrench} meta={String(step.input.tools.length)}`, colapsada.
   Corpo: por tool, um `CollapsibleSection` com `title={tool.name}`, `preview={tool.description}` e
   corpo `<CodeBlock value={tool.inputSchema} />`.
6. **Output schema** — só quando `step.input.outputSchema != null`.
   `CollapsibleSection title="Output schema" icon={Braces}`, colapsada, corpo `<CodeBlock value={step.input.outputSchema} />`.
7. **Raw request JSON** — `CollapsibleSection title="Raw request JSON" icon={Braces}`, colapsada, no
   fim, corpo `<CodeBlock value={step.input.requestBody ?? step.input} />`. `requestBody` é o corpo
   HTTP literal enviado ao OpenRouter; quando o provider não expõe corpo, cai no objeto de input
   montado pelo backend.

**Arquivo (novo):** `.../message-trace-sheet/message-trace-input.tsx`
```tsx
type MessageTraceInputProps = { trace: AgentCallTrace }
```
`<ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2">` mapeando
`trace.steps` para `<MessageTraceInputStep key={step.stepNumber} step={step} />`.

### Passo 37 — Aba OUTPUT

**Arquivo (novo):** `.../message-trace-sheet/message-trace-output-step.tsx`
```tsx
type MessageTraceOutputStepProps = { step: AgentCallStep }
```
1. Cabeçalho do step, igual ao da aba input.
2. **Result summary**, sempre visível, não colapsável: `View className="gap-1"` com uma linha por
   par, `flex-row justify-between gap-3`, rótulo
   `<Typography variant="code" className="text-on-surface-variant">` e valor
   `<Typography variant="code" className="text-on-surface">`. Pares, nesta ordem:
   `finish reason` (`step.output.finishReason`),
   `tokens` (`` `${usage.inputTokens ?? '—'} / ${usage.outputTokens ?? '—'} / ${usage.totalTokens ?? '—'}` ``),
   `started` (`absoluteDateTime(step.startedAt)`), `finished` (`absoluteDateTime(step.finishedAt)`),
   `latency` (`${(step.latencyMs / 1000).toFixed(1)}s`).
3. **Text response** — `CollapsibleSection title="Text response" icon={MessageSquare} defaultOpen copyValue={step.output.text}`,
   corpo `<Typography variant="body-md" selectable className="text-on-surface">{step.output.text}</Typography>`.
   **`body-md`, não mono**: é prosa.
4. **Object** — só quando `step.output.object != null`.
   `CollapsibleSection title="Object" icon={Braces} defaultOpen`, corpo `<CodeBlock value={step.output.object} />`.
5. **Tool calls** — a seção **não é renderizada** quando `step.output.toolCalls.length === 0`.
   Com a captura por ida (passo 4) isso quer dizer: ela aparece na ida em que o modelo de fato
   chamou a tool e some nas idas em que ele só escreveu texto. Sumir em **todas** as idas da fase
   `context` significa que o modelo não chamou a tool naquela conversa — é observação, não bug.
   `CollapsibleSection title="Tool calls" icon={Wrench} defaultOpen meta={String(step.output.toolCalls.length)}`.
   Corpo: por tool call, um `CollapsibleSection` com `title={toolCall.toolName}` contendo
   `<CodeBlock value={toolCall.input} />` e, quando houver um `toolResult` com o mesmo `toolCallId`,
   `<CodeBlock value={toolResult.output} />`.
6. **Warnings** — só quando `step.output.warnings.length > 0`:
   `CollapsibleSection title="Warnings" icon={CircleAlert}`, corpo `<CodeBlock value={step.output.warnings} />`.
7. **Raw response JSON** — `CollapsibleSection title="Raw response JSON" icon={Braces}`, colapsada, no
   fim, corpo `<CodeBlock value={step.output} />`.

**Arquivo (novo):** `.../message-trace-sheet/message-trace-output.tsx`
```tsx
type MessageTraceOutputProps = { trace: AgentCallTrace }
```
`ScrollView` igual ao da aba input. **Antes** dos steps, quando `trace.status === 'error'`, uma banda
com o visual idêntico ao `ItemDetailError`, mas **sem** retry:
```tsx
<View className="flex-row items-start gap-2 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
  <CircleAlert size={16} color={textError} />
  <Typography variant="body-md" className="flex-1 text-text-error">
    {trace.error ?? 'the model call failed'}
  </Typography>
</View>
```
Não é falha de fetch, é conteúdo registrado — por isso não tem "tap to retry".

### Passo 38 — O casco do sheet

**Arquivo (novo):** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/components/message-trace-sheet/message-trace-sheet.tsx`

`MenuSheet` vem de
`/root/so/repos/ben-prototype/project-mobile/src/layout/components/menu/menu-sheet.tsx`
(`export function MenuSheet({ children, className })`, linha 11) — pasta `menu/`, **não**
`menu-settings/` (essa é onde vive o `SettingsSheetOverlay` do passo 17).

```tsx
type MessageTraceSheetProps = {
  messageId: string
  createdAt: string | null
  initialTab: MessageTraceTab
  onClose: () => void
}
```

Corpo:
```tsx
const { height } = useWindowDimensions()
const [tab, setTab] = useState<MessageTraceTab>(initialTab)
const { state, actions } = useMessageTraceData(messageId)
const trace = state.data?.item.trace ?? null
```

Estrutura de render:
```tsx
<View style={{ height: height * 0.9 }}>
  <MenuSheet className="flex-1">
    <View className="flex-1">
      {/* faixa 1 — identidade + fechar */}
      <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="size-7 items-center justify-center rounded-lg bg-surface-container-high">
            <Cpu size={16} color={onSurfaceVariant} />
          </View>
          <Typography variant="label-caps" className="text-on-surface-variant">
            Model call
          </Typography>
        </View>
        <IconButton label="Close" onPress={onClose} className="size-11">
          <X size={16} color={onSurfaceVariant} />
        </IconButton>
      </View>

      {/* faixa 2 — só com trace; faixa 3 — também no loading, desabilitada */}
      {trace && <MessageTraceMetaStrip trace={trace} />}
      {(state.isLoading || trace) && (
        <SegmentedControl
          className="mx-5 mb-3"
          disabled={state.isLoading}
          value={tab}
          onChange={setTab}
          options={[
            { value: 'input', label: 'Input' },
            { value: 'output', label: 'Output' },
          ]}
        />
      )}

      {/* corpo */}
      {state.isLoading ? (
        <MessageTraceLoading />
      ) : state.isError ? (
        <ItemDetailError
          message="couldn't load this trace — tap to retry"
          onRetry={() => actions.refetch()}
        />
      ) : trace ? (
        tab === 'input' ? (
          <MessageTraceInput trace={trace} />
        ) : (
          <MessageTraceOutput trace={trace} />
        )
      ) : (
        <View className="gap-2">
          <ItemDetailGone message="no trace for this one — it was sent before Ben started recording model calls." />
          <Typography variant="code" className="px-5 pb-4 text-on-surface-variant">
            {`${messageId}${createdAt ? ` · ${absoluteDateTime(createdAt)}` : ''}`}
          </Typography>
        </View>
      )}
    </View>
  </MenuSheet>
</View>
```

Notas obrigatórias:
- O segmented control aparece **durante o loading, desabilitado**, como pede o `r1-design.md` §3.7:
  sem isso o header pularia de uma faixa para três quando o fetch termina. A meta strip continua
  escondida no loading — o skeleton do passo 34 já tem a barra que a substitui.
- A altura vem de `style`, não de `h-[90%]`: o pai (`Animated.View` do `SettingsSheetOverlay`) tem
  altura automática e a porcentagem não resolveria (desvio D3).
- Trocar de aba **reseta o scroll** de graça: `MessageTraceInput` e `MessageTraceOutput` são
  componentes irmãos alternados, então cada troca desmonta uma `ScrollView` e monta outra no topo.
  Não implemente `scrollTo` manual.
- **Sem pan-to-dismiss.** O handle do `MenuSheet` fica como marcador de borda. Um gesto de fechar
  brigaria com o scroll longo, que é a razão de ser deste sheet. Fechar é pelo `X`, pelo backdrop e
  pelo Back.

### Passo 39 — Montar na página do chat

**Arquivo:** `/root/so/repos/ben-prototype/project-mobile/src/pages/chat/page.tsx`
**O que:** os dois overlays vivem aqui, irmãos dos outros, **nunca** dentro do `renderItem`.
- Ler da store: `traceTarget`, `closeTrace`, `reset`.
- `useEffect(() => () => reset(), [reset])` — a forma exata de `src/pages/menu/page.tsx:24`, para
  não abrir uma segunda convenção.
- `const { height: windowHeight } = useWindowDimensions()`.
- Dentro do `<View className="flex-1">` externo, **depois** do bloco absoluto do footer:
  ```tsx
  <MessageActionsMenu />

  <SettingsSheetOverlay
    isOpen={traceTarget != null}
    onClose={closeTrace}
    slideOffset={windowHeight}
  >
    {traceTarget && (
      <MessageTraceSheet
        messageId={traceTarget.messageId}
        createdAt={traceTarget.createdAt}
        initialTab={traceTarget.tab}
        onClose={closeTrace}
      />
    )}
  </SettingsSheetOverlay>
  ```

### Passo 40 — Fechar o mobile

```bash
cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix
cd /root/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```
Os dois têm de passar limpos.

---

## 9. Riscos e o que fazer em cada um

### R1 — `measureInWindow` numa `FlatList inverted` (o risco sinalizado pelo design)
A lista de chat é `inverted`, o que aplica `scaleY(-1)` na lista e em cada célula. Em tese
`measureInWindow` já devolve coordenada de tela pós-transform (tanto no RN Web, que usa
`getBoundingClientRect`, quanto no nativo), mas **não confie**: o passo 33 já monta o fallback.
- **Sintoma:** o menu abre fora da tela, colado no topo, ou espelhado verticalmente em relação à bolha.
- **Ação 1:** o fallback já embutido — use as coordenadas do toque (`event.nativeEvent.pageX/pageY`).
  Force o fallback trocando a condição `isValid` por `false` e confirme que o menu passa a abrir junto
  do dedo. Se ficar bom, **mantenha o fallback como caminho único** e apague a medição.
- **Ação 2 (só se nem o fallback resolver):** abandone a ancoragem e centralize o card
  (`top: height / 2 - MENU_HEIGHT_ESTIMATE / 2`, `left: (width - MENU_WIDTH) / 2`), mantendo backdrop,
  itens e comportamento. **Perde-se o vínculo espacial, não a feature.** Registre no relatório.

### R2 — O long-press não dispara no Expo web
No navegador, long-press é mouse-down segurado ~500 ms sem mover. Playwright precisa de
`mouse.down()` → espera ≥ 600 ms → `mouse.up()`; um `click()` comum **não** dispara.
- **Ação:** está no roteiro do tester (§10). Se mesmo assim não disparar, troque o `Pressable` por
  `<Pressable onLongPress delayLongPress={400}>` antes de suspeitar do resto.

### R3 — `npx expo install expo-clipboard` falha (sem rede)
- **Ação:** o fallback `navigator.clipboard` do passo 16, declarado como pendência no relatório.
  Nunca deixe o app sem compilar por causa disso.

### R4 — (removido na rodada 2)
`z.toJSONSchema` foi verificado em runtime dentro de `project-backend` e devolve JSON Schema
draft 2020-12 corretamente. Não há risco a mitigar. Os números R5-R8 ficam como estão para não
invalidar as referências do resto do plano.

### R5 — Trace grande demais numa linha do sqlite
`props` é `TEXT`; o system prompt do Ben + histórico + dois raw payloads devem ficar na casa de
dezenas de KB, o que o sqlite aguenta com folga. Se um trace passar de ~1 MB, o sintoma será
lentidão no `GET /messages/list` (que **não** devolve o trace — ver passo 9 — mas ainda assim lê a
linha inteira).
- **Ação, só se acontecer:** truncar `step.output.text` e os `toolResults` em 100 000 caracteres no
  `buildAgentCallStep`, acrescentando `'… [truncated]'`. Não faça isso preventivamente.

### R6 — Mensagem duplicada na lista após refetch do histórico
Coberto pelo passo 24. Se aparecer warning de `key` duplicada no console, é sinal de que o filtro do
passo 24 não foi aplicado.

### R7 — Backend sem `.env`
Não existe `.env` em `/root/so/repos/ben-prototype/project-backend` (só `.env.example`), e não há
`prisma/dev.db`. Sem chaves (OpenRouter, Firebase, JWT) o backend não sobe e o app não autentica.
- **Ação:** antes do teste de browser, copiar `.env.example` para `.env` e **pedir os valores ao
  usuário**. Não invente chaves, não comite `.env`. O mesmo vale para
  `/root/so/repos/ben-prototype/project-mobile/.env`.
- Consequência prática: se as chaves não vierem, `npm run lint:fix` + `npx tsc --noEmit` nos dois
  projetos continuam sendo prova válida do que foi escrito, e o item 6 da definição de pronto
  (screenshots) fica bloqueado por falta de ambiente — o que deve ser dito, não contornado.

### R8 — Estado vazio sem mensagem antiga para testar
Com `PERSISTENCE_DRIVER=in-memory` (default do `.env.example`) não existe mensagem anterior à
feature. Como provar o caminho `trace: null`?
- **Ação:** `curl` na rota usando o **id de uma mensagem do usuário** (elas nascem com `trace: null`
  por construção — passo 7). Isso prova o contrato. Se houver um `prisma/dev.db` com linhas antigas
  do Ben, prefira o teste pela UI.

---

## 10. A prova

### 10.1 Lint e tipos (obrigatório, sempre)

```bash
cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix
cd /root/so/repos/ben-prototype/project-backend && npx tsc --noEmit
cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix
cd /root/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```
Os quatro comandos têm de terminar sem erro. É o item 5 da definição de pronto.

### 10.2 Prova de API (antes de chamar o browser tester)

Com o backend rodando (`cd /root/so/repos/ben-prototype/project-backend && npm run dev`) e um par de
tokens válido. A porta é **3333**, não 3000: `src/infra/http/server.ts:5` faz
`app.listen(env.API_PORT, …)` e `.env.example:1` traz `API_PORT=3333`, que é o valor que o `.env`
criado no R7 vai ter. Se você mudar `API_PORT`, mude os três comandos junto.

```bash
# 1. manda uma mensagem e guarda o messageId devolvido
curl -s -X POST http://localhost:3333/chat \
  -H 'content-type: application/json' \
  -H "jwtauthenticationtoken: $JWT" \
  -H "providerauthenticationtoken: $PROVIDER" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"lembra de comprar pão amanhã"}]}]}'

# 2. lê o trace daquela mensagem
curl -s http://localhost:3333/messages/<messageId>/trace \
  -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: $PROVIDER"

# 3. id que não existe -> 404 RESOURCE_NOT_FOUND
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3333/messages/nao-existe/trace \
  -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: $PROVIDER"
```

O que checar na resposta de (2) — é aqui que se prova que o trace não nasceu vazio:

- `item.trace.steps` tem **3** entradas no fluxo normal (`context`, `context`, `format`), ou **2** se
  o modelo não chamou a tool. `step.phase` e `step.stepNumber` distinguem as idas.
- **Tool calls, o ponto crítico:** existe um step com `phase === 'context'` cujo
  `output.toolCalls[0].toolName === 'get-history-context'`, e `output.toolResults[0].output` traz o
  histórico. `input.tools[0].name` **não** prova nada aqui: é a *definição* da tool, não a chamada.
  Se `output.toolCalls` vier vazio em todos os steps enquanto a tool visivelmente executou, o passo 4
  está lendo do topo do resultado em vez de `result.steps`.
- **Messages, o outro ponto crítico:** o step `context` #1 tem `input.messages` com 1 entrada
  (`role: 'user'`); o step `context` #2 tem **3** (`user`, `assistant` com a tool call, `tool` com o
  resultado). Cada entrada tem `role`, `text` não vazio e `content`. Se toda ida mostrar uma
  mensagem só, o `prepareStep` do passo 5 não está gravando.
- `input.systemPrompt` não vazio nos steps de `context`, e `input.requestBody` não nulo.
- o step `format` tem `input.outputSchema` não nulo e `output.object` preenchido.
- `trace.modelId` **não é vazio** (esperado `openai/gpt-5.6-luna`, mas esse valor vem de
  `steps[último].response.modelId`, o id **devolvido pelo provider**, não o configurado — o
  OpenRouter pode normalizar a string; se só isso divergir, não é sinal de bug no trace),
  `trace.latencyMs` > 0 e `trace.totalUsage.totalTokens` > 0.
Em (3): a saída é `404`.
Repita (2) com o id de uma **mensagem do usuário** (pegue em `GET /messages/list`): a resposta tem de
ser `200` com `"trace": null`.

### 10.3 Roteiro do browser tester (Expo web, porta 8081, viewport 390x844)

Pré-requisito: backend rodando e `npx expo start --web` em
`/root/so/repos/ben-prototype/project-mobile` servindo na porta 8081; usuário autenticado na tela de
chat.

1. Abrir `http://localhost:8081`, redimensionar para **390x844**, entrar até a tela de chat.
2. **Criar uma mensagem do Ben com trace:** digitar no composer `me lembra de comprar pão amanhã às 9h`
   e enviar. Esperar a bolha do Ben terminar de "digitar" (a animação revela o texto a ~24 ms por
   3 caracteres).
3. **Long-press na bolha do Ben** (a última, alinhada à esquerda): posicionar o mouse sobre a bolha,
   `mouse.down()`, **esperar 700 ms**, `mouse.up()`. Um clique comum não dispara.
4. **Screenshot 1 — menu aberto.** Conferir: card branco flutuante com borda, timestamp em caixa
   alta no topo, exatamente **dois** itens, "Ver input" e "Ver output", cada um com ícone à
   esquerda; conversa atrás visível e escurecida.
5. Clicar em **"Ver input"**. **Screenshot 2 — sheet aberto na aba Input.** Conferir: sheet ocupando
   ~90 % da altura, header com o quadradinho `Cpu` + "MODEL CALL" + botão de fechar; chips de
   modelo, latência e status; segmented control com "Input" ativo; abaixo, "Step 1 · context" com a
   linha de resumo, a seção **Messages** aberta, e "System prompt", "Tools" e "Raw request JSON"
   fechadas.
6. Abrir a seção **System prompt**, rolar até o fim do conteúdo e voltar — o scroll é longo e não
   pode travar. Abrir **Raw request JSON** e clicar em "Show more": o bloco cresce.
7. Clicar no botão de copiar de uma seção: o ícone vira um "check" por ~1,5 s.
8. Trocar para a aba **Output**. **Screenshot 3.** Conferir: "Result summary" com finish reason e
   tokens, "Text response" aberta com o texto cru do modelo, e "Raw response JSON" fechada no fim.
   O scroll voltou ao topo ao trocar de aba.
9. Fechar pelo **X**. O chat volta sem overlay preso.
10. **Long-press numa mensagem do usuário** (bolha escura, à direita): **nada** pode acontecer —
    nem menu, nem háptico, nem sheet. **Screenshot 4** do estado inalterado.
11. Reabrir o sheet e fechar tocando no **backdrop** (área escurecida acima do sheet): tem de fechar.
12. **Estado vazio:** se existir uma mensagem do Ben anterior a esta feature (rolar o histórico para
    cima), long-press nela → "Ver input" → o sheet abre **sem** meta strip e **sem** segmented
    control, mostrando a frase "no trace for this one — it was sent before Ben started recording
    model calls." e uma linha mono com o id. **Screenshot 5.** Se não existir nenhuma, pule e
    registre que o caminho foi provado por `curl` (§10.2).
13. Sanidade das telas que foram tocadas de raspão: abrir o menu (ícone no topo), abrir uma nota e
    abrir Settings — os dois sheets continuam animando e fechando normalmente (o `slideOffset` novo
    tem default e não pode ter quebrado nada).

### 10.4 Commit

Branch: **`feat/update-model-and-add-logs`** (nunca `main` — há CI de deploy automático na `main`).
Um commit só, mensagem no padrão do repo (`feat(...)`, corpo em português), com as linhas de
atribuição exigidas pelo harness. Push na mesma branch.

---

## 11. Checklist final do implementador

- [ ] `GET /messages/:id/trace` responde 200 com trace, 200 com `trace: null`, e 404 para id inexistente
- [ ] O trace tem **um step por ida ao provider**, lido de `result.steps` — não do topo do resultado
- [ ] A ida que chamou a tool traz `output.toolCalls` preenchido
- [ ] `input.messages` cresce de 1 para 3 entre a ida 1 e a ida 2 da fase `context`
- [ ] `POST /chat` devolve `messageId` e a bolha otimista usa esse id
- [ ] Nenhuma migração de prisma criada ou rodada
- [ ] Os quatro `console.log` do `ben-agent-provider/index.ts` foram removidos
- [ ] `MessagePresenter` **não** expõe o trace na listagem
- [ ] Long-press só na bolha do Ben; mensagem do usuário não responde
- [ ] Menu com exatamente dois itens, ancorado na bolha
- [ ] Sheet com abas, seções colapsáveis, copiar, e os três estados (loading, vazio, erro de fetch)
- [ ] `npm run lint:fix` e `npx tsc --noEmit` limpos nos **dois** projetos
- [ ] Screenshots do menu aberto e do sheet aberto
- [ ] Commit e push em `feat/update-model-and-add-logs`

---

## Correções da revisão (rodada 2)

Uma linha por achado do `r3-review.md`. "Passo N" é o passo deste arquivo, já corrigido no lugar.

### Bloqueantes

- **B1 — tool calls só do último step.** Corrigido nos passos 4 e 5, e na §10.2. O trace deixou de
  ser "um step por chamada `generateText`" e passou a ser **um step por ida ao provider**, lido de
  `result.steps[i]` (`node_modules/ai/dist/index.d.ts:1151-1154`), que é o único campo que carrega
  todas as idas — os campos do topo são "in the last step" (`:1049-1116`). Cada step traz os seus
  `toolCalls`, `toolResults`, `text`, `finishReason`, `usage`, `warnings` e `response`. A seção
  "Tool calls" (passo 37, item 5) continua escondida quando a ida não teve tool call, mas agora
  aparece na ida que teve. §10.2 ganhou a verificação explícita pedida, incluindo a observação de
  que `input.tools[0].name` é a definição da tool e não prova chamada nenhuma.

- **B2 — `input.messages` hard-coded.** Corrigido pela saída (a): captura de verdade, nos passos 4,
  5, 36 e §10.2. As mensagens reais de cada ida vêm do callback `prepareStep`, que o SDK invoca no
  topo de cada volta do laço com `messages: Array<ModelMessage>` = "The messages that will be sent
  to the model for the current step" (`node_modules/ai/dist/index.d.ts:960-981`; a invocação está em
  `node_modules/ai/dist/index.js:4394`, e o `steps.push` da mesma volta em `:4712`, o que garante o
  pareamento por índice). O `prepareStep` entra como observador puro: corpo em bloco terminado em
  `return undefined` explícito (um bloco sem `return` infere `void`, que não compila contra o tipo do
  callback), e é esse `undefined` que significa "use as settings de fora" — o comportamento do agente
  não muda. Além disso cada step guarda `input.requestBody` = `step.request.body`, o corpo HTTP literal enviado ao
  provider (`:133-138`). `AgentCallMessage` virou `{ role, text, content }`: `content` é o bruto
  (`unknown`, porque na ida 2 é um array de partes tool-call/tool-result) e `text` é a versão
  achatada que a UI renderiza. A seção "Messages" não foi renomeada: ela agora mostra mesmo o que o
  modelo viu, incluindo a mensagem de assistant com a tool call e a mensagem `tool` com o resultado.

- **B3 — porta 3000.** Corrigido na §10.2: os três `curl` vão para `http://localhost:3333`, com uma
  linha dizendo de onde vem o valor (`server.ts:5` + `.env.example:1`).

### Não bloqueantes

1. **Passo 17, "três lugares".** Corrigido: são **dois** (linha 24 e linha 32), e o passo diz
   explicitamente que a linha 29 não muda.
2. **Segmented control durante o loading.** Corrigido, não declarado como desvio: o passo 26 ganhou
   `disabled?: boolean` e o passo 38 renderiza o controle quando `state.isLoading || trace`, com
   `disabled={state.isLoading}`. Passa a cumprir o `r1-design.md` §3.7.
3. **`?? null` morto.** Corrigido: `modelId` e `responseId` são `string` no `AgentCallStep`,
   `finishReason` é `string`, e os `?? null` sumiram do passo 4. O único `?? null` que ficou é o de
   `requestBody`, que é genuinamente opcional no tipo do SDK. No passo 28 caiu o `?? 'null'` de
   fora do `JSON.stringify`. Na aba Output caiu o `?? '—'` de `finishReason`.
4. **`clipboard-service.web.ts`.** Corrigido: o passo 16 agora proíbe criar o par `.web.ts` e diz
   por quê (`expo-clipboard` suporta web; um no-op mataria o copiar no browser tester).
5. **Passo 33, `renderItem`.** Corrigido: é `const renderItem = ({ item }) => {`, e o passo manda
   mover o `MessageBubble` (linhas 42-66, com as 18 linhas de `CaptureCard`) intacto para a
   variável, avisando que o `…` é abreviação do plano.
6. **`useEffect(() => () => reset(), [reset])`.** Corrigido no passo 39, na forma do precedente.
7. **Dedup não cobre a bolha do usuário.** **Não corrigido, de propósito.** É pré-existente (o
   `randomUUID()` de `message-builders.ts:7` já duplica hoje), fechá-lo exige um segundo id na
   resposta do `POST /chat`, e o briefing restringe o long-press às mensagens do Ben — nenhum item
   da definição de pronto depende disso. Fica registrado aqui e no `r5-plano-v2.md`.
8. **R4 não existe.** Corrigido: o risco R4 virou um stub dizendo que `z.toJSONSchema` foi
   verificado e funciona, e o plano B condicional saiu do passo 5. Os números R5-R8 foram mantidos
   para não invalidar as referências ao R7 espalhadas pelo plano.
9. **Confirmações do revisor (`AlertTriangle`, `expo-clipboard`, `.env`, migração, `serializeValue`).**
   Nada a mudar — o plano já dizia isso; a revisão só confirmou.

### O que não foi corrigido porque não é corrigível no plano

- **R7 / item 6 da definição de pronto.** Não há `.env` em nenhum dos dois projetos e o backend
  lança em env inválido (`src/infra/services/env.ts:29-32`), então os screenshots dependem de chaves
  que só o usuário tem. O plano já manda pedir; o orquestrador precisa resolver isso **antes** de
  chamar o browser tester.

## Correções da revisão (rodada 3)

Uma linha por achado do `r6-review-v2.md`.

### Bloqueante

- **B1 (novo) — `prepareStep` não compila.** Corrigido: as duas chamadas `generateText` do passo 5
  (fases `context` e `format`) agora fecham o bloco do `prepareStep` com `return undefined` explícito.
  Corrigida também a nota de implementação do passo 5 ("`prepareStep` é observador, não configurador")
  e o texto de "Correções da revisão (rodada 2) › B2", que repetiam a premissa falsa "bloco sem
  `return` devolve `undefined`" — agora dizem que um bloco sem `return` infere `void` (que não
  compila contra o tipo do callback) e que é o `return undefined` explícito, não o bloco vazio, que
  sinaliza "use as settings de fora". Não encontrei essa afirmação repetida em nenhum outro trecho do
  plano além desses dois (busquei por `prepareStep`, "sem `return`" e "settings de fora" no arquivo
  inteiro).

### Não bloqueantes

1. **§2, D5 contradiz o passo 23.** Corrigido: a linha D5 agora diz "Mantido opcional
   (`createdAt?: string`, passo 23)", igual ao passo, com a razão da opcionalidade e a referência aos
   consumidores que já toleram `null`.
2. **`MenuSheet` sem caminho no passo 38.** Corrigido: acrescentada uma linha com o caminho absoluto
   (`src/layout/components/menu/menu-sheet.tsx`, linha 11) e o aviso de que não é `menu-settings/`.
3. **`StepResult.stepNumber` não serve.** Corrigido: acrescentada uma quarta decisão no passo 4
   explicando por que `stepNumber` vem de `firstStepNumber + index` e não do `stepNumber` nativo do
   SDK (que reiniciaria do zero na fase `format`).
4. **`trace.modelId` pode vir normalizado pelo provider.** Corrigido na §10.2: a verificação virou
   "não é vazio", com a ressalva de que o valor esperado (`openai/gpt-5.6-luna`) pode ser normalizado
   pelo OpenRouter e isso sozinho não é sinal de bug.
5. **Plano B do passo 16 (`navigator.clipboard`) sem falar de tipagem.** Corrigido: acrescentada
   instrução de que `navigator` depende da lib `dom` em `tsconfig.json`, e que se faltar, o
   implementador deve **parar e registrar**, não improvisar `as any`/`declare`.
6. **Passo 36, item 7 — `CodeBlock` recursa no próprio `step.input`.** **Não corrigido, de propósito.**
   O revisor não deixou remédio: classificou como "não quebra nada, só é ruído no caso raro de
   provider sem corpo HTTP" — não uma mudança de comportamento a fazer. Como não cabe a esta rodada
   inventar um remédio que o revisor não escreveu, o passo 36 fica como está.
