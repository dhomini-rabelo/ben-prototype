# Implementer — chat-messages (task chat-v2-design)

Git: branch feat/chat-v2-design, base bdc17ab. Repo root /home/fael/so/repos/ben-prototype. Task dir .claude/tasks/2026-10-26_chat-v2-design.

BEFORE EDITING: load the skills code-write-code (SKILL.md + general-coding-practices.md + the pattern files named below) and code-get-coding-designs (SKILL.md + the design files named below). Never spawn agents. Never call AskUserQuestion: if blocked, write the blocker into the handoff file and return. Do not open plan.md: this file is your contract. Edit ONLY the files you own (listed below). Other scopes may be editing other files in this worktree at the same time.

Finishing: run `pnpm exec eslint --fix <your owned files>` from the root. Then run the typecheck in the acceptance section; errors in files you do NOT own are reported, never fixed. Commit only your files: `git add <owned paths>` (never -A), with message "simple-loop(chat-v2-design): impl — chat-messages" and the final line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". No push.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. Your nonce is "impl-chat-messages-chat-v2-design", the exact description of your launch. Measure with `.claude/skills/simple-loop/scripts/medir-janela.sh "impl-chat-messages-chat-v2-design"` at turn 20, then at every `proxima=` it returns, and FIRST THING on any SendMessage. Confirm `desc=` is you. If it errors, retry with `--list`, then `--self`; if both fail, treat turn 40 as handoff. Never invent a number. On `status=ok`, continue. On `status=handoff` or `preso`: open nothing new, finish the file you are on, commit only the finished owned files, write .claude/tasks/2026-10-26_chat-v2-design/handoff-chat-messages.md (done / missing, concretely) and return `handoff-necessario` (or `preso`) plus the path. You never spawn agents.
Final message: at most 6 lines (status, commit hash, files touched, typecheck/test result, anything left).

