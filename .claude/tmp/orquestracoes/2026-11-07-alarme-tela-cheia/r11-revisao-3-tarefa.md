# Tarefa — revisor do plano, rodada 3 (Etapa 4, Passo 4.3) — alarme-tela-cheia

Siga `.claude/skills/decidir-especificar-e-planejar/prompts/revisor-plano.md` (rodada ≥ 2).
Substituição: a medição de teto é a do bloco TETO abaixo, não o `--self`.

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Rodada: 3 (última; um `corrigir` aqui não volta ao planejador: os bloqueios viram premissa a
  confirmar pelo usuário no relatório final — escreva cada um em uma linha clara para isso).
- Saída: PASTA/revisao-plano-3.md
- Rodada anterior: PASTA/revisao-plano-2.md (1 bloqueio + 3 notas). Plano: PASTA/plano.md — comece por
  `## Lista da volta 2` e confira só os passos que ela cita (26, 28, 29, 35, 37, 1, 4 e `## Contratos`
  de `snoozeAlarm`), mais a coerência de `## Cobertura` e `## Resumo do plano`.
- As rodadas 1 e 2 já conferiram o resto do plano; não revise tudo de novo. Achado novo só se
  bloqueia a implementação.
- Premissa nova do planejador: `canUseFullScreenIntent` funcionando no handler de background com o app
  morto (não confirmada). Confira no `node_modules` do notify-kit se der com 1–2 `grep -n`; senão
  aceite como premissa com o fallback descrito.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa documentada.
- Não edite arquivo do projeto nem o plano. Escreva o arquivo antes de retornar.
- Retorno: ponteiro, veredito (`aprovado` | `corrigir`), no máximo 6 linhas.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r11-revisao-3"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/revisao-plano-3.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
