# Escopo: backend-agenda-dominio — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Premissas", "Modelo de dados", "Lógica de agenda"). Escopo 2 de 6; depende do 1 (tipos no port, preferências, `POST /chat` com `timeZone`).

## Contrato

- Build: `Reminder` com kind/agenda; backfill dos legados; funções puras de agenda com relógio injetado; `persist-captures` cria alarm/conditional/goal; `append-goal-messages`; `list-reminders` com filtro; presenter novo; `POST /chat` passa goals ativos e persiste `newGoals`/`goalUpdates`.
- Files you OWN:
  - `packages/domain/chat/src/enterprise/entities/reminder.ts`
  - `packages/infra/db/prisma/migrations/20261022000000_backfill_reminder_schedule/migration.sql`
  - `packages/domain/chat/src/application/utils/reminders.ts` + `utils/__tests__/reminders.test.ts` (novos)
  - `packages/domain/chat/src/application/__tests__/factories/reminder.ts`
  - `packages/domain/chat/src/application/use-cases/captures/persist-captures.ts` + `__tests__/persist-captures.test.ts`
  - `packages/domain/chat/src/application/use-cases/captures/list-reminders.ts` + `__tests__/list-reminders.test.ts`
  - `packages/domain/chat/src/application/use-cases/reminders/append-goal-messages.ts` + `__tests__/append-goal-messages.test.ts` (novos)
  - `packages/infra/server-ben/src/presenters/reminder-presenter.ts`
  - `packages/infra/server-ben/src/routes/reminders/list-reminders.ts`
  - `packages/infra/server-ben/src/routes/chat.ts`
  — anything else is another agent's scope.

## Decisões vinculantes (extract)

- Props novas do `Reminder` (tipos importados de `@ben/adapters`): `kind: ReminderKind`, `status: 'active' | 'done'`, `timeZone: string`, `alerts: ReminderAlert[]`, `recurrence: GoalRecurrence | null`, `messages: string[]`, `checkFrequency: CheckFrequency | null`, `acknowledgedUntil: Date | null`, `snoozedUntil: Date | null`, `nextFireAt: Date | null`, `completedAt: Date | null`. `remindAt` mantém o nome: evento (alarm), primeira ocorrência (goal), null (conditional).
- Migration só-SQL (sem mudar `schema.prisma`): `UPDATE reminders SET props = json_set(props, '$.kind','alarm', '$.status','active', '$.timeZone','UTC', '$.alerts', json('[{"kind":"at-event"}]'), '$.recurrence', json('null'), '$.messages', json('[]'), '$.checkFrequency', json('null'), '$.acknowledgedUntil', json('null'), '$.snoozedUntil', json('null'), '$.nextFireAt', json('null'), '$.completedAt', json('null')) WHERE json_extract(props,'$.kind') IS NULL;`. Datas null não precisam de tag em `types` (conferido em `packages/infra/db/src/repos/sqlite/sqlite-repository.ts:241-301`). Aplicar com o script de migrate do `@ben/infra-db` (ver `package.json` dele).
- `utils/reminders.ts` (puras, sem `new Date()` interno; `now`/âncora entram por parâmetro; só `Intl`):
  - `toZonedParts(instant, timeZone)` e `fromZonedParts(parts, timeZone)` (resolve offset/DST iterando).
  - `listGoalOccurrences({ remindAt, recurrence, timeZone }, from, days = 8)`.
  - `listAlertInstants({ eventAt, alerts, timeZone, morningTime, createdAt })`: `at-event` = evento; `day-before` = mesma hora local no dia anterior; `morning-of` = dia local do evento às `morningTime`, descartado se `>= eventAt`; `minutes-before`; descarta instantes `< createdAt`.
  - `computeNextFireAt(reminderProps, morningTime)`: `done` → null; âncora = `acknowledgedUntil ?? createdAt`; menor instante `> âncora` entre avisos (alarm: do evento; goal: das ocorrências a partir da âncora; conditional: data local da âncora + 1 / N / 7 dias às `morningTime`) e `snoozedUntil`.
  - `listSnoozeOptions({ reminderProps, now, morningTime })` → `{ option: SnoozeOption, at: Date }[]` (ordem: 10-minutes, 30-minutes, 1-hour, 2-hours, tomorrow-morning = dia local seguinte às morningTime). Alarm com `now < evento`: só `at <= evento`; alarm com `now >= evento`: só 10 e 30 min; goal/conditional: todas.
  - `occursOnLocalDate(reminderProps, date 'YYYY-MM-DD', timeZone)`.
