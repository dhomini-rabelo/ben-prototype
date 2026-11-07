# Protótipo: lembrete criado abre a tela de lembretes (r2-proto, prints refeitos em r3)

Escopo: rótulo de repetição no card do chat, na linha da lista e no meta do detalhe, mais o sinal de toque no card. Dados fixos de `[Visual] › Dados`, só o estado ativo, sem hook de API.

## Variações
V1 — pílulas irmãs: o rótulo é uma pílula própria (ícone de repetição) ao lado da pílula de horário no card, ao lado do selo de tipo na linha da lista e na linha de chips do detalhe; toque sinalizado por seta `>` à direita do card. Eixo: rótulo como elemento separado, seta como sinal.
V2 — rótulo absorvido: o rótulo entra dentro da pílula de horário do card ("amanhã 08:00 · Todo dia"), vira prefixo do texto de apoio na linha da lista ("Todo dia · capturado há 10min") e linha própria com ícone dentro do box do detalhe; toque só pelo estado pressionado (sem seta nem texto). Eixo: nenhuma peça nova, rótulo fundido ao que existe.
V3 — rodapé de ação e coluna dupla: o card ganha um rodapé separado por filete (rótulo à esquerda, "Ver lembrete >" à direita); a linha da lista ganha coluna à direita com horário em cima e rótulo embaixo (selo de tipo desce para a segunda linha); no detalhe o rótulo vira texto na primeira linha ("em 15h · Todo dia"). Eixo: rótulo como linha própria, texto de apoio como sinal de toque, hierarquia horário/rótulo em duas camadas.

## Premissas
- Rótulos fixos em pt-BR (a rota força o idioma pt-BR); en fica para o plano.
- Lembrete "Quando acontecer" não mostra rótulo de repetição: no card aparece o texto "Quando acontecer" no lugar (AC-004); na lista e no detalhe vale só o selo de tipo (AC-010/011).
- Horários são gerados a partir de "agora" (amanhã 08:00, amanhã 09:00, +2d 07:00, +3d 18:00), por isso os textos relativos ("em 15h") variam conforme a hora de captura; não é erro.
- Card do chat: 4 lembretes (Todo dia, Único, Seg Qui, Quando acontecer). Lista: Ana completa, com "Pagar o aluguel" concluído. Detalhe: "Tomar o remédio" aberto sobre a lista escurecida; editor omitido (AC-018, fora do escopo do protótipo).
- V2 mostra o 2º card (Ligar pro dentista) já no estado pressionado, só para a captura exibir o retorno visual.
- O detalhe no protótipo é o `ItemDetailRoot` real com `DetailMeta` (cópia local de `ItemDetailReminderMeta` com slots), pois o componente real não aceita o rótulo. `MenuListRow` real nas V1 e V2; cópia local (`RowV3`) na V3.
- Não há tela de rota sem login: as rotas ficam em `app/prototipo/` fora de `(protected)`, sem gate.
- r3: a apresentação empilhada (molduras, rótulos de seção, ScrollView) foi removida; cada tela é uma rota própria de tela inteira, 390x844, DPR 1, sem rótulo nem moldura. Capturas com `playwright-core` + `/usr/bin/google-chrome` (script em `/tmp/pw/r3p/shot.js`), só viewport, esperando o texto da tela aparecer.
- r3: o chat usa `ChatTopBar` e `ActiveTaskPeek` reais (peek com "Plan the Lisbon trip", 3 ativas, igual à referência) e um composer estático (`ChatComposer`, cópia visual do rodapé real). Cabe em 844 com 4 lembretes e uma mensagem do usuário, também na V3 (cards mais altos); nenhuma tela precisou de print de continuação.
- r3: a tela de lembretes é o cabeçalho do `MenuListShell` real (voltar + "Lembretes") com a lista completa (5 ativos, 1 concluído); o sheet é o `ItemDetailRoot` real desenhado inline sobre scrim `bg-inverse-surface/30`, para a captura ser estável. Na V3 o último concluído ("Pagar o aluguel") fica parcialmente atrás do sheet.
- Achados de layout: na V1 a linha da lista fica apertada (título trunca em "Tomar ...", "Acad...") com selo de tipo + rótulo + horário na mesma linha; datas absolutas ("9 de nov. de 2026, 7:00") já estouram na linha hoje e pioram nas V1/V2.

