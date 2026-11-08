# Plano — Topo centralizado e menu no footer do chat

> Caminhos: `B/` = `packages/infra/mobile/ben/`, `D/` = `packages/infra/mobile/design/`. Base visual: V4
> (`B/app/prototipo/header-menu-footer/v4.tsx` e `B/src/prototipo/header-menu-footer/shared.tsx`, prints
> `prototipo/v4*.png`).

## Resumo do plano

### O que muda

#### Checkpoint 1 — Galeria no desenho V4
- **Topo único nas shells.** Chat, seleção de tarefa e detalhe passam a mostrar logo, "Ben", divisor e "Sat, Nov 7" centralizados, sem botão.
- **Rodapé V4.** O campo vira a pílula de 44px com o botão do menu à esquerda e o microfone/enviar à direita; nas telas de workspace o botão da esquerda é o anexar. A gravação vira componente próprio (X, ponto, tempo, onda, enviar), usado no chat e no workspace.
- **Estado novo `/app/chat-menu-open`.** O chat com o sheet das 4 opções aberto entra; os estados do menu lateral (`menu-sidebar-*`) saem; Tasks, Notes e Reminders ficam. Nos estados de Settings, o fundo atrás da folha passa de menu lateral para chat.

#### Checkpoint 2 — Topo, campo e gravação novos no app
- **Topo centralizado.** O topo do chat fica só com logo, "Ben", divisor e data, sem o botão do menu.
- **Campo V4 compartilhado.** O campo de chat e o do workspace são a mesma pílula de 44px, que cresce até 5 linhas e depois rola. O envio passa a ser só pelo botão.
- **Gravação V4 compartilhada.** O cartão alto e o gesto de deslizar saem; ficam o X para cancelar, o tempo correndo, a onda (que passa a aparecer no navegador) e o enviar.
- **Botão do menu no rodapé.** Por enquanto ele abre o menu de tela cheia de hoje. O sheet chega no checkpoint 3.

#### Checkpoint 3 — Sheet do menu e caminho de volta
- **Sheet do menu no chat.** Ele sobe de baixo com fundo escurecido e fecha arrastando, tocando no fundo ou com voltar/Escape.
- **Entrada e volta.** Tasks, Notes e Reminders abrem a tela de hoje direto, e voltar delas cai no chat. Settings abre sobre o chat. O conteúdo das quatro não muda.

#### Checkpoint 4 — Doc e limpeza
- **`ux-philosophy.md`** passa a dizer que o menu abre do rodapé, em sheet. A regra "sem abas no rodapé" continua.
- **Remoção da rota de protótipo** `header-menu-footer`. Os protótipos `alarme-tela-cheia` e `lembrete-criado-abrir-tela` ficam.

### Decisões que travei sozinho
- **Envio só pelo botão.** Com o campo de várias linhas, o Enter quebra linha e não envia mais (hoje envia). O AC-009 fala em "enviando pelo botão".
- **Gravação sem deslizar para cancelar.** Cancelar passa a ser só o X da V4. As strings "Slide up to cancel" e "Recording" saem.
- **Botão do menu com 32px visuais e toque de 44px.** O botão tem 32px na tela e `hitSlop` até 44px, para cumprir o RT-006 sem mudar a V4. O microfone, o enviar, o X e o anexar seguem a mesma regra.
- **Settings abre sobre o próprio chat**, como a folha de detalhes de uma resposta. Tasks, Notes e Reminders continuam na rota `/menu`, que agora abre direto na tela escolhida e volta ao chat.
- **Sheet com peça reutilizável nova.** O sheet do menu usa uma peça nova, `DraggableSheetOverlay` (Modal, fundo escurecido e arrastar para fechar). A seleção de tarefa continua com a cópia própria dela.
- **Ordem do botão no rodapé.** No checkpoint 2 o botão do menu já fica no rodapé, mas abre o menu de tela cheia de hoje. Assim o app nunca fica sem menu entre os checkpoints.
- **Estado das provas.** O server das provas sobe com `PERSISTENCE_DRIVER=sqlite` (o padrão de dev guarda tudo em memória). Um script em `.claude/tmp/` cria dois usuários no `dev.db` (que hoje está vazio): um com dados semeados pela API e outro sem mensagens. S20 e S40 usam o usuário vazio com backend real. Só S19 (histórico carregando) usa interceptação (`page.route`), e S37 usa `context.setOffline`.
- **Nenhuma prova acrescentada nem dispensada.** As provas S01 a S55 entram como aprovadas, com a rodada marcada.

### O que fica de fora
- Migrar a seleção de tarefa para a peça de sheet nova.
- Atualizar as docs de `code-get-project-context` que citam o menu lateral (é da `task-update-project-context`).
- O teste do voltar físico do Android e do teclado virtual real (só no aparelho).

### Como se prova
- AC-001 — o topo mostra logo, "Ben", divisor e "Sat, Nov 7" / "sáb., 7 de nov." centralizados (S01, S33)
- AC-002 — não há botão no topo (S01)
- AC-003 — o menu fica à esquerda do campo e o microfone à direita, na mesma linha (S02, S21; RT-006 na lane codigo)
- AC-004 — tocar no menu sobe o sheet com as 4 opções na ordem (S04, S34, S49)
- AC-005 — as contagens são "N active" e os totais, e Settings não tem contagem (S05)
- AC-006 — Tasks, Notes e Reminders abrem as telas de hoje (S06, S08, S10)
- AC-007 — Settings abre a folha de hoje (S12)
- AC-008 — voltar ou fechar leva ao chat sem o sheet (S07, S09, S11, S13)
- AC-009 — o botão da direita vira enviar com texto (S03, S32)
- AC-010 — a gravação mostra o tempo correndo, cancela e envia (S26, S28)
- AC-011 — o campo e a gravação estão no desenho V4 (S02, S03, S42, S48, S50)
- AC-012 — o topo centralizado aparece nas telas da galeria (S45, S46, S47)
- AC-013 — a galeria mostra o menu no rodapé, o sheet aberto e a gravação (S48, S49, S50)
- AC-014 — o texto enviado aparece e o Ben responde (S25, S51)
- AC-015 — a fala parada é transcrita e enviada; a cancelada não envia nada (S27, S28, S30, S52)
- AC-016 — as telas de Tasks, Notes e Reminders e o workspace de uma tarefa funcionam como hoje (S06, S08, S10, S14)
- AC-017 — Settings mostra perfil, idioma e sair (S12)
- AC-018 — o resto do chat continua igual (S35 a S40)
- AC-019 — o workspace mantém o topo e ganha o campo e a gravação novos (S41 a S44)

## Objetivo
O chat do app e a galeria passam a ter o topo centralizado, sem botão, e o rodapé da V4. O menu abre de um sheet com as 4 opções a partir do botão à esquerda do campo. O workspace usa o mesmo campo e a mesma gravação, e a doc de UX descreve o menu no rodapé.

## Passos

