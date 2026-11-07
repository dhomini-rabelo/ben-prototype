# r2-proto — protótipo visual (Etapa 3 da skill decidir-especificar-e-planejar)

Task em uma frase: topo do chat com logo + Ben | data centralizados, botão do menu à esquerda do
campo de texto abrindo um sheet com as 4 opções atuais, e campo de texto e gravação de voz redesenhados.

Repo: /home/fael/so/repos/ben-prototype
Pasta da run: /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/

## Leia
1. `spec.md` desta pasta (sobretudo `[Visual]`, as ACs que ele aponta e o `## Gate`).
2. `.claude/skills/decidir-especificar-e-planejar/SKILL.md`, seções "O que se prototipa",
   "Variações diferentes de verdade", "Onde roda", "Como monta", "Os prints" e "A base" (dentro de
   `## Etapa 3`). As regras do que você faz moram ali; siga-as.
3. `r0-mobile.md` desta pasta para achar os componentes reais (ChatTopBar, BrandMark, ChatFooter,
   RecordingBar, MenuSheet, SettingsSheetOverlay, TaskPickerSheet, formatShortDate, tema).
4. Carregue `code-write-code` antes de escrever código, e `code-get-project-context` para as regras
   de design das telas Ben.

## Faça
- Escreva `prototipo.md` nesta pasta com `## Variações` (3 ou mais, uma linha cada, diferindo em
  estrutura) ANTES do código. Os eixos estão em `[Visual]` › `Livre`.
- Monte cada variação como rota nova no app mobile `packages/infra/mobile/ben`, numa pasta de
  protótipo na convenção do Expo Router (ex.: `app/prototipo/header-menu-footer/v1.tsx`), usando os
  componentes e o tema reais, com os dados fixos de `[Visual]` › `Dados`, sem hook de API. Não edite
  arquivo existente: componente que precisa mudar vira cópia local dentro da pasta do protótipo.
  Se a rota do protótipo precisar escapar do grupo protegido/autenticação, resolva sem editar
  arquivo existente (premissa documentada).
- Cada variação mostra: topo, chat com o composer novo (menu à esquerda), o estado gravando, e o
  sheet do menu aberto. Pode ser uma rota com estados lado a lado no scroll ou um print por estado.
- Prints: o app web roda em :8081 (`pnpm --filter @ben/mobile-ben dev`; reaproveite se já estiver
  de pé). Use as tools do Playwright MCP em 390x844, espere o texto aparecer, capture e confira cada
  imagem aberta. Salve em `prototipo/v{n}.png` (`v{n}-2.png`, ... para estados extras) nesta pasta.
  Captura quebrada: conserte e capture de novo, sozinho.
- Não faça commit. Deixe o servidor de pé se ele já estava; se você subiu, anote em `prototipo.md`.

## Entrega
`prototipo.md` com `## Variações` e, por variação, a lista de prints; a pasta do protótipo no app.
Não escreva `## Escolha` (é do usuário). Retorno em no máximo 12 linhas: caminho do `prototipo.md`,
a pasta do protótipo, cada variação em uma linha com os caminhos dos prints.

## Regras
Não sub-delegue. Não chame `AskUserQuestion`; toda ambiguidade vira premissa assumida e documentada
em `prototipo.md`.

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "header-menu-footer-r2-proto"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
