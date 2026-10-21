# Escopo: mobile-api-agendador — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Premissas", "Contratos HTTP", "Mobile"). Escopo 4 de 6; depende do 3 (backend completo). App: `packages/infra/mobile/ben` (`@ben/mobile-ben`); o mobile fala com o backend só por HTTP.

## Contrato

- Build: cliente HTTP das rotas novas; chat envia fuso; agendador JS global que detecta lembretes vencidos e os enfileira num store (o popup visual é do escopo 5); notificações nativas por `nextFireAt` (web no-op).
- Files you OWN (relativos a `packages/infra/mobile/ben/`):
  - `src/api/models/reminder.ts`, `src/api/models/user-preferences.ts`
  - `src/api/routes.ts`, `src/api/requests/reminders.ts`, `src/api/requests/chat.ts` (+ tipos de resposta novos em `src/api/responses/` se o padrão pedir)
  - `src/layout/hooks/api/use-active-reminders-data.ts` (novo)
  - `src/layout/stores/alarm-store.ts` (novo), `src/layout/hooks/use-alarm-scheduler.ts` (novo)
  - `src/services/notifications-service.ts`, `src/services/notifications-service.web.ts`
  - `src/layout/components/menu-reminders/menu-reminders-view.tsx`, `src/layout/components/menu-detail/reminder-detail.tsx`, `src/layout/components/menu-detail/item-detail-reminder-meta.tsx` (só o necessário para compilar com o status novo)
  - `src/pages/chat/stores/messages-store/invalidate-captured-queries.ts`
  - `app/(protected)/_layout.tsx`
  — anything else is another agent's scope.

## Decisões vinculantes (extract)

- Model `Reminder` espelha o `ReminderPresenter`: `id, title, kind ('alarm'|'goal'|'conditional'), status ('active'|'done'), firesAt, body, capturedAt, timeZone, alerts, recurrence, messages, checkFrequency, nextFireAt, snoozedUntil, acknowledgedUntil, completedAt` (datas ISO string | null). Tipos `ReminderAlert`, `GoalRecurrence`, `CheckFrequency`, `SnoozeOption` copiados do plano (o mobile não importa pacotes de domínio). `ReminderStatus` passa a `'active' | 'done'`; em `item-detail-reminder-meta.tsx` troque só a comparação (`done` no lugar de `fired`); o redesenho é do escopo 6.
- `UserPreferences` ganha `morningTime: string`, `dailySummaryEnabled: boolean`, `dailySummaryTime: string` (store/sync/UI ficam nos escopos 5-6).
- Requests (`src/api/requests/reminders.ts`): `requestActiveReminders()` (`GET /reminders/list?status=active`, página grande o bastante para trazer todos; confira os params de paginação da rota), `requestUpdateReminder(id, body)`, `requestAcknowledgeReminder(id, { firedAt, snoozeUntil? })`, `requestSnoozeOptions(id, at)`, `requestDailySummary(date, timeZone)`. Rotas em `src/api/routes.ts` (`reminders.update(id)`, `.acknowledge(id)`, `.snoozeOptions(id)`, `.dailySummary`).
- `requestSendChatMessage` envia `timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone`.
- `alarm-store` (zustand): `queue: FiredAlarm[]` com `FiredAlarm = { reminder: Reminder; firedAt: string }` (firedAt = `nextFireAt` que disparou), `firedKeys: Set<string>` (`${id}:${nextFireAt}`), `enqueue`, `dismissCurrent`, `current` (primeiro da fila), `reset`.
- `use-alarm-scheduler`: usa `use-active-reminders-data`; a cada mudança da lista e num `setInterval` de 15 s, enfileira todo lembrete `active` com `nextFireAt <= Date.now()` ainda não disparado (chave acima). Expor `refreshActiveReminders` (invalidate da query) para o popup chamar depois de ack/update. Em nativo, a cada mudança da lista chama `syncReminderNotifications(items)`.
- `notifications-service.ts` (nativo): agenda 1 notificação por lembrete ativo em `nextFireAt` (cancela as que não existem mais), `data: { reminderId, nextFireAt }`; listener de toque que enfileira no `alarm-store` (via `requestActiveReminders` ou a lista em cache); exportar também `scheduleDailySummaryNotification(time: 'HH:mm', title, body)` e `cancelDailySummaryNotification()` (usados no escopo 5). `.web.ts`: as mesmas exports como no-op.
- A sincronização sai de `menu-reminders-view.tsx` e `reminder-detail.tsx`; `invalidate-captured-queries.ts` passa a invalidar a query de ativos em vez de sincronizar notificações.
- `app/(protected)/_layout.tsx` monta `useAlarmScheduler()` ao lado de `useUserPreferencesSync()`.

## Molde a espelhar

- `src/layout/hooks/api/use-reminder-list-data.ts` e `src/api/requests/reminders.ts` — hook de dados e request.
- `src/layout/stores/user-preferences-store.ts` — store zustand.
- `src/services/notifications-service.ts:51-109` — agendamento atual por `firesAt`.
- Skills: `.claude/skills/code-get-coding-designs/designs/{api-client-structure,mobile-services-layer-structure,mobile-app-structure}.md`, `.claude/skills/code-write-code/coding-patterns/frontend/api-data-hooks.md`.

## Footprint (do not break)

- `src/layout/components/menu-reminders/menu-reminders-list.tsx`, `item-detail-content.tsx`, `src/layout/utils/format-time.ts` (`firesAtRelative`) consomem `firesAt`, que continua igual.
- Cards de captura no chat (`src/pages/chat/components/capture-card/*`) têm estado `fired` próprio, não ligado a `ReminderStatus`: não mexa.

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do escopo 3).

## Critérios de aceitação

- `pnpm --filter @ben/mobile-ben typecheck` e `pnpm --filter @ben/mobile-ben lint` (se existir) passam.
- Verificação rápida opcional: Expo web na 8082 + API 3335 (nunca 8081); com um lembrete vencido, `useAlarmStore.getState().queue` recebe o item uma única vez.
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — mobile-api-agendador`.
