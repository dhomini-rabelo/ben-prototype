# Tarefa r4 — base do protótipo (Etapa 3, subagente proto-alarme-tela-cheia-base)

Task em uma frase: tela de alarme em tela cheia com som para lembretes de horário do Ben; o
usuário aprovou a V4, e você deixa só a base dela na árvore.

PASTA = .claude/tmp/orquestracoes/2026-11-07-alarme-tela-cheia/
Pasta do protótipo: packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/ e
packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/
Entrega: PASTA/prototipo.md, linha `Base:` da seção `## Escolha` (substitua o placeholder)

## Leia
1. PASTA/prototipo.md — `## Escolha` (V4 aprovada) e `## Variações`.
2. .claude/skills/decidir-especificar-e-planejar/SKILL.md, Etapa 3, subseção "A base" (~789-801).
3. Carregue code-write-code antes de editar.

## Faça
- Apague os arquivos que só servem às V1, V2 e V3 (rotas v1–v3.tsx e as variações delas em src/).
  O que a V4 importa (inclusive partes da V1 reaproveitadas) FICA. Se um arquivo mistura código da
  V4 com o das recusadas, mantenha-o (não refatore a base).
- Rode `pnpm --filter @ben/mobile-ben typecheck` (ou o tsc do pacote) e o eslint do pacote; a V4
  tem que continuar compilando. Confirme que a rota v4 ainda abre no Expo web :8081 (um print de
  conferência em PASTA/prototipo/base-check.png, aberto e conferido; use a lib `playwright` com o
  Chrome local se o MCP não estiver disponível).
- Rode `git status --short` na raiz. Só podem aparecer como novos a pasta da base e as pastas de
  outros protótipos que já existiam (header-menu-footer, lembrete-criado-abrir-tela — NÃO toque
  nelas).
- Preencha `Base:` em `## Escolha` com a lista de arquivos da base (caminhos a partir da raiz).
- Não apague os prints v1–v3 em PASTA/prototipo/ (são histórico do gate).
- Sem commit.

## Retorno (até 10 linhas)
`veredito: ok | parcial | preso`, lista da base, saída resumida de `git status --short`.

## Regras
- Não sub-delegue (não dispare agente). Não chame `AskUserQuestion`; toda ambiguidade vira
  premissa assumida e documentada no seu arquivo (seção `## Premissas da base` em prototipo.md).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "alarme-tela-cheia-r4-proto-base"
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
