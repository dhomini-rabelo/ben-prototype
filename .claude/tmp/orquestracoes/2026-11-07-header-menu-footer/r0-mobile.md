# r0-mobile: reconhecimento (read-only) do app `packages/infra/mobile/ben`

Base dos caminhos: `packages/infra/mobile/ben/` (omitida abaixo). Contexto lido: `code-get-project-context` (SKILL.md, mobile/ben/{description,project-structure}.md, mobile/design/design-rules.md) e `.claude/memory/README.md` (categorias environment, decisions, rules, fails-and-lessons, vocabulary sem entradas; business-rules só tem razão de negócio v1, não pertinente a header/footer/menu).

## 1. Header atual
- Só existe na tela de chat (`app/(protected)/chat.tsx` -> `src/pages/chat/page.tsx`). `ChatTopBar` e `BrandMark` só são usados em `chat/page.tsx:82` e `layout/components/menu/menu-sidebar.tsx:63` (cabeçalho do próprio menu, BrandMark + X).
- Montagem: `src/pages/chat/page.tsx:78-86`: `View` absoluto `top-0 z-50 bg-background` (onLayout mede `headerHeight`, usado como `paddingTop` da lista, :88) contendo `ChatTopBar` (:82), `ActiveTaskPicker` (:83), `ChatTopBanner` (:84). `SafeAreaView edges top+bottom` em :76.
- `src/pages/chat/components/chat-top-bar/chat-top-bar.tsx` (memo, prop `onOpenMenu`): linha `h-[52px] flex-row items-center justify-between pl-5 pr-4` (:21).
  - ESQUERDA (:22-28): `BrandMark` (logo + "Ben") + `View` com `border-l border-outline-variant pl-2.5` contendo a data (`formatShortDate(new Date(), language)`, texto 13px, `font-sans-medium text-on-surface-variant`). Ou seja, hoje já existe "logo + Ben | data", só que alinhado à esquerda.
  - DIREITA (:30-36): `IconButton` 44px (`size-11`, fundo `surface-container-lowest`, sombra) com ícone Phosphor `List` (22px), label `strings.menu`; `onPress` = `router.push(ROUTES.menu)` (page.tsx:82; `ROUTES.menu = '/menu'`, `src/core/routes.ts:4`).
  - Centro: vazio.
- `BrandMark` (`src/layout/components/brand-mark.tsx`): `BenLogo` 30px + `Typography wordmark` "Ben" 23px; props `orientation`, `className`, `itemClassName`.
- Outras telas: `task-workspace` tem `workspace-top-bar/workspace-top-bar.tsx` e `workspace-footer/workspace-footer.tsx` próprios (não lidos a fundo; o pedido fala de logo+Ben+data e hambúrguer, que só existem no chat). Dúvida: o pedido vale só para o chat? (premissa: sim.)
- Sandbox de design (passo anterior à implementação, per CLAUDE.md): `packages/infra/mobile/design/src/layout/components/common/chat-shell.tsx:23-30` tem header com BrandMark à esquerda + botão Menu (lucide) à direita, sem data; rodapé via prop `footer`. Não foi lido a fundo se o design deve ser atualizado antes (dúvida de processo).

## 2. O que o menu hambúrguer faz hoje
- Não é drawer nem dropdown: `router.push('/menu')` abre uma rota Expo Router com `presentation: 'modal'` (`app/(protected)/_layout.tsx:25`; tela `app/(protected)/menu.tsx` -> `src/pages/menu/page.tsx`), tela cheia com fundo `surface-container-lowest`.
- `src/pages/menu/page.tsx:26-52`: `view` do `useMenuStore` (`src/layout/stores/menu-store.ts:3`, `MenuView = 'menu'|'tasks'|'notes'|'reminders'`). `view==='menu'` renderiza `MenuSidebarView` (:28, `onClose = router.back()`); outras views: `MenuTasksView`, `MenuNotesView`, `MenuRemindersView` (:29-31). Sheets internos: detalhe de nota/lembrete (`SettingsSheetOverlay` + `MenuSheet`, :33-46) e Settings (`SettingsSheetOverlay` + `SettingsView`, :48-50). `reset()` ao desmontar (:24).
- Opções (lista em `src/layout/components/menu/menu-sidebar.tsx:58-63`, `ENTRY_ICONS`; rótulos em `src/layout/strings/menu-strings.ts:8-11`; ação em `menu-store.ts:30-36` `selectEntry`):
  1. Tasks (`ListChecks`) com badge "N active" -> `view='tasks'` (`MenuTasksView`).
  2. Notes (`NotePencil`) com badge de total -> `view='notes'`.
  3. Reminders (`Bell`) com badge de total -> `view='reminders'`.
  4. Settings (`GearSix`), sem badge (`menu-sidebar.tsx:110`) -> `isSettingsOpen=true` (abre `SettingsView` em sheet, `settings-view.tsx`).
