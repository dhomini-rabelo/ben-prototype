# Recon — chat-v2-design (base bdc17ab)

Mock: docs/design/chat-v2/index.html (390x844; tokens :root 13-31, CSS 41-88, markup 92-157). plano.md = racional; paleta final = Adendo r7 (âmbar), balão Ben r15 (#f1e2d6).

## Mapa de arquivos (mobile-ben = packages/infra/mobile/ben)
- app/(protected)/chat.tsx | rota fina -> src/pages/chat/page.tsx | 1-11
- src/pages/chat/page.tsx | tela: header abs + FlatList + rodapé abs | 73-138 (header 76-82, histórico 84-103, rodapé 105-118)
- src/pages/chat/components/chat-top-bar/chat-top-bar.tsx | BrandMark + IconButton Menu (lucide) -> ROUTES.menu | 14-24
- src/layout/components/brand-mark.tsx + icons/ben-logo.tsx | logo + wordmark "Ben" (cor primary preta) | 17-43
- src/pages/chat/components/active-task-picker.tsx (task-picker/active-task-picker.tsx) | peek no RODAPÉ; some se 0 tarefas | 9-55
- src/pages/chat/components/active-task-peek.tsx | faixa "N active · título" (lucide Hammer/ChevronUp) | 15-79
- src/pages/chat/components/task-picker/task-picker-sheet.tsx, -list.tsx | sheet do seletor (fica) | 114 / 100 linhas
- src/pages/chat/components/chat-history/chat-history.tsx | FlatList `inverted` (mais nova embaixo), renderItem | 27-151 (renderItem 40-90, inverted 95, header typing/voz 104-141)
- src/pages/chat/hooks/use-chat-list.ts | reverte array p/ inverted | 26-29
- src/pages/chat/components/message-bubble/message-bubble.tsx | bolha: user=bg-primary preto, ben=surface-container-low; footer; max 78% | 177-233
- src/pages/chat/components/capture-card/* (root 15-48, icon 81-97, header 7-40, action-button 13-55, body/title/meta) | cartão DENTRO da bolha do Ben; header caps "NOTE"; botão task "play/active" mono caps | idem
- src/pages/chat/components/chat-footer/chat-footer.tsx | ChatInput.Root pílula + ícone Mic/Send; troca por RecordingBar ao gravar | 33-64
- src/layout/components/chat-input/chat-input-root.tsx (pílula cinza, 27-35), chat-input-input.tsx, chat-input-action-button.tsx (botão size-10 preto, 64-92) | campo + ação
- src/layout/components/recording-bar.tsx, wave-bar.tsx | barra de gravação (onda) | 168 / 28 linhas
- src/pages/chat/components/chat-top-banner/chat-top-banner.tsx | banners offline/erro de voz/mic negado | 12-50
- src/pages/chat/components/chat-empty-state, chat-history-skeleton, typing-indicator, message-footers/*, message-trace-pressable | estados vizinhos que herdam a cara nova
- src/layout/utils/colors.ts | hex p/ ícones (primary #121213...) | 7-15
- tailwind.config.js | fontFamily Hanken 13-49; colors 50-108; fontSize 109-129
- src/layout/components/ui/typography.tsx | variantes (label-caps = mono caps) | 6-22
- app/_layout.tsx | carrega Hanken+JetBrains via expo-google-fonts | 1-30
- src/pages/chat/strings/chat-strings.ts, capture-card-strings.ts, chat-input-strings.ts | copy (mock: "Type or hold to talk", "Latest active task", "Today · 3 filed")
- src/api/models/message.ts | Message{id,role,content,createdAt,capture{kind,itemId,title,meta},costUsd} | 1-20

## Molde a espelhar
Gabarito de estrutura = o próprio chat atual (compound components CaptureCard.*, ChatInput.*), não há irmão para "tela v2". Pontos de partida: capture-card-root.tsx 28-46 (View + cn), message-bubble.tsx 177-233. Para visual: o HTML do mock (index.html). Nenhum molde de dog-ear/onda existente (wave-bar.tsx é da gravação, não por duração).

## Footprint
- page.tsx:80-81 ChatTopBar/ChatTopBanner; :113 ActiveTaskPicker (rodapé); :114 ChatFooter; :98 ChatHistory (inverted).
- chat-history.tsx:60-76 compõe CaptureCard DENTRO de MessageBubble (children); :54 CostFooter; :83 MessageTracePressable (tap no balão Ben abre trace).
- MessageBubble, CaptureCard e ActiveTaskPeek são usados SÓ dentro de src/pages/chat (grep em src/ e app/ fora de pages/chat/components: zero), logo mudar a API deles não afeta task-workspace.
- Ícones: 47 arquivos em src importam lucide-react-native (não apenas o chat).
- useChatMessages (use-chat-messages.ts 27-47) já entrega ordem cronológica (antigo->novo); use-chat-list.ts só reverte para inverted.

## Gap list (mock v2 x atual) — V=visual-only, D=needs-data
1. Ordem: mock cronológica, nova perto do polegar. Atual JÁ mostra nova embaixo (FlatList inverted, chat-history.tsx:95). V/none: só confirmar; scroll-to-bottom em use-scroll-to-bottom.ts.
2. Header: mock marca âmbar balão-dobrado + "Ben" + divisor + "Wed, Oct 21" + botão menu 44px circular branco c/ sombra (ph-list). Atual BrandMark preto + Menu lucide sem círculo. V (data = Date local).
3. Faixa de tarefa ativa: mock NO TOPO (abaixo do header), cartão branco 54px, ladrilho kanban, "Latest active task"/título, chip "2 active" + caret-up-down. Atual: no rodapé, layout 1 linha "N ACTIVE · título" (active-task-peek.tsx). V (dados já existem: count, tasks[0].title). Contradiz regra design-rules.md ("peek no fim da pilha do rodapé") — regra deve ser atualizada/decisão do planner.
4. Divisória "Today · 3 filed": D leve — contagem de capturas do dia derivável de messages com capture e createdAt hoje (client); ou useCapturesCountsData (só tem totais). Sem dado no backend p/ "filed today" pronto.
5. Tab bar: não existe no app mobile (grep Tabs/tab em app/ e src/: sem tab bar; menu é rota modal em (protected)/_layout.tsx:23). V/none.
6. Balão do usuário: mock fundo #f7e6c3, raio 20/6 no canto inf. dir., texto tinta, meta (onda+duração+hora) dentro. Atual bg-primary preto texto branco, sem hora. V + D (hora = createdAt já existe).
7. Onda por duração (barras = 3*seg, "0:05"): D — nenhum campo de duração de áudio/ flag "é voz" em Message (message.ts, MessagePresenter message-presenter.ts:17-25, schema prisma Message props JSON). Mensagens de voz viram texto simples (page.tsx:53-57 sendText(text, costUsd)). Sem dado p/ mostrar duração/ser voz após reload.
8. Balão do Ben: mock avatar 28px (marca branca contornada) + balão #f1e2d6 raio 6/20 + cartão como ANEXO abaixo, alinhado à esquerda, fit-content 224-286. Atual: balão surface-container-low, sem avatar, cartão dentro do balão. V (reestrutura chat-history.tsx:46-78).
9. Cartão Filed: dog-ear 12px canto sup. dir., ladrilho 30px neutro com ícone por tipo (note verde #067d51, alarm roxo #724aab, kanban marca-profunda), título 15/600, prévia 12, chip "tomorrow, 9:00" (clock), botão Start âmbar 72x30 só em task. Atual: header caps "NOTE", borda, ícone lucide, botão mono caps preto. V. Dados: título=capture.title, prévia/chip = capture.meta (string única; mock distingue prévia de nota x chip de hora: D leve — meta é string livre; reminder já vem formatado?). Ícone "Start" -> router.push taskWorkspace (já existe, chat-history.tsx:69-73).
10. Compositor: mock campo "Type or hold to talk" 52px com borda 1.5px #908b87 + botão voz 56px âmbar com halo 6px, lado a lado, bg fundo, sem sombra de faixa. Atual: pílula única cinza com mic preto 40px dentro (chat-footer.tsx 33-64; chat-input-root 29). V. Mantém Send quando há texto e RecordingBar ao gravar (estados fora do mock).
11. Paleta/tipografia: mock fundo #f6f4f2, marca #f9a12f, tinta #1d1814, texto-2 #605a54, borda #e1dfdd, Instrument Sans 400-700 tabular-nums. Atual: cinzas neutros Material (tailwind.config.js 50-108), Hanken Grotesk, caps mono. V.
12. Ícones: mock Phosphor regular/fill. Atual lucide-react-native (47 arquivos). V.
13. Status bar/home indicator do mock: são do SO, ignorar. Estados não-mock (empty, loading, recording, transcribing, error, offline, banners, trace sheet, MessageActionsMenu) precisam herdar tokens novos — o mock não os cobre.

## Design gallery (packages/infra/mobile/design, :3002)
Contraparte existe: páginas src/pages/chat-{populated,empty,loading,composing,recording,transcribing,awaiting-reply,error,permission-denied,offline,edge-cases}, componentes src/layout/components/{chat/message-bubble.tsx,chat-input.tsx,composer.tsx; capture-card/*; workspace/active-task-peek.tsx; common/chat-shell.tsx}, registro em src/core/screens.ts:43-68, tokens src/core/global.css (@theme Tailwind v4; mesma paleta cinza do app, Hanken). Gallery é "passo anterior" (project context); convenção do repo = desenhar lá e depois implementar, então um estado v2 é esperado — o pedido do usuário foi "implementar o novo design para esse projeto"; escopo do gallery fica como decisão/premissa do planner (assumir: atualizar chat-populated + componentes e tokens do gallery em slice separada).
Também: design-rules.md (skill code-get-project-context/mobile/design) e agents-docs/design-advisor/design.md são fonte da verdade do design system ATUAL (cinza); v2 os contradiz (paleta âmbar, peek no topo) -> atualizar.

## Tokens/fontes/ícones no app
Cores: tailwind.config.js:50-108 + espelho hex em layout/utils/colors.ts (para ícones lucide). Fontes: Hanken via expo-google-fonts (app/_layout.tsx:3-30, fontFamily alias por peso tailwind.config.js:19-42 — RN exige família exata por peso). Instrument Sans: NÃO instalada (node_modules/@expo-google-fonts só tem hanken-grotesk, jetbrains-mono; existe pacote @expo-google-fonts/instrument-sans a adicionar). Phosphor: NÃO instalado (nenhum @phosphor-icons/* em node_modules; mobile usaria phosphor-react-native, que depende de react-native-svg 15.12.1 já presente). Gallery (web) usaria @phosphor-icons/react; também sem instalação.

## Backend
Nada necessário para as lacunas V. Para onda/duração (gap 7): precisaria novo campo (ex.: voiceDurationSec/isVoice) em MessageProps (domain/chat/src/enterprise/entities/message.ts), MessagePresenter (server-ben/src/presenters/message-presenter.ts:17-25), a transcrição retornar duração (domain/transcription + src/api/responses/transcription.ts) e o mobile enviar/persistir. Alternativa sem backend: medir duração no cliente na gravação (recorder.ts) só para a sessão atual e omitir onda no histórico. "Filed today": derivável no cliente. Decisão de produto -> planner.

## Armadilhas
- chat-history.tsx:95 `inverted` + use-chat-list.ts reverse + useScrollToBottom: mexer na ordem quebra paginação (onEndReached=loadOlder); manter.
- ChatHistory header (typing/voz pendente, 104-141) usa MessageBubble from="user" state pending/error: o novo balão claro deve manter esses estados (opacity, border erro).
- page.tsx:80 header é `absolute` com padding calculado via headerHeight (84-96) — a faixa de tarefa no topo muda headerHeight e o paddingTop do empty state; footer absolute usa keyboardOffset (useKeyboardHeight).
- RN: font por família exata, sem fontWeight combinando; box-shadow/dog-ear (gradiente linear 225deg) não existe nativo -> usar react-native-svg ou View rotacionada; `width: fit-content` não existe em RN.
- Regra do repo: ActiveTaskPeek renderiza só com tarefas ativas (active-task-picker.tsx:16-18) — o mock sempre mostra; manter guard.
- CLAUDE.md: lucide e Hanken estão por toda parte; trocar de ícone só no chat deixa app misturado (premissa: escopo = tela de chat).

## Sinal de teste
- Automático: mobile-ben não tem testes (`typecheck` só: package.json scripts); testes só em domínio (domain/chat .../__tests__). Gallery: só typecheck (`tsc -b`).
- UI path: sim — browser-mobile-tester em :8081 (390x844) comparando com docs/design/chat-v2/shot.png; precisa stack (API :3333 + login/dev-auth). Backend só se onda por duração entrar.

## Veredito de complexidade
1. Uma frente só? sim — todo o visual é mobile (+gallery); backend só se houver onda real (premissa: não).
2. Footprint <=6 arquivos? não — page, top-bar, peek, picker, bubble, chat-history, capture-card (9 arquivos), footer/chat-input, tailwind, colors, layout, deps.
3. Molde claro? não — sem irmão para v2; mock HTML serve de referência apenas.
4. Zero decisão de arquitetura/produto em aberto? não — escopo do gallery, onda/duração (backend x cliente), troca global de fonte/ícones, regra "peek no rodapé" revogada.
5. Zero lógica nova? não — dog-ear SVG, onda por duração, divisória "Today · N filed".
veredito: complexa — falham 2, 3, 4 e 5 (footprint ~12 arquivos, sem molde, decisões de produto abertas, lógica nova de onda/dog-ear/contagem)

partição: não
