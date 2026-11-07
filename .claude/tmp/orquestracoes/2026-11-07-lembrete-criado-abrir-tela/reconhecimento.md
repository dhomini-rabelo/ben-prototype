# Reconhecimento — card de lembrete no chat abre o detalhe; único/recorrente claro

## Estado atual
veredito: confirma
A pesquisa do decisao.md e as linhas de "Continua como hoje" batem com o código: o card de lembrete é um `View` sem toque, o card só leva `kind/itemId/title/meta` (sem repetição), `menu-store` já tem `openDetail/detailTarget`, `ReminderDetail` busca por id e trata 404/erro/carregando, e a lista e o detalhe só mostram o selo de tipo (Alarme/Goal/Quando acontecer). Nenhuma peça da spec existe em parte.

## Unidade afetada
mais de uma: `@ben/domain-chat` (CaptureView, persist-captures, resolve-capture), `@ben/server-ben` (só repasse nos presenters; ver Mapa) e `@ben/mobile-ben` (card, lista, detalhe, menu-store, strings). A galeria `@ben/mobile-design` não entra (Premissa 1).

## Lane de cada RT e PR
- RT-001 → teste — `packages/domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts` (criação) e `resolve-capture.test.ts` (histórico); `pnpm --filter @ben/domain-chat test:unit`
- RT-002 → teste — `resolve-capture.test.ts`: lembrete editado no repositório antes do resolve devolve a repetição atual
- RT-003 → codigo — o diff não cria arquivo em `packages/infra/mobile/ben/app/` nem muda `src/core/routes.ts`; a abertura usa `useMenuStore` + `router.push(ROUTES.menu)` (`chat-history-item.tsx`)
- RT-004 → teste — novo `packages/infra/mobile/ben/src/layout/stores/__tests__/menu-store.test.ts` (`reset()` esquece a origem "chat"); o comportamento na tela é visto em S42-S44. Comando: `pnpm --filter @ben/mobile-ben test:unit`
- PR-001 → teste — os dois arquivos de domínio acima (T01 a T07)
- PR-002 → teste — novo `packages/infra/mobile/ben/src/layout/utils/__tests__/recurrence-label.test.ts` (T08 a T13)
- PR-003 → browser — `http://localhost:8081/chat`
- PR-004 → browser — `http://localhost:8081/chat` (depois `/menu` pela navegação do próprio app)
- PR-005 → browser — `http://localhost:8081/chat`
- PR-006 → browser — `http://localhost:8081/chat`
- PR-007 → browser — `http://localhost:8081/chat`
- PR-008 → browser — `http://localhost:8081/chat`
- PR-009 → teste — ver `## RT problemáticos`: o app não tem como renderizar componente em teste; vira teste de um predicado puro, novo `packages/infra/mobile/ben/src/pages/chat/utils/__tests__/capture-openable.test.ts` (T15)
- PR-010 → browser — `http://localhost:8081/chat` com backend real

Contagem: teste 6 (RT-001, RT-002, RT-004, PR-001, PR-002, PR-009), browser 7 (PR-003 a PR-008, PR-010), codigo 1 (RT-003).

## RT problemáticos
- PR-009 (teste de componente): `packages/infra/mobile/ben/vitest.config.ts` inclui só `src/**/*.test.ts` em ambiente node e o `package.json` não tem `@testing-library/*` nem `react-test-renderer`; teste de componente não roda. Além disso o chat nunca monta o card em estado de erro (`CaptureCard.Error` não tem chamador, `chat-history-item.tsx:77` não passa `state`), então o "estado de erro com card" não existe no fluxo real, como a própria PR admite. Proposta: extrair a decisão "este card abre o detalhe?" para um predicado puro e testá-lo (Dúvida 2).
- PR-007 (aviso do alarme na tela, AC-020): o aviso só aparece quando `useAlarmStore.enqueue` é chamado por notificação ou agendador, e no web `notifications-service.web.ts` é no-op; sem ele o screenshot do popup não é alcançável pelo fluxo normal. Deixei o S45 pedindo o popup por um disparo forçado (ver Armadilhas); se o usuário não quiser, corta.
- PR-006 ("lembrete removido no banco de teste"): não existe rota de delete (r0-backend §3); o tester precisa apagar a linha em `packages/infra/db/prisma/dev.db` (modelo `Reminder`). Possível, mas é passo de preparo (Dúvida 1).

