# Plano — chat-v2-design (base bdc17ab, branch feat/chat-v2-design)

Fonte visual: docs/design/chat-v2/index.html (tokens :root 13-37, CSS 41-88, markup 92-157, SVG 142-157). Racional: docs/design/chat-v2/plano.md. Pixel: docs/design/chat-v2/shot.png. Mapa: recon.md desta pasta.

## Decisões do usuário (vinculantes)

- Alcance → APP INTEIRO: paleta âmbar + Instrument Sans + Phosphor em todo o mobile-ben; lucide-react-native removido no fim.
- Onda de voz → DURAÇÃO PERSISTIDA: campo novo na mensagem (domínio + API + app) + teste de use case.
- Botão de voz → MANTER O TOQUE; placeholder "Type or tap to talk" / "Digite ou toque para falar".
- Galeria → SÓ O APP; packages/infra/mobile/design fora do escopo.

## Premissas assumidas

1. Ordem do chat: já cronológica com a mais nova embaixo (chat-history.tsx:95 `inverted` + use-chat-list.ts:26-29). Mantém `inverted`, `onEndReached=loadOlder` e useScrollToBottom.
2. Tab bar não existe no app: nada a remover.
3. Faixa de tarefa ativa no TOPO, abaixo do header (plano.md §3.1). Renderiza só com tarefas ativas (active-task-picker.tsx:16-18) e abre o task-picker-sheet atual. design-rules.md fica para o estágio final de contexto, não para o implementador.
4. Banners (offline, erro de voz, mic negado) ficam abaixo da faixa; o padding do histórico soma header + faixa + banner (page.tsx:84-96).
5. Divisória de dia, no cliente: uma a cada fronteira de dia local: "Today", "Yesterday" ou a data curta ("Wed, Oct 21"). Fica " · N filed" quando N > 0, e N = mensagens do Ben com `capture` naquele dia, contando só o que já foi paginado.
6. Header: BrandMark (marca balão-dobrado âmbar + "Ben") + divisor + data local curta no idioma do app; menu = botão circular branco de 44 px com sombra, ROUTES.menu.
7. Marca: um único componente SVG (src/layout/components/icons/ben-logo.tsx) com variantes `brand` (index.html:96-102) e `avatar` (index.html:150-156), em mapa `Record<variant, cores>`. O avatar de 28 px fica ao lado de cada balão do Ben.
8. Cartão Filed: anexo ABAIXO do balão do Ben, alinhado à esquerda. Título = capture.title. Prévia de note/task OMITIDA, porque o backend manda `meta: null` (resolve-capture.ts:65,74). O chip de hora (ícone Clock) aparece só no lembrete: `meta` (= remindAt ISO) formatado com o utilitário de data existente, com o texto cru como fallback. O Start âmbar aparece só em task, mantém os estados pending/active/finished e a rota ROUTES.taskWorkspace. O header caps "NOTE" sai. O estado de erro continua.
9. Dog-ear de 12 px via react-native-svg. Sombra sh-1 via shadow*/elevation. Sem `fit-content`: usar self-start/self-end + min-w 224 / max-w 286.
10. Bolha do usuário: #f7e6c3, raio 20 com canto inferior direito 6. A meta dentro dela tem onda (se `voiceDurationMs`) + duração m:ss + hora HH:MM de createdAt, com tabular-nums. Barras = 3 por segundo, mínimo 3, máximo 24 (alturas no padrão do mock, index.html:160-162). Os estados pending/error (chat-history.tsx:104-141) continuam.
11. Balão do Ben: #f1e2d6, raio 20 com canto superior esquerdo 6. CostFooter e MessageTracePressable continuam, discretos.
12. Compositor: campo de 52 px com borda 1,5 #908b87 + botão âmbar redondo de 56 px com halo de 6 px #f3dcbb. O botão vira Send quando há texto. RecordingBar continua, com os tokens novos. Segue keyboard-aware-absolute-footer.
13. Paleta app-wide: os nomes Material do tailwind.config.js ficam, com valores novos, e entram tokens novos (lista no prompt theme-foundation). `primary` = âmbar #f9a12f, `on-primary` = tinta #1d1814. Texto e ícone que hoje usam `primary` como tinta passam para on-surface.
14. Fonte: Instrument Sans 400/500/600/700 (@expo-google-fonts/instrument-sans) nos aliases sans/sans-medium/sans-semibold/sans-bold. Hanken sai; JetBrains Mono continua em `mono` (trace/código).
15. Ícones: phosphor-react-native, com `color` e `size` explícitos vindos de @/layout/utils/colors. Tabela lucide→Phosphor nos prompts de ícones.
16. Duração: `voiceDurationMs: number | null` em MessageProps. HTTP body opcional `voiceDurationMs` (int ≥ 0, nullable). Resposta `voiceDurationMs: number | null`. Sem migration: Message persiste `props` como JSON string (schema.prisma:12-18). Mensagens antigas sem a chave viram null no presenter.
17. Copy nova em en + pt-BR nos arquivos de strings existentes. As falas do Ben vêm do agente.
18. Estados fora do mock herdam os tokens novos sem redesenho. Status bar e home indicator são do SO.
19. Escopos paralelos dividem a worktree. Cada implementador roda eslint --fix só nos arquivos dele, aceita typecheck limpo nos arquivos dele e commita só com `git add <arquivos do escopo>`. Lint, typecheck e testes completos na raiz rodam no escopo final.

