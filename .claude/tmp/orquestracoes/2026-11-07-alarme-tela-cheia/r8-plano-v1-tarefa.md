# Tarefa — planejador, volta 1 de correção (Etapa 4, Passo 4.3) — alarme-tela-cheia

A revisão rodada 1 voltou `corrigir`. Você conserta `plano.md` no lugar (Edit cirúrgico; não reescreva
o plano). Siga `.claude/skills/decidir-especificar-e-planejar/prompts/planejador.md` no que ele diz
sobre volta de correção (procure por "volta", "bloqueio", "recus" com `grep -n`).

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Plano a corrigir: PASTA/plano.md
- Revisão: PASTA/revisao-plano-1.md (os 6 bloqueios e as 4 notas; a seção `## Parcial` dela lista o
  que o revisor não chegou a conferir — não é bloqueio, é o que a rodada 2 vai olhar).
- Contexto, por `grep -n` quando precisar: PASTA/spec.md, PASTA/roteiro.md (contrato fechado: prova
  acrescentada ou dispensada aparece no resumo), PASTA/reconhecimento.md.

## O que fazer
1. Conserte cada bloqueio (ou recuse com motivo escrito no plano). Confira no código só a linha que o
   bloqueio cita (`grep -n` / offset+limit); não releia o resto.
2. Trate as notas quando o conserto for barato; senão registre em premissas/riscos.
3. Mantenha coerentes `## Cobertura`, `## Desvios da spec`, `## Desvios de padrão` e o
   `## Resumo do plano` (atualize o resumo se um conserto mudou o que ele diz).
4. Acrescente ao fim do plano (ou na seção que o formato prevê) a lista: bloqueio → consertado |
   recusado, com o passo.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto. Escreva antes de retornar.
- Retorno no formato de `prompts/planejador.md` para volta de correção: ≤10 linhas (quais consertou,
  quais recusou, cobertura, desvios) + `## Resumo do plano` literal.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r8-plano-v1"
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
