# r5 — Plano v2: o que mudou e o que reconferir

O plano continua sendo **`r2-plano.md`**, corrigido no lugar. Não existe segundo arquivo de plano.
A numeração dos passos foi mantida inteira. No fim do `r2-plano.md` há a seção
`## Correções da revisão (rodada 2)`, achado por achado.

## Os três bloqueantes

**B1 — tool calls só do último step. Corrigido em 4, 5, 37 e §10.2.**
Abri `node_modules/ai/dist/index.d.ts`. `GenerateTextResult.toolCalls|toolResults|text|finishReason|usage`
são documentados como "in the last step" (`:1049-1116`); `readonly steps: Array<StepResult<TOOLS>>`
(`:1151-1154`) é o único campo com todas as idas, e cada `StepResult` (`:828-937`) tem os seus
próprios `toolCalls`, `toolResults`, `text`, `finishReason`, `usage`, `warnings`, `request` e
`response`. O builder do passo 4 agora itera `result.steps`.

**B2 — `input.messages` hard-coded. Corrigido pela saída (a): captura de verdade.**
Não caí na saída (b) porque ela entrega uma tela que diz mostrar o contexto e mostra uma linha — não
serve para julgar o comportamento do bot. As mensagens reais vêm de `prepareStep`, que recebe
`messages: Array<ModelMessage>` = "The messages that will be sent to the model for the current step"
(`:960-981`), é chamado no topo de cada volta do laço (`dist/index.js:4394`) e pareia por índice com
o `steps.push` da mesma volta (`:4712`). Ele entra como observador puro (bloco sem `return`;
`undefined` = "use as settings de fora", `:955-958`), então nada do comportamento do agente muda.
Cada step ganhou também `input.requestBody` = `step.request.body`, o corpo HTTP literal enviado ao
provider (`:133-138`).

**B3 — porta. Corrigido em §10.2:** 3000 → 3333, com a origem do valor citada.

**A consequência estrutural dos dois primeiros, que é o que o revisor precisa olhar primeiro:** um
`AgentCallStep` deixou de ser "uma chamada `generateText`" e passou a ser **uma ida ao provider**,
com `phase: 'context' | 'format'` e `stepNumber`. O trace tem 3 steps no fluxo normal (context #1
com a tool call, context #2 com o texto, format #3) e 2 se o modelo não chamar a tool.
`AgentCallMessage` virou `{ role, text, content }` — `content` é bruto e `unknown`, `text` é o
achatado que a UI renderiza.

## Não bloqueantes: 7 corrigidos, 1 recusado com motivo, 1 sem ação

Corrigidos: 1 (contagem do passo 17), 2 (segmented control desabilitado no loading), 3 (`?? null`
mortos), 4 (proibido criar `clipboard-service.web.ts`), 5 (`const renderItem` + extrair o
`MessageBubble` intacto), 6 (`useEffect(() => () => reset(), [reset])`), 8 (R4 removido).
Recusado: 7 (id real da bolha do usuário) — pré-existente, exige um segundo id no `POST /chat`,
fora do briefing, nenhum item da definição de pronto depende. Sem ação: 9 (só confirmações).

## O que o revisor precisa reconferir

1. **Passo 4, o builder.** Se `StepResultLike` bate estruturalmente com `StepResult` real, e se o
   pareamento `recorded[i]` ↔ `result.steps[i]` se sustenta quando uma ida falha no meio.
2. **Passo 5, o `prepareStep`.** Se o corpo em bloco sem `return` é mesmo inócuo, e se os dois
   recorders locais ao método resistem a requisições concorrentes.
3. **`ModelMessage` não é importado** em lugar nenhum: não é re-exportado por `ai` e
   `@ai-sdk/provider-utils` não é dependência direta (conferi o `package.json`). As mensagens
   gravadas são tipadas estruturalmente como `{ role: string; content: unknown }[]`. Vale conferir
   que `ModelMessage[]` é atribuível a isso sem cast.
4. **Passo 36, item 3.** A UI renderiza `message.text` e só cai no `CodeBlock` quando
   `typeof message.content !== 'string'`. Se escapar um `{message.content}` em algum lugar, quebra.
5. **§10.2.** Se as verificações novas são executáveis como estão.

## Aviso ao orquestrador (não é defeito do plano)

Não há `.env` em `project-backend` nem em `project-mobile`, e o backend lança em env inválido
(`src/infra/services/env.ts:29-32`). O item 6 da definição de pronto (screenshots) depende de chaves
que só o usuário tem. Isso precisa ser resolvido **antes** de chamar o browser tester.
