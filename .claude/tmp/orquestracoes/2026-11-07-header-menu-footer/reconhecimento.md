# Reconhecimento — Topo centralizado e menu no footer do chat

Caminhos relativos a `packages/infra/mobile/ben/` (`B/`) e `packages/infra/mobile/design/` (`D/`), salvo indicação.

## Estado atual
veredito: confirma

O código mostra o que a spec supõe: topo do chat com logo + "Ben" | data à esquerda e botão de menu à direita (`B/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`), menu como rota modal `/menu` com as 4 opções (`B/app/(protected)/_layout.tsx:25`, `B/src/pages/menu/page.tsx`), campo + microfone/enviar sem nada à esquerda (`chat-footer.tsx`), e a galeria sem data no topo (`D/src/layout/components/common/chat-shell.tsx:23-30`). O workspace de tarefa usa um rodapé próprio (anexar + campo + `IconButton`), diferente do chat, o que a spec já tratava (RT-004).

## Unidade afetada
mais de uma: `@ben/mobile-ben` (app), `@ben/mobile-design` (galeria) e a doc `.claude/agents-docs/project-context/ux-philosophy.md`. Backend, domínio e banco não mudam.

## Lane de cada RT e PR
- RT-001 → codigo — sheet novo em `B/src/pages/chat/components/` seguindo `task-picker/task-picker-sheet.tsx:67-113` (Modal + reanimated + pan); revisor confere que `package.json` do app não ganhou dependência.
- RT-002 → codigo — `git diff` não toca o conteúdo de `B/src/layout/components/{menu-tasks,menu-notes,menu-reminders,menu-settings,menu-detail}/`, só os pontos de entrada e de volta (`goBackToMenu`, `closeSettings`, `B/src/layout/stores/menu-store.ts`, `B/src/pages/menu/page.tsx`).
- RT-003 → codigo — a galeria (`D/src/...`) é alterada em passo anterior ao do app, e o app copia o desenho dela (ordem dos passos do plano e dos commits).
- RT-004 → codigo — `B/src/layout/components/chat-input/` é usado por `chat-footer.tsx` e por `B/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`; o botão do menu só aparece em `chat-footer.tsx`. Visto também em PR-009.
- RT-005 → codigo — `.claude/agents-docs/project-context/ux-philosophy.md` (linhas 3, 21, 22, 27, 28 falam de "menu sidebar" que desliza do canto e de affordance no topo).
- RT-006 → codigo — botão do menu em `chat-footer.tsx` (ou componente novo) com `accessibilityLabel` vindo de `strings.menu` (`chat-strings.ts:15,53`) e área de toque de 44px (ver `## RT problemáticos`); o rótulo em pt-BR também aparece em S34.
- RT-007 → codigo — `D/src/core/screens.ts` (grupo `menu-sidebar`, linhas 125-130 e `COMPONENTS` :185) e `D/src/core/routes.tsx` (rotas `/app/menu-sidebar-*`): estados do menu lateral saem, estado do chat com o sheet aberto entra; `menu-tasks-*`, `menu-notes-*`, `menu-reminders-*` ficam.
- PR-001 → browser — `http://localhost:8081/chat`
- PR-002 → browser — `http://localhost:8081/chat`
- PR-003 → browser — `http://localhost:8081/chat`
- PR-004 → browser — `http://localhost:8081/chat`
- PR-005 → browser — `http://localhost:8081/chat` (se o navegador não liberar o microfone, cai no fallback da própria PR: foto da galeria `http://localhost:3002/app/chat-recording` e a linha do app fica `(sem captura)`)
- PR-006 → browser — `http://localhost:8081/chat`
- PR-007 → browser — `http://localhost:8081/chat`
- PR-008 → browser — `http://localhost:8081/chat`
- PR-009 → browser — `http://localhost:8081/tasks/{id de uma tarefa}` (rota `app/(protected)/tasks/[taskId]`)
- PR-010 → browser — `http://localhost:3002/app/chat-populated` (e demais rotas citadas nas provas)
- PR-011 → browser — `http://localhost:8081/chat`

Lane `teste`: nenhuma PR é de tipo teste, então não há `T0n`. O comando de teste existe (`pnpm test`), mas não há suíte de UI e nenhuma regra desta task é lógica pura com muitas bordas. O planejador pode somar um caso para a altura do campo (helper puro) se extrair um.

