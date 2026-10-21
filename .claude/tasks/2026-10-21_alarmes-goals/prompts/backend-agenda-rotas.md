# Escopo: backend-agenda-rotas — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Use cases" e "Contratos HTTP"). Escopo 3 de 6; depende do 2 (entidade, `utils/reminders.ts`, presenter).

## Contrato

- Build: 4 use cases novos no chat (update, acknowledge, snooze-options, daily-summary) com teste ao lado e 4 rotas HTTP.
- Files you OWN:
  - `packages/domain/chat/src/application/use-cases/reminders/{update-reminder,acknowledge-reminder,get-snooze-options,get-daily-summary}.ts`
  - `packages/domain/chat/src/application/use-cases/reminders/__tests__/{update-reminder,acknowledge-reminder,get-snooze-options,get-daily-summary}.test.ts`
  - `packages/infra/server-ben/src/routes/reminders/{update-reminder,acknowledge-reminder,get-snooze-options,get-daily-summary}.ts`
  - `packages/infra/server-ben/src/app.ts`
  — anything else is another agent's scope (não reescreva `utils/reminders.ts`; se precisar de helper novo, adicione função sem alterar as existentes).

## Decisões vinculantes (extract)

- Todos recebem `userId` e só operam lembretes do usuário (`ResourceNotFoundError`/padrão atual de `get-reminder-detail` para id alheio ou inexistente). Use cases que recalculam agenda recebem `morningTime` (a rota lê de `resolveUserPreferences`, como `POST /chat` faz no escopo 2) e chamam `computeNextFireAt`.
- `update-reminder` `{ userId, reminderId, morningTime, title?, remindAt?, alerts?, recurrence?, checkFrequency?, status? }`: `recurrence` só em goal, `checkFrequency` só em conditional, `remindAt` não em conditional (senão `ValidationError`). Mudança de `remindAt/alerts/recurrence/checkFrequency` limpa `snoozedUntil`. `status 'done'` grava `completedAt` (instante passado no input como `now` ou `new Date()` injetável: siga o padrão do repo) e `nextFireAt = null`; `status 'active'` recalcula.
- `acknowledge-reminder` `{ userId, reminderId, morningTime, firedAt: Date, snoozeUntil?: Date }`: `acknowledgedUntil = max(atual, firedAt)`; `snoozeUntil` exige `> firedAt` (senão `ValidationError`) e vira `snoozedUntil`; sem `snoozeUntil`, `snoozedUntil = null` ("Ainda não" do conditional = ack sem snooze). Recalcula `nextFireAt`.
- `get-snooze-options` `{ userId, reminderId, morningTime, now: Date }` → `{ options: { option, at }[] }` via `listSnoozeOptions` (`now` vem do cliente).
- `get-daily-summary` `{ userId, date: 'YYYY-MM-DD', timeZone }` → `{ alarms, goals, conditionals }` só `status active`: alarm cujo evento cai na data local; goal com ocorrência na data (`occursOnLocalDate`); conditional com `nextFireAt <= fim da data local`.
- Rotas (Zod, um arquivo por rota, `authMiddleware`, respostas com `ReminderPresenter`):
  - `POST /reminders/:id/update` → `{ reminder }`
  - `POST /reminders/:id/acknowledge` body `{ firedAt: ISO, snoozeUntil?: ISO }` → `{ reminder }`
  - `GET /reminders/:id/snooze-options?at=ISO` → `{ options: { option, at: ISO }[] }`
  - `GET /reminders/daily-summary?date=YYYY-MM-DD&timeZone=IANA` (fuso inválido → 400) → `{ alarms, goals, conditionals }`
  - Registrar em `app.ts` ao lado de `/reminders/list` e `/reminders/:id/detail`.

## Molde a espelhar

- `packages/domain/chat/src/application/use-cases/captures/get-reminder-detail.ts` (+ teste) — busca por usuário e erro de não encontrado.
- `packages/infra/server-ben/src/routes/reminders/get-reminder-detail.ts` e `routes/user-preferences/update-user-preferences.ts` — handler GET/POST com Zod.
- `packages/infra/server-ben/src/app.ts:80-81` — registro das rotas de reminders.
- Skills: `.claude/skills/code-write-code/coding-patterns/backend/{use-case-structure,use-case-response-structure,http-route-handler}.md`, `coding-patterns/automated-testing.md`.

## Footprint (do not break)

- `utils/reminders.ts`, presenter e `POST /chat` do escopo 2 (só consumir).

## Testes obrigatórios (Vitest)

- update: done zera nextFireAt e grava completedAt; troca de alerts recalcula e limpa snooze; recurrence em alarm → ValidationError.
- acknowledge: ack + snooze → nextFireAt = snooze; snooze ≤ firedAt → ValidationError; conditional weekly "Ainda não" → próxima checagem +7 dias às morningTime.
- snooze-options: alarm 16:40 com evento 17:00 → só 10-minutes; goal → 5 opções.
- daily-summary: separa alarm/goal (weekdays)/conditional na data; ignora done.

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do escopo 2).

## Critérios de aceitação

- `pnpm --filter @ben/domain-chat test:unit`, `pnpm --filter @ben/server-ben typecheck`.
- Smoke opcional com a API local na porta 3335 (nunca toque a 8081).
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — backend-agenda-rotas`.
