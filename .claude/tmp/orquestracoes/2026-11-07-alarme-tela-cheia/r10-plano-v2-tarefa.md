# Tarefa — planejador, volta 2 de correção (Etapa 4, Passo 4.3) — alarme-tela-cheia

A revisão rodada 2 voltou `corrigir` com 1 bloqueio e 3 notas. Conserte `plano.md` no lugar (Edit
cirúrgico; não reescreva o plano). Esta é a última volta permitida.

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Plano: PASTA/plano.md
- Revisão: PASTA/revisao-plano-2.md (bloqueio dos passos 26 e 28: origem do `fullScreen` em
  `snoozeAlarm` no background; notas: passo 35 parte de `settings-row.tsx` do protótipo que o passo 37
  apaga; getter `actions` sem leitor; T14 sem o caso `status: 'active'` + `firedAt`).
- Contexto só por `grep -n`: PASTA/spec.md, PASTA/roteiro.md (contrato fechado; prova acrescentada
  aparece no resumo), PASTA/reconhecimento.md, `.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md`.

## O que fazer
1. Conserte o bloqueio (ou recuse com motivo escrito no plano). Código: só a linha citada.
2. Trate as 3 notas se o conserto for barato; senão registre em premissas/riscos.
3. Mantenha coerentes `## Cobertura`, desvios e `## Resumo do plano` (edite o resumo só onde mudou).
4. Acrescente `## Lista da volta 2` (bloqueio/nota → consertado | recusado, com o passo).

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto. Escreva antes de retornar.
- Retorno: no máximo 8 linhas (consertados, recusados, cobertura, provas acrescentadas, se o
  `## Resumo do plano` mudou e em quais bullets). **Não** copie o resumo inteiro no retorno.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r10-plano-v2"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/plano.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
