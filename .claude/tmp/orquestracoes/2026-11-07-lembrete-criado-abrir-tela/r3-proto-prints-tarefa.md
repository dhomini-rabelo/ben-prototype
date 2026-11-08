# Tarefa r3-proto-prints — refazer os prints das variações, uma tela por print

Pasta da run (P): /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/

## Por quê
O usuário não conseguiu ver bem os designs e pediu (verbatim): "não consigo ver os designs bem, separe melhor assim como home\fael\so\repos\ben-prototype\.claude\tmp\orquestracoes\2026-11-07-header-menu-footer\prototipo\v1.png".
Abra essa referência: /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png — é UMA tela inteira do app como ela aparece de verdade (header Ben com data, peek de task, bolhas, cards, composer no rodapé), 390x844, escala 1x, sem rótulo de seção, sem moldura, sem cortar no meio.
Compare com os prints atuais (P/prototipo/v1.png): eles empilham as três telas numa rota rolável com títulos "1 · CARD NO CHAT", "2 · LISTA..." dentro de molduras, em escala 2x, cortadas por altura. É isso que deve mudar.

## Leia
1. P/prototipo.md (variações V1-V3, premissas, arquivos e pastas do protótipo). As variações NÃO mudam: só a forma de apresentar.
2. P/spec.md `## [Visual]` (Telas, Dados).
3. A referência de como o protótipo anterior montou telas inteiras: /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo.md (seções de premissas e prints: telas inteiras com componentes reais; sheet desenhado inline com o MenuSheet real sobre fundo escurecido para o print ser estável; captura com playwright-core + Chrome).
4. Carregue a skill `code-write-code` antes de editar código.

## Faça
- Para cada variação V1, V2, V3, monte três telas inteiras, cada uma uma rota própria na pasta de protótipo existente (packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/ e src/prototipo/lembrete-criado-abrir-tela/), reaproveitando as peças que já existem lá:
  1. `v{n}.png` — a tela de CHAT inteira como no app real (header Ben, bolhas, composer embaixo), com os cards de lembrete da variação (Único, Todo dia, Seg, Qui, Quando acontecer — os dados atuais), um deles mostrado no estado pressionado se a variação usa isso como sinal de toque.
  2. `v{n}-2.png` — a tela de LEMBRETES inteira (header com voltar, lista de ativos e concluídos) com o rótulo da variação.
  3. `v{n}-3.png` — a mesma tela de lembretes com o SHEET de detalhe do lembrete aberto por cima (o que o toque no card abre), com o rótulo da variação.
- Se uma tela não cabe em 844 de altura, reduza os dados até caber (prefira caber a rolar); só se impossível, um print extra `v{n}-{k}.png` da continuação.
- Capture em viewport 390x844, deviceScaleFactor 1, screenshot só do viewport (não fullPage), esperando o texto aparecer. Substitua os arquivos antigos em P/prototipo/ (apague os v*.png velhos que não forem regravados). Abra e confira cada print contra a referência: tela inteira, legível, sem moldura nem rótulo de seção.
- Apague as rotas/código da apresentação antiga que não forem mais usados (só dentro das pastas de protótipo). Não edite arquivo existente fora delas. Sem commit.
- Atualize P/prototipo.md: seção `## Prints` com a lista nova por variação (caminho absoluto + o que cada print mostra) e as URLs das rotas no :8081. Mantenha `## Variações` como está.

## Regras
- Não sub-delegue (sem tool Agent), não chame AskUserQuestion; ambiguidade vira premissa em P/prototipo.md.
- Escreva P/prototipo.md antes de retornar. Retorne no máximo 12 linhas: lista dos prints, URLs, veredito (ok|parcial|preso).

TETO: 140k de janela e 50 turns, o primeiro que chegar manda. Sem exceção.
Meça com: .claude/skills/sem-nivel-0/scripts/medir-janela.sh "lembrete-criado-abrir-tela-r3-proto-prints"
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
