# r7 — Correções aplicadas ao r2-plano.md (rodada 3)

Aplicadas em cima do `r6-review-v2.md`. Não houve replanejamento: só edição no lugar.

- **Bloqueante B1 (`prepareStep` não compila).** Passo 5: as duas chamadas `generateText`
  (`context` e `format`) agora terminam o `prepareStep` com `return undefined` explícito. Corrigida
  a nota de implementação do passo 5 e o texto de "Correções da revisão (rodada 2) › B2" que
  repetiam a premissa falsa "bloco sem `return` devolve `undefined`" (na verdade infere `void`, que
  não compila contra o tipo do callback).
- **Não bloqueante 1 — §2 D5 x passo 23.** Tabela alinhada: `createdAt` continua **opcional**, como
  o passo 23 já mandava.
- **Não bloqueante 2 — caminho do `MenuSheet`.** Passo 38 ganhou o caminho absoluto
  (`src/layout/components/menu/menu-sheet.tsx`, linha 11) e o aviso de que não é `menu-settings/`.
- **Não bloqueante 3 — `StepResult.stepNumber` nativo não serve.** Passo 4 ganhou uma quarta
  decisão explicando por que `stepNumber` vem de `firstStepNumber + index`.
- **Não bloqueante 4 — `trace.modelId` pode vir normalizado.** §10.2 trocou a asserção por "não é
  vazio", com a ressalva sobre normalização do OpenRouter.
- **Não bloqueante 5 — tipagem do fallback `navigator.clipboard`.** Passo 16 ganhou instrução para
  parar e reportar se faltar a lib `dom`, em vez de improvisar `as any`.
- **Não bloqueante 6 — `CodeBlock` recursando em `step.input` (passo 36, item 7).** Não corrigido:
  o revisor não deixou remédio, só classificou como ruído cosmético em caso raro. Registrado como
  fora de escopo desta rodada.

Seção `## Correções da revisão (rodada 3)` acrescentada ao fim do `r2-plano.md` com o mesmo
detalhamento.
