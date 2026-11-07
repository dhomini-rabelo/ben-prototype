# Revisão do plano — rodada 2 — header-menu-footer

## Veredito
corrigir

## Convenções carregadas
- code-write-code: `SKILL.md` (os subarquivos `lint.md`, `mobile/{mobile-bottom-sheet-overlay,mobile-icon-colors}.md`, `frontend/{component-variant-maps,frontend-code-preferences,react-components}.md` foram lidos na rodada 1 e não mudaram; não reli).
- code-get-coding-designs: `SKILL.md` (os designs `mobile-app-structure`, `page-structure` e `feature-state-components-structure` vêm da rodada 1).
- Código lido nesta rodada, só nos trechos dos consertos: `B/src/pages/chat/components/task-picker/task-picker-sheet.tsx:1-112`, `B/src/layout/components/menu-settings/settings-sheet-overlay.tsx`, `B/src/layout/components/menu/menu-sheet.tsx`, `D/src/layout/components/common/{picker,detail,chat,menu,settings}-shell.tsx`, `D/src/layout/components/menu/menu-sidebar.tsx` (grep), `D/src/pages/menu-sidebar-preview/page.tsx`, `B/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`, `B/src/pages/chat/components/chat-footer/chat-footer.tsx`, `B/src/layout/components/chat-input/{chat-input-input,chat-input-action-frame}.tsx`, `B/src/layout/components/wave-bar.tsx`, `B/src/layout/components/recording-bar.tsx:1-20`, `B/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`, `B/src/layout/stores/menu-store.ts` (grep e :28-36), `B/src/layout/utils/colors.ts` (grep), `packages/infra/adapters/src/services/jwt.ts` (grep), `.claude/agents-docs/project-context/ux-philosophy.md` (grep), `B/src/prototipo/header-menu-footer/shared.tsx:178-211`, `prototipo/v4-4.png`.

## Bloqueios
### 1. No estado `/app/chat-menu-open` o scrim fica abaixo do topo e do rodapé do `ChatShell`, e o S49 não bate com `v4-4.png` — implementabilidade
Onde: plano.md:87 — passo 6 (scrim `fixed inset-0 z-40 bg-inverse-surface/30`, sheet em wrapper `… z-50 …`).
Regra: a prova S49 (plano.md:270) pede o estado "igual a `prototipo/v4-4.png`", e no print o topo (logo, "Ben", data) e o resto do chat ficam escurecidos sob o scrim (no protótipo o scrim é `z-30` sobre topo `z-10` e rodapé `z-20`, `shared.tsx:181,197,201`). O passo diz que a página é "o `chat-populated`", que monta o `ChatShell` (`pages/chat-populated/page.tsx:9`), e o `ChatShell` tem `<header … fixed … z-50>` (`chat-shell.tsx:23`) e `<footer … fixed … z-50>` (`chat-shell.tsx:43`). Com o scrim em `z-40`, o topo e o campo ficam acesos por cima do fundo escurecido. O gabarito citado (`picker-shell.tsx`) só funciona com `z-40` porque o topo dele é `z-10` e o rodapé `z-30`. Na validação o implementador teria que escolher sozinho entre mexer no `ChatShell` ou subir as camadas da página.
Conserto: no passo 6, subir as duas camadas da página acima do `ChatShell`: scrim `fixed inset-0 z-60 bg-inverse-surface/30` e wrapper do sheet `fixed bottom-0 left-1/2 z-70 flex w-full max-w-120 -translate-x-1/2 flex-col` (Tailwind `^4.3.0` no `D/package.json` aceita `z-<n>` com qualquer inteiro), e dizer que o `ChatShell` não muda.

## Notas
- plano.md:92 — passo 9: o passo descreve a classe do `disabled`, mas não diz que o `Pressable` recebe `onPress={onPress}` e `disabled={disabled}`. Os passos 15 e 16 dependem disso: no 16 a tarefa `finished` deixou de anular o `onPress` e passou a usar só o `disabled`. Conserto: acrescentar os dois props na frase do `Pressable`.
- plano.md:94 — passo 11: falta o valor inicial de `measuredHeight`. Conserto: `useState(TEXT_MIN_HEIGHT)`. Com o `onSubmitEditing` fora, o `onSend` e o `handleSubmit` do `chat-input-input.tsx:13-19` ficam sem uso; o lint pega, mas dá para listar.
- plano.md:105 — passo 15: hoje o enviar fica sem `onPress` quando `isDisabled` (`chat-footer.tsx:41`). O "a regra de `isDisabled` não muda" cobre isso só implicitamente. Conserto: escrever `disabled={isDisabled}` no botão de enviar.
- plano.md:112 — passo 18: `onOpenMenu={() => router.push(ROUTES.menu)}` é arrow inline sem argumento (`react-components.md`). Vale até o passo 24, que troca por `handleOpenMenu`. O lint não pega. Conserto opcional: `function handleOpenMenu()` já no passo 18.
- plano.md:101 — passo 13: na V4 o X usa `color={onSurface}` (`v4.tsx:95`) e o plano usa `ink`. A diferença visual é mínima; vale alinhar ao protótipo.