- Cabeçalho do menu: `BrandMark` + botão X ("Close menu") (`menu-sidebar.tsx:61-70`). Contagens vêm de `useCapturesCountsData` (`menu-sidebar-view.tsx:11`).
- "A opção atual" do pedido: DÚVIDA. O código não responde. Leituras possíveis: (a) o conteúdo atual do menu (as 4 entradas acima) dentro do sheet; (b) só uma entrada. Premissa sugerida: (a), o sheet do footer reaproveita as 4 opções existentes (Tasks, Notes, Reminders, Settings). Atenção: "opção atual" no singular pode significar "a opção que existe hoje".

## 3. Footer atual
- Só no chat: `src/pages/chat/page.tsx:107-120`: `View absolute inset-x-0 bottom-0 z-50` com `bottom: keyboardOffset`, filho (:111-113) `onLayout` mede `footerHeight`, `flex-col gap-2 bg-background px-4 pb-2 pt-2`, renderiza `ChatFooter` (:115). Altura usada em `bottomInset={footerHeight + FOOTER_GAP(16) + keyboardOffset}` (:24, :98-110) e no estado vazio (:93-97).
- `src/pages/chat/components/chat-footer/chat-footer.tsx` + `src/layout/components/chat-input/*`: `ChatInput.Root` = `flex-row items-center gap-3 w-full` (`chat-input-root.tsx:27-33`). Ordem: `ChatInput.Input` (campo texto, `h-[52px] flex-1 rounded-[26px]`, `chat-input-input.tsx`) e à DIREITA `ChatInput.ActionFrame` (56px, âmbar `bg-primary`, anel `brand-light`): seta `ArrowUp` se há texto (:39-45), `Microphone` fill se não há (:47-53; desabilitado sem permissão `useCanRecord`). Durante gravação (`voiceStatus==='recording'`), o footer inteiro vira `RecordingBar` (:27-29). Existe também `chat-input-attach-button.tsx` (`ChatInputAttachButton`), não usado no `ChatFooter` (grep apenas leu o arquivo; dúvida se é usado em outro lugar).
- Portanto à esquerda do input hoje não há nada: o botão de menu entraria à esquerda do `Input` na mesma linha (Root é `flex-row`), ou acima/abaixo. Dúvida de layout: o botão fica na linha do input (esquerda do campo) e some/permanece durante `RecordingBar`? O código não define.

## 4. Bottom sheet existente
- Sem lib de bottom sheet (nenhum `@gorhom/bottom-sheet`; grep por `bottom-sheet` só retornou os arquivos abaixo por `Modal`/`SettingsSheetOverlay`). Padrão do app = `Modal` RN transparente + `react-native-reanimated`:
  - `src/layout/components/menu-settings/settings-sheet-overlay.tsx` (genérico: props `isOpen`, `onClose`, `children`, `slideOffset?`; Modal transparente, backdrop `bg-inverse-surface/30`, slide-up 220ms). Usado em: `pages/menu/page.tsx:33,48` (detalhe e Settings), `pages/chat/page.tsx:123` (trace sheet).
  - `src/layout/components/menu/menu-sheet.tsx`: casca visual `rounded-t-3xl bg-surface-container-lowest`, grabber `h-1 w-10`, `paddingBottom: insets.bottom`.
  - `src/pages/chat/components/task-picker/task-picker-sheet.tsx:67-113`: Modal + `GestureHandlerRootView` + pan para fechar (`CLOSE_THRESHOLD=80`) + título label-caps; usado por `active-task-picker.tsx:33`.
  - Outros Modals: `message-actions-menu/message-actions-menu.tsx:96`, `alarm-popup-overlay.tsx`, `daily-summary-popup.tsx`.
