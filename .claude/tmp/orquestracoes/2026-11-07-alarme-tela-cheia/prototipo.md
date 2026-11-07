# Protótipo — Alarme em tela cheia (r2)

## Variações
V1 — "Alarmy": fundo escuro de ponta a ponta com brilho âmbar; data e hora enormes no topo, título num balão de fala, Soneca como pílula no meio, Parar como botão largo embaixo e Concluir como link de texto abaixo; a Soneca abre um bottom sheet com a lista das opções; o aviso de liberar a tela cheia é um bottom sheet por cima do app.
V2 — "Cartão claro, ações empilhadas": fundo claro do app, título como destaque principal (grande, no centro) e hora menor acima; três botões empilhados embaixo (Parar cheio, Soneca e Concluir lado a lado); a Soneca troca a área dos botões, na própria tela, pela lista de opções (sem sheet nem tela nova); o aviso de liberar é uma tela inteira própria, com passos.
V3 — "Botão redondo central": hora e título no topo, um botão Parar circular grande no centro com anéis que pulsam, Soneca e Concluir como botões circulares menores abaixo, lado a lado; a Soneca abre uma segunda tela cheia com chips das opções (um toque confirma); o aviso de liberar é um cartão no topo da tela de alarme (banner), sem sair dela.
V4 — "V1 ajustada" (escolha do usuário na rodada 3): igual à V1 (fundo escuro com brilho âmbar, data e hora enormes, Soneca como pílula, Parar largo e Concluir em texto) com três ajustes: o balão de fala mostra só o título do lembrete (sem "às 15:00") e não tem o bico na borda de baixo; a escolha da soneca deixou a paleta escura/âmbar e virou uma tela clara com as cores do app, com um slider de tempo próprio no topo (5 min a 2 h, de 5 em 5 min, mostra a duração e o horário em que toca, com botão "Adiar X" para confirmar), acima das opções de hoje (10 min, 30 min, 1 h, 2 h, amanhã de manhã); aviso de liberar e configurações iguais à V1.

(Todas mostram: alarme tocando, escolha da soneca, título longo, fila de dois alarmes, aviso de liberar a tela cheia e o estado nas configurações de lembretes.)

## Pasta do protótipo
- Rotas: `packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/v1.tsx`, `v2.tsx`, `v3.tsx`
- Código: `packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/` (`shared.tsx`, `parts.tsx`, `settings-row.tsx`, `data.ts`, `strings.ts`, `variation-types.ts`, `variacao-1.tsx`, `variacao-2.tsx`, `variacao-3.tsx`; V4: `variacao-4.tsx`, `duration-slider.tsx`, `strings-v4.ts`)
- Abrir: `http://localhost:8081/prototipo/alarme-tela-cheia/v{n}?s={cenario}`; cenários `main` (padrão), `snooze`, `long`, `queue`, `permission`, `settings`; `&lang=en` troca para inglês. Na tela, Soneca abre a escolha da soneca e Parar, Concluir e a escolha de uma opção voltam ao alarme (no `queue`, passam para o segundo alarme).

## Prints (390x844, Expo web :8081)
| Arquivo | Conteúdo |
|---|---|
| prototipo/v1.png ... v1-6.png | V1: alarme (v1), escolha da soneca (-2), título longo (-3), fila de dois, "1 de 2" (-4), aviso de liberar a tela cheia (-5), estado nas configurações de lembretes (-6) |
| prototipo/v2.png ... v2-6.png | V2: mesma ordem |
| prototipo/v3.png ... v3-6.png | V3: mesma ordem |
| prototipo/v4.png ... v4-7.png | V4: alarme (v4), escolha da soneca com o slider no valor inicial de 15 min (-2), a mesma tela com o slider arrastado para 1 h 5 min (-3), título longo (-4), fila de dois, "1 de 2" (-5), aviso de liberar a tela cheia (-6), estado nas configurações (-7) |

Linha de `## Variações` de cada print: v1*.png = V1, v2*.png = V2, v3*.png = V3, v4*.png = V4.