### Checkpoint 1 — Galeria no desenho V4
1. (RT-003) **`D/src/layout/components/common/centered-top-bar.tsx`** (novo, `CenteredTopBar`, sem props) — `<div className="flex h-16 items-center justify-center">` (um `div`, não `<header>`: ele vai dentro do `<header>` fixo de cada casca, e `<header>` não pode descender de `<header>`) com `<BrandMark logoWidth={28} logoHeight={22} />` (o tamanho que as três cascas usam hoje), depois `<span className="ml-3 border-l border-outline-variant pl-3 text-[13px] font-medium text-on-surface-variant">Sat, Nov 7</span>`. A data é fixa porque a galeria é estática. `font-medium` vai direto: a `D/src/core/global.css` só tem `--font-sans`/`--font-mono` e tokens de texto com peso próprio, sem token de peso avulso.
2. (RT-003) **`D/src/layout/components/common/chat-shell.tsx`, `picker-shell.tsx`, `detail-shell.tsx`** — cada casca **mantém o seu `<header>` fixo** e troca só os filhos dele por `<CenteredTopBar />`:
    - `picker-shell.tsx:21` e `detail-shell.tsx:15`: o `<header>` perde `items-center justify-between px-6` (fica `fixed top-0 left-1/2 z-10 flex h-16 w-full max-w-120 -translate-x-1/2 flex-col bg-surface`) e recebe `<CenteredTopBar />` como filho único, no lugar de `BrandMark` + `IconButton`;
    - `chat-shell.tsx:24-29`: o `<div className="flex h-16 items-center justify-between px-6">` e os filhos dele dão lugar a `<CenteredTopBar />`; o `<header>` (:23) não muda e o `topBanner` (:30) continua abaixo, como hoje.

    Saem o `IconButton label="Menu"`, o import de `Menu` (lucide) e o de `IconButton`/`BrandMark` que ficarem sem uso em cada casca. O `menu-shell.tsx` não é cabeçalho de nada: é a casca do menu lateral (fundo de chat esmaecido + painel de 78% à esquerda), usada só pelas páginas `menu-sidebar-*`, e sai no passo 6 junto com elas.
3. (RT-003) **`D/src/layout/components/chat/chat-input.tsx`** — hoje o `ChatInput` (props `value`, `placeholder`, `mode: "idle" | "composing" | "disabled" | "sending-disabled"`, `onChange`, `className`) é uma pílula `rounded-full bg-surface-container-high` com o anexar `Plus` embutido à esquerda e `Send`/`Mic` `size-10` à direita, tudo `lucide-react`. O `ChatShell` não monta o rodapé: cada página passa `<ChatInput … />` na prop `footer`. Ele também é usado direto pelo `picker-shell.tsx:38` e por 11 páginas de workspace. Redesenhar como a pílula da V4:
    - container `flex w-full min-h-[44px] items-end gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 py-[3px]`, com a sombra de `v4.tsx:128`, e `disabled && "opacity-60"` como hoje;
    - o `<input>` fica (a galeria é estática), com `min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[15px] leading-5 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none`;
    - prop nova `leading?: ChatInputLeading`, com `type ChatInputLeading = "menu" | "attach"` e default `"menu"`, resolvida por um mapa no módulo: `menu: { icon: List, label: "Menu" }` e `attach: { icon: Plus, label: "Attach" }`. O botão é `flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface` com o ícone `size-4`;
    - à direita, `flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-60`, com `ArrowUp` `size-4` e `aria-label="Send"` quando há texto, e `Mic` `size-4` com `aria-label="Voice input"` sem texto. A regra de `hasText` e de `disabled` não muda.

    Com o default `"menu"`, as páginas `chat-*`, `capture-*`, `chat-input-preview` e o `picker-shell` ficam sem edição. As 11 páginas de workspace passam `leading="attach"`: `D/src/pages/workspace-{composing,edge-cases,empty,error,finished,list-populated,offline,pending-diff,permission-denied,text-populated,transcribing}/page.tsx`.
4. (RT-003) **`D/src/layout/components/chat/recording-bar.tsx`** (novo, `RecordingBar`) — a pílula `h-[44px] flex-row items-center gap-2 rounded-full border-[1.5px] border-field-border bg-surface-container-lowest px-1.5`. Da esquerda para a direita: o X (`size-8 bg-surface-container-low`, ícone 16px), o ponto `size-2 rounded-full bg-text-error`, o tempo `0:07` em `font-mono`, a onda `h-7 flex-1` com barras `w-1 rounded-full bg-wave` e o enviar `size-8 bg-primary` com `ArrowUp` 16px. Prop única `elapsed?: string`, default `"0:07"`. **`D/src/pages/chat-recording/page.tsx`** passa a usar esse componente no lugar do desenho inline (:22-53). **`D/src/pages/workspace-recording/page.tsx`** troca o seu desenho inline (o cartão com "Recording", o "0:04 / 0:30" e o botão `Mic` de `aria-label="Recording"`) por `<RecordingBar elapsed="0:04" />`, porque o workspace ganha a mesma gravação (AC-019). Criar **`D/src/pages/recording-bar-preview/page.tsx`** (`RecordingBarPreviewPage`, com `PreviewShell`), a rota `/components/recording-bar` em `core/routes.tsx` e a entrada `{ id: "recording-bar", title: "Recording Bar", file: "/components/recording-bar" }` em `COMPONENTS` (`core/screens.ts`).
5. (RT-003, RT-007) **`D/src/layout/components/menu/menu-entry-sheet.tsx`** (novo, `MenuEntrySheet`) — casca `rounded-t-3xl bg-surface-container-lowest` com alça `h-1 w-10`. Dentro, as 4 linhas da V4 (`v4.tsx:165-195`), com `counts={{ tasks: 3, notes: 12, reminders: 5 }}` ("3 active", "12", "5"; Settings sem contagem). As linhas já existem com essas classes no `<nav>` do `D/src/layout/components/menu/menu-sidebar.tsx` (`ENTRIES`, botão `gap-3 rounded-xl px-3 py-3.5`, ícone em `size-9 rounded-lg bg-surface-container-high`, `CountBadge`). Renomear o arquivo para **`menu-entry-list.tsx`** (`MenuEntryList`), no espelho do passo 21 do app: ficam `MenuEntryId`, `ENTRIES`, `CountBadge`, a regra de `variant`/`counts` e as props `{ variant?, counts?, className?, onSelect? }`; saem o `<aside>`, o cabeçalho com `BrandMark` + X e a altura cheia. O `MenuEntrySheet` renderiza `<MenuEntryList counts={…} />`. O único outro consumidor do `MenuSidebar` fora das páginas `menu-sidebar-*` é o **`D/src/layout/components/common/settings-shell.tsx`**, que desenha o menu lateral esmaecido atrás da folha de Settings: trocar esse fundo pelo fundo de chat esmaecido (o bloco "Faint chat backdrop" do `menu-shell.tsx`, `pointer-events-none absolute inset-0 … opacity-30` com a bolha "morning. what's on the list today?"), porque Settings passa a abrir sobre o chat. Na entrada de `COMPONENTS` (:185), trocar o menu-sidebar por `{ id: "menu-entry-sheet", title: "Menu Entry Sheet", file: "/components/menu-entry-sheet" }`; a rota `/components/menu-sidebar` (`core/routes.tsx:406`) e o lazy `MenuSidebarPreviewPage` (:295) viram `/components/menu-entry-sheet` e `MenuEntrySheetPreviewPage`, com a página `pages/menu-entry-sheet-preview/page.tsx` no lugar de `pages/menu-sidebar-preview/`. A página nova (`MenuEntrySheetPreviewPage`, com `PreviewShell`) mostra o `MenuEntrySheet` e, abaixo, as três variantes do `MenuEntryList` que a atual mostra do `MenuSidebar` (populated, loading, error). O `MenuEntrySheet` não tem props: `counts` é o valor fixo `{ tasks: 3, notes: 12, reminders: 5 }` dentro dele.
6. (RT-007) **`D/src/pages/chat-menu-open/page.tsx`** (novo, `ChatMenuOpenPage`) — o `chat-populated` com o fundo `fixed inset-0 z-60 bg-inverse-surface/30` e o `MenuEntrySheet` num wrapper `fixed bottom-0 left-1/2 z-70 flex w-full max-w-120 -translate-x-1/2 flex-col`, as classes do gabarito `picker-shell.tsx:43` (assim o sheet não ocupa a largura toda numa janela larga) com as camadas acima das do `ChatShell`. O `<header>` e o `<footer>` do `ChatShell` são `z-50` (`chat-shell.tsx:23,43`), e com o fundo em `z-60` o topo e o campo ficam escurecidos sob ele, como em `prototipo/v4-4.png` (no protótipo, scrim `z-30` sobre topo `z-10` e rodapé `z-20`, `shared.tsx:181,197,201`). O Tailwind `^4.3.0` do `D/package.json` aceita `z-<n>` com qualquer inteiro. O `ChatShell` não muda. Rota `/app/chat-menu-open` em `core/routes.tsx` e estado `{ id: "menu-open", title: "Menu open", file: "/app/chat-menu-open" }` no `states` da página `chat` em `PAGES`. Remover do `PAGES` o grupo `menu-sidebar` (:125-130), as rotas `/app/menu-sidebar-*` (`core/routes.tsx:384-386`) com os lazies `MenuSidebar{Populated,Loading,Error}Page` (:229-237), as pastas `D/src/pages/menu-sidebar-{populated,loading,error}` e o `D/src/layout/components/common/menu-shell.tsx`, que só elas usam. As páginas `menu-tasks-*`, `menu-notes-*` e `menu-reminders-*` ficam.
7. (infra, fecha o checkpoint 1) — `pnpm lint:fix` e `pnpm --filter @ben/mobile-design typecheck`; conferir num print de `/app/chat-populated` que o rodapé bate com `prototipo/v4.png`. Commit `feat(design): topo centralizado, rodapé V4 e sheet do menu na galeria`.

