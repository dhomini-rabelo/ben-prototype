# Tarefa r2 — protótipo da tela de alarme em tela cheia (Etapa 3, subagente proto-alarme-tela-cheia)

Task em uma frase: tela de alarme em tela cheia com som para lembretes de horário do Ben
(estilo Alarmy), a ser escolhida pelo usuário vendo variações antes do plano.

Pasta da run: .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/ (PASTA)
Entrega: PASTA/prototipo.md (você cria) + prints em PASTA/prototipo/v{n}.png

## Leia
1. PASTA/spec.md — principalmente `[Visual]` (Telas, Plataforma, Referências, Manter, Livre,
   Dados) e as ACs que ele aponta. A spec tem `## Gate` aprovado.
2. PASTA/referencia-alarmy.png — referência que o usuário mandou.
3. .claude/skills/decidir-especificar-e-planejar/SKILL.md, Etapa 3, só as subseções "O que se
   prototipa", "Variações diferentes de verdade", "Onde roda", "Como monta", "Os prints" e
   "A base" (linhas ~677-801). As regras do que você faz moram aí.
4. Antes de editar: carregue as skills code-get-project-context e code-write-code.

## O que fazer
- Escreva `## Variações` em PASTA/prototipo.md antes do código (três ou mais, diferindo em
  estrutura, todas respeitando `[Visual]` › `Manter` e o estilo do app).
- Código em `packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/v{n}.tsx` (rotas) e, se
  precisar de partes compartilhadas ou cópias locais de componentes, em
  `packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/`. Esse é o padrão já usado por
  outros protótipos no repo (ex.: app/prototipo/header-menu-footer/, src/prototipo/
  header-menu-footer/) — use como exemplo, NÃO edite nem apague as pastas de outros protótipos.
  Não edite arquivo existente do app. Sem commit, sem worktree.
- Componentes reais e tema do app; dados fixos de `[Visual]` › `Dados`; sem API, só estado ativo.
- O Expo web já está rodando em :8081 (reaproveite). Prints pelo Playwright MCP em 390x844,
  esperando o texto aparecer; salve em PASTA/prototipo/v{n}.png (v{n}-2.png se rolar). Se o app
  tiver gate de login antes das rotas, prepare o estado. Abra cada print e confira; captura
  quebrada você conserta e refaz sozinho.
- Se `[Visual]` pedir algo que o protótipo não deve ter (som, permissão, erro), ignore: é do plano.

## Retorno (até 10 linhas)
`veredito: ok | parcial | preso`, caminho de prototipo.md, pasta do protótipo, lista dos prints
com a linha de `## Variações` de cada um. Premissas que você tomou vão em prototipo.md, seção
`## Premissas do protótipo`.

## Regras
- Não sub-delegue (não dispare agente). Não chame `AskUserQuestion`; toda ambiguidade vira
  premissa assumida e documentada no seu arquivo.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r2-proto"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em PASTA/prototipo.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