## Premissas do protótipo
- O Playwright MCP não estava disponível como ferramenta nesta sessão. Os prints saíram da biblioteca `playwright` (cache do npx) com o Chrome local, viewport 390x844, esperando o texto da tela aparecer antes de cada captura. O mesmo efeito do `browser_resize` + screenshot.
- Rotas de protótipo ficam fora do grupo `(protected)`, então não há gate de login para preparar.
- Textos em pt-BR (idioma padrão dos outros protótipos); `&lang=en` mostra o inglês. Os rótulos das três ações seguem a spec: "Parar", "Soneca", "Concluir" (o painel de hoje usa "OK" e "Adiar"). Opções de soneca reaproveitam `alarmStrings.snoozeOptions`.
- Dados fixos: relógio 15:00 (sábado, 7 de novembro) em todas as telas; opções de soneca 15:10, 15:30, 16:00, 17:00 e amanhã 08:00 (a "manhã" de 08:00 é o padrão de `morningTime` visto nas configurações).
- A fila de dois alarmes aparece como contador "1 de 2" (V1 e V3 em linha pequena junto à data, V2 no cabeçalho); o print mostra o primeiro, o segundo aparece ao tocar em Parar.
- Estado nas configurações: mostrado só o caso "tela cheia desligada" (AC-011), logo abaixo da seção real de lembretes (`RemindersSettingsSection`), na forma própria de cada variação (linha, cartão, faixa).
- Aviso de liberar: V1 bottom sheet, V2 tela inteira com três passos, V3 diálogo central; o fundo é um trecho de chat do app só para dar contexto.
- Fundo da V1: sem foto nem gradiente nativo (não há `expo-linear-gradient` no app); o brilho âmbar é feito com círculos sobrepostos de opacidade decrescente. Se a escolha for a V1, a implementação decide gradiente real.
- Anéis pulsando da V3 usam Reanimated; no print aparecem num quadro qualquer da animação.
- Som, permissão real, erro e vazio ficaram de fora (são do plano). Nenhum arquivo existente do app foi editado; nenhum commit.
- Cópias locais: a lista de opções de soneca (`parts.tsx`) copia o visual das linhas do `AlarmPopupSnooze`, sem a chamada à API.
- Conferido: `tsc` sem erros nos arquivos novos e `eslint --fix` limpo. Prints abertos e conferidos: v1, v2, v3, v1-2, v2-2, v3-2, v1-3, v1-4, v2-4, v3-4, v1-5, v2-5, v3-5, v2-6, v3-6. Não abertos individualmente (mesmo código e mesmo script, gerados sem erro de página): v2-3, v3-3, v1-6.

## Premissas da V4
- Partida: o código da V1 (`variacao-1.tsx`) copiado para `variacao-4.tsx`; V1–V3 e os demais protótipos não foram tocados. A V4 reaproveita da V1 o brilho (`Glow`), a lista de opções (`SnoozeChoiceList`), o aviso de liberar (bottom sheet) e a linha das configurações; por isso os prints -6 (aviso) e -7 (configurações) saem iguais a v1-5 e v1-6.
- Balão: mantido com a sombra dura e os cantos de 32; só sai o bico (o losango rotacionado) e a linha "às 15:00". O espaço que o bico ocupava foi para o vão entre o balão e a Soneca.
- Cores da escolha da soneca: "cores do app" lido como o visual claro do app (fundo `background`, cartão `surface-container-lowest`, linhas `surface-container`, botão e slider em `primary`). A escolha deixou de ser um bottom sheet sobre o alarme escuro e virou uma tela clara cheia, com "Voltar" embaixo. Se o usuário quiser manter o sheet sobre o alarme, é uma troca de contêiner, sem mudar o conteúdo.
- Slider: o app e o pacote não têm lib de slider (`package.json` sem slider, só `@react-native-community/netinfo` no cache); montei um simples em `duration-slider.tsx` com `PanResponder` (toque e arraste, funciona no web e no nativo), sem lib nova. Faixa de 5 a 120 min, passo de 5 min, rótulos "5 min" e "2 h" nas pontas, `accessibilityRole="adjustable"` com ações de incremento e decremento.
- Valor inicial do slider: 15 min (premissa minha; a spec não define). O valor aparece grande ("15 min", "1 h 5 min") com "toca de novo às HH:MM" (calculado a partir de 15:00) e o botão de confirmar repete a duração ("Adiar 15 min"). Tocar nesse botão, como tocar numa opção, volta ao alarme (como na V1).
- Opções de hoje abaixo do slider, sob o rótulo "ou escolha uma"; o rótulo do topo continua "adiar para" e o do cartão é "tempo próprio".
- Título em inglês: o dado do protótipo é o mesmo da V1 ("Buscar o Leo na escola"), então `&lang=en` traduz só os rótulos, não o título (igual à V1).
- Prints: mesma biblioteca `playwright` com o Chrome local, 390x844. O v4-3 foi feito arrastando de verdade o slider com o mouse (do início ao meio da faixa), o que confirma que o arraste funciona no web; o toque em nativo não foi exercitado.
- Conferido: `tsc` sem erros e `eslint --fix` limpo. Prints abertos e conferidos: v4, v4-2, v4-3, v4-4, v4-5, v4-6, v4-7. Na primeira versão o valor "1 h 5 min" quebrava em duas linhas ao lado do horário; corrigi pondo o horário abaixo do valor. Nenhum arquivo existente do app foi editado; nenhum commit.

