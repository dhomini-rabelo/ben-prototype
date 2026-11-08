# Tarefa — revisor do plano, rodada 1 (Etapa 4, Passo 4.3) — alarme-tela-cheia

Siga, inteiro, `.claude/skills/decidir-especificar-e-planejar/prompts/revisor-plano.md`.
Substituição: a medição de teto é a do bloco TETO abaixo (com o seu description), não o `--self`.

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
- Rodada: 1
- Saída: PASTA/revisao-plano-1.md
- Entradas: PASTA/plano.md, PASTA/spec.md, PASTA/roteiro.md, PASTA/reconhecimento.md, PASTA/projeto.md,
  PASTA/prototipo.md, .claude/skills/decidir-especificar-e-planejar/formats/plano.md.
- Contexto: Dúvida 1 do reconhecimento foi assumida (A) pelo orquestrador, por delegação do usuário
  (briefing.md › Premissas): notify-kit + módulo Expo próprio de som em loop com USAGE_ALARM.

Skills: `code-write-code` e `code-get-coding-designs` — SKILL.md e só os subarquivos que os passos
tocam (mobile, testes, backend/domain). Não carregue tudo.

## Orçamento (os planejadores desta run estouraram a janela lendo)
- plano.md é grande: leia-o por seções (offset/limit). Código do projeto: confira por `grep -n` ou
  offset/limit os caminhos e linhas que os passos citam; amostre, não leia arquivos inteiros.
- Escreva revisao-plano-1.md cedo (esqueleto com veredito provisório) e complete com Edit.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada.
- Não edite arquivo do projeto nem o plano. Escreva o arquivo antes de retornar.
- Retorno: ponteiro, veredito (`aprovado` | `corrigir`), no máximo 10 linhas.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r7-revisao-1"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/revisao-plano-1.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
