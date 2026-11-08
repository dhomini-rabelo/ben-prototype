# r0-backend: lembrete criado -> abrir tela, alarme recorrente vs único

Caminhos relativos a `packages/`. Veredito: ok.

## 1. Modelo do lembrete
- Entidade: `domain/chat/src/enterprise/entities/reminder.ts` (ReminderProps, linhas ~9-27). Campos: `remindAt: string|null` (ISO), `kind`, `status` ('active'|'done'), `timeZone`, `alerts[]`, `recurrence: GoalRecurrence|null`, `messages[]`, `checkFrequency: CheckFrequency|null`, `acknowledgedUntil`, `snoozedUntil`, `nextFireAt`, `completedAt`, `createdAt`, `notes`.
- Tipos em `adapters/src/ports/agent-provider.ts:53-69`:
  - `ReminderKind = 'alarm' | 'goal' | 'conditional'`
  - `GoalRecurrence = {type:'none'} | {type:'daily'} | {type:'weekdays', weekdays:number[] (0=domingo..6)}`
  - `CheckFrequency = daily | every-n-days{days} | weekly` (só para `conditional`).
  - `ReminderAlert = at-event | day-before | morning-of | minutes-before{minutes}`.
- Como distinguir único de recorrente: NÃO é enum nem campo nulo único; é o par `kind` + `recurrence`.
  - `kind='alarm'` = único (data/hora fixa em `remindAt`). `persist-captures.ts:84-93` grava `recurrence: null` para alarm/conditional.
  - `kind='goal'` = meta com horário `remindAt` (início) e `recurrence` (`persist-captures.ts:107-129`, `recurrence: draft.recurrence`). `recurrence.type==='none'` ou `null` = ocorre só em `remindAt`; `daily` = todo dia; `weekdays` = dias da semana listados.
  - `kind='conditional'` = sem horário fixo (`remindAt=null`), reavaliado por `checkFrequency` (daily/every-n-days/weekly), com `morningTime` do usuário (`utils/reminders.ts` `computeNextFireAt`, `conditionalIntervalDays`).
  - Consequência: "alarme recorrente" no sentido do usuário = `kind='goal'` com `recurrence.type` in (daily, weekdays). `kind='alarm'` NUNCA recorre hoje (só a UpdateReminder poderia setar `recurrence` num alarm; ver `update-reminder.ts` `validate`, não lido, ver premissas).
- Helpers em `domain/chat/src/application/utils/reminders.ts`: `toZonedParts`, `fromZonedParts`, `listGoalOccurrences` (próximas ocorrências conforme recurrence), `listAlertInstants`, `computeNextFireAt`, `listSnoozeOptions`, `occursOnLocalDate` (alarm: mesma data; goal: `goalMatchesDate`). NÃO há helper de "rótulo" textual (ex.: "todo dia", "seg, qua") no backend; rotulagem fica a cargo do cliente.
- Persistência: `infra/db/prisma/schema.prisma:28-34` modelo `Reminder {id, props(String JSON), types}`; `infra/db/src/repos/sqlite/reminder.ts` herda de `SqliteRepository`. Props em JSON: recorrência não é coluna.