## RT problemáticos
- RT-006 contra o desenho aprovado: a V4 pediu botões de 32px (menu, microfone, enviar, cancelar), e o RT-006 exige área de toque de pelo menos 44px. Não é impossível: o plano assume o botão visual de 32px com `hitSlop` até 44px (`Pressable hitSlop`), e a prova é `codigo` mais o rótulo "Menu". Se o usuário preferir o botão visual de 44px, a V4 muda.
- CB-003 ("voltar do aparelho fecha o sheet"): no navegador não existe botão de voltar do aparelho. O que dispara `Modal onRequestClose` no Expo web é a tecla Escape; S17 usa Escape como equivalente web, e o voltar do Android fica sem prova no roteiro.
- CB-005 e CB-006 (teclado aberto): o navegador de teste não abre teclado virtual, então `useKeyboardHeight` (`B/src/pages/chat/hooks/use-keyboard-height`, não li o hook) não é exercitado do mesmo jeito. S21 a S23 provam com o campo focado (menu ao lado, foco some ao abrir o sheet); o deslocamento acima do teclado real só se confere no aparelho.
- CB-011 (menu com histórico carregando) e AC-018 (aviso do topo, chat vazio) pedem estado de dados que o app real não fabrica sozinho (ver `## Fixtures` e Dúvida 1).
- AC-001 e CB-012 fixam "Sat, Nov 7" e "sáb., 7 de nov.": `formatShortDate(new Date(), language)` usa a data de hoje; a prova só reproduz o texto se o relógio do navegador estiver fixo em 7/nov/2026 (`page.clock.setFixedTime`).

