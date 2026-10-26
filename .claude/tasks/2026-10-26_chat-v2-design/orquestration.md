# Orquestration — chat-v2-design

Date: 2026-10-26
Skill: simple-loop

## Log

- bootstrap: pasta docs/design/chat-v2/ ausente no início; usuário a colocou no caminho. Branch feat/chat-v2-design criada.
- recon: complexa (falham 2-5), partição não → planner opus. Ponteiro: recon.md
- plan: 4 perguntas (alcance, onda de voz, botão de voz, galeria) enviadas ao usuário via nível 0; planner vivo para SendMessage.

## Extrato da task

(copiado de plan.md ## Extrato)

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
- plan: respostas aplicadas; 11 escopos em 4 grupos (G1 backend-voice-duration∥theme-foundation; G2 6∥; G3 chat-shell∥chat-messages; G4 finalize). Sem migration.
- impl backend-voice-duration: ok, commit f14d23f, +message-trace-presenter.ts (Omit). tsc 0, test:unit 101 ok.
- impl theme-foundation: ok, commit d37fcdd; tocou chat-top-bar.tsx e menu-sidebar.tsx (BrandMark sem props). tsc 0.
- impl icons-chat-misc: ok, commit 4b8303a, 13 arquivos, tsc 0.
- impl chat-composer: ok, commit a4a3cbf; novo ChatInput.ActionFrame; fluxo mic/send não exercitado (tester cobre).
- impl icons-layout: ok, commit 4e11379, 15 arquivos, tsc 0.
- impl icons-task-workspace: ok, commit e03fb1f, 8 arquivos; ícones on-primary agora com color explícito (mudança visível). tsc 0.
- impl mobile-voice-duration: ok, commit 5ce4941, 12 arquivos + page.tsx (setTranscriptHandler). eslint rodou 1x em arquivos de outro agente por scratchpad compartilhado (ver Armadilhas). tsc 0.
- impl capture-card: ok, commit af33453; Header removido, dog-ear novo. Aberto: server não popula capture.meta → chip de hora pode não aparecer.
- impl chat-shell: ok, commit c360e16; strip no topo, picker saiu do footer; tsc 0.
- impl chat-messages: ok, commit 8f8182f; voice-wave, day-divider, chat-history-item novos; tocou use-scroll-to-bottom.ts (tipo). tsc 0.
- impl finalize: ok, commit 0c29803; lucide removido; lint:fix, typecheck, test (101) verdes na raiz.
