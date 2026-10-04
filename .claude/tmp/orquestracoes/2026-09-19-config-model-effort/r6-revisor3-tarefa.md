# Tarefa — r6: revisar as correções do plano v2 (config model + effort)

Você é filho de um orquestrador (O2) numa cadeia de subagentes. Não é uma revisão nova do plano
inteiro: é conferir se duas correções específicas fecharam e se elas não quebraram nada em volta.

## Leia, nesta ordem
1. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — o contrato da task.
2. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r3-plano-v2.md` (1017 linhas) — o
   plano, já corrigido in loco pelo planejador (tem uma seção final "## Resposta à revisão v2").
   É a fonte única e atual do plano. **Não leia** `r1-plano.md` (morto, versão anterior).
3. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r4-revisao-v2.md` — a revisão que
   reprovou o plano com 2 bloqueantes, que é o que você está conferindo se fechou.

**Não refaça** os pontos já listados como verificados em `r2-revisao.md` nem no fim de
`r4-revisao-v2.md` — foram conferidos contra o código real em rodadas anteriores e reabri-los é
rodada perdida.

## O que fazer
- Carregue as skills `code-get-coding-designs` e `code-get-project-context` para os dois apps que
  a task cruza: `project-backend` e `project-mobile`.
- Confira, no código real do repo (não confie apenas no texto do plano), toda afirmação do
  `r3-plano-v2.md` sobre caminho de arquivo, assinatura de função, schema, rota ou tipo que ainda
  não tenha sido verificada nas rodadas anteriores.
- Confira especificamente, um a um, se os 2 bloqueantes listados em `r4-revisao-v2.md` foram
  fechados pela correção in loco (seção final do `r3-plano-v2.md`).
- Critério de bloqueante: o que faz a implementação sair errada, incompleta, fora do contrato do
  briefing (Definição de Pronto, Fora do escopo, Autorizações, Premissas) ou fora do padrão
  documentado do repo. **Não é bloqueante** preferência de estilo ou forma alternativa de escrever
  algo que já funciona — reprovar por isso trava a cadeia sem necessidade.

## Escreva sua entrega em
`.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r6-revisao-v3.md`, no mesmo formato de
`r4-revisao-v2.md`:
- Veredito: APROVADO ou REPROVADO.
- Bloqueantes (se houver): lista, cada um com o trecho do plano, o problema concreto e a
  evidência no código.
- Não bloqueantes: observações que não travam a implementação.
- Seção "Os 2 bloqueantes da r4": um a um, diga se fechou ou não, com a evidência.

## Regras obrigatórias
- Não sub-delegue (não use a tool `Agent`).
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e documentada no seu
  arquivo de entrega.
- Escreva o arquivo de entrega **antes** de retornar.
- Seu retorno final para o orquestrador tem no máximo 10 linhas: caminho do arquivo, veredito, e
  se os 2 bloqueantes da r4 fecharam.
- Teto de janela: ~140k de contexto e 50 turns. Se aproximar do teto, feche a revisão com o que já
  apurou em vez de continuar investigando.