## Entrega
- Pasta do protótipo (código): `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` (rotas) e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/` (peças). Sem commit.
- Arquivos por variação: rota `app/prototipo/lembrete-criado-abrir-tela/v{n}.tsx` + `src/prototipo/lembrete-criado-abrir-tela/variacao-{n}.tsx`; compartilhados: `shared.tsx` (dados, cenas), `parts.tsx` (pílulas, `DetailMeta`, `TappableCard`).
- Rotas: `app/prototipo/lembrete-criado-abrir-tela/v{n}.tsx` (chat), `v{n}-2.tsx` (lembretes), `v{n}-3.tsx` (lembretes com sheet); páginas em `shared.tsx` (`ChatPage`, `ListPage`, `DetailPage`).
- Servidor Expo web: reaproveitado, já rodava em 8081 (PID 23795); não foi iniciado nem parado por este agente.
- Typecheck e eslint dos arquivos novos limpos.

## Prints
Todos 390x844, escala 1x, uma tela inteira por arquivo, sem rótulo de seção nem moldura (mesmo formato da referência `header-menu-footer/prototipo/v1.png`).

### V1 (pílulas irmãs + seta `>`)
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v1.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v1: chat inteiro (header Ben com data, peek de task, bolhas, 4 cards: Todo dia, Único, Seg Qui, Quando acontecer, composer).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v1-2.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v1-2: tela de Lembretes inteira (voltar, 5 ativos, 1 concluído).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v1-3.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v1-3: a mesma lista escurecida com o sheet de detalhe de "Tomar o remédio" aberto.

### V2 (rótulo dentro da pílula de horário; 2º card pressionado)
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v2.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v2: chat inteiro (header Ben com data, peek de task, bolhas, 4 cards: Todo dia, Único, Seg Qui, Quando acontecer, composer).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v2-2.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v2-2: tela de Lembretes inteira (voltar, 5 ativos, 1 concluído).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v2-3.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v2-3: a mesma lista escurecida com o sheet de detalhe de "Tomar o remédio" aberto.

### V3 (rodapé de ação no card; coluna dupla na lista; rótulo no detalhe)
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v3.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v3: chat inteiro (header Ben com data, peek de task, bolhas, 4 cards: Todo dia, Único, Seg Qui, Quando acontecer, composer).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v3-2.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v3-2: tela de Lembretes inteira (voltar, 5 ativos, 1 concluído).
- `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-lembrete-criado-abrir-tela/prototipo/v3-3.png` — http://localhost:8081/prototipo/lembrete-criado-abrir-tela/v3-3: a mesma lista escurecida com o sheet de detalhe de "Tomar o remédio" aberto.

Achado visível nos prints: na V1 a linha da lista fica apertada (títulos truncam; "Academia" e "Regar as plantas" perdem o título por completo na linha com selo + rótulo + data absoluta); V2 trunca "Regar as..." e "Ver se ..."; V3 mantém os títulos legíveis, mas "capturado há 3h" quebra em duas linhas.

## Escolha
Variação:   V2 — rótulo absorvido
Prints:     prototipo/v2.png (chat), prototipo/v2-2.png (lista de lembretes), prototipo/v2-3.png (lista com o detalhe aberto)
Base:       packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2.tsx, v2-2.tsx, v2-3.tsx; packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx + shared.tsx/parts.tsx no que a V2 usar (a limpeza da base decide)
Descrição:  nenhuma peça nova: o rótulo de repetição entra dentro da pílula de horário do card ("amanhã 08:00 · Todo dia"; "Único"; "Seg, Qui"; conditional mostra só "Quando acontecer"), vira prefixo do texto de apoio na linha da lista ("Todo dia · capturado há 10min") e linha própria com ícone dentro do box do detalhe. Sinal de toque do card: só o estado pressionado (sem seta nem texto). Usa CaptureCard, MenuListRow, ReminderKindBadge, ItemDetailRoot e MenuSheet reais.
Comentários do usuário: rodada 1 de prints: "não consigo ver os designs bem, separe melhor assim como home\fael\so\repos\ben-prototype\.claude\tmp\orquestracoes\2026-11-07-header-menu-footer\prototipo\v1.png" (prints refeitos, uma tela por arquivo). Rodada 2: "V2 — rótulo absorvido (recomendada)".

## Base final
packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2.tsx
packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2-2.tsx
packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/v2-3.tsx
packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx
packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/shared.tsx
packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/parts.tsx

Esses arquivos são o ponto de partida visual da implementação.