## 2. Como o agente cria o lembrete e o que a mensagem carrega
- Rota `infra/server-ben/src/routes/chat.ts`: chama agente (l.180), depois `persistCapturesUseCase.execute` (l.208-216) com `newReminders`, `newNotes`, `newTasks`, `newGoals`.
- `domain/chat/src/application/use-cases/captures/persist-captures.ts`: ordem do retorno `[...reminderViews, ...goalViews, ...taskViews, ...noteViews]` (l.68). `toReminderView` (l.166-173) devolve `CaptureView {kind:'reminder', itemId, title, meta: remindAt}`. Tipo em `domain/chat/src/application/types/capture-view.ts`: `kind, itemId, title, meta:string|null`. NÃO carrega `reminderKind`, `recurrence` nem status.
- `chat.ts:223` `primaryCapture = capturesResult.items[0]` — só UMA capture por resposta (a primeira: lembrete antes de goal antes de task antes de nota). Se o agente criar vários itens, só o primeiro é persistido/apontado. Persistida na mensagem em `chat.ts:225-233`: `Message.props.capture = {kind, itemId: ID}` (`enterprise/entities/message.ts`, `MessageCapture`, 7-10).
- Resposta HTTP do chat: `presenters/agent-reply-presenter.ts` (`toHttp`, l.~5-30): devolve `message`, `newReminders` (os DRAFTS crus do agente: title/remindAt/notes/alerts/checkFrequency, sem id), `newNotes`, `newTasks`, `historyTopics`, `capture` (o CaptureView acima, com `itemId`), `updatedGoalIds`, `messageId`, `interactionCostUsd`. `newGoals` e `goalUpdates` são OMITIDOS do HTTP (tipo `Omit<AgentReply,'conversation'|'memories'|'newGoals'|'goalUpdates'>`). Ou seja: para um goal recém-criado, o mobile só sabe dele via `capture` (id, título, remindAt em meta), não via `newReminders`.
- Mobile: `mobile/ben/src/api/responses/agent-reply.ts` (`AgentReply.capture: CaptureView | null`, `CaptureView = MessageCapture`; `ReminderDraft` local tem só title/remindAt?/notes?, mais pobre que o do servidor); `models/message.ts:3-9` `MessageCapture {kind: CaptureKind('note'|'reminder'|'task'), itemId, title, meta?}`; `Message.capture?`.

## 3. Endpoints de lembrete (já existem; detalhe por id existe)
- Servidor `infra/server-ben/src/app.ts:86-91`: `GET /reminders/list` (query `kind`, `status`), `GET /reminders/daily-summary`, `GET /reminders/:id/detail`, `GET /reminders/:id/snooze-options`, `POST /reminders/:id/update`, `POST /reminders/:id/acknowledge`. Todos com `authMiddleware`. NÃO há rota de delete de lembrete (grep em app.ts sem delete); "encerrar" = `status:'done'` via update.
- Handlers em `infra/server-ben/src/routes/reminders/*.ts`; `get-reminder-detail.ts` usa `GetReminderDetailUseCase` (`domain/chat/src/application/use-cases/captures/get-reminder-detail.ts`) -> `reminderRepository.get({id,userId})`; resposta `{ item: ReminderPresenter.toHttp }`. `update-reminder.ts:13-46` aceita title, remindAt, alerts, recurrence (none|daily|weekdays), checkFrequency, status, now.
- Presenter `server-ben/src/presenters/reminder-presenter.ts:87-108` devolve o mesmo shape no detalhe e na lista: `id, title, kind, status, firesAt(remindAt), body(notes), capturedAt, timeZone, alerts, recurrence, messages, checkFrequency, nextFireAt, snoozedUntil, acknowledgedUntil, completedAt`.
- Mobile `mobile/ben/src/api/routes.ts` (bloco `reminders`): `list`, `detail(id)`, `update(id)`, `acknowledge(id)`, `snoozeOptions(id)`, `dailySummary`; `captures.counts`. Tipos: `models/reminder.ts:1-54` (`Reminder` com `kind`, `recurrence`, `firesAt`, `nextFireAt`, etc.; `ReminderListItem = Reminder`). Requests em `mobile/ben/src/api/requests/reminders.ts` (não lido em detalhe). Não há `responses/reminder.ts`; `responses/captures.ts` só tem `CapturesCountsResponse`.