### Checkpoint 2 — Topo, campo e gravação novos no app
8. (RT-004) **`B/src/layout/components/wave-bar.tsx`** — tirar o `className` e passar a forma por estilo: `style={[{ width: 4, borderRadius: 2, backgroundColor: wave, height }, animatedStyle]}`, com `wave` importado de `@/layout/utils/colors`. O local `const wave = Math.sin(...)` do worklet (`wave-bar.tsx:17`) passa a se chamar `waveProgress` (e o uso em :18 acompanha), para não sombrear a cor importada. Motivo: o `Animated.View` ignora `className` no web, e a onda some (armadilha do reconhecimento).
9. (RT-004) **`B/src/layout/components/chat-input/chat-input-icon-button.tsx`** (novo, `ChatInputIconButton`) — props `{ label: string; onPress?: () => void; disabled?: boolean; variant: ChatInputIconButtonVariant; children: ReactNode }`, com `type ChatInputIconButtonVariant = 'primary' | 'subtle'` e um mapa de variantes no módulo (`primary: 'bg-primary'`, `subtle: 'bg-surface-container-low active:bg-surface-container-high'`). O botão é um `Pressable` com `onPress={onPress}`, `disabled={disabled}`, `accessibilityRole="button"`, `accessibilityLabel={label}`, `hitSlop={6}` (32 + 12 = 44px, RT-006), `className={cn('size-8 items-center justify-center rounded-full', variantClasses[variant], disabled && 'opacity-40')}`. Registrar como `ChatInput.IconButton` em `chat-input/index.tsx`. Remover `ActionFrame` e `ActionButton` do índice e apagar `chat-input-action-frame.tsx` e `chat-input-action-button.tsx`. O `grep` confirmou: o `ChatInputActionButton` não tem consumidor fora do índice (ele mesmo usa o `ActionFrame`), e o `ActionFrame` só é usado por ele e pelo `chat-footer.tsx:40-53`, que o passo 15 reescreve. O `CaptureCardActionButton` é outro componente e não muda.
10. (RT-004) **`B/src/layout/components/chat-input/chat-input-root.tsx`** — o container vira a pílula da V4: `min-h-[44px] flex-row items-end gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 py-[3px]`, mais a sombra de `v4.tsx:128`. O contexto `ChatInputContext` não muda.
11. (RT-004) **`B/src/layout/components/chat-input/chat-input-input.tsx`** — `TextInput` com `multiline`, sem `h-[52px]`, sem borda própria e sem `returnKeyType="send"`/`onSubmitEditing`. As constantes ficam no módulo: `TEXT_LINE_HEIGHT = 20`, `TEXT_VERTICAL_PADDING = 12`, `TEXT_MAX_LINES = 5`, `TEXT_MIN_HEIGHT = 32` e `TEXT_MAX_HEIGHT = TEXT_LINE_HEIGHT * TEXT_MAX_LINES + TEXT_VERTICAL_PADDING` (112). A altura medida é um estado `const [measuredHeight, setMeasuredHeight] = useState(TEXT_MIN_HEIGHT)` atualizado em `onContentSizeChange` com `Math.min(Math.max(contentSize.height + TEXT_VERTICAL_PADDING, TEXT_MIN_HEIGHT), TEXT_MAX_HEIGHT)`, que funciona no nativo e no react-native-web multiline. Não usar `scrollHeight`, que é só web e só existe no protótipo. A altura usada é derivada no render, sem `useEffect`: `const inputHeight = draft.length === 0 ? TEXT_MIN_HEIGHT : measuredHeight` (`draft` é o valor que o input já lê hoje); assim, quando o rascunho é limpo após enviar, a altura volta a 32 sem `setState` em efeito (`react-hooks/set-state-in-effect`, `lint.md`). `scrollEnabled={inputHeight >= TEXT_MAX_HEIGHT}`. Estilos: `style={{ lineHeight: TEXT_LINE_HEIGHT, height: inputHeight }}`, `className="min-w-0 flex-1 px-2 py-1.5 font-sans text-[15px] text-on-surface"` e `placeholderTextColor` vindo de `@/layout/utils/colors`. Com o `onSubmitEditing` fora, saem também o `handleSubmit` (`chat-input-input.tsx:15-19`), o `onSend` do destructuring do `useChatInputContext()` (:13) e o `blurOnSubmit`; o `ChatInputContext` continua expondo `onSend`.
12. (RT-004) **`B/src/layout/components/chat-input/chat-input-attach-button.tsx`** — passa a renderizar `ChatInputIconButton variant="subtle"` com `Plus` 16px (`color={ink}`), mantendo o rótulo atual.
13. (RT-004) **`B/src/layout/components/recording-bar.tsx`** — reescrever como a pílula da V4: `h-[44px] flex-row items-center gap-2 rounded-full border-[1.5px] border-field-border bg-surface-container-lowest px-1.5`, mantendo a prop `className` e o `cn`. Os filhos são:
    - `ChatInputIconButton variant="subtle" label={strings.cancelRecording} onPress={handleCancel}` com `<X size={16} color={onSurface} />`, a cor da V4 (`v4.tsx:95`), com `onSurface` de `@/layout/utils/colors`; o `handleCancel` de hoje fica (háptico `Warning` + `cancelRecording()`);
    - o ponto, que é um `Animated.View` com `dotStyle` (pulso de opacidade): a forma vai por estilo, `style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: textError }, dotStyle]}`, com `textError` de `@/layout/utils/colors`, pelo mesmo motivo do passo 8 (hoje está em `className="size-2 rounded-full bg-text-error"`);
    - o tempo `formatTime(elapsedSeconds)` (o formatador `formatTime` e o seletor `elapsedSeconds = useVoiceStore((store) => store.recordingSeconds)` já existem no arquivo, :31 e :44), em `Typography variant="label-caps" className="font-mono normal-case text-on-surface-variant"` como hoje;
    - a onda `h-7 flex-1 flex-row items-center justify-center gap-1`, com os mesmos `WAVEFORM_BARS`, `WaveBar`, `waveClock`, `WAVE_STAGGER` e `WAVE_DURATION` de hoje;
    - `ChatInputIconButton variant="primary" label={strings.stopRecording} onPress={handleStop}` com `<ArrowUp size={16} color={ink} />`.

    Saem o `GestureDetector`/`Gesture.Pan`, `CANCEL_THRESHOLD`, `dragY`, `cardStyle`, o cartão `Animated.View`, o rótulo `strings.recording`, o texto `strings.slideUpToCancel`, o `Microphone`, os imports `runOnJS`, `withSpring` e `Pressable` (`recording-bar.tsx:3,7,11`) e o de `onSurfaceVariant` se ficar sem uso. O háptico do início (`useEffect` :52-54) e o pulso do ponto ficam. Imports de ícones: `ArrowUp, X` de `phosphor-react-native`. Em **`B/src/layout/strings/recording-strings.ts`** remover `slideUpToCancel` e `recording` nos dois idiomas, se o `grep` confirmar que não têm outro uso.
