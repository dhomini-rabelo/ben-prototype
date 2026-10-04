# Tarefa — r7: implementar "configurar modelo e effort do agente Ben"

Você é filho de um orquestrador (O2) numa cadeia de subagentes. Sua tarefa é implementar,
integralmente e na ordem, o plano já revisado e aprovado (2 rodadas de revisão completa + 1
correção final focada, todas fechadas). Não há revisão de plano pendente. Implemente.

## Leia, e só isto
1. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — o contrato da task:
   pedido original, Definição de Pronto, Fora do escopo, Autorizações, Premissas.
2. `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r3-plano-v2.md` (1100 linhas) — o
   plano definitivo, já com as correções de 3 rodadas de revisão incorporadas in loco, terminando
   na seção "## Resposta à revisão v3". É a fonte única. Execute as Etapas na ordem em que estão
   escritas (a numeração final do roteiro de teste foi renumerada para 7 e 8 na última correção).

Não leia `r1-plano.md`, `r2-revisao.md`, `r4-revisao-v2.md` nem `r6-revisao-v3.md` — são histórico
de revisão já incorporado no `r3-plano-v2.md`; abri-los é rodada perdida.

## Antes de editar
- Carregue a skill `code-write-code`.
- Carregue `code-get-coding-designs` e `code-get-project-context` para os dois apps que a task
  cruza: `project-backend` e `project-mobile`.

## O que fazer
- Execute todas as Etapas do plano, na ordem, nos dois projetos.
- Onde divergir do plano (arquivo que mudou desde a última leitura, tipo que não bate, etc.),
  resolva da forma mais fiel possível à intenção do plano e **registre a divergência e o motivo**
  na sua entrega — não pare para perguntar (não chame `AskUserQuestion`; ambiguidade vira premissa
  documentada).
- Respeite o "Fora do escopo" do briefing: não mexa no `geminiModel` mesmo que pareça código morto,
  não implemente catálogo dinâmico do OpenRouter, não toque em transcrição/AssemblyAI, não adicione
  i18n, não adicione controle de temperature/topP.
- Ao final, rode nos **dois** projetos:
  ```bash
  cd /root/so/repos/ben-prototype/project-backend && npm run lint:fix && npx tsc --noEmit
  cd /root/so/repos/ben-prototype/project-mobile && npm run lint:fix && npx tsc --noEmit
  ```
  O baseline antes da task é EXIT=0 nos dois comandos, nos dois projetos. O critério de pronto do
  plano amarra manter isso — corrija o que aparecer até os dois saírem limpos, ou registre
  explicitamente por que algo não fechou.

## Escreva sua entrega em
`.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r7-implementacao.md`:
- O que foi feito, por Etapa do plano (lista curta, uma linha por etapa está ok se não houve
  divergência).
- O que divergiu do plano e por quê, se houve.
- A saída final de `lint:fix` e `tsc --noEmit` dos dois projetos (resumida: exit code e, se não
  for 0, o que falta).
- Se você criou o `seed-task.ts` que o plano especifica para popular a tabela `tasks`: caminho do
  arquivo e como rodá-lo.

## Regras obrigatórias
- Não sub-delegue (não use a tool `Agent`).
- Não chame `AskUserQuestion`.
- Não faça commit nem push — isso é de outra rodada.
- Escreva o arquivo de entrega **antes** de retornar.
- Retorno final em até 10 linhas: caminho do arquivo, se lint/tsc fecharam limpos nos dois
  projetos, e se houve alguma divergência relevante do plano.
- Teto de janela: ~140k de contexto e 50 turns. Se a task inteira não couber, implemente o máximo
  possível na ordem do plano, registre exatamente onde parou e o que falta, e retorne mesmo assim
  com o arquivo escrito — não deixe trabalho feito sem registrar.