## Contract: bubbles, avatar, voice wave, day divider (index.html:59-71, 115-133; shot.png middle)
- packages/infra/mobile/ben/src/pages/chat/components/message-bubble/message-bubble.tsx (177-233). User: bg bubble-user, radius 20 with bottom-right 6, padding 9/14/8, max-w 286, self-end, text 15/20 ink. Inside, a meta row right-aligned, gap 6, 12/16 on-surface-variant, tabular-nums: [VoiceWave if voiceDurationMs] + time HH:MM from createdAt. Ben: bg bubble-ben, radius 20 with top-left 6, padding 7/14. Keep the pending/error states (opacity, error border) and the footer slot.
- New packages/infra/mobile/ben/src/pages/chat/components/voice-wave/voice-wave.tsx: bars = clamp(round(sec)*3, 3, 24), each 2 px wide, gap 2, color wave, heights cycled from [5,9,13,7,11,6,12,8,10,5,9,14,7,11,6] (index.html:160-162), then the duration "m:ss" 600 brand-deep.
- Ben row: BenLogo variant="avatar" 28 (from theme-foundation) + a column with the bubble and the CaptureCard BELOW it (gap 6, self-start). Restructure chat-history/chat-history.tsx renderItem (40-90) so the card is no longer a child of MessageBubble. Keep MessageTracePressable around the Ben bubble, CostFooter (message-footers/cost-footer.tsx: discreet 11 px on-surface-variant), SendRetryFooter, onAction → ROUTES.taskWorkspace, `inverted` (95), loadOlder, and the typing/pending header (104-141) with the new bubble look.
- Day divider: new packages/infra/mobile/ben/src/pages/chat/components/day-divider/day-divider.tsx (12/600 on-surface-variant, centered) inserted by packages/infra/mobile/ben/src/pages/chat/hooks/use-chat-list.ts (26-29) at each local-day boundary of the reversed list: "Today" / "Yesterday" / short date, plus " · {n} filed" when n > 0 (n = Ben messages with capture that day). Use a discriminated union item type for messages and dividers so renderItem switches on it exhaustively. Strings in chat-strings (en + pt-BR "Hoje", "Ontem", "{n} arquivados"); add only your keys.
- Spacing: 8 between items, 4 extra under a Ben row.
Patterns: designs page-structure.md; frontend/react-components.md, react-single-responsibility.md, component-variant-maps.md.
Owned: message-bubble.tsx, chat-history.tsx, voice-wave/*, day-divider/*, use-chat-list.ts, cost-footer.tsx, your chat-strings keys.
Parallel: yes, with chat-shell (after capture-card and mobile-voice-duration).

## Acceptance
Typecheck shows no error in owned files. Chat matches shot.png middle. A voice message shows the wave + duration, and still does after a reload. Pagination works.

## Premissas do implementador
- Extraí `chat-history/chat-history-item.tsx` (novo) para o renderItem, mantendo chat-history.tsx enxuto; o switch por `item.kind` fica lá.
- Tipo união `ChatListItem` (message | divider) e `buildChatListItems` exportados de use-chat-list.ts; o divider fica após a mensagem mais antiga de cada dia (lista invertida), com contagem de Ben+capture dentre as mensagens carregadas.
- `use-scroll-to-bottom.ts` (sem dono) teve só o tipo do ref trocado para `FlatList<ChatListItem>`, necessário para o typecheck.
- Hora usa `formatClock` existente (HH:MM 2 dígitos, locale do idioma); wave usa fórmula de altura do index.html `(i*7+s)%15`.
- Wave só aparece com `voiceDurationMs > 0`. Typing indicator do header ganhou avatar e raio/cor do bubble-ben via className (typing-indicator.tsx não é meu); o rótulo "Ben" foi removido.
- CostFooter passou de label-caps (mono/uppercase) para Text 11px; CaptureCard recebe `className="mt-0"` para não somar a margem própria ao gap 6.
- pt-BR `dayFiled`: singular "arquivado" quando n=1.

## Premissas do implementador (fix1)

- Start button moved out of CaptureCard.Body to be the last child of CaptureCard.Root (design index.html:132).
- font-sans-semibold applied to voice-wave duration and day-divider label.
- day-divider now calls formatShortDate (pages/chat/utils/format-short-date.ts).
- capture-card-meta: "more than a day away" interpreted as any date that is neither today nor tomorrow (past dates included); shows "<short date>, <time>" via formatShortDate + formatClock. Today keeps time only; tomorrow keeps the existing "tomorrow <time>" string.

## Premissas do implementador (fix2)
- Typography variants now carry the family matching the fontSize token weight: wordmark font-sans-bold, tagline font-sans, headline-lg font-sans-semibold, body-md font-sans, button-text font-sans-semibold (label-caps/code keep font-mono). Button text uses font-sans-semibold.
- Every `font-semibold`/`font-medium` utility in src was replaced by `font-sans-semibold`/`font-sans-medium` (tailwind-merge treats font-sans* as one group, so the override wins over the variant family; a bare weight utility would not change the family).
- menu-list-row emphasized trailing text (label-caps, normal-case) moves from mono to Instrument Sans semibold, since there is no loaded mono semibold family; its non-emphasized sibling stays mono.
- Standalone Text/TextInput outside Typography (message bubble body and time, cost footer, workspace top bar texts, chat input, text-content, add-todo-row) received `font-sans`.
- Verified in the web DOM only on login (computed font-family: Ben InstrumentSans_700Bold, tagline 400, button 600, links 500); chat texts not re-checked in the browser (needs login), left to the tester.

## Premissas do implementador (fix3-A)

- Ano no chip: formatShortDate (usado pelo chip do lembrete, pelo divisor de dia e pelo cabecalho) passa a incluir `year: 'numeric'` apenas quando o ano da data difere do ano atual; datas do ano corrente continuam compactas.
- Task picker: a className `bg-surface-container-lowest rounded-t-3xl` ja estava no fonte; o NativeWind nao aplica className em `Animated.View` na web (mesmo achado documentado em message-actions-menu.tsx). O fundo arredondado e o scrim passaram para um `View` simples aninhado; o `Animated.View` guarda so o `style` animado.
- GET /tasks//detail: causa raiz inferida do codigo (servidores :3333/:8081 fora do ar, nao reproduzido no navegador): `useWorkspaceTask` le `taskId` com fallback `''` e `useTaskDetailData` buscava sem gate, entao qualquer render com o param ainda indefinido pedia `/tasks//detail`. Correcao: `enabled: Boolean(taskId)` em useTaskDetailData.

## Premissas do implementador (fix3-B)

- Gravar na web é desejado: toque para gravar, mesma UX do nativo (RecordingBar, duração), via getUserMedia + MediaRecorder em `audio-service.web.ts`, mesma API exportada do nativo; o nativo não foi tocado.
- O formato gravado é o primeiro suportado entre webm/opus, webm, ogg/opus e mp4. O servidor (multer em memória, sem filtro de mime) e o AssemblyAI (recebe só o buffer, detecta o formato pelo conteúdo) aceitam esses formatos; o upload web busca o blob URL e envia um Blob com o nome `recording.webm` (o nativo segue enviando `{uri,name,type}`).
- Permissão web: `navigator.permissions.query('microphone')` (falha vira `prompt`); sem getUserMedia/MediaRecorder (contexto inseguro) vira `denied`.
- Banner sobre a primeira todo: o cabeçalho absoluto do workspace agora é medido por `onLayout` e esse valor é o `paddingTop` do scroll (antes fixo em 64), então o banner empurra a lista em vez de cobri-la.
- Docs de project-context não tinham afirmação de "web sem captura de voz"; nenhuma linha alterada ali.
- Verificação em navegador não feita: :8081 e :3333 estavam fora do ar e não foram iniciados; validado por leitura de código, lint e typecheck.