- `persist-captures`: input ganha `timeZone`, `morningTime`, `newGoals: GoalDraft[]`. Reminder draft sem `kind` = alarm com `alerts ?? [at-event]`; conditional = `remindAt null`, `checkFrequency ?? daily`, `alerts []`; goal = `remindAt = startsAt`, `alerts [at-event]`, `recurrence`, `messages`. Todos `status active`, `nextFireAt = computeNextFireAt(...)`. Retorno inclui os goals criados.
- `append-goal-messages`: `{ userId, updates: GoalMessagesDraft[] }`; só goals do usuário; ids desconhecidos ignorados; dedupe por texto aparado.
- `list-reminders`: filtros opcionais `kind`, `status` (repassados ao `findMany`/paginação; o repo SQLite filtra por `json_extract` com igualdade).
- `ReminderPresenter` (Omit tipado, padrão atual): `id, title, kind, status, firesAt (= remindAt ISO|null), body, capturedAt, timeZone, alerts, recurrence, messages, checkFrequency, nextFireAt, snoozedUntil, acknowledgedUntil, completedAt` (datas ISO|null). O status antigo `upcoming|fired` sai.
- `GET /reminders/list`: query + `kind?` (enum) e `status?` (`active|done`), Zod.
- `POST /chat`: lê `morningTime` via `resolveUserPreferences` do usuário; monta `activeGoals` com `list-reminders` `{ kind: 'goal', status: 'active' }`; passa `timeZone`, `morningTime`, `newGoals` ao `persistCaptures` e chama `append-goal-messages` com `goalUpdates`.

## Molde a espelhar

- `packages/domain/chat/src/application/use-cases/captures/persist-captures.ts` e o teste ao lado (estrutura de use case e testes com repositório em memória de `application/__tests__/repositories`).
- `packages/domain/user/src/application/utils/user-preferences.ts` — precedente de `application/utils/`.
- Skills: `.claude/skills/code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-presenter}.md`, `coding-patterns/automated-testing.md`.

## Footprint (do not break)

- `get-reminder-detail` (use case + rota) usa o presenter.
- Contador de capturas (`get-captures-counts`) e testes de `resolve-capture` usam a factory de reminder: a factory precisa de defaults para as props novas.
- Mobile ainda lê `status upcoming|fired`; não é seu escopo (escopo 4 ajusta).

## Testes obrigatórios (Vitest, relógio por parâmetro)

- `reminders.test.ts`: dentista amanhã 17h com day-before + morning-of em `America/Sao_Paulo` (3 instantes, próximo = hoje 17:00; após ack de 17:00 → amanhã 08:00); morning-of descartado para evento às 07:00; goal weekdays 11h pulando fim de semana; conditional daily/every-n-days(3)/weekly a partir da âncora; snooze dinâmico (16:40 com evento 17:00 → só 10-minutes; após evento → 10 e 30); DST em `America/New_York` (ex.: 2026-03-08) mantém hora local.
- `persist-captures.test.ts`: alarm com alerts, conditional, goal com messages, `nextFireAt` preenchido.
- `append-goal-messages.test.ts`: acrescenta, dedupe, ignora id desconhecido e goal de outro usuário.
- `list-reminders.test.ts`: filtro por kind/status.

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do escopo 1).

## Critérios de aceitação

- `pnpm --filter @ben/domain-chat test:unit`, `pnpm --filter @ben/server-ben typecheck`, migration aplicada no SQLite de desenvolvimento sem erro.
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — backend-agenda-dominio`.