## Mapa do código
Caminhos relativos a `packages/`. Linhas conferidas no código.
- [domain/chat/src/application/types/capture-view.ts](domain/chat/src/application/types/capture-view.ts) — `CaptureView {kind, itemId, title, meta}`: onde nasce o campo novo (tipo do lembrete + repetição)
- [domain/chat/src/application/use-cases/captures/persist-captures.ts:166](domain/chat/src/application/use-cases/captures/persist-captures.ts#L166) — `toReminderView` serve alarme, conditional (l.96) e goal (l.128); `reminder.props.kind` e `reminder.props.recurrence` estão ali (alarme/conditional gravam `recurrence: null`, l.90; goal grava `draft.recurrence`, l.121)
- [domain/chat/src/application/use-cases/captures/resolve-capture.ts:44](domain/chat/src/application/use-cases/captures/resolve-capture.ts#L44) — `resolveReminderView` lê o lembrete atual por `findUnique` (título e `remindAt` atuais); é onde RT-002 se cumpre; devolve `null` se sumiu (CB-009)
- [domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts:174](domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts#L174) — teste de goal com recurrence e view; o de alarme está na l.37 e o de conditional na l.151; estender
- [domain/chat/src/application/use-cases/captures/__tests__/resolve-capture.test.ts](domain/chat/src/application/use-cases/captures/__tests__/resolve-capture.test.ts) — usa `InMemoryReminderRepository` e `ReminderFactory`; estender
- [infra/server-ben/src/routes/chat.ts:223](infra/server-ben/src/routes/chat.ts#L223) — `capturesResult.items[0]`; persiste só `{kind, itemId}` na mensagem (l.225-233); não muda
- [infra/server-ben/src/presenters/agent-reply-presenter.ts](infra/server-ben/src/presenters/agent-reply-presenter.ts) e [message-presenter.ts](infra/server-ben/src/presenters/message-presenter.ts) — repassam o `CaptureView` inteiro (`capture`), então campo novo no tipo atravessa sem mudar o presenter; conferir
- [infra/server-ben/src/routes/messages/list-messages.ts:352](infra/server-ben/src/routes/messages/list-messages.ts#L352) — resolve a capture de cada mensagem no histórico
- [infra/mobile/ben/src/api/models/message.ts:5](infra/mobile/ben/src/api/models/message.ts#L5) — `MessageCapture {kind,itemId,title,meta?}`; `api/responses/agent-reply.ts:24` usa o mesmo tipo; `pages/chat/utils/chat-messages.ts` e `use-chat-messages.ts:13` repassam `capture` para o metadata
- [infra/mobile/ben/src/api/models/reminder.ts](infra/mobile/ben/src/api/models/reminder.ts) — `ReminderKind`, `GoalRecurrence`, `Reminder.recurrence`; já usados por lista e detalhe
- [infra/mobile/ben/src/pages/chat/components/chat-history/chat-history-item.tsx:76](infra/mobile/ben/src/pages/chat/components/chat-history/chat-history-item.tsx#L76) — onde o card é montado; `CaptureCard.Action onAction` empurra `taskWorkspace` (só renderiza para task); aqui entra o toque do card de lembrete
- [infra/mobile/ben/src/pages/chat/components/capture-card/capture-card-meta.tsx:41](infra/mobile/ben/src/pages/chat/components/capture-card/capture-card-meta.tsx#L41) — pílula de horário (`Clock`, `bg-brand-50`); `chat-history-item.tsx:73` só monta o `Meta` quando `capture.meta` existe, então o conditional (meta nula) hoje não mostra nada; AC-004 exige o texto "Quando acontecer" aqui
- [infra/mobile/ben/src/pages/chat/components/capture-card/capture-card-root.tsx:57](infra/mobile/ben/src/pages/chat/components/capture-card/capture-card-root.tsx#L57) — `View` sem toque, com sombra; o toque entra por fora (Pressable em volta) ou aqui
- [infra/mobile/ben/src/layout/stores/menu-store.ts](infra/mobile/ben/src/layout/stores/menu-store.ts) — `view`, `detailTarget`, `openDetail`, `reset`; receberá a origem "chat"
- [infra/mobile/ben/src/pages/menu/page.tsx:24](infra/mobile/ben/src/pages/menu/page.tsx#L24) — `useEffect(() => () => reset(), [reset])` zera ao desmontar (RT-004); o detalhe é o `SettingsSheetOverlay` com `ReminderDetail` (l.33-46)
- [infra/mobile/ben/src/layout/components/menu-reminders/menu-reminders-view.tsx:20](infra/mobile/ben/src/layout/components/menu-reminders/menu-reminders-view.tsx#L20) — `onBack={goBackToMenu}`: é o voltar que AC-009 muda quando veio do card; `useReminderListData` busca `reminders/list` sem filtro (concluídos incluídos); erro da lista com "tentar de novo" já existe (CB-012)
- [infra/mobile/ben/src/layout/components/menu-reminders/menu-reminders-list.tsx:47](infra/mobile/ben/src/layout/components/menu-reminders/menu-reminders-list.tsx#L47) — `MenuListRow` ativo (supporting `capturedSupporting`) e concluído (`doneSupporting`, l.69); onde o prefixo de repetição entra
- [infra/mobile/ben/src/layout/components/menu-detail/reminder-detail.tsx:34](infra/mobile/ben/src/layout/components/menu-detail/reminder-detail.tsx#L34), [item-detail-content.tsx](infra/mobile/ben/src/layout/components/menu-detail/item-detail-content.tsx) e [item-detail-reminder-meta.tsx:17](infra/mobile/ben/src/layout/components/menu-detail/item-detail-reminder-meta.tsx#L17) — cadeia que leva `kind` até o box de meta; `recurrence` precisa passar por ela
- [infra/mobile/ben/src/layout/components/menu-detail/reminder-editor.tsx:230](infra/mobile/ben/src/layout/components/menu-detail/reminder-editor.tsx#L230) — o salvar invalida queries (l.230-236); conferir que invalida lista e detalhe (AC-012)
- [infra/mobile/ben/src/layout/strings/menu-strings.ts](infra/mobile/ben/src/layout/strings/menu-strings.ts), [menu-detail-strings.ts:29](infra/mobile/ben/src/layout/strings/menu-detail-strings.ts#L29) — `reminderKinds`, `recurrenceWeekdays` ("Dias úteis"); vocabulário novo (Único, Todo dia, abreviações dos dias) em `Localized<T>`
- [infra/mobile/ben/src/pages/chat/utils/format-short-date.ts](infra/mobile/ben/src/pages/chat/utils/format-short-date.ts) — usa `Intl` com `LANGUAGE_LOCALES`; não serve de base para "Seg, Qua" (ver Armadilhas)
- Base visual do protótipo (ponto de partida, não é para copiar `DemoReminder`): [infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx](infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/variacao-2.tsx) (CardV2, RowV2, meta com `Repeat`), [parts.tsx](infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/parts.tsx) (`TappableCard` com `active:opacity-60`, `CardTimePill` com sufixo, `KindPill` para o conditional) e [shared.tsx](infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/shared.tsx) (dados da Ana e telas de prova); rotas `app/prototipo/lembrete-criado-abrir-tela/v2.tsx`, `v2-2.tsx`, `v2-3.tsx`
- Rota de protótipo a remover no último passo do plano: `packages/infra/mobile/ben/app/prototipo/lembrete-criado-abrir-tela/` e `packages/infra/mobile/ben/src/prototipo/lembrete-criado-abrir-tela/` (as pastas `alarme-tela-cheia` e `header-menu-footer` ficam)

## Padrão da vizinhança
- Domínio: use case ao lado de teste em `__tests__/`, repositório em memória e factory (`InMemoryReminderRepository`, `ReminderFactory`); `CaptureView` é tipo simples.
- App: componentes compostos (`CaptureCard.Root/Icon/Body/...`), strings por área em `Localized<T>` com `useStrings`, ícones `phosphor-react-native` com `color` de `@/layout/utils/colors`, zustand para estado de tela (`menu-store`), `cn()` para classes NativeWind, `active:opacity-60` para estado pressionado (protótipo; conferir se `MenuListRow` usa algo parecido). Sem comentários, sem abreviações.
- Testes do app: só `*.test.ts` puro em `src/**/__tests__/` (notifications-service.test.ts como modelo, com `vi.hoisted` para mocks); a lógica de rótulo e o predicado do toque têm que ser funções puras sem importar `react-native`.

## Reuso disponível
`ReminderDetail` (busca por id, 404, erro, carregando), `useMenuStore.openDetail`, `ReminderKindBadge`, `MenuListRow` (aceita `supporting` string), `CaptureCard.*`, `formatClock/isTomorrow` e `formatShortDate`, `alarmStrings.snoozeTomorrow`, `GoalRecurrence` e `ReminderKind` do modelo. Do protótipo: `TappableCard`, `CardTimePill`, `KindPill`, o box de detalhe com `Repeat`.

## Memórias que se aplicam
- `.claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md` — diz que lembrete recorrente não é v1; o código já tem goal com `daily/weekdays` (persist-captures.ts:121, editor de recorrência); vale o código, e a memória fica para o usuário atualizar (não é escopo).
- Demais categorias: "Nenhuma entrada ainda".

## Fixtures
veredito: sem mecanismo
estado: nenhum
a mudar: nada

## Roteiro de comprovação
ambiente: `pnpm dev` na raiz (server :3333 + Expo web :8081), com `BACKEND_URL=http://localhost:3333` no `.env.development` do app (hoje aponta para um túnel ngrok; a linha localhost está comentada e :3333 está fora do ar). `pnpm dev:mobile` sozinho NÃO serve: sem o server o chat não carrega histórico nem lembretes. A galeria (`pnpm dev:design`) não participa. Prints: `playwright-core` + Chrome local, uma tela inteira por print, 390x844, escala 1x, nome do PNG com o id (como em `.claude/tmp/orquestracoes/2026-11-07-header-menu-footer/prototipo/v1.png`).
estado: nenhum (sem mecanismo de fixtures; sessão e lembretes da Ana são montados num passo do plano, ver Dúvida 1)
url: http://localhost:8081/chat — chat do app em português (pt-BR), relógio do navegador fixo em 7/nov/2026, histórico com os lembretes da Ana (ver `[Visual] Dados` da spec), 390x844

S01 (PR-003; AC-005, AC-007) [final] (era vídeo) o usuário encosta e segura o dedo num card antigo da conversa ("Ligar pro dentista") → o card aparece em estado pressionado (mais claro que os outros) e a conversa continua na tela
S02 (PR-003; AC-005, AC-006) [final] o usuário solta o toque no card antigo "Ligar pro dentista" → a lista de lembretes aparece com o detalhe de "Ligar pro dentista" aberto por cima
S03 (PR-003; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela com a linha "Ligar pro dentista" nela
S04 (PR-003; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece no mesmo ponto de antes, sem passar pela lista do menu
S05 (PR-003; AC-006) [final] o usuário toca no card do lembrete mais recente → o detalhe aberto é o do lembrete mais recente, não o do card antigo
S06 (PR-003; CB-005) [final] o usuário toca duas vezes rápido num card → o detalhe aparece numa tela só (nada empilhado por baixo)
S07 (PR-003; CB-011, AC-009) [final] o usuário volta pelo botão voltar do navegador uma vez → a conversa aparece
S08 (PR-004; AC-001, AC-002, AC-003, AC-004, AC-005, AC-019) [final] o usuário olha a conversa em português com os sete lembretes → os cards mostram, junto do horário, "Único" (alarme), "Único" (goal), "Todo dia", "Dias úteis", "Seg, Qui" e, no sem horário, "Quando acontecer"
S09 (PR-004; AC-001, AC-002, AC-003, AC-004) [final] o usuário troca o idioma para inglês e olha a conversa → os cards mostram "One-time", "Every day", "Weekdays", "Mon, Thu" e "When it happens"
S10 (PR-004; AC-010, AC-019, CB-001) [final] o usuário abre a lista de lembretes em português → cada linha ativa e a concluída ("Pagar o aluguel") mostram o rótulo de repetição ("Todo dia · capturado há ...", "Único", "Seg, Qui") e o selo de tipo; a linha "quando acontecer" mostra só o selo "Quando acontecer"
S11 (PR-004; AC-010) [final] o usuário abre a lista de lembretes em inglês → as linhas mostram "Every day", "One-time", "Weekdays", "Mon, Thu"
S12 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe do alarme "Ligar pro dentista" → o box mostra horário, "ativo", "Alarme" e a linha "Único"
S13 (PR-004; AC-011, AC-002) [final] o usuário abre o detalhe de um goal sem repetição → o box mostra "Goal" e a linha "Único"
S14 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Todo dia"
S15 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Academia" → o box mostra a linha "Dias úteis"
S16 (PR-004; AC-011, AC-003) [final] o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Seg, Qui"
S17 (PR-004; AC-011, AC-004) [final] o usuário abre o detalhe de "Ver se a encomenda chegou" → o box mostra o selo "Quando acontecer" e nenhuma linha de repetição repetindo o texto
S18 (PR-004; AC-011, CB-001) [final] o usuário abre o detalhe de "Pagar o aluguel" → o box mostra "concluído", o rótulo "Único" e nenhum editor abaixo
S19 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Tomar o remédio" → o box mostra a linha "Every day"
S20 (PR-004; AC-011, AC-003) [final] em inglês, o usuário abre o detalhe de "Regar as plantas" → o box mostra a linha "Mon, Thu"
S21 (PR-005; AC-012, AC-018) [final] (era vídeo) o usuário toca no card de um goal sem repetição e olha o detalhe → o box mostra "Único" e o editor mostra "Repetir" com "Não" marcado
S22 (PR-005; AC-012, AC-018) [final] o usuário marca "Diária" e salva → o detalhe passa a mostrar a linha "Todo dia"
S23 (PR-005; AC-012) [final] o usuário fecha o detalhe → a linha desse lembrete na lista mostra "Todo dia"
S24 (PR-005; CB-010) [final] o usuário volta à conversa e recarrega a página → o card desse lembrete mostra "Todo dia"
S25 (PR-006; CB-003) [final] o usuário toca no card com o servidor respondendo devagar → o carregando do detalhe aparece por cima da lista
S26 (PR-006; CB-002) [final] o usuário toca num card cujo lembrete foi removido do banco antes → o detalhe mostra "este item sumiu — deve ter sido apagado em outro lugar."
S27 (PR-006; CB-002, AC-009) [final] o usuário fecha o detalhe que sumiu e toca no voltar da lista → a lista aparece ao fechar e, ao voltar, a conversa
S28 (PR-006; CB-004) [final] o usuário toca no card com o servidor falhando → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S29 (PR-006; CB-004) [final] o usuário toca no card sem conexão → o detalhe mostra "não deu para carregar — toque para tentar de novo"
S30 (PR-006; CB-004) [final] o usuário toca em "tentar de novo" com o servidor de volta → o detalhe do lembrete aparece ali mesmo
S31 (PR-006; CB-004, AC-009) [final] o usuário fecha o detalhe com erro e volta pela lista → a conversa aparece
S32 (PR-006; CB-012, AC-008) [final] o usuário abre o detalhe pelo card com a lista falhando e fecha o detalhe → a lista mostra o aviso de falha com "tentar de novo"
S33 (PR-007; AC-013) [final] (era vídeo) o usuário toca no botão do card de task → a task abre como hoje
S34 (PR-007; AC-014) [final] o usuário toca no card de nota → nada abre e a conversa continua na tela
S35 (PR-007; AC-015) [final] o usuário pressiona e segura a bolha de texto do Ben → o menu de ações da mensagem abre
S36 (PR-007; AC-016) [final] o usuário toca no botão do topo da conversa → a lista do menu abre (Tarefas, Notas, Lembretes...)
S37 (PR-007; AC-017) [final] o usuário entra em Lembretes e toca num lembrete da lista → o detalhe abre por cima da lista
S38 (PR-007; AC-017) [final] o usuário fecha o detalhe → a lista de lembretes fica na tela
S39 (PR-007; AC-016) [final] o usuário toca no voltar da lista (aberta pelo menu) → a lista do menu aparece, não a conversa
S40 (PR-007; AC-016) [final] depois de já ter aberto um card pelo chat e voltado, o usuário abre o menu pelo botão do topo, entra em Lembretes e toca no voltar → a lista do menu aparece, não a conversa
S41 (PR-007; AC-020) [final] o alarme dispara com o app aberto → o aviso do alarme na tela aparece como hoje (alarme, título e horário)
S42 (PR-008; CB-007) [final] o Ben responde criando dois lembretes de uma vez → a resposta mostra um card só, o do primeiro
S43 (PR-008; CB-007, AC-010) [final] o usuário abre a lista de lembretes depois dessa resposta → os dois lembretes estão na lista, cada um com o rótulo de repetição
S44 (PR-008; CB-009, AC-005) [final] o usuário recarrega a conversa depois de o lembrete do card ter sido removido do banco → a mensagem aparece sem card
S45 (PR-010; AC-001, AC-003) [final] o usuário diz ao Ben "me lembra de tomar o remédio todo dia às 8" → a resposta traz o card com "Todo dia"
S46 (PR-010; AC-006, AC-011) [final] o usuário toca no card → o detalhe do lembrete certo abre com a linha "Todo dia"
S47 (PR-010; AC-008) [final] o usuário fecha o detalhe → a lista de lembretes mostra o lembrete criado com "Todo dia"
S48 (PR-010; AC-009) [final] o usuário toca no voltar da lista → a conversa aparece com a resposta do Ben e o card

comando: `pnpm test` na raiz (ou `pnpm --filter @ben/domain-chat test:unit` e `pnpm --filter @ben/mobile-ben test:unit`)
T01 (PR-001; AC-001, AC-002) [final] `packages/domain/chat/src/application/use-cases/captures/__tests__/persist-captures.test.ts` — alarme criado pela conversa → a view traz tipo "alarme" e nenhuma repetição
T02 (PR-001; AC-002) [final] mesmo arquivo — goal com repetição "nenhuma" e goal sem valor de repetição → a view traz tipo "goal" e a mesma ausência de repetição nos dois
T03 (PR-001; AC-003) [final] mesmo arquivo — goal que repete todo dia → a view traz a repetição diária
T04 (PR-001; AC-003) [final] mesmo arquivo — goal de segunda a sexta → a view traz os dias 1 a 5
T05 (PR-001; AC-003) [final] mesmo arquivo — goal em dias quaisquer (segunda e quarta) → a view traz esses dias
T06 (PR-001; AC-004) [final] mesmo arquivo — lembrete "quando acontecer" → a view traz tipo "conditional", sem horário e sem repetição
T07 (PR-001; AC-005, CB-008, RT-002) [final] `packages/domain/chat/src/application/use-cases/captures/__tests__/resolve-capture.test.ts` — lembrete cuja repetição mudou depois da criação → a view resolvida traz a repetição atual
T08 (PR-002; AC-002) [final] `packages/infra/mobile/ben/src/layout/utils/__tests__/recurrence-label.test.ts` — alarme, goal "nenhuma" e goal sem valor → "Único" em pt-BR e "One-time" em en
T09 (PR-002; AC-003) [final] mesmo arquivo — repetição diária → "Todo dia" e "Every day"
T10 (PR-002; AC-003) [final] mesmo arquivo — segunda a sexta (1 a 5) → "Dias úteis" e "Weekdays"
T11 (PR-002; AC-003) [final] mesmo arquivo — os sete dias marcados → "Todo dia" e "Every day"
T12 (PR-002; AC-003) [final] mesmo arquivo — segunda e quarta → "Seg, Qua" e "Mon, Wed"
T13 (PR-002; AC-004) [final] mesmo arquivo — "quando acontecer" → "Quando acontecer" e "When it happens" no card, e sem rótulo de repetição na lista e no detalhe
T14 (RT-004; AC-016) [final] `packages/infra/mobile/ben/src/layout/stores/__tests__/menu-store.test.ts` — abre pelo chat e chama `reset()` → a origem "chat" some e a vista volta à do menu
T15 (PR-009; CB-006) [final] `packages/infra/mobile/ben/src/pages/chat/utils/__tests__/capture-openable.test.ts` — card de lembrete em estado de erro → o toque não abre o detalhe; em estado normal, abre

## Armadilhas
- O store é global e só zera ao desmontar o Menu: a origem "chat" tem que ser gravada junto de `view='reminders'` e `openDetail` ANTES do `router.push(ROUTES.menu)`, e esquecida pelo `reset()`. Abrir o menu pelo botão do topo depois de ter vindo pelo card tem que cair na lista do menu (AC-016); se a origem sobreviver, o voltar vai ao chat errado.
- Toque duplo (CB-005): `router.push` chamado duas vezes empilha duas telas de menu; precisa de guarda (por exemplo, ignorar o toque se o store já está com detalhe/origem aberta).
- O voltar do cabeçalho da lista usa `goBackToMenu` (view='menu'); vindo do card precisa de `router.back()`. O voltar do sistema/navegador já faz `router.back()` (CB-011), mas uma recarga em `/menu` perde o store (fora de escopo: sem link direto).
- `CaptureCard.Meta` só é montado quando `capture.meta` existe (`chat-history-item.tsx:73`) e só renderiza para `kind==='reminder'`; o lembrete "quando acontecer" tem `meta` nula e hoje fica sem pílula nenhuma.
- Pílula de horário: manter o horário exatamente como hoje (AC-019: só a hora hoje, "amanhã 09:00", data nos outros dias) e só acrescentar o rótulo (V2: "amanhã 08:00 · Todo dia").
- Abreviação dos dias: `Intl` com `weekday: 'short'` em pt-BR devolve "seg." (com ponto) e em en "Mon"; "Seg, Qua" precisa de tabela própria em `Localized`, não de `formatShortDate`.
- Lista e detalhe: o conditional não ganha texto de repetição (selo de tipo basta; AC-010/011), então a função de rótulo devolve vazio para conditional e o card usa o selo de tipo.
- `ReminderKind` do alarme é sempre "Único" mesmo que o backend aceite `recurrence` num alarme via update (não verificado em `update-reminder.ts`): a regra de AC-002 manda o tipo vencer a repetição.
- Dados para provas: lembretes só nascem pelo agente (não há rota de criação); a matriz de S08 a S20 pede linhas no `dev.db` (props em JSON) ou respostas interceptadas. Erros e carregando (S25 a S32) só se fabricam de forma estável por interceptação da API (`page.route`) ou parando o server; sem rota de delete, "removido no banco" é um DELETE em SQLite.
- S45 a S48 usam o Ben de verdade: o server precisa das chaves do provedor de IA no `.env` (não verifiquei).
- S41: o web não dispara alarme (`notifications-service.web.ts` é no-op); só aparece o popup se o tester enfileirar o alarme na `alarm-store` pelo console. Se isso for caro, o usuário corta a prova.
- Em S08, sete cards num chat curto: se não couber em 390x844, a prova vira dois prints (S08 e um id novo); ids não renumeram.

## Dúvidas
- Como as provas S01 a S48 conseguem sessão e dados no navegador? O login Google não roda em navegador de teste e `BACKEND_URL` aponta para um túnel ngrok. — candidatas: (A) subir o server local, apontar `BACKEND_URL` para ele, gerar um JWT local para um usuário do `dev.db` e gravá-lo em `localStorage` (`ben.jwttoken`), com os lembretes da Ana inseridos no banco; (B) manter só o Expo e interceptar a API no Playwright (`page.route`) com token falso, que dá controle de todos os estados (carregando, 500, sem conexão, removido) mas não prova S45 a S48 nem a edição real de S21 a S24; (C) A para S21 a S24, S42 a S48 e S45, B para a matriz S08 a S20 e as bordas S25 a S32. Recomendo: C, porque a edição com recarga e o Ben de verdade exigem backend real e carregando/erro só se fabricam de forma estável por interceptação.
- Como cumprir PR-009 sem biblioteca de teste de componente? — candidatas: (A) extrair um predicado puro "este card abre o detalhe?" e testá-lo em Vitest node (T15); (B) adicionar `@testing-library/react-native` e ambiente de teste para `.test.tsx` (muda a infra de teste do app); (C) tirar a PR de teste e deixar em `codigo` (revisor lê que o card em erro não recebe o toque). Recomendo: A, porque cumpre a intenção (card de erro não abre) sem mexer na infra de teste.

## Premissas
1. A galeria `packages/infra/mobile/design` não é tocada: o protótipo foi feito e aprovado no app Expo e a galeria está defasada (sem selo de tipo, sem alarm/goal), então atualizá-la seria trabalho fora da spec; o plano não cria `pages/<page>-<state>` na galeria.
2. A repetição chega ao app como dado cru (tipo do lembrete e `recurrence`) em `CaptureView`/`MessageCapture`; o texto ("Todo dia", "Seg, Qua") é montado no app em en/pt-BR, que é o que PR-002 testa. O backend não rotula (r0-backend §1).
3. Ordem dos dias em "Seg, Qua": segunda a domingo (o backend numera 0=domingo..6=sábado; o rótulo não segue essa ordem, e domingo vai ao fim); abreviações en: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
4. `recurrence.type==='weekdays'` com lista vazia não tem AC; assumo que cai em "Único" (nenhum dia para repetir). Qualquer outro conjunto que não seja segunda a sexta nem os sete dias segue a regra geral (dias abreviados).
5. O toque é no card inteiro (Pressable por fora do `CaptureCard.Root`, como `TappableCard` do protótipo), com `active:opacity-60`; o card de task e o de nota não ganham o toque (AC-013, AC-014).
6. O S01 (estado pressionado) é obtido com mouse pressionado no Playwright; é a forma de ver `active:`.
7. Os S de inglês trocam o idioma pelas configurações do app (ou pela chave `@ben/language` do `localStorage`).
8. O `.env.development` e os dados de prova (`dev.db`, JWT) são montados num passo do plano e não entram no diff do produto.

veredito: complexa