## Premissas da base
- Apagados: rotas `v1.tsx`, `v2.tsx`, `v3.tsx` e `variacao-2.tsx`, `variacao-3.tsx`. Nenhum outro arquivo do app importava esses.
- `variacao-1.tsx` fica: `variacao-4.tsx` importa `VARIATION_1` (usa `settingsRowVariant` e `PermissionScreen` da V1). Não refatorei a base; o implementador troca isso ao transformar a tela.
- Arquivos compartilhados (`parts.tsx`, `strings.ts`, `settings-row.tsx`, `variation-types.ts`, `shared.tsx`) misturam código usado só por V2/V3 (ex.: variantes `card` e `banner`, textos extras); ficaram como estão, conforme a tarefa.
- Conferido: `pnpm --filter @ben/mobile-ben typecheck` sem erros, eslint das duas pastas limpo, rota v4 abre no Expo web :8081 sem erro de página (prototipo/base-check.png, aberto e conferido). `git status --short` mostra só `?? packages/infra/mobile/ben/app/prototipo/` e `?? packages/infra/mobile/ben/src/prototipo/` (pastas novas, colapsadas pelo git, contendo a base e os outros protótipos intocados). Sem commit.

## Comentários do usuário (gate, rodada 3)
Escolha parcial: V1, com ajustes — vira V4 = V1 ajustada. Verbatim:
"v1, mas não precisa mostrar 'Buscar o Leo na escola as 15:00', somente 'Buscar o Leo na escola' é suficiente; o balão de fala é legal mas não quero o esse v da borda de baixo do balao; o v1-2 não tem nada haver com as cores do app e deve ter um slider em cima para customizar o tempo"
Requisitos que voltaram à spec: AC-003 (só o título, sem horário) e AC-016 (slider de tempo próprio no topo da soneca).

## Escolha
Variação:   V4 = V1 ajustada (só o título no balão, balão sem bico, soneca em tela clara nas cores do app com slider de tempo no topo)
Prints:     prototipo/v4.png, prototipo/v4-2.png, prototipo/v4-3.png, prototipo/v4-4.png, prototipo/v4-5.png, prototipo/v4-6.png, prototipo/v4-7.png
Base:       packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/v4.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/variacao-4.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/variacao-1.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/duration-slider.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/strings-v4.ts
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/strings.ts
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/parts.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/shared.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/settings-row.tsx
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/data.ts
            packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/variation-types.ts
Descrição:  Tela cheia escura com brilho âmbar (da V1): data e hora enormes no topo, título do
            lembrete num balão de fala sem bico, Soneca como pílula no meio, Parar como botão largo
            embaixo e Concluir como link de texto. Soneca abre tela clara no design system do Ben
            com slider de tempo próprio (5 min–2 h, passo 5, começa em 15 min) no topo e as opções
            de hoje abaixo. Aviso de liberar (bottom sheet) e configurações iguais à V1.
Comentários do usuário: rodada 3: "v1, mas não precisa mostrar 'Buscar o Leo na escola as 15:00', somente 'Buscar o Leo na escola' é suficiente; o balão de fala é legal mas não quero o esse v da borda de baixo do balao; o v1-2 não tem nada haver com as cores do app e deve ter um slider em cima para customizar o tempo". Rodada 4: "Aprovo a V4"; AC-003 e AC-016: "Aprovo as duas".
