# Tarefa — planejador, continuação c1 (Etapa 4, Passo 4.3) — alarme-tela-cheia

Você continua o plano que `alarme-tela-cheia-r6-plano` deixou parcial: ele gastou a janela lendo e não
escreveu nenhuma seção. A sua tarefa base é a mesma: `.claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/r6-plano-tarefa.md`
(leia-a; o bloco TETO de lá é substituído pelo do fim deste arquivo, com o SEU description).

## Comece por aqui
1. Leia `PASTA/plano.md` › `## Parcial` (PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/).
   Os fatos que o antecessor levantou valem: não os redescubra.
2. Leia `formats/plano.md`, `spec.md`, `roteiro.md` e `reconhecimento.md` (o mapa de código com
   arquivos e linhas está lá; ele é a sua base). `prompts/planejador.md` também.

## Orçamento de leitura (a lição da rodada anterior)
- Não carregue as skills inteiras de novo. De `code-write-code` e `code-get-coding-designs`, abra só o
  SKILL.md e no máximo 2 subarquivos que um passo concreto exija (ex.: padrão de teste e de mobile).
- Código do projeto: abra só o que o `## Parcial` lista como "em aberto" e que um passo precise citar
  com caminho e linha; use `offset`/`limit` ou `grep -n`, nunca arquivo inteiro acima de ~200 linhas.
- **Escreva cedo.** Até o turn 12, `plano.md` já tem o esqueleto com todas as seções obrigatórias e os
  checkpoints (substituindo o conteúdo atual; preserve os fatos do `## Parcial` onde couberem, em
  `## Premissas` ou nos passos). Depois preencha seção por seção com Edit, medindo a janela entre elas.
  Ao terminar, remova a seção `## Parcial`.
- Se o teto chegar, a seção `## Parcial` nova diz quais seções estão completas e quais faltam.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto. Escreva plano.md antes de retornar.
- Retorno no formato de `prompts/planejador.md` (≤10 linhas + `## Resumo do plano` literal).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r6-plano-c1"
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