## Convenções aplicáveis

- .claude/skills/code-get-coding-designs/designs/mobile-app-structure.md, page-structure.md, api-client-structure.md, backend-domain-structure.md, backend-http-layer-structure.md
- .claude/skills/code-write-code/general-coding-practices.md, coding-patterns/{general-code-preferences,lint,automated-testing}.md
- coding-patterns/frontend/{frontend-code-preferences,react-components,component-variant-maps,minimum-props-strategies}.md
- coding-patterns/mobile/{mobile-icon-colors,keyboard-aware-absolute-footer}.md

## Escopos (ordem e paralelismo)

| Grupo | Escopo | Prompt | Depende de |
|---|---|---|---|
| G1 ∥ | backend-voice-duration | prompts/backend-voice-duration.md | — |
| G1 ∥ | theme-foundation | prompts/theme-foundation.md | — |
| G2 ∥ | icons-layout | prompts/icons-layout.md | theme-foundation |
| G2 ∥ | icons-task-workspace | prompts/icons-task-workspace.md | theme-foundation |
| G2 ∥ | icons-chat-misc | prompts/icons-chat-misc.md | theme-foundation |
| G2 ∥ | capture-card | prompts/capture-card.md | theme-foundation |
| G2 ∥ | chat-composer | prompts/chat-composer.md | theme-foundation |
| G2 ∥ | mobile-voice-duration | prompts/mobile-voice-duration.md | backend-voice-duration (contrato) |
| G3 ∥ | chat-shell | prompts/chat-shell.md | theme-foundation, mobile-voice-duration (page.tsx) |
| G3 ∥ | chat-messages | prompts/chat-messages.md | capture-card, mobile-voice-duration, theme-foundation |
| G4 | finalize | prompts/finalize.md | todos |

## Melhorias estruturais (nos contratos)

- MessagePresenter já tipa o retorno com `Omit<Serialize<WithID<MessageProps>>,…>`, então `voiceDurationMs` vira erro de tipo até ser serializado (backend-voice-duration).
- Variantes da marca e cores por tipo de captura em `Record<…>` (theme-foundation, capture-card): uma variante ou um kind novo quebra a compilação.

## Melhorias estruturais sugeridas (fora do escopo)

- Fonte única de hex: tailwind.config.js e layout/utils/colors.ts duplicam a paleta à mão. Um módulo JS compartilhado eliminaria a sincronização manual.
- Atualizar o exemplo lucide em coding-patterns/mobile/mobile-icon-colors.md e as regras de design-rules.md/design.md (estágio de contexto).