## Mapa do código
App, topo e rodapé do chat:
- [B/src/pages/chat/page.tsx:78-86](packages/infra/mobile/ben/src/pages/chat/page.tsx#L78) — header absoluto (`ChatTopBar` + `ActiveTaskPicker` + `ChatTopBanner`), altura medida por `onLayout` e usada como `paddingTop` (:88); `onOpenMenu={() => router.push(ROUTES.menu)}` em :82 sai.
- [B/src/pages/chat/page.tsx:107-120](packages/infra/mobile/ben/src/pages/chat/page.tsx#L107) — footer absoluto `bottom: keyboardOffset`, `px-4 pb-2 pt-2`, `onLayout` alimenta `bottomInset` (`footerHeight + FOOTER_GAP + keyboardOffset`, :98-110 e :93-97 para chat vazio). O campo que cresce muda essa altura; o `onLayout` já cobre.
- [B/src/pages/chat/page.tsx:123-135](packages/infra/mobile/ben/src/pages/chat/page.tsx#L123) — `SettingsSheetOverlay` do trace sheet já mora no chat (modelo para hospedar Settings e o sheet do menu).
- [B/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx:21-36](packages/infra/mobile/ben/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx#L21) — `h-[52px] justify-between pl-5 pr-4`; `BrandMark` + divisor `border-l` + data 13px (`formatShortDate`); `IconButton` do menu (`List` 22px) à direita. Passa a `justify-center`, sem o botão e sem a prop `onOpenMenu`.
- [B/src/pages/chat/utils/format-short-date.ts:3-11](packages/infra/mobile/ben/src/pages/chat/utils/format-short-date.ts#L3) — formato da data; reusar como está.
- [B/src/layout/components/brand-mark.tsx:66-90](packages/infra/mobile/ben/src/layout/components/brand-mark.tsx#L66) — logo 30px + "Ben" 23px.
- [B/src/pages/chat/components/chat-footer/chat-footer.tsx:15-58](packages/infra/mobile/ben/src/pages/chat/components/chat-footer/chat-footer.tsx#L15) — `ChatInput.Input` + `ChatInput.ActionFrame` (seta com texto, microfone sem); `voiceStatus==='recording'` troca tudo por `<RecordingBar />` (:27-29); mic desabilitado por `useCanRecord`.
- [B/src/layout/components/chat-input/chat-input-input.tsx:14-33](packages/infra/mobile/ben/src/layout/components/chat-input/chat-input-input.tsx#L14) — `TextInput` `h-[52px] rounded-[26px] border-[1.5px] border-field-border`, `returnKeyType="send"`, `blurOnSubmit={false}`, sem `multiline`.
- [B/src/layout/components/chat-input/chat-input-action-frame.tsx](packages/infra/mobile/ben/src/layout/components/chat-input/chat-input-action-frame.tsx) — botão de 68px com anel `brand-light` (some no desenho V4); [chat-input-root.tsx:27-33](packages/infra/mobile/ben/src/layout/components/chat-input/chat-input-root.tsx#L27) — `flex-row items-center gap-3`, contexto `ChatInputContext`; [chat-input-attach-button.tsx](packages/infra/mobile/ben/src/layout/components/chat-input/chat-input-attach-button.tsx) — `Plus` 20px, usado só no workspace.
- [B/src/layout/components/recording-bar.tsx:55-181](packages/infra/mobile/ben/src/layout/components/recording-bar.tsx#L55) — cartão com ponto pulsante "Recording", tempo (`recordingSeconds`), 15 `WaveBar`, "slide up to cancel" (pan com `CANCEL_THRESHOLD=56` e botão) e botão de parar de 48px; háptico no início. Usado também por `workspace-footer.tsx`.
- [B/src/layout/components/wave-bar.tsx:15-25](packages/infra/mobile/ben/src/layout/components/wave-bar.tsx#L15) — `Animated.View` com `className="w-1 rounded-full bg-wave"` e só `height` em `style`; é o problema do web (largura e cor só vêm do `className`).
- [B/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx:20-72](packages/infra/mobile/ben/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx#L20) — `ChatInput.AttachButton` + `Input` + `IconButton` enviar/microfone próprio (não usa `ActionFrame`); troca por `RecordingBar` ao gravar; desabilita em tarefa `finished`.
Menu e sheets:
- [B/src/pages/menu/page.tsx:15-52](packages/infra/mobile/ben/src/pages/menu/page.tsx#L15) — `Menu()` rota modal; `view` do `useMenuStore`; `view==='menu'` renderiza `MenuSidebarView` com `router.back()` (:28); hospeda detalhe de nota/lembrete e `SettingsView` em `SettingsSheetOverlay`; `reset()` ao desmontar (:24).
- [B/src/layout/stores/menu-store.ts:14-41](packages/infra/mobile/ben/src/layout/stores/menu-store.ts#L14) — `selectEntry` (settings abre sheet, outras trocam `view`), `goBackToMenu`, `closeSettings`. `goBackToMenu` é chamado só por `menu-tasks-view.tsx:17,26`, `menu-reminders-view.tsx:15,20` e `menu-notes-view.tsx:14,19`.
- [B/src/layout/components/menu-tasks/menu-tasks-view.tsx:21-22](packages/infra/mobile/ben/src/layout/components/menu-tasks/menu-tasks-view.tsx#L21) — ao tocar numa tarefa faz `router.back()` e depois `router.push(workspace)`; continua válido (a rota modal volta ao chat e empilha o workspace).
- [B/src/layout/components/menu/menu-sidebar.tsx:58-108](packages/infra/mobile/ben/src/layout/components/menu/menu-sidebar.tsx#L58) — lista das 4 entradas (ícone `size-9`, rótulo, `CountBadge`; Settings sem contagem), cabeçalho com `BrandMark` + X; [menu-sidebar-view.tsx:9-34](packages/infra/mobile/ben/src/layout/components/menu/menu-sidebar-view.tsx#L9) — contagens via `useCapturesCountsData`; strings em `B/src/layout/strings/menu-strings.ts:8-11`.
- [B/src/pages/chat/components/task-picker/task-picker-sheet.tsx:60-113](packages/infra/mobile/ben/src/pages/chat/components/task-picker/task-picker-sheet.tsx#L60) — o sheet que fecha arrastando (`CLOSE_THRESHOLD=80`) e tocando no fundo: modelo do sheet do menu. [B/src/layout/components/menu-settings/settings-sheet-overlay.tsx](packages/infra/mobile/ben/src/layout/components/menu-settings/settings-sheet-overlay.tsx) fecha só por toque no fundo e por `onClose`; não tem pan. [B/src/layout/components/menu/menu-sheet.tsx](packages/infra/mobile/ben/src/layout/components/menu/menu-sheet.tsx) — casca `rounded-t-3xl` com alça.
- [B/src/core/routes.ts:1-6](packages/infra/mobile/ben/src/core/routes.ts#L1) — `ROUTES`; [B/src/layout/stores/voice-store] (`selectVoiceStatus`, `startRecording`, `stopRecording`, `cancelRecording`).
Protótipo aprovado (V4), base visual:
- [B/app/prototipo/header-menu-footer/v4.tsx](packages/infra/mobile/ben/app/prototipo/header-menu-footer/v4.tsx) — pílula 44px, botões 32px, ícones 16px, `TEXT_MAX_LINES=5`, crescimento por `scrollHeight` (:58-80, só web), onda com `ProtoWaveBar`.
- [B/src/prototipo/header-menu-footer/shared.tsx](packages/infra/mobile/ben/src/prototipo/header-menu-footer/shared.tsx) — `ProtoTopBar` (:61), `ProtoScreen` (:172), `ProtoWaveBar` (:215, estilo explícito com a cor `#ab7b48` literal; a implementação troca por cor do tema).
- Rota de protótipo a remover no último passo: `B/app/prototipo/header-menu-footer/` e `B/src/prototipo/header-menu-footer/`. Não apagar `app/prototipo/` nem `src/prototipo/` inteiros: `alarme-tela-cheia` e `lembrete-criado-abrir-tela` são de outros protótipos.
Galeria:
- [D/src/layout/components/common/chat-shell.tsx:23-47](packages/infra/mobile/design/src/layout/components/common/chat-shell.tsx#L23) — header `h-16 justify-between px-6` com `BrandMark` + `IconButton "Menu"`, `main` `pb-44/pb-60`, footer `fixed bottom-0 ... pb-6` empilhando `peek` e `footer`. Cópias do mesmo header em [picker-shell.tsx:21-26](packages/infra/mobile/design/src/layout/components/common/picker-shell.tsx#L21), `detail-shell.tsx:16-19` (`menu-shell.tsx` é o menu lateral, não li se tem o mesmo header); [picker-shell.tsx:41-48](packages/infra/mobile/design/src/layout/components/common/picker-shell.tsx#L41) é o gabarito de "sheet sobre o chat" (dim `z-40`, sheet `z-50`).
- [D/src/layout/components/common/brand-mark.tsx:28-37](packages/infra/mobile/design/src/layout/components/common/brand-mark.tsx#L28) — só logo + "Ben"; nenhuma data na galeria. [D/src/layout/components/chat/chat-input.tsx] — `ChatInput` da galeria; a gravação é desenhada inline em [D/src/pages/chat-recording/page.tsx:22-53](packages/infra/mobile/design/src/pages/chat-recording/page.tsx#L22) (não existe componente de gravação).
- [D/src/layout/components/menu/menu-sidebar.tsx], [D/src/layout/components/common/menu-shell.tsx], [D/src/layout/components/ui/icon-button.tsx], páginas `D/src/pages/chat-*` (populated, composing, recording, ...), `task-picker-*`, `item-detail-*`, `menu-sidebar-*`; registro em [D/src/core/screens.ts](packages/infra/mobile/design/src/core/screens.ts) (`PAGES` :40 e :125, `COMPONENTS` :170-187) e [D/src/core/routes.tsx](packages/infra/mobile/design/src/core/routes.tsx).
Doc:
- [.claude/agents-docs/project-context/ux-philosophy.md](.claude/agents-docs/project-context/ux-philosophy.md) — linhas 3, 21, 22, 27, 28 (menu sidebar do canto, affordance no topo); "No bottom tab nav" (:22) continua verdadeiro.

## Padrão da vizinhança
- Sheets: `Modal transparent` + `GestureHandlerRootView` + `Animated.View` reanimated (`withTiming`), scrim `bg-inverse-surface/30` tocável, pan que fecha acima do limite, casca `rounded-t-3xl bg-surface-container-lowest`, alça `h-1 w-10`, `paddingBottom: insets.bottom` (padrão registrado em `code-write-code/coding-patterns/mobile/mobile-bottom-sheet-overlay.md`).
- Componentes de chat: pasta por componente em `pages/chat/components/<nome>/<nome>.tsx` (kebab-case, `memo`, props tipadas), strings `Localized<T>` em `pages/chat/strings/chat-strings.ts` via `useStrings`, ícones Phosphor com `color` explícito de `@/layout/utils/colors`, `cn()` para classes, mapas de variante em módulo.
- `ChatInput` é composto (`Root`, `Input`, `ActionFrame`, `AttachButton`) com contexto; o consumidor monta a ordem dos filhos.
- Galeria: shells (`common/*-shell.tsx`) concentram header e footer; as páginas só passam `children`/`footer`; componente novo ganha `<nome>-preview` + entrada em `COMPONENTS`.

## Reuso disponível
`BrandMark`, `BenLogo`, `formatShortDate`, `LANGUAGE_LOCALES`, `useStrings`/`chatStrings.menu`/`menuStrings`, `MenuSidebar` (as 4 linhas e os `CountBadge`; hoje inclui o cabeçalho com X, que o sheet não quer), `useCapturesCountsData`, `useMenuStore.selectEntry`, `MenuTasksView`/`MenuNotesView`/`MenuRemindersView`/`SettingsView`, `SettingsSheetOverlay` (hospedar Settings no chat, como o trace sheet), `task-picker-sheet` como gabarito do pan, `RecordingBar` e `voice-store`, `useCanRecord`, `colors` do tema, `IconButton`. No sandbox: `BrandMark`, `PickerShell`, `settings-sheet`, `menu-sidebar`.

## Memórias que se aplicam
nenhuma (o índice só tem `business-rules/razao-de-negocio-e-casos-de-uso-v1.md`, sem relação com header, menu ou composer).

## Fixtures
veredito: sem mecanismo
estado: nenhum
a mudar: nada

## Roteiro de comprovação
ambiente: app com backend real, `pnpm dev` na raiz (server :3333 + Expo web :8081; `BACKEND_URL=http://localhost:3333` no `.env.development` do app); galeria, `pnpm dev:design` (:3002). `pnpm dev:mobile` sozinho NÃO serve para as provas do app real: sem server o chat não carrega histórico, contagens nem tarefas.
estado: nenhum (sessão e dados do app real são montados num passo do plano; ver Dúvida 1)
url: http://localhost:8081/chat — chat do app em inglês, relógio do navegador fixo em 7/nov/2026, 390x844

S01 (PR-001; AC-001, AC-002) [final] o usuário abre o chat → o topo mostra, centralizados na largura, a logo, "Ben", um divisor vertical e "Sat, Nov 7", sem nenhum botão no topo
S02 (PR-001; AC-003, AC-011) [final] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo e o microfone à direita, os três na mesma linha, no desenho da V4 (`prototipo/v4.png`)
S03 (PR-001; AC-009, AC-011) [final] o usuário digita uma mensagem no campo → o botão à direita vira enviar (seta) e o botão do menu continua à esquerda
S04 (PR-002; AC-004) [final] (era vídeo) o usuário toca no botão do menu → sobe de baixo um sheet sobre o chat com Tasks, Notes, Reminders e Settings, nessa ordem
S05 (PR-002; AC-005) [final] o sheet está aberto → Tasks mostra "N active", Notes e Reminders mostram o total, e Settings não mostra contagem
S06 (PR-002; AC-006, AC-016) [final] o usuário toca em Tasks → abre a tela Tasks de hoje, com a lista e as contagens de hoje
S07 (PR-002; AC-008) [final] o usuário volta de Tasks → está no chat, sem o sheet na frente
S08 (PR-002; AC-006, AC-016) [final] o usuário abre o menu e toca em Notes → abre a tela Notes de hoje
S09 (PR-002; AC-008) [final] o usuário volta de Notes → está no chat, sem o sheet na frente
S10 (PR-002; AC-006, AC-016) [final] o usuário abre o menu e toca em Reminders → abre a tela Reminders de hoje
S11 (PR-002; AC-008) [final] o usuário volta de Reminders → está no chat, sem o sheet na frente
S12 (PR-002; AC-007, AC-017) [final] o usuário abre o menu e toca em Settings → abre a folha de Settings de hoje, com perfil, idioma e sair
S13 (PR-002; AC-008) [final] o usuário fecha Settings → está no chat, sem o sheet na frente
S14 (PR-002; AC-016) [final] o usuário abre o menu, toca em Tasks e toca numa tarefa → chega ao workspace dessa tarefa
S15 (PR-003; CB-001) [final] o usuário digita um rascunho, abre o menu e arrasta o sheet para baixo → o sheet fecha e o chat volta como estava, com o rascunho no campo
S16 (PR-003; CB-002) [final] o usuário abre o menu e toca no fundo escurecido → o sheet fecha e o chat volta como estava
S17 (PR-003; CB-003) [final] o usuário abre o menu e aperta Escape (equivalente web do voltar do aparelho) → o sheet fecha e o chat continua aberto
S18 (PR-003; CB-004) [final] o usuário toca duas vezes rápido no botão do menu → há um sheet só aberto, e um único gesto de fechar volta ao chat
S19 (PR-003; CB-011) [final] o usuário toca no menu com o histórico ainda carregando → o sheet abre com as 4 opções sobre o chat em carregamento
S20 (PR-003; CB-011) [final] o usuário toca no menu com o chat vazio → o sheet abre com as 4 opções sobre a tela de chat vazio
url: http://localhost:8081/chat — de volta ao chat com histórico
S21 (PR-004; CB-005, CB-007) [final] o usuário toca no campo para escrever → o campo fica focado e o botão do menu continua à esquerda dele, na mesma linha
S22 (PR-004; CB-006) [final] o usuário, com o campo focado e um rascunho, toca no menu → o campo perde o foco e o sheet abre
S23 (PR-004; CB-001, CB-006) [final] o usuário fecha o sheet → o chat volta com o rascunho preservado no campo
S24 (PR-004; CB-007) [final] o usuário cola um texto longo no campo → o texto continua inteiro e editável no campo (que cresce até 5 linhas e rola por dentro depois, `prototipo/v4-5.png`), e o botão do menu e o de enviar continuam dentro dos 390px
S25 (PR-004; AC-014) [final] o usuário envia a mensagem → ela aparece no chat e o Ben responde
S26 (PR-005; AC-010, CB-008) [final] o usuário toca no microfone → o rodapé inteiro vira a gravação (cancelar, onda, tempo correndo e enviar), sem o botão do menu (`prototipo/v4-3.png`)
S27 (PR-005; AC-015, CB-008) [final] o usuário cancela a gravação → o rodapé volta ao normal, com o menu à esquerda do campo, e nenhuma mensagem nova aparece no chat
S28 (PR-005; AC-010, AC-015) [final] o usuário grava de novo e toca para parar e enviar → a fala aparece como em transcrição no chat
S29 (PR-005; CB-009) [final] o usuário abre o menu enquanto a fala é transcrita → o sheet abre sobre o chat
S30 (PR-005; AC-015, CB-009) [final] o usuário fecha o sheet depois da transcrição → a mensagem da fala está no chat
S31 (PR-006; CB-010) [final] o usuário abre o chat com o microfone sem permissão → o botão do microfone aparece desabilitado e o botão do menu e o campo aparecem ativos
S32 (PR-006; CB-010) [final] o usuário, sem permissão de microfone, digita no campo → o botão à direita vira enviar e o menu abre o sheet
url: http://localhost:8081/chat — idioma pt-BR (`@ben/language` = `pt-BR`), relógio fixo em 7/nov/2026
S33 (PR-007; AC-001, CB-012) [final] o usuário abre o chat em português → o topo mostra "sáb., 7 de nov." ao lado do divisor, centralizado
S34 (PR-007; CB-012) [final] o usuário toca no botão "Menu" → o sheet mostra Tarefas, Notas, Lembretes e Configurações
url: http://localhost:8081/chat — inglês
S35 (PR-008; AC-018) [final] o usuário abre o chat com mensagens → a última mensagem fica encostada no rodapé, sem vão grande acima do campo
S36 (PR-008; AC-018) [final] o usuário abre o chat com tarefa ativa → o seletor de tarefa ativa aparece logo abaixo do topo
S37 (PR-008; AC-018) [final] o usuário abre o chat com um aviso no topo (ex.: sem conexão) → o aviso aparece abaixo do topo
S38 (PR-008; AC-018) [final] o usuário segura uma mensagem → aparece o menu de ações da mensagem
S39 (PR-008; AC-018) [final] o usuário abre os detalhes de uma resposta do Ben → aparece a folha de detalhes
S40 (PR-008; AC-018) [final] o usuário abre o chat sem nenhuma mensagem → aparece a tela de chat vazio, com o botão do menu no rodapé
url: http://localhost:8081/tasks/{id de uma tarefa} — workspace de tarefa
S41 (PR-009; AC-019) [final] o usuário abre o workspace → o topo é o de hoje, sem logo centralizada nem data
S42 (PR-009; AC-019, AC-011) [final] o usuário olha o rodapé do workspace → o botão de anexar está à esquerda do campo e o microfone à direita, no mesmo desenho do chat (pílula da V4)
S43 (PR-009; AC-019) [final] o usuário digita no campo e envia → o botão vira enviar e a mensagem aparece no workspace
S44 (PR-009; AC-019) [final] o usuário toca no microfone → o rodapé vira a mesma barra de gravação do chat
url: http://localhost:3002/app/chat-populated — galeria
S45 (PR-010; AC-012) [final] o usuário abre a tela de chat → o topo mostra logo, "Ben", divisor e "Sat, Nov 7" centralizados, sem botão
url: http://localhost:3002/app/task-picker-populated
S46 (PR-010; AC-012) [final] o usuário abre a seleção de tarefa → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/item-detail-note
S47 (PR-010; AC-012) [final] o usuário abre o detalhe → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/chat-populated
S48 (PR-010; AC-013, AC-011) [final] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo, igual a `prototipo/v4.png`
url: a rota nova do chat com o sheet aberto (nome definido no plano, p.ex. `/app/chat-menu-open`)
S49 (PR-010; AC-013, AC-004) [final] o usuário abre o estado do sheet → o chat com o sheet de Tasks, Notes, Reminders e Settings aberto, igual a `prototipo/v4-4.png`
url: http://localhost:3002/app/chat-recording
S50 (PR-010; AC-013, AC-011) [final] o usuário abre o estado gravando → o rodapé vira a gravação sem o botão do menu, igual a `prototipo/v4-3.png`
url: http://localhost:8081/chat — inglês
S51 (PR-011) [final] (era vídeo) o usuário abre o chat e envia um texto → o topo está centralizado e o Ben responde ao texto
S52 (PR-011) [final] o usuário grava e envia uma fala → a fala transcrita aparece no chat
S53 (PR-011) [final] o usuário abre o menu pelo rodapé e entra em Tasks → aparece a tela Tasks
S54 (PR-011) [final] o usuário volta de Tasks e abre Settings → está no chat e a folha de Settings aparece sobre ele
S55 (PR-011) [final] o usuário fecha Settings → está de volta ao chat

comando: n/a
T01: n/a (nenhuma RT ou PR de lane teste)

## Armadilhas
- O composer é uma peça só, mas hoje os dois rodapés divergem: o chat usa `ChatInput.ActionFrame` (68px, anel) e o workspace usa `AttachButton` + `IconButton` próprios (`workspace-footer.tsx:44-70`). O desenho V4 precisa de um slot à esquerda (menu no chat, anexar no workspace) e de um botão de ação único, ou o workspace fica com o desenho antigo (viola RT-004).
- O campo atual é `TextInput` de linha única com `h-[52px]` fixo. Para crescer é preciso `multiline`, altura controlada por `onContentSizeChange` (a V4 usa `scrollHeight`, que só existe no web) e `maxHeight` de 5 linhas; com `multiline` o Enter nativo quebra linha, então `onSubmitEditing`/`returnKeyType="send"` deixam de enviar e o envio fica no botão (AC-009 já diz "enviando pelo botão").
- `WaveBar` real só tem `height` em `style`; largura e cor vêm do `className`, que o `Animated.View` ignora no Expo web (a prova da gravação no navegador mostraria onda invisível). A `ProtoWaveBar` do protótipo resolve com estilo explícito, mas com a cor `#ab7b48` literal: passar largura e cor do tema por `style` no `WaveBar` real em vez de copiar o hex.
- A gravação atual é um cartão alto (ponto, "Recording", tempo, onda, "slide up to cancel" com pan e botão de parar); a V4 é uma pílula de 44px com X, onda e enviar. O gesto de deslizar para cancelar e a string `slideUpToCancel` ficam sem uso: o plano decide se o gesto sai (premissa: sai, o X cancela) e remove a string. O tempo correndo (AC-010) precisa continuar visível na pílula; a V4 mostrou 0:07 fixo.
- `Menu()` faz `reset()` ao desmontar e `view==='menu'` é o estado inicial que renderiza o `MenuSidebarView`. Se o sheet empurra `/menu` com a view já escolhida, o estado `'menu'` deixa de ser porta de entrada e `goBackToMenu` (3 views) tem que virar `router.back()`; sem isso o voltar cai numa tela em branco e o AC-008 falha.
- Fechar o sheet (Modal) antes de navegar: empurrar a rota com o Modal ainda aberto deixa o scrim na frente no web. Settings fica mais limpo hospedado no próprio chat (como o trace sheet em `chat/page.tsx:123`) do que numa rota `/menu` vazia atrás.
- O rodapé do chat é medido por `onLayout` e o espaço da lista usa `footerHeight + FOOTER_GAP + keyboardOffset`; qualquer `margin`/`position` novo no rodapé fora desse `View` quebra a ancoragem das mensagens (AC-018).
- Galeria: o header está copiado em `chat-shell`, `picker-shell` e `detail-shell` (conferir `menu-shell`); mudar as shells, não as 40+ páginas. A gravação da galeria está inline em `pages/chat-recording/page.tsx`, e `gallery-workflows.md` pede componente próprio com `<nome>-preview` e entrada em `COMPONENTS`. `design-tokens` só muda se nascer token.
- Auth no web: `ProtectedLayout` redireciona ao login se não há token nem usuário (`B/app/(protected)/_layout.tsx:19`). Em web o token mora em `localStorage` na chave `ben.jwttoken` (`token-storage.ts:9-10` + `secure-store.web.ts`), usuário em `@ben/user`, idioma em `@ben/language`. `DEV_ACCESS_TOKEN` do `.env.development` só aparece como botão em Expo Go (`use-dev-auth.ts:8`); não li se ele é assinado com o segredo do server local.
- Captura: o Playwright MCP (`browser-mobile-tester`, :8931) deu CONNECT_TIMEOUT nesta run. Caminho que funcionou: `playwright-core` em `/tmp/pw/node_modules` + `/usr/bin/google-chrome`, viewport 390x844, script de exemplo `/tmp/pw/r3/v4.js` (PNG direto na pasta da run). `/tmp/pw` é volátil: se sumir, `npm i playwright-core` numa pasta nova. Para a gravação, lançar o Chrome com `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` e conceder `microphone`; para S31, negar a permissão; para S37, `context.setOffline(true)`; para S33, `page.clock.setFixedTime`.
- Expo web já está de pé na :8081 (`.claude/tmp/expo-r2.log`). Reaproveitar, mas o `.env.development` só é lido na subida: apontar `BACKEND_URL` para o server local exige reiniciar o Expo.
- Nome do botão: o rótulo "Menu" já existe em `chat-strings.ts:15,53`; reaproveitar em vez de criar string nova.

## Dúvidas
- Como as provas do app real (S01 a S44, S51 a S55) conseguem sessão e dados? O `.env.development` do app aponta para um túnel ngrok (provavelmente morto) e o server local (:3333) está fora do ar; o login Google não roda no navegador de teste. — candidatas: (A) subir o server local (`pnpm dev`), apontar `BACKEND_URL` para ele, gerar um JWT local para um usuário do `dev.db` e gravar em `localStorage` (`ben.jwttoken`), com dados semeados por chamadas à API; (B) manter só o Expo e interceptar a API no Playwright (`page.route`) com token falso, o que dá controle total dos estados (histórico lento, vazio, offline) mas não prova que o Ben responde nem que a fala é transcrita (AC-014, AC-015); (C) A para o caminho feliz e B para os estados de borda (S19, S20, S37, S40). Recomendo: C, porque AC-014 e AC-015 exigem backend de verdade, e carregando, vazio e aviso só se fabricam de forma estável por interceptação.

## Premissas
- As três telas de lista e a folha de Settings abrem da mesma forma que hoje: o sheet do chat chama `selectEntry` e empurra `/menu` com a view escolhida; Settings é hospedada no próprio chat (nenhuma rota nova). A V4 não tem tela própria para elas.
- O sheet novo é um componente do chat (`pages/chat/components/menu-sheet/`), não o `MenuSidebar` inteiro: reusa as linhas e contagens, sem o cabeçalho com X, e segue o gabarito do `task-picker-sheet` (pan + scrim), mais a V4 (lista com 4 linhas).
- O botão do menu fica visual de 32px com `hitSlop` até 44px (RT-006) e ícone 16px, igual à V4. A V4 é a escolha aprovada e RT-006 é cumprido pela área de toque.
- No workspace o desenho novo do campo vale com o botão de anexar ocupando o slot esquerdo (não há botão de menu ali); o topo do workspace não muda.
- O gesto de deslizar para cancelar da gravação sai; cancelar é o X (V4). Se o usuário quiser manter o gesto, vira outro passo.
- Teto de 5 linhas do campo (decisão da V4, ajustável em `TEXT_MAX_LINES`) e `FIELD_MIN_HEIGHT` 44px entram como estão no app.
- A galeria ganha um estado novo `chat-menu-open` (página `chat`, estado `menu-open`), troca os estados `menu-sidebar-*` por ele (RT-007) e extrai a gravação para componente; o nome exato é do planejador.
- O voltar do Android não é provado no web; S17 usa Escape. Teclado virtual real só se confere no aparelho (ver `## RT problemáticos`).
- Memória e fixtures não participam; `ux-philosophy.md` é atualizado diretamente porque a spec (RT-005) pede, mesmo com o `CLAUDE.md` reservando as docs de `code-get-project-context` à skill `task-update-project-context` (essas docs de contexto não estão no escopo da spec; só `ux-philosophy.md`).

veredito: complexa