14. (RT-004, RT-006) **`B/src/pages/chat/components/chat-menu-button/chat-menu-button.tsx`** (novo, `ChatMenuButton`, com `memo`) — prop `{ onPress: () => void }`. Renderiza `ChatInput.IconButton variant="subtle" label={strings.menu}`, com `strings` de `useStrings(chatStrings)` (a chave `menu` já existe em `chat-strings.ts:15,53`) e `<List size={16} color={ink} />` de `phosphor-react-native`.
15. (RT-004) **`B/src/pages/chat/components/chat-footer/chat-footer.tsx`** — props `{ onOpenMenu: () => void; onStartRecording?: () => void }`. Durante a gravação o rodapé continua sendo `<RecordingBar />`. Fora dela: `ChatInput.Root` > `<ChatMenuButton onPress={onOpenMenu} />`, `<ChatInput.Input />` e `ChatInput.IconButton variant="primary"`. Com texto, o botão é `<ArrowUp size={16} color={ink} />` com `label={strings.send}`, `onPress={handleSend}` e `disabled={isDisabled}` (hoje o enviar anula o `onPress` quando `isDisabled`, `chat-footer.tsx:42`); sem texto, é `<Microphone size={16} weight="fill" color={ink} />` (a cor `ink` de hoje, `chat-footer.tsx:44,52`) com `label={strings.voiceInput}`, `onPress={onStartRecording}` e `disabled={!canRecord}`. A regra de `isDisabled` não muda.
16. (RT-004) **`B/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`** — sai o `View className="flex-row items-center"` de :49 e o `ml-2` (a pílula do passo 10 já espaça com `gap-1 px-1.5`). Os botões viram filhos diretos do `ChatInput.Root`, depois do `ChatInput.Input`, e o bloqueio da tarefa `finished` passa de `onPress` anulado + `opacity-60` para `disabled`:
    - com texto: `<ChatInput.IconButton variant="primary" label={strings.send} onPress={handleSend} disabled={isFinished}>` com `<ArrowUp size={16} color={onPrimary} />`;
    - sem texto: `<ChatInput.IconButton variant="primary" label={strings.voiceInput} onPress={onStartRecording} disabled={isFinished || !canRecord}>` com `<Microphone size={16} color={onPrimary} />` (sem `weight`, como hoje).

    Saem os imports `IconButton`, `View` e `cn` se ficarem sem uso. Ficam `ChatInput.AttachButton`, `ChatInput.Input` com o placeholder de hoje e a troca por `RecordingBar` ao gravar.
17. (RT-006) **`B/src/pages/chat/components/chat-top-bar/chat-top-bar.tsx`** — `h-[52px] flex-row items-center justify-center`, com `BrandMark` e a data como hoje (`formatShortDate`). Saem o `IconButton`, o `List`, a prop `onOpenMenu` e o que fica sem uso com eles: `MENU_ICON_SIZE`, `ink`, `useStrings`, `chatStrings` e o `strings` (`chat-top-bar.tsx:5-11,18`). O `View` interno da data (`gap-1`, `ml-1 border-l … pl-2.5`) fica. `ChatTopBar` fica sem props.
18. (RT-004) **`B/src/pages/chat/page.tsx`** — `<ChatTopBar />` e `<ChatFooter onOpenMenu={handleOpenMenu} onStartRecording={...} />`, com `function handleOpenMenu() { router.push(ROUTES.menu) }` no componente (função nomeada, sem arrow inline no JSX, `react-components.md`); o push sai do topo para o rodapé. O `View` do rodapé medido por `onLayout` não ganha margem nem posição nova (AC-018).
19. (infra, fecha o checkpoint 2) — `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`. Commit `feat(mobile): topo centralizado, campo e gravação V4 no chat e no workspace`.

### Checkpoint 3 — Sheet do menu e caminho de volta
20. (RT-001) **`B/src/layout/components/draggable-sheet-overlay.tsx`** (novo, `DraggableSheetOverlay`) — props `{ isOpen: boolean; onClose: () => void; children: ReactNode }`. A árvore segue `task-picker-sheet.tsx:66-110` e a animação segue `settings-sheet-overlay.tsx:17-38`. Nenhum `Animated.View` recebe `className`: no web o NativeWind descarta as classes desse nó (`message-actions-menu.tsx:103-115`), então cor e forma ficam num `View` aninhado.
    - constantes no módulo: `SLIDE_OFFSET = 600`, `ANIMATION_DURATION = 220`, `SNAP_BACK_DURATION = 160` e `CLOSE_THRESHOLD = 80`;
    - estado animado: `translateY = useSharedValue(SLIDE_OFFSET)` e `backdropOpacity = useSharedValue(0)`. Num `useEffect` em `[isOpen, translateY, backdropOpacity]`: aberto → `translateY.value = withTiming(0, { duration: ANIMATION_DURATION })` e `backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION })` (o sheet sobe de baixo, AC-004); fechado → `translateY.value = SLIDE_OFFSET` e `backdropOpacity.value = 0` (zera o que um arrasto deixou, CB-001). `sheetStyle` = `{ transform: [{ translateY: translateY.value }] }` e `backdropStyle` = `{ opacity: backdropOpacity.value }`, ambos em `useAnimatedStyle`;
    - `Gesture.Pan()` como `task-picker-sheet.tsx:54-64`: `onUpdate` → `translateY.value = Math.max(0, event.translationY)`; `onEnd` → acima de `CLOSE_THRESHOLD`, `runOnJS(onClose)()`; abaixo, `translateY.value = withTiming(0, { duration: SNAP_BACK_DURATION })`;
    - árvore: `<Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>` (voltar do Android e Escape no web) > `<GestureHandlerRootView style={{ flex: 1 }}>` > `<View className="flex-1 justify-end">`, com dois filhos:
      - scrim: `<Pressable className="absolute inset-0" onPress={onClose}>` > `<Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>` > `<View className="flex-1 bg-inverse-surface/30" />`;
      - conteúdo: `<GestureDetector gesture={panGesture}>` > `<Animated.View style={sheetStyle}>` > `{children}`.

    A superfície arredondada, a alça e o `paddingBottom: insets.bottom` ficam no `children` (o `MenuSheet` do passo 22), não no overlay. Nenhuma dependência nova: `react-native-gesture-handler` e `react-native-reanimated` já estão no app.