## Bloqueios da rodada anterior
1. Scrim com `className` em `Animated.View` — **corrigido**. Em plano.md:116 e 120-122 a árvore é `GestureHandlerRootView style={{ flex: 1 }}` > `View className="flex-1 justify-end"`, com o scrim `Pressable` > `Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}` > `View className="flex-1 bg-inverse-surface/30"` e o conteúdo em `Animated.View style={sheetStyle}`. É idêntica a `task-picker-sheet.tsx:73-87`. O RT-001 (plano.md:285) passou a reprovar `className` em `Animated.View`. O sheet sem `w-full` estica pelo `alignItems: stretch` padrão do pai, como no gabarito.
2. `translateY` sem partida e sem reset — **corrigido**. Em plano.md:117-119: `SLIDE_OFFSET = 600`, `ANIMATION_DURATION = 220`, o `useEffect` aberto/fechado igual a `settings-sheet-overlay.tsx:17-38`, o pan igual a `task-picker-sheet.tsx:54-64` e `SNAP_BACK_DURATION = 160`, que é o 160 literal do gabarito.
3. `<header>` dentro de `<header>` e tamanho da marca — **corrigido**. Em plano.md:72 o `CenteredTopBar` é um `div` com `BrandMark logoWidth={28} logoHeight={22}`. Em plano.md:74-75 o picker e o detail mantêm o `<header>` (`picker-shell.tsx:21`, `detail-shell.tsx:15`) sem `items-center justify-between px-6`, com `flex-col`, e o filho estica e centraliza. O chat troca o `div` de `chat-shell.tsx:24-29` e mantém o `topBanner` (:30). Tudo confere com o código.
4. Botões do `workspace-footer` — **corrigido**. Em plano.md:106-110 saem o `View` (`workspace-footer.tsx:49`) e o `ml-2`, entra `disabled={isFinished}` / `disabled={isFinished || !canRecord}` e o `onPrimary` sem `weight` fica como hoje (`:56,66`). Os imports que saem (`IconButton`, `View`, `cn`) são os de `:3,6,10`. Ver a nota sobre o `disabled` do passo 9.
5. `ux-philosophy.md` com "menu sidebar" restante — **corrigido**. Em plano.md:137-147 entram as linhas 3, 8, 14, 15, 19, 21, 22 e 27, e o texto de origem de cada troca confere letra por letra com o `grep` atual. Depois das trocas, o `grep` de verificação só acha "top bar" na frase nova da :21, porque "leading edge of the chat composer" não casa com "…chat surface". "No bottom tab nav" continua na :22.

Notas da rodada 1 que conferi nos passos tocados: passo 8 (`waveProgress`; o local `wave` está em `wave-bar.tsx:17-18`) ok; passo 11 (altura derivada no render, sem efeito) ok; passo 13 (`runOnJS` :7, `withSpring` :11, `Pressable` :3) ok; passo 15 (`ink` = `#1d1814` = `onPrimary`, `colors.ts:8,17`) ok; passo 17 (`MENU_ICON_SIZE`, `ink`, `useStrings`, `chatStrings`, `strings` em `chat-top-bar.tsx:5-11,18`; o `useLanguage` do mesmo import fica) ok; passo 24 (`handleCloseMenu`; `isSettingsOpen`, `closeSettings` e `selectEntry` existem em `menu-store.ts:13,18,30`) ok; passo 1 (`font-medium` direto) ok; passo 5 (a preview nova com o `MenuEntrySheet` e as três variantes, como a atual `menu-sidebar-preview/page.tsx`; o bloco "Faint chat backdrop" existe em `menu-shell.tsx:10-15`; as props do `MenuSidebar` são `{ variant?, counts?, className?, onSelect? }`, `menu-sidebar.tsx:11-16`) ok; passo 6 (wrapper do gabarito `picker-shell.tsx:43`) ok, mas veja o bloqueio 1; E1 (`JsonWebTokenJwtService` exportado direto de `services/jwt.ts:11`) ok; desvio `text-[13px]`/`text-[15px]` com o motivo reescrito (plano.md:349) aceito.

## Novos nesta rodada
- Bloqueio 1 (camadas do `chat-menu-open`). Escapou na rodada 1: o `z-40` do scrim já estava no passo 6, e a nota daquela rodada só tratou da largura do wrapper.

## Desvios de padrão julgados
- Passos 8 e 13 (`style` no `Animated.View`): aceito. O planejador não aplicou a alternativa sem desvio (`View` aninhado com `className`), e isso é escolha dele: o motivo continua verdadeiro.
- Passos 1, 3, 11 e 17 (`text-[13px]`, `text-[15px]`): aceito, com o motivo corrigido (`button` é semibold e de botão; 13px não tem token).
- Passo 20 (peça nova convivendo com a cópia do `task-picker-sheet`): aceito. O motivo confere, e a árvore agora segue o gabarito que funciona no web.

## Spec em dúvida
nenhum

## Premissas
- Contei o bloqueio 1 como implementabilidade porque o S49 compara com `v4-4.png` e as classes do passo 6 produzem outro resultado. Não subi a galeria: a conclusão vem do empilhamento `z-40` × `z-50` lido no código e do print.
- Não reabri os passos intocados desde a rodada 1 (3, 4, 7, 9, 10, 12, 14, 18, 19, 21, 22, 23, 25, 27, marcos, cobertura). Só registrei como notas o que apareceu de passagem ao ler código para os passos tocados.
- O caminho real do gabarito é `B/src/pages/chat/components/task-picker/task-picker-sheet.tsx`. O plano cita só o nome do arquivo, e o implementador o acha com `find`, então não contei isso como achado.
