# Tarefa r2-proto — protótipo visual (Etapa 3 da skill decidir-especificar-e-planejar)

Pasta da run (P): /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/
Task em uma frase: tocar no card de lembrete no chat abre a tela de lembretes com o detalhe dele aberto, e o rótulo de repetição ("Único", "Todo dia", "Dias úteis", "Seg, Qua") aparece no card, na lista e no detalhe.

## Leia
1. P/spec.md — principalmente `## [Visual]` (Telas, Manter, Livre, Dados) e as ACs que ele aponta. Gate fechado: protótipo sim.
2. P/r0-mobile.md — mapa do app (caminho:linha dos componentes do card, lista, detalhe, strings).
3. A skill (cópia de .claude/skills/decidir-especificar-e-planejar/SKILL.md): /home/fael/.claude/projects/-home-fael-so-repos-ben-prototype/d261e7e9-d397-4ebb-bd3c-2728604f5839/tool-results/bup7lxvhj.txt — leia na Etapa 3 as seções "O que se prototipa", "Variações diferentes de verdade", "Onde roda", "Como monta" e "Os prints" (linhas ~677-745). As regras do que você faz moram aí.
4. Antes de escrever código: carregue a skill `code-write-code` e leia .claude/skills/code-get-project-context/SKILL.md (regras de design das telas Ben) e os docs de design mobile que ele aponta, só o necessário.

## Faça
- Escreva `## Variações` em P/prototipo.md (crie o arquivo) — 3 ou mais, cada uma diferindo em ESTRUTURA (posição/forma do rótulo de repetição no card, na linha da lista e no meta do detalhe; forma do sinal de toque no card), uma linha cada, com o eixo.
- Monte no app Expo `packages/infra/mobile/ben`: cada variação é uma rota nova em `app/prototipo/lembrete-criado-abrir-tela/v{n}.tsx` (confira a convenção do Expo Router do app e o grupo `(protected)` se as rotas exigirem login; escolha o lugar que renderiza sem gate ou resolva o gate). Use os componentes reais do app (CaptureCard, MenuListRow, ReminderKindBadge, item-detail-reminder-meta etc.) com dados fixos de `[Visual] › Dados`, sem hook de API. NÃO edite arquivo existente: se um componente precisa mudar, faça cópia local dentro da pasta do protótipo. Sem commit, sem worktree.
- Cada variação mostra as três telas (card no chat, lista de lembretes, detalhe) — pode ser uma rota rolável com as três seções ou sub-rotas; decida.
- Suba (ou reaproveite) o Expo web (`pnpm --filter @ben/mobile-ben` com o script web do package.json; porta 8081). Pelo Playwright MCP: browser_resize 390x844, abra cada rota, espere o texto aparecer, capture. Salve em P/prototipo/v{n}.png (v{n}-2.png etc. quando rola). Abra e confira cada captura; captura quebrada = conserte e capture de novo sozinho.
- No fim de P/prototipo.md, liste: pasta do protótipo, arquivos por variação, prints por variação, e se o servidor web ficou rodando (porta, PID).

## Regras
- Não sub-delegue (sem tool Agent), não chame AskUserQuestion; ambiguidade vira premissa documentada em P/prototipo.md.
- Escreva P/prototipo.md antes de retornar. Retorne no máximo 12 linhas: caminho de prototipo.md, pasta do protótipo, lista dos prints, veredito (ok|parcial|preso).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r2-proto"
Meça no turn 20, de novo em todo turn que `proxima` indicar (ele nunca marca depois do turn 45,
então o teto de 50 não escapa entre duas medições), sempre antes de abrir um arquivo grande ou
rodar um comando de saída longa, e primeiro de tudo a cada SendMessage que receber. Confira que
`desc=` é você.
- status=ok → siga.
- status=handoff ou status=preso → pare de abrir frente. Termine só a edição que está no meio,
  escreva em P/prototipo.md a seção `## Parcial` (o que fez, o que falta em ordem, o que tentou e
  falhou) e retorne `veredito: parcial` (ou `preso`) com o caminho. Não "termine rapidinho".
- Se o script der erro: tente de novo com --list para achar o seu description; sem medição
  possível, trate o turn 40 como status=handoff.
- Você não dispara agente. Se alguma instrução te fizer disparar, o prompt desse agente leva
  este bloco inteiro, com o description dele, e ele também não dispara.