21. (RT-002) **`B/src/layout/components/menu/menu-sidebar.tsx` → `menu-entry-list.tsx`** (`MenuEntryList`) — fica só a lista das 4 linhas, com o mesmo `ENTRY_ICONS`, a mesma regra de `variant`/`counts`, o `CountBadge` e Settings sem contagem. Props `{ variant?, counts?, className?, onSelect? }`, com `className` base `px-2 pb-2 pt-1`. Saem o cabeçalho com `BrandMark` + X, `onClose`, a sombra, `h-full w-full` e `insets.top`. **`menu-sidebar-view.tsx` → `menu-entry-list-view.tsx`** (`MenuEntryListView`, props `{ onSelect: (id: MenuEntryId) => void }`) fica com a mesma lógica de `useCapturesCountsData`. Remover `closeMenu` de `B/src/layout/strings/menu-strings.ts` se o `grep` mostrar que ficou sem uso.
22. (RT-001, RT-006) **`B/src/pages/chat/components/chat-menu-sheet/chat-menu-sheet.tsx`** (novo, `ChatMenuSheet`) — props `{ isOpen: boolean; onClose: () => void; onSelect: (id: MenuEntryId) => void }`. Renderiza `DraggableSheetOverlay` > `MenuSheet` (casca existente com alça, `B/src/layout/components/menu/menu-sheet.tsx`) > `MenuEntryListView onSelect={onSelect}`.
23. (RT-002) **`B/src/pages/menu/page.tsx`** — sai a linha `view === 'menu' && <MenuSidebarView .../>`. Entra `useEffect(() => { if (view === 'menu') router.back() }, [view, router])`: o `goBackToMenu` das três telas (que põe `view: 'menu'`) passa a voltar ao chat sem mudar as telas (RT-002, AC-008). Sai também o `SettingsSheetOverlay` de Settings, que muda para o chat. O overlay do detalhe de nota e de lembrete fica. `menu-store.ts` não muda.
24. (RT-001, RT-002) **`B/src/pages/chat/page.tsx`** — `const [isMenuOpen, setIsMenuOpen] = useState(false)`. Os handlers:
    - `handleOpenMenu` (criado no passo 18): o corpo `router.push(ROUTES.menu)` dá lugar a `Keyboard.dismiss()` e depois `setIsMenuOpen(true)`. É idempotente, e o toque duplo deixa um sheet só (CB-004, CB-006).
    - `handleCloseMenu()`: `setIsMenuOpen(false)` (função nomeada, sem arrow inline no JSX, `react-components.md`).
    - `handleSelectMenuEntry(id)`: `setIsMenuOpen(false)` e `useMenuStore.getState().selectEntry(id)`; se `id !== 'settings'`, `router.push(ROUTES.menu)`.

    `<ChatFooter onOpenMenu={handleOpenMenu} ... />`, `<ChatMenuSheet isOpen={isMenuOpen} onClose={handleCloseMenu} onSelect={handleSelectMenuEntry} />` e, junto do overlay do trace, `<SettingsSheetOverlay isOpen={isSettingsOpen} onClose={closeSettings}>{isSettingsOpen && <SettingsView onClose={closeSettings} />}</SettingsSheetOverlay>`, com `isSettingsOpen` e `closeSettings` lidos do `useMenuStore`. O rascunho mora no store do chat e não é tocado (CB-001).
25. (infra, fecha o checkpoint 3) — `pnpm lint:fix`, `pnpm typecheck`, `pnpm test`. Commit `feat(mobile): menu no rodapé abre sheet e volta direto ao chat`.

### Checkpoint 4 — Doc e limpeza
26. (RT-005) **`.claude/agents-docs/project-context/ux-philosophy.md`** — a doc é em inglês; trocar em todas as linhas que citam o menu sidebar (3, 8, 14, 15, 19, 21, 22 e 27; a 28 não cita e fica), com este texto exato:
    - :3 — "a **menu sidebar** is added" → "a **menu sheet** is added";
    - :8 — "(browsable from a menu sidebar)" → "(browsable from the menu sheet)";
    - :14 — "browse via the menu sidebar's Notes view" → "browse via the menu sheet's Notes view";
    - :15 — "Browse via the menu sidebar's Reminders view" → "Browse via the menu sheet's Reminders view";
    - :19 — "reached from the menu sidebar" → "reached from the menu sheet";
    - :21 — "**Menu sidebar (new)** — Slides in from the leading edge of the chat surface via a small affordance in the top bar. Contains four entries:" → "**Menu sheet (new)** — Opens from the button at the leading edge of the chat composer, in a sheet that slides up from the bottom; the top bar only shows the brand mark and the date. Contains four entries:" (o resto da linha fica);
    - :22 — "the menu sidebar (slides in from leading edge). No bottom tab nav." → "the menu sheet (slides up from the composer). No bottom tab nav.";
    - :27 — "The menu sidebar gives a real home" → "The menu sheet gives a real home".

    Ao fim, `grep -n -i "sidebar\|leading edge of the chat surface\|top bar" .claude/agents-docs/project-context/ux-philosophy.md` só pode achar a frase nova da :21 ("the top bar only shows the brand mark and the date"), e "No bottom tab nav" continua na :22.
27. (infra, último passo) **Remoção do protótipo** — `rm -rf B/app/prototipo/header-menu-footer B/src/prototipo/header-menu-footer`. Estão fora do git (`??`). Não apagar `B/app/prototipo/` nem `B/src/prototipo/` inteiros: `alarme-tela-cheia` e `lembrete-criado-abrir-tela` ficam. Depois rodar `pnpm lint:fix`, `pnpm typecheck` e `pnpm test`, e fazer o commit `docs: menu no rodapé em ux-philosophy`. A remoção não entra no commit porque os arquivos nunca foram versionados.

## Marcos de validação

### Marco 1 — checkpoint 2 de 4
prova: RT-004, RT-006 (e AC-001, AC-002, AC-003, AC-009, AC-010, AC-011, AC-014, AC-019 observáveis)
lane: browser, codigo
provas: S01, S02, S03, S21, S24, S25, S26, S27, S42, S43, S44
motivo: o campo de várias linhas, a pílula e a gravação são o alicerce que o chat e o workspace consomem. Erro na âncora das mensagens, no envio sem Enter ou na onda invisível viraria cascata depois do sheet.

### Marco 2 — checkpoint 3 de 4
prova: RT-001, RT-002
lane: browser, codigo
provas: S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18
motivo: a volta por `router.back()` a partir de `view === 'menu'` e o Modal fechando antes do push são o ponto em que o AC-008 cai numa tela em branco ou num scrim preso. O checkpoint 4 só mexe em doc e limpeza, então o erro achado aqui ainda é barato.

## Ondas
onda única

## Contratos
- `ChatInput = { Root, AttachButton, Input, IconButton }` (`ActionFrame` e `ActionButton` saem).
- `RecordingBar({ className? })` no app, sem mudança de assinatura; na galeria, `RecordingBar({ elapsed? })` e `ChatInput({ …, leading?: "menu" | "attach" })`; `MenuEntryList` da galeria com as props do antigo `MenuSidebar`. `ChatInputIconButton({ label, onPress?, disabled?, variant: 'primary' | 'subtle', children })`.
- `ChatFooter({ onOpenMenu: () => void; onStartRecording?: () => void })`; `ChatTopBar()` sem props.
- `DraggableSheetOverlay({ isOpen, onClose, children })`; `ChatMenuSheet({ isOpen, onClose, onSelect })`.
- `MenuEntryList({ variant?, counts?, className?, onSelect? })`; `MenuEntryListView({ onSelect })`.
- Galeria: rota `/app/chat-menu-open` (`ChatMenuOpenPage`), estado `menu-open` da página `chat`; componentes `/components/recording-bar` e `/components/menu-entry-sheet`.

## Fixtures
veredito: sem mecanismo
a mudar: nada. O estado de partida das provas é montado pelo passo E1 abaixo (script de teste fora do código do produto).