## 4. Mensagem histórica e lembrete apagado/resolvido
- `routes/messages/list-messages.ts:352-377`: ao listar, cada mensagem com `capture` passa por `ResolveCaptureUseCase` (`domain/chat/.../captures/resolve-capture.ts`); para reminder faz `reminderRepository.findUnique({id})` e devolve `{kind:'reminder', itemId, title: título ATUAL do lembrete, meta: remindAt ATUAL}`; se não existir retorna `null`, e `MessagePresenter.toHttp` (l.~308-325) envia `capture: null` (o chip some). `itemId` persistido continua no banco (`Message.props.capture`), então o id sobrevive ao reload.
- `findUnique` não filtra por userId (resolve-capture) — o detalhe (`get`) filtra e lança `ResourceNotFoundError` -> HTTP 404 `{message:'RESOURCE_NOT_FOUND'}` (`middlewares/error-handler.ts:122-127`). Na mobile, abrir um item inexistente/de outro usuário cai nesse 404.
- Não há delete de lembrete; "resolvido" = `status:'done'` + `completedAt` (`update-reminder.ts:~62-66`) e o registro continua existindo: `capture` segue resolvendo e `GET detail` funciona; a lista aceita `status` filtrável (a tela precisa incluir 'done' para achar o item, ou buscar por id).
- No momento da criação (resposta do `/chat`), o `capture` vem direto do `persistCaptures`, com o mesmo shape.

## 5. Memória e ownerships
- `.claude/memory/README.md` lido. `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` (único registro das categorias): diz que lembrete recorrente NÃO é v1 (v1 = nota, lembrete único com `fires_at`, task) e que alarmes são mockados no web. CÓDIGO ATUAL DIVERGE: já há `kind:'goal'` com `recurrence` daily/weekdays e `conditional`, então a memória está desatualizada/anterior; tratar o código como verdade, não o registro (e sinalizar ao pai). `decisions/` e `vocabulary/`: "Nenhuma entrada ainda".
- `domain/ownerships.md`: `task` <- `chat` (`TaskRepository` em `persist-captures`); `user` <- `task` (`resolveAgentSelection`). Chat é dono de reminders/notes/messages; qualquer mudança em captures fica dentro de `domain/chat` (mais tipos de `@ben/adapters`).

## Lacunas de contrato
1. `CaptureView`/`MessageCapture` (`capture-view.ts`, `models/message.ts`) não traz tipo do lembrete nem recorrência: o chip da conversa não consegue dizer "recorrente" vs "único" sem buscar `GET /reminders/:id/detail` (um round-trip por chip). Para rotular direto no chip, seria preciso estender o CaptureView em `persist-captures.ts:166` e `resolve-capture.ts:resolveReminderView` (ex.: `reminderKind`, `recurrence`) e propagar em `AgentReplyPresenter`/`MessagePresenter` e nos tipos mobile. Alternativa sem mudar backend: mobile abre a tela com `itemId` e a tela carrega o detalhe (já existe) / lista.
2. Para "abrir a tela de lembretes com o criado selecionado": `itemId` já chega no chat (`capture.itemId`) e já existe `GET /reminders/:id/detail`; o backend não precisa de rota nova. Falta só consumo no mobile (outra frente).
3. Apenas 1 capture por mensagem (`chat.ts:223`): se o agente criar 2+ lembretes na mesma resposta, só o primeiro tem chip/seleção.
4. `AgentReply` do mobile tem `ReminderDraft` mais pobre que o servidor (sem alerts/checkFrequency) e `newGoals` não é exposto no HTTP; goals só aparecem via `capture`.
5. Resolve-capture devolve título/meta atuais, não o snapshot da criação; `meta` = `remindAt` (início), não o próximo disparo (`nextFireAt`).
6. Sem rótulo textual de recorrência no backend; fica no cliente (daily, weekdays com números 0-6 domingo-sábado).

## Premissas razoáveis
- "Alarme recorrente" do usuário = `kind==='goal'` com `recurrence.type` daily/weekdays; `alarm` = único; `goal` com `recurrence` none/null = único com horário; `conditional` = verificação periódica (sem horário) — tratar como categoria à parte.
- Dado que o detalhe por id e o 404 existem, a seleção do lembrete criado pode se apoiar só em `capture.itemId`; se o lembrete foi marcado done ele continua acessível por id.
- Não li `update-reminder.ts` `validate()` (l.80+) nem `requests/reminders.ts`; premissa de que `recurrence` só é aceito para `kind==='goal'` é não verificada.
- A memória de negócio (recorrente fora do v1) está desatualizada frente ao código; não atualizei nada (read-only).