- Dúvida técnica: o sheet de menu precisaria viver na tela de chat (hoje o menu é rota `/menu`). O `useMenuStore` e as views (`MenuTasksView` etc.) assumem estar dentro de `Menu` (`pages/menu/page.tsx`); abrir as listas a partir do sheet exige decidir se o sheet navega para `/menu` já na view escolhida ou renderiza as views. O código não responde.

## 5. Data e idioma
- Formato: `src/pages/chat/utils/format-short-date.ts:3-11`: `toLocaleDateString(LANGUAGE_LOCALES[language], {weekday:'short', month:'short', day:'numeric'})` e adiciona `year:'numeric'` se não for o ano corrente. `LANGUAGE_LOCALES`: `en -> 'en-US'`, `pt-BR -> 'pt-BR'` (`src/core/languages.ts:11-14`). Em en-US dá "Sat, Nov 7" (hoje, 2026-11-07, é sábado; formato inferido, não executado).
- Reaproveitável como está: `formatShortDate(new Date(), language)` (usado também em `day-divider.tsx:32` e `capture-card-meta.tsx`).
- Idioma da UI: `en` (padrão) e `pt-BR`, dicionários `Localized<T>` com `useStrings`; chave existente `menu: 'Menu'` / `'Menu'` em `src/pages/chat/strings/chat-strings.ts:15,53`; menu em `src/layout/strings/menu-strings.ts`. Qualquer texto novo precisa de `en` e `pt-BR`. Texto "Ben" é fixo (wordmark), não localizado.

## 6. Testes e execução
- Testes existentes no app: apenas `src/services/__tests__/notifications-service.test.ts` (Vitest, script `test:unit`). Nenhum teste de UI/e2e/playwright no repo do app (find por `*.test.*`, `*.spec.*`, `playwright*`, `e2e`). Não há `pnpm test` do app incluído nos checks do CLAUDE.md (só domínio).
- Prova de UI: agente `.claude/agents/browser-mobile-tester.md` (Playwright, 390x844, `http://localhost:8081`; exige dev server de pé, ex. `pnpm dev:mobile` na raiz).
- Web: `package.json` do app: `dev = pnpm icons && expo start --web --port 8081`. Há `*.web.ts` para audio/notifications/storage. Login Google: token persistido faz `/` ir direto a `/chat`; sem token, a prova de chat exige login (dúvida: como o tester loga no ambiente; ver instruções do agente, linhas ~73-83).
- Checks pós-tarefa (CLAUDE.md): na raiz `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`.

## Premissas assumidas (para o plano)
1. Escopo = tela de chat apenas.
2. Header: centralizar `BrandMark` + separador + data (`justify-center`), removendo o botão da direita; manter `ActiveTaskPicker` e `ChatTopBanner` abaixo.
3. Footer: botão hambúrguer (`IconButton` + `List`) à esquerda do `ChatInput.Input` no `ChatFooter`; toque abre sheet (padrão `SettingsSheetOverlay`/`MenuSheet`), não mais `router.push('/menu')`.
4. "Opção atual" = as 4 entradas existentes (Tasks, Notes, Reminders, Settings); a decisão de navegar a `/menu` na view certa vs. renderizar dentro do sheet fica aberta.
5. Pontos de impacto: `chat-top-bar.tsx`, `chat-footer.tsx`, `chat/page.tsx` (altura do header/footer medida por onLayout, :78-86, :107-120), strings `chat-strings.ts`, possivelmente `menu-store`/`menu-sidebar.tsx`, e o sandbox `design` (`chat-shell.tsx`) se o design vier primeiro.