## Plano de teste
lane: browser, codigo
ambiente: app com backend real, `PERSISTENCE_DRIVER=sqlite pnpm dev` na raiz (server :3333 lendo `packages/infra/db/prisma/dev.db` + Expo web :8081; `BACKEND_URL=http://localhost:3333` no `.env.development` do app, com o Expo reiniciado depois da troca); galeria, `pnpm dev:design` (:3002). O `.env.development` do server não define `PERSISTENCE_DRIVER`, e o padrão de `@ben/modules-env` é `in-memory`: sem a variável, os usuários que o E1 grava no `dev.db` não existem para o server. `pnpm dev:mobile` sozinho NÃO serve para as provas do app real.
estado: `NODE_ENV=development PERSISTENCE_DRIVER=sqlite pnpm --filter @ben/server-ben exec tsx /home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/estado/montar-estado.ts`, com o server já no ar. Imprime `TOKEN_FULL=…`, `TOKEN_EMPTY=…`, `USER_FULL=…`, `USER_EMPTY=…` (JSON do `StoredUser`) e `TASK_ID=…`. Antes de abrir a url, o tester grava via `page.addInitScript`: `localStorage['ben.jwttoken']` = token, `localStorage['ben.authprovidertoken']` = `'e2e-unused'` e `localStorage['@ben/user']` = o JSON do usuário. S20 e S40 usam o par `EMPTY`, as demais o par `FULL`; S33 e S34 também gravam `localStorage['@ben/language']='pt-BR'`.
url: http://localhost:8081/chat — chat do app em inglês, relógio do navegador fixo em 7/nov/2026 (`page.clock.setFixedTime(new Date('2026-11-07T10:00:00'))`), 390x844

### Estado das provas — passo E1 (infra, antes da validação do marco 1)
> Seção nova: o projeto não tem mecanismo de fixtures, e o gate 4.2 pediu um passo que monte sessão e dados (misto real + interceptação).

E1. Escrever `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/estado/montar-estado.ts`. Ele roda com `tsx` com cwd em `packages/infra/server-ben` (é o que o `pnpm --filter … exec` faz), e é por isso que o `@ben/modules-env` acha o `.env.development` (só com `NODE_ENV=development`) e os aliases `@ben/*` do `tsconfig.base.json` resolvem. Não existe `node_modules/@ben` na raiz, então o script importa os módulos do projeto por caminho absoluto, e os imports internos deles resolvem como no `pnpm dev` do server:
- `userRepository` de `/home/fael/so/repos/ben-prototype/packages/infra/server-ben/src/repositories.ts` (com `PERSISTENCE_DRIVER=sqlite` ele é o `SqliteUserRepository` sobre o `dev.db` padrão de `@ben/infra-db/client/database-url`);
- `env` de `/home/fael/so/repos/ben-prototype/packages/modules/env/src/index.ts`;
- `JsonWebTokenJwtService` de `/home/fael/so/repos/ben-prototype/packages/infra/adapters/src/services/jwt.ts` (direto, não pelo `index.ts`, que carrega também o `assemblyai-transcription-provider.ts` e instancia o cliente no topo do módulo).

O script faz quatro coisas:
- **Usuários.** Para "Ana Test" (`ana.test@ben.local`, username `ana.test`, providerId `e2e-ana`) e "Empty Test" (`empty.test@ben.local`, username `empty.test`, providerId `e2e-empty`): `await userRepository.findFirst({ email })` e, se vier `null`, `await userRepository.create({ name, username, email, avatarUrl: '', providerId, createdAt: new Date(), agentModelSlug: null, agentEffort: null, language: null, showUsdCost: false, morningTime: null, dailySummaryEnabled: null, dailySummaryTime: null })`. São todas as props obrigatórias de `UserProps` (`packages/domain/user/src/enterprise/entities/user.ts`); o `create` do `Repository` (`packages/domain/base/src/repository/repository.ts`) recebe as props e gera o id.
- **Tokens.** `new JsonWebTokenJwtService({ privateKey: env.JWT_PRIVATE_KEY, expirationTimeInSeconds: env.JWT_EXPIRATION_TIME_IN_SECONDS }).generateToken(user.id.toValue())`, a mesma construção de `packages/infra/server-ben/src/middlewares/auth.ts`. O middleware exige os dois headers `jwtauthenticationtoken` e `providerauthenticationtoken`, mas com o JWT válido não consulta o provedor (`VerifyAuthenticationUseCase` só usa o provider token quando o JWT expirou); por isso o provider token das provas é um texto qualquer.
- **Mensagens.** Com o token de Ana, `POST http://localhost:3333/chat` com headers `{ 'content-type': 'application/json', jwtauthenticationtoken: TOKEN_FULL, providerauthenticationtoken: 'e2e-unused' }` e body `{ messages: [{ role: 'user', parts: [{ type: 'text', text }] }], timeZone: 'America/Sao_Paulo' }` (schema `chatBodySchema` de `packages/infra/server-ben/src/routes/chat.ts`; a resposta é JSON, status 200). Três vezes, uma por texto: "Note: the plumber's number is 555-0142", "Remind me tomorrow at 9am to call the bank" e "Start a task: plan the move to the new apartment". Depois `GET http://localhost:3333/tasks/list` (mesmos headers; sem `status` o handler lista as `active`), que devolve `{ items: [{ id, … }] }`, e imprime `items[0].id` como `TASK_ID`.
- **Saída.** Imprime `TOKEN_FULL`, `TOKEN_EMPTY`, `USER_FULL` e `USER_EMPTY` no formato `StoredUser` de `B/src/storage/user-storage.ts` (`{ id, name, username, email, avatarUrl, providerId }`) e `TASK_ID`. O `@ben/user` é necessário para a folha de Settings mostrar o perfil (S12), porque `settings-view.tsx` lê o usuário do `useAuthStore`, que se hidrata dessa chave; só o token já passa pelo guarda `(protected)/_layout.tsx` (`!getCachedToken() && !user`).

Se `items` vier vazio, o script repete o terceiro texto uma vez e falha com mensagem clara se continuar vazio. Rodar o script de novo reusa os usuários e manda as três mensagens outra vez, o que não atrapalha nenhuma prova.

As chaves de `localStorage` são exatas: no web o `secure-store.web.ts` usa o `AsyncStorage`, que grava em `localStorage` com a chave sem prefixo, e o `token-storage.ts` mapeia o JWT para `ben.jwttoken` e o provider para `ben.authprovidertoken`; o `loadTokenIntoMemory()` do `auth-bootstrap.ts` lê os dois na subida, antes do `getCachedToken()` do guarda.

Receita das provas (Node `playwright` + `/usr/bin/google-chrome`, 390x844):
- **Captura.** O Playwright MCP deu CONNECT_TIMEOUT. Usar `playwright-core` numa pasta própria (`npm i playwright-core` se `/tmp/pw` sumiu), com `chromium.launch({ executablePath: '/usr/bin/google-chrome' })`.
- **Gravação (S26 a S30, S44, S52).** Lançar com `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` e `context.grantPermissions(['microphone'])`. Para a transcrição ter fala, acrescentar `--use-file-for-fake-audio-capture=<wav com voz>` quando houver um arquivo.
- **Microfone sem permissão (S31, S32).** Contexto novo sem os dois flags e sem `grantPermissions`.
- **Histórico carregando (S19).** `page.route('**/messages/list**', async (route) => { await new Promise((resolve) => setTimeout(resolve, 8000)); await route.continue() })`.
- **Aviso sem conexão (S37).** `context.setOffline(true)` depois do primeiro carregamento.
- **Voltar do aparelho (S17).** `page.keyboard.press('Escape')`.
- **Arrastar o sheet (S15).** `page.mouse` arrastando a alça para baixo mais de 80px.