## Perguntas

Respondidas (ver Decisões do usuário).

## Extrato

- Pedido: implementar no app mobile-ben o design docs/design/chat-v2 (index.html = estilo, shot.png = pixel, plano.md = racional).
- Decisões: paleta âmbar + Instrument Sans + Phosphor no APP INTEIRO (lucide removido); duração de voz PERSISTIDA (`voiceDurationMs`); mic continua por TOQUE com placeholder "Type or tap to talk"; galeria fora.
- Premissas-chave: faixa de tarefa no topo (só com tarefas ativas); cartão Filed anexo abaixo do balão do Ben, sem prévia em note/task, chip de hora só no lembrete, Start só em task; divisória de dia "Today · N filed" no cliente; sem migration (props JSON).
- Arquivos no escopo:
  - domain/chat: message entity, persist-user/ben-message + teste, factories;
  - server-ben: routes/chat.ts, message/agent-reply presenters;
  - mobile-ben: tailwind.config.js, app/_layout.tsx, package.json, layout/utils/colors.ts, typography.tsx, icons/ben-logo.tsx, brand-mark.tsx, os 46 arquivos com lucide, pages/chat (page, top-bar, peek/picker, history, bubble, capture-card/*, footer, chat-input/*, recording-bar, stores e voice-store, use-chat-list, strings), api/models/message.ts, api/requests/chat.ts.
- Fora: packages/infra/mobile/design, docs de contexto/skills, preview de nota/tarefa, gesto segurar-para-falar.
- Critérios de aceitação:
  1. `pnpm lint:fix`, `pnpm typecheck` e `pnpm test` verdes na raiz.
  2. Zero `lucide-react-native` em src/app/package.json.
  3. Zero Hanken carregada.
  4. O chat em :8081 bate com shot.png: header (marca âmbar, "Ben", data, menu circular), faixa de tarefa no topo, divisória do dia, bolha creme do usuário com onda + duração + hora, avatar + balão areia do Ben, cartão branco com dog-ear, ladrilho e ícone colorido por tipo, Start âmbar em task, chip de hora no lembrete, compositor campo + mic âmbar com halo.
  5. Recarregar a página mantém a onda e a duração das mensagens de voz.
- Armadilhas:
  - Não quebrar `inverted`, a paginação nem o scroll-to-bottom.
  - O header absoluto muda headerHeight; o padding do empty state depende dele.
  - RN: fonte por família exata, sem fit-content e sem gradiente CSS (usar react-native-svg); ícones com color/size em props.
  - A duração precisa sobreviver ao retry da transcrição (o voice-store guarda o durationMillis junto do uri).
  - Escopos paralelos na mesma worktree: lint e commit só dos próprios arquivos.
- Cenário de teste (browser-mobile-tester, :8081, 390x844, API :3333 + login dev):
  - a) Abrir o chat e comparar com shot.png (screenshot lado a lado).
  - b) Mandar texto: bolha creme com hora e sem onda; resposta com avatar + balão.
  - c) Gravar voz (ou simular) por cerca de 4 s: bolha com onda de cerca de 12 barras e "0:04"; recarregar e a onda continua.
  - d) Capturas note, reminder e task: ícone e cor por tipo, chip de hora no lembrete, Start abre o workspace.
  - e) Com 0 tarefas ativas a faixa some; com 2, "2 active" abre o seletor.
  - f) Digitar: o botão vira Send; teclado aberto mantém o compositor visível.
  - g) Estados: offline/banner abaixo da faixa, erro de envio na bolha, gravação (RecordingBar âmbar), transcrevendo.
  - h) Menu, workspace de tarefa e login com a fonte e a paleta novas, sem ícone faltando nem texto âmbar ilegível.
  - i) Rolar para cima carrega mensagens antigas e as divisórias de dia aparecem.