### Roteiro — lane browser
S01 (PR-001; AC-001, AC-002) [marco 1] o usuário abre o chat → o topo mostra, centralizados na largura, a logo, "Ben", um divisor vertical e "Sat, Nov 7", sem nenhum botão no topo
S02 (PR-001; AC-003, AC-011) [marco 1] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo e o microfone à direita, os três na mesma linha, no desenho da V4 (`prototipo/v4.png`)
S03 (PR-001; AC-009, AC-011) [marco 1] o usuário digita uma mensagem no campo → o botão à direita vira enviar (seta) e o botão do menu continua à esquerda
S04 (PR-002; AC-004) [marco 2] (era vídeo) o usuário toca no botão do menu → sobe de baixo um sheet sobre o chat com Tasks, Notes, Reminders e Settings, nessa ordem
S05 (PR-002; AC-005) [marco 2] o sheet está aberto → Tasks mostra "N active", Notes e Reminders mostram o total, e Settings não mostra contagem
S06 (PR-002; AC-006, AC-016) [marco 2] o usuário toca em Tasks → abre a tela Tasks de hoje, com a lista e as contagens de hoje
S07 (PR-002; AC-008) [marco 2] o usuário volta de Tasks → está no chat, sem o sheet na frente
S08 (PR-002; AC-006, AC-016) [marco 2] o usuário abre o menu e toca em Notes → abre a tela Notes de hoje
S09 (PR-002; AC-008) [marco 2] o usuário volta de Notes → está no chat, sem o sheet na frente
S10 (PR-002; AC-006, AC-016) [marco 2] o usuário abre o menu e toca em Reminders → abre a tela Reminders de hoje
S11 (PR-002; AC-008) [marco 2] o usuário volta de Reminders → está no chat, sem o sheet na frente
S12 (PR-002; AC-007, AC-017) [marco 2] o usuário abre o menu e toca em Settings → abre a folha de Settings de hoje, com perfil, idioma e sair
S13 (PR-002; AC-008) [marco 2] o usuário fecha Settings → está no chat, sem o sheet na frente
S14 (PR-002; AC-016) [marco 2] o usuário abre o menu, toca em Tasks e toca numa tarefa → chega ao workspace dessa tarefa
S15 (PR-003; CB-001) [marco 2] o usuário digita um rascunho, abre o menu e arrasta o sheet para baixo → o sheet fecha e o chat volta como estava, com o rascunho no campo
S16 (PR-003; CB-002) [marco 2] o usuário abre o menu e toca no fundo escurecido → o sheet fecha e o chat volta como estava
S17 (PR-003; CB-003) [marco 2] o usuário abre o menu e aperta Escape (equivalente web do voltar do aparelho) → o sheet fecha e o chat continua aberto
S18 (PR-003; CB-004) [marco 2] o usuário toca duas vezes rápido no botão do menu → há um sheet só aberto, e um único gesto de fechar volta ao chat
S19 (PR-003; CB-011) [final] o usuário toca no menu com o histórico ainda carregando → o sheet abre com as 4 opções sobre o chat em carregamento
S20 (PR-003; CB-011) [final] o usuário toca no menu com o chat vazio → o sheet abre com as 4 opções sobre a tela de chat vazio
url: http://localhost:8081/chat — de volta ao chat com histórico
S21 (PR-004; CB-005, CB-007) [marco 1] o usuário toca no campo para escrever → o campo fica focado e o botão do menu continua à esquerda dele, na mesma linha
S22 (PR-004; CB-006) [final] o usuário, com o campo focado e um rascunho, toca no menu → o campo perde o foco e o sheet abre
S23 (PR-004; CB-001, CB-006) [final] o usuário fecha o sheet → o chat volta com o rascunho preservado no campo
S24 (PR-004; CB-007) [marco 1] o usuário cola um texto longo no campo → o texto continua inteiro e editável no campo (que cresce até 5 linhas e rola por dentro depois, `prototipo/v4-5.png`), e o botão do menu e o de enviar continuam dentro dos 390px
S25 (PR-004; AC-014) [marco 1] o usuário envia a mensagem → ela aparece no chat e o Ben responde
S26 (PR-005; AC-010, CB-008) [marco 1] o usuário toca no microfone → o rodapé inteiro vira a gravação (cancelar, onda, tempo correndo e enviar), sem o botão do menu (`prototipo/v4-3.png`)
S27 (PR-005; AC-015, CB-008) [marco 1] o usuário cancela a gravação → o rodapé volta ao normal, com o menu à esquerda do campo, e nenhuma mensagem nova aparece no chat
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
url: http://localhost:8081/tasks/{TASK_ID} — workspace de tarefa
S41 (PR-009; AC-019) [final] o usuário abre o workspace → o topo é o de hoje, sem logo centralizada nem data
S42 (PR-009; AC-019, AC-011) [marco 1] o usuário olha o rodapé do workspace → o botão de anexar está à esquerda do campo e o microfone à direita, no mesmo desenho do chat (pílula da V4)
S43 (PR-009; AC-019) [marco 1] o usuário digita no campo e envia → o botão vira enviar e a mensagem aparece no workspace
S44 (PR-009; AC-019) [marco 1] o usuário toca no microfone → o rodapé vira a mesma barra de gravação do chat
url: http://localhost:3002/app/chat-populated — galeria
S45 (PR-010; AC-012) [final] o usuário abre a tela de chat → o topo mostra logo, "Ben", divisor e "Sat, Nov 7" centralizados, sem botão
url: http://localhost:3002/app/task-picker-populated
S46 (PR-010; AC-012) [final] o usuário abre a seleção de tarefa → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/item-detail-note
S47 (PR-010; AC-012) [final] o usuário abre o detalhe → o topo é o mesmo topo centralizado, com a data
url: http://localhost:3002/app/chat-populated
S48 (PR-010; AC-013, AC-011) [final] o usuário olha o rodapé do chat → o botão do menu está à esquerda do campo, igual a `prototipo/v4.png`
url: http://localhost:3002/app/chat-menu-open
S49 (PR-010; AC-013, AC-004) [final] o usuário abre o estado do sheet → o chat com o sheet de Tasks, Notes, Reminders e Settings aberto, igual a `prototipo/v4-4.png`
url: http://localhost:3002/app/chat-recording
S50 (PR-010; AC-013, AC-011) [final] o usuário abre o estado gravando → o rodapé vira a gravação sem o botão do menu, igual a `prototipo/v4-3.png`
url: http://localhost:8081/chat — inglês
S51 (PR-011) [final] (era vídeo) o usuário abre o chat e envia um texto → o topo está centralizado e o Ben responde ao texto
S52 (PR-011) [final] o usuário grava e envia uma fala → a fala transcrita aparece no chat
S53 (PR-011) [final] o usuário abre o menu pelo rodapé e entra em Tasks → aparece a tela Tasks
S54 (PR-011) [final] o usuário volta de Tasks e abre Settings → está no chat e a folha de Settings aparece sobre ele
S55 (PR-011) [final] o usuário fecha Settings → está de volta ao chat

### Roteiro — lane teste
n/a (nenhuma RT ou PR de lane teste)

### RT-001 — lane codigo
Procurar em: `B/src/layout/components/draggable-sheet-overlay.tsx`, `B/src/pages/chat/components/chat-menu-sheet/`, `B/package.json`
Reprova se: o `package.json` do app ganhou dependência; o sheet não usa `Modal` com `onRequestClose`, scrim `bg-inverse-surface/30` tocável e `Gesture.Pan` com limite de fechamento; a animação não usa `react-native-reanimated`; ou algum `Animated.View` do overlay recebe `className` (a cor do scrim fica num `View` aninhado, senão some no web).

### RT-002 — lane codigo
Procurar em: `git diff` de `B/src/layout/components/{menu-tasks,menu-notes,menu-reminders,menu-settings,menu-detail}/`
Reprova se: qualquer arquivo dessas pastas aparece no diff. Só podem mudar `B/src/pages/menu/page.tsx`, `B/src/pages/chat/page.tsx`, `B/src/layout/components/menu/*` e os pontos de entrada.

### RT-003 — lane codigo
Procurar em: `git log --oneline` da implementação
Reprova se: o commit do checkpoint 1 (galeria, `D/`) não vem antes do primeiro commit que toca `B/src/`, ou se o rodapé e o topo do app divergem das classes da galeria (pílula 44px, botões `size-8`, ícones 16px).

### RT-004 — lane codigo
Procurar em: `B/src/pages/chat/components/chat-footer/chat-footer.tsx`, `B/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`
Reprova se: um dos dois rodapés não usa `ChatInput.Root`/`ChatInput.Input`/`ChatInput.IconButton` e `RecordingBar`; se o `workspace-footer.tsx` renderiza `ChatMenuButton`; ou se sobrou `ActionFrame` ou um `IconButton` próprio em algum dos dois.

### RT-005 — lane codigo
Procurar em: `.claude/agents-docs/project-context/ux-philosophy.md`
Reprova se: o texto ainda diz que o menu desliza do canto, que fica numa sidebar ou que a affordance do menu fica no topo; ou se "No bottom tab nav" sumiu.

### RT-006 — lane codigo
Procurar em: `B/src/layout/components/chat-input/chat-input-icon-button.tsx`, `B/src/pages/chat/components/chat-menu-button/chat-menu-button.tsx`
Reprova se: o botão tem menos de 44px de área de toque (`size-8` sem `hitSlop` de pelo menos 6), ou se o `accessibilityLabel` não vem de `chatStrings.menu` ("Menu" em `en` e em `pt-BR`).

### RT-007 — lane codigo
Procurar em: `D/src/core/screens.ts`, `D/src/core/routes.tsx`, `D/src/pages/`
Reprova se: sobra estado ou rota `menu-sidebar-*`; se falta `/app/chat-menu-open` no `PAGES`/rotas; ou se algum estado `menu-tasks-*`, `menu-notes-*` ou `menu-reminders-*` foi removido.

## Cobertura
7/7 RT · 11/11 PR · 12/12 CB
RT-001 → seção RT-001 (codigo); S04, S15, S16, S17, S18 (browser)
RT-002 → seção RT-002 (codigo); S06 a S14 (browser)
RT-003 → seção RT-003 (codigo); S45 a S50 (browser)
RT-004 → seção RT-004 (codigo); S42, S43, S44 (browser)
RT-005 → seção RT-005 (codigo)
RT-006 → seção RT-006 (codigo); S34 (browser)
RT-007 → seção RT-007 (codigo); S49 (browser)
PR-001 → S01, S02, S03
PR-002 → S04 a S14
PR-003 → S15 a S20
PR-004 → S21 a S25
PR-005 → S26 a S30
PR-006 → S31, S32
PR-007 → S33, S34
PR-008 → S35 a S40
PR-009 → S41 a S44
PR-010 → S45 a S50
PR-011 → S51 a S55
CB-001 → PR-003, PR-004 → S15, S23
CB-002 → PR-003 → S16
CB-003 → PR-003 → S17 (Escape como equivalente web)
CB-004 → PR-003 → S18
CB-005 → PR-004 → S21 (campo focado como equivalente web)
CB-006 → PR-004 → S22, S23 (campo focado como equivalente web)
CB-007 → PR-004 → S21, S24
CB-008 → PR-005 → S26, S27
CB-009 → PR-005 → S29, S30
CB-010 → PR-006 → S31, S32
CB-011 → PR-003 → S19, S20
CB-012 → PR-007 → S33, S34

## Desvios da spec
nenhum. Nenhum RT é violado; CB-003, CB-005 e CB-006 são provados pelo equivalente web, conforme as premissas do gate 4.2.

## Desvios de padrão
- Passos 8 e 13: o padrão diz que o estilo vem de classes Tailwind (`code-get-coding-designs/designs/mobile-app-structure.md`, "Styling lives in Tailwind tokens"), mas o `WaveBar` e o ponto da gravação recebem largura, raio e cor por `style`. Motivo: o `Animated.View` ignora `className` no Expo web e a onda some. A cor vem de `@/layout/utils/colors` (`wave`), sem hex literal.
- Passos 1, 3, 11 e 17: a regra é usar tokens (`design-rules.md`), mas entram os tamanhos arbitrários `text-[13px]` e `text-[15px]`. Motivo: o token de 15px (`button`, `D/src/core/global.css:85-87` e `B/tailwind.config.js:134`) é semibold e de botão, errado para texto digitado, e o app já usa `font-sans text-[15px] leading-5` (`message-bubble.tsx:48`); 13px não tem token (`chat-top-bar.tsx:25` já usa `text-[13px]`).
- Passo 20: `mobile-bottom-sheet-overlay.md` pede uma peça reutilizável, e a peça nova convive com a cópia do `task-picker-sheet`. Motivo: migrar a seleção de tarefa está fora do escopo e amplia o diff; o `SettingsSheetOverlay` não tem arrastar, e acrescentar arrastar a ele mudaria Settings, trace e detalhe.

## Riscos
- `onContentSizeChange` no react-native-web multiline: se não disparar ao apagar texto, a altura não encolhe enquanto houver texto (com o campo vazio ela já volta a 32 pela derivação do passo 11). O marco 1 (S24) pega isso.
- Tirar o Enter-envia muda o hábito no web e no teclado físico.
- O `router.back()` dentro do `useEffect` da rota `/menu` pode rodar duas vezes em StrictMode; o marco 2 (S07, S09, S11) pega isso.
- Áudio falso do Chrome (bipe) pode virar transcrição vazia, e S28, S30 e S52 dependem de um wav com voz.
- O rodapé mais baixo (44px contra 68px) muda `footerHeight`; a âncora já usa `onLayout`, e S35 confere.

## Premissas
- Os botões de 32px da V4 ficam com `hitSlop` até 44px (RT-006, gate 4.2).
- CB-003 é provada com Escape, e CB-005 e CB-006 com o campo focado (gate 4.2).
- Sessão e dados no modo misto (gate 4.2). Como o `dev.db` não tem usuário nenhum, o script cria dois; o vazio substitui a interceptação em S20 e S40, e S19 continua com interceptação.
- O gesto de deslizar para cancelar sai; o X cancela.
- O teto de 5 linhas e a pílula mínima de 44px entram como na V4.
- O topo do workspace não muda, e o slot esquerdo dele é o anexar.
- A data da galeria é fixa ("Sat, Nov 7"), porque a galeria é estática.
- `ux-philosophy.md` é editado direto, porque o RT-005 pede. As docs de `code-get-project-context` ficam para a `task-update-project-context`.
- Fluxo de dados persistentes: nenhum (a task não muda schema).
- As provas do app real rodam o server com `PERSISTENCE_DRIVER=sqlite`, porque o `dev` padrão é in-memory e o E1 precisa gravar os usuários onde o server lê. O `.env.development` do server não é editado.
- Na galeria, a folha de Settings (`SettingsShell`) passa a ter o chat esmaecido atrás, no lugar do menu lateral, porque o menu lateral sai e Settings abre sobre o chat. O conteúdo das páginas `menu-settings-*` não muda.
- Na galeria, o `ChatInput` tem o menu como slot esquerdo padrão e as 11 páginas de workspace pedem o anexar; o `workspace-recording` também passa a usar o `RecordingBar`.
