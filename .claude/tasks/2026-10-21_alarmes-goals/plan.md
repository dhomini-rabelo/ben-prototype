# Plano — alarmes dinâmicos, goals recorrentes, lembretes condicionais e resumo diário

Contrato: `.claude/tmp/orquestracoes/2026-10-21-alarmes-goals/briefing.md`. Branch `feat/alarmes-goals` (base `0025fed`).
Execução em 6 escopos sequenciais (`prompts/`), cada um com commit `simple-loop(alarmes-goals): implement — {escopo}`.

## Premissas assumidas

1. Tudo é `Reminder` (módulo chat) com `kind: 'alarm' | 'goal' | 'conditional'`. Sem entidade nova; `packages/domain/ownerships.md` inalterado.
2. `remindAt` mantém o nome (compat de dados): instante do evento (alarm), primeira ocorrência que define a hora local (goal), `null` (conditional). O presenter continua expondo `firesAt` (divergência resolvida no presenter).
3. Tipos-fonte no port `@ben/adapters` (precedente: User importa `AgentEffort` de lá).
4. Lembretes legados: backfill por migration só-SQL; ficam `kind alarm`, `alerts [at-event]`, `timeZone 'UTC'`, `nextFireAt null` (não disparam).
5. A agenda não depende do relógio do servidor: `nextFireAt` é derivado da âncora (`acknowledgedUntil ?? createdAt`), não de `now`. O cliente decide quando disparar (`nextFireAt <= Date.now()` do aparelho). Isso permite `page.clock` no browser.
6. `morningTime` vem das preferências do usuário; a rota (server-ben) lê e passa aos use cases do chat (chat não importa user). Mudar a preferência vale para lembretes criados/editados depois.
7. Opções de adiar: candidatas `10-minutes`, `30-minutes`, `1-hour`, `2-hours`, `tomorrow-morning`. Alarm com `now < evento`: só as que caem antes (ou exatamente no) evento. Alarm com `now >= evento`: só `10-minutes` e `30-minutes`. Goal/conditional: todas. Mais "outro horário" livre no app.
8. "Um dia antes" = mesmo horário local no dia anterior; "pela manhã" = `morningTime` no dia do evento, descartado se não cair antes do evento. Avisos anteriores a `createdAt` são descartados.
9. Goal: o Ben propõe "quer salvar como goal?" e não grava; grava no turno seguinte se o usuário confirmar. Mensagens = falas do usuário (literais, curtas). `goalUpdates` acrescenta mensagens a goals ativos (ids da lista `activeGoals`), dedupe, ids desconhecidos ignorados. Sem editor de mensagens no app (só leitura).
10. Conditional sem data: frequência padrão `daily`; "Sim" = `status done`; "Ainda não" = ack sem snooze (próxima checagem pela frequência a partir da data local do disparo).
11. Resumo diário: preferências `dailySummaryEnabled` (true) e `dailySummaryTime` ('08:00') no servidor; o app mostra o popup no horário do aparelho, 1x por data local (AsyncStorage). Nativo agenda notificação diária; web só popup com o app aberto.
12. Fuso: o app envia IANA do aparelho (`Intl.DateTimeFormat().resolvedOptions().timeZone`); servidor valida com `Intl` e cai para `UTC`.
13. Sem lib de data: `Intl` (Node 24) com testes cobrindo DST (`America/New_York`) e fuso sem DST (`America/Sao_Paulo`).
14. Design-advisor: implementers não disparam agente; leem `.claude/agents-docs/design-advisor/design.md` e `.claude/agents-docs/project-context/ux-philosophy.md`. O validate cobre design.
15. A memória "recorrente fora do v1" fica desatualizada; não é editada (registrar no relatório final).

## Convenções aplicáveis

- Estrutura: `.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md`, `backend-http-layer-structure.md`, `mobile-app-structure.md`, `mobile-services-layer-structure.md`, `api-client-structure.md`.
- Código: `.claude/skills/code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-route-handler,http-presenter,backend-code-preferences}.md`, `coding-patterns/automated-testing.md`, `coding-patterns/frontend/{api-data-hooks,react-components,react-single-responsibility}.md`, `coding-patterns/mobile/mobile-bottom-sheet-overlay.md`.

## Modelo de dados

`packages/domain/chat/src/enterprise/entities/reminder.ts`, novas props (além das atuais `title`, `remindAt`, `body`, `createdAt`...):

| Prop | Tipo | Observação |
| --- | --- | --- |
| `kind` | `ReminderKind` | `'alarm' \| 'goal' \| 'conditional'` |
| `status` | `'active' \| 'done'` | |
| `timeZone` | `string` | IANA |
| `alerts` | `ReminderAlert[]` | só alarm (goal usa `[at-event]`, conditional `[]`) |
| `recurrence` | `GoalRecurrence \| null` | só goal |
| `messages` | `string[]` | só goal |
| `checkFrequency` | `CheckFrequency \| null` | só conditional |
| `acknowledgedUntil` | `Date \| null` | âncora: disparos até aqui já vistos |
| `snoozedUntil` | `Date \| null` | |
| `nextFireAt` | `Date \| null` | persistido; recalculado por todo use case que muda o lembrete |
| `completedAt` | `Date \| null` | |

Tipos no port `packages/adapters/src/ports/agent-provider.ts`:

```ts
type ReminderKind = 'alarm' | 'goal' | 'conditional'
type ReminderAlert = { kind: 'at-event' } | { kind: 'day-before' } | { kind: 'morning-of' } | { kind: 'minutes-before'; minutes: number }
type GoalRecurrence = { type: 'none' } | { type: 'daily' } | { type: 'weekdays'; weekdays: number[] } // 0 = domingo
type CheckFrequency = { type: 'daily' } | { type: 'every-n-days'; days: number } | { type: 'weekly' }
type SnoozeOption = '10-minutes' | '30-minutes' | '1-hour' | '2-hours' | 'tomorrow-morning'
```

Backfill: `packages/infra/db/prisma/migrations/20261022000000_backfill_reminder_schedule/migration.sql` com `UPDATE reminders SET props = json_set(props, '$.kind','alarm', '$.status','active', '$.timeZone','UTC', '$.alerts', json('[{"kind":"at-event"}]'), '$.recurrence', json('null'), '$.messages', json('[]'), '$.checkFrequency', json('null'), '$.acknowledgedUntil', json('null'), '$.snoozedUntil', json('null'), '$.nextFireAt', json('null'), '$.completedAt', json('null')) WHERE json_extract(props,'$.kind') IS NULL`. Conferido em `packages/infra/db/src/repos/sqlite/sqlite-repository.ts:241-301`: Dates são marcadas no JSON `types` por caminho (`types[path]='date'`); valores `null` não recebem tag, então o backfill não toca `types`. `findMany` filtra props por `json_extract` com igualdade (`buildWhere`, l.378-398), então `{ kind: 'goal', status: 'active' }` funciona.

## Lógica de agenda (pura, relógio injetado)

`packages/domain/chat/src/application/utils/reminders.ts` + `utils/__tests__/reminders.test.ts`:

- `toZonedParts(instant, timeZone)` / `fromZonedParts({year,month,day,hour,minute}, timeZone)` via `Intl.DateTimeFormat` (offset iterativo, resolve DST).
- `listGoalOccurrences(reminder, from, days=8)`: hora local de `remindAt`; `none` = só `remindAt`; `daily`; `weekdays` filtra dia da semana local.
- `listAlertInstants({ eventAt, alerts, timeZone, morningTime, createdAt })`.
- `computeNextFireAt(reminder, morningTime)`: menor instante `> âncora` entre avisos das ocorrências (alarm: o evento; goal: ocorrências; conditional: data local da âncora + 1/N/7 dias às `morningTime`) e `snoozedUntil`. `status done` → `null`.
- `listSnoozeOptions({ reminder, now, morningTime })` → `{ option: SnoozeOption, at: Date }[]` (regras da premissa 7).
- `occursOnLocalDate(reminder, 'YYYY-MM-DD', timeZone)`.

## Use cases (chat)

Pasta nova `packages/domain/chat/src/application/use-cases/reminders/` (teste em `__tests__/`), além dos alterados em `use-cases/captures/`:

- `persist-captures` (alterado): recebe `timeZone`, `morningTime`, `newGoals`; cria alarm/conditional/goal com `nextFireAt` calculado.
- `append-goal-messages` (novo): `{ userId, updates: GoalMessagesDraft[] }`.
- `list-reminders` (alterado): filtros opcionais `kind`, `status`.
- `update-reminder` (novo): `{ userId, reminderId, morningTime, title?, remindAt?, alerts?, recurrence? (só goal), checkFrequency? (só conditional), status? }`. `done` grava `completedAt` e zera `nextFireAt`; mudança de agenda limpa `snoozedUntil`.
- `acknowledge-reminder` (novo): `{ userId, reminderId, morningTime, firedAt, snoozeUntil? }`. `acknowledgedUntil = max(atual, firedAt)`; `snoozeUntil` deve ser `> firedAt` (senão `ValidationError`).
- `get-snooze-options` (novo): `{ userId, reminderId, morningTime, now }`.
- `get-daily-summary` (novo): `{ userId, date, timeZone }` → `{ alarms, goals, conditionals }` (alarm com evento na data; goal com ocorrência na data; conditional ativo com `nextFireAt <= fim da data`).

## Contratos HTTP (server-ben, um arquivo por rota)

| Rota | Body / query | Resposta |
| --- | --- | --- |
| `POST /chat` (alterada) | + `timeZone?: string` | inalterada |
| `GET /reminders/list` (alterada) | + `kind?`, `status?` | `ReminderPresenter[]` paginado (inalterado) |
| `POST /reminders/:id/update` | campos do update-reminder | `{ reminder }` |
| `POST /reminders/:id/acknowledge` | `{ firedAt, snoozeUntil? }` (ISO) | `{ reminder }` |
| `GET /reminders/:id/snooze-options?at=ISO` | | `{ options: { option, at }[] }` |
| `GET /reminders/daily-summary?date=YYYY-MM-DD&timeZone=` | | `{ alarms, goals, conditionals }` (cada um `ReminderPresenter[]`) |
| `GET/POST /user-preferences/*` (alteradas) | + `morningTime`, `dailySummaryEnabled`, `dailySummaryTime` (`HH:mm`) | idem |

`ReminderPresenter`: `id, title, kind, status ('active'|'done'), firesAt (= remindAt), body, capturedAt, timeZone, alerts, recurrence, messages, checkFrequency, nextFireAt, snoozedUntil, acknowledgedUntil, completedAt`. O status antigo `upcoming|fired` sai.

## Agente

- `GenerateReplyPayload` + `now: string` (ISO), `timeZone: string`, `activeGoals: ActiveGoal[]`. `AgentReply` + `newGoals: GoalDraft[]`, `goalUpdates: GoalMessagesDraft[]`. `ReminderDraft` + `kind?`, `alerts?`, `checkFrequency?`.
- `schemas.ts`: reminder ganha `kind`, `alerts` (`minutes` nullable), `checkFrequency`; `newGoals`, `goalUpdates`. `to-agent-reply.ts` converte nullable → port (descarta `minutes-before` sem minutos).
- `system-prompt.ts`: seção "Agora" (instante local com dia da semana + IANA), datas em ISO 8601 com offset, frases → alerts ("um dia antes" → day-before, "pela manhã" → morning-of, "N min/horas antes" → minutes-before), condicional sem data, fluxo de goal em 2 turnos, `goalUpdates` só com ids de `activeGoals`. `format-system-prompt.ts` espelha as regras de saída.
- `server-ben/src/routes/chat.ts`: passa `now`, `timeZone`, `activeGoals` (goals ativos do usuário), persiste `newGoals` e `goalUpdates`.

## Mobile (`packages/infra/mobile/ben`)

- API: models/requests/routes de reminder e user-preferences; `requestSendChatMessage` envia `timeZone`.
- Agendador global: `src/layout/hooks/use-alarm-scheduler.ts` (tick 15 s + na mudança da lista de ativos; dispara quando `nextFireAt <= Date.now()`; chave `id+nextFireAt` evita duplicar) + `src/layout/stores/alarm-store.ts` (fila e alerta ativo). Montado em `app/(protected)/_layout.tsx`.
- Nativo: `notifications-service.ts` agenda por `nextFireAt` + resumo diário + listener de toque (web segue no-op). Sincronização sai de `menu-reminders-view.tsx` e `reminder-detail.tsx` e vai para o agendador.
- Popup global (bottom sheet overlay): alarm (adiar dinâmico via snooze-options com `at` = agora do aparelho, "outro horário" com `src/layout/components/ui/time-stepper.tsx`, Concluir, OK), goal (mensagens salvas, Feito, adiar), conditional ("Já aconteceu?" Sim/Ainda não + frequência: diária, a cada 2 dias, a cada 3 dias, semanal).
- Resumo diário: popup no `dailySummaryTime` do aparelho, 1x por data.
- Settings: seção Lembretes (switch do resumo, horário do resumo, horário da manhã).
- Menu: badge de kind na lista; editor no reminder-detail (horário, avisos, recorrência, frequência; mensagens só leitura).
- i18n en/pt-BR; entrada em `src/core/app-versions.ts`.

## Escopos

| # | Escopo | Prompt | Depende de |
| --- | --- | --- | --- |
| 1 | backend-agente-preferencias | `prompts/backend-agente-preferencias.md` | — |
| 2 | backend-agenda-dominio | `prompts/backend-agenda-dominio.md` | 1 |
| 3 | backend-agenda-rotas | `prompts/backend-agenda-rotas.md` | 2 |
| 4 | mobile-api-agendador | `prompts/mobile-api-agendador.md` | 3 |
| 5 | mobile-popups | `prompts/mobile-popups.md` | 4 |
| 6 | mobile-ajustes | `prompts/mobile-ajustes.md` | 5 |

## Roteiro de teste no browser (system-test)

Servidores: API `API_PORT=3335`, Expo web na `8082` (nunca 8081). Playwright, viewport 390x844, `timezoneId: 'America/Sao_Paulo'`, `page.clock.install({ time: <hoje 10:00 local> })` antes do `goto`; avançar com `page.clock.setSystemTime`/`fastForward` (o tick de 15 s precisa rodar; após `setSystemTime` usar `fastForward(20_000)`).

1. Settings → Lembretes: manhã 08:00, resumo ligado às 08:00. Recarregar e conferir persistência.
2. Chat: "tenho dentista amanhã às 17h, me avise um dia antes e pela manhã" → lembrete no menu com 2 avisos + evento.
3. Hoje 17:00 → popup do alarme; "Adiar" mostra 10 min, 30 min, 1 h, 2 h, amanhã de manhã + outro horário. Escolher OK.
4. Amanhã 08:00 → resumo diário aparece (dentista listado) e popup do alarme; "outro horário" 16:40.
5. Amanhã 16:40 → popup; adiar mostra só "10 min" (prova do dinâmico). Concluir.
6. Chat: "quero ir à academia às 11h de segunda a sexta; me lembra que treinar me dá energia e que preciso resolver a dor nas costas" → Ben pergunta se quer salvar como goal; "sim" → goal criado com 2 mensagens.
7. Próximo dia útil 11:00 → popup do goal com as 2 mensagens; Feito.
8. Chat: "visitar minha mãe quando ela voltar à cidade" → conditional.
9. Amanhã 08:00 → popup "Já aconteceu?"; trocar frequência para semanal; "Ainda não". +1 dia 08:00 → nada; +7 dias 08:00 → pergunta de novo; "Sim" → some da lista de ativos.
10. Settings: resumo às 07:30; no dia seguinte 07:30 → resumo aparece; desligar o switch → não aparece no dia seguinte.

Screenshots por passo em `tests-NN/`, verdict em `tests-NN/verdict.md`.

## Fora do escopo

Push, PR, deploy; servidor de push, workers ou cron; prova de disparo nativo em device; sandbox de design; editor de mensagens do goal; edição da memória do projeto.

## Riscos

- `page.clock` saltando dias pode disparar refresh do token Firebase no browser (mitigar: login dev e saltos via `setSystemTime`).
- LLM real pode não seguir o fluxo de goal em 2 turnos ou errar o ISO com offset (mitigar com exemplos no prompt; system-test registra a frase usada).
- `Intl` sem lib: conversão local↔instante em DST precisa de teste explícito.
- Mudança do presenter (`status` antigo sai) quebra a UI até o escopo 4 entrar; escopos 1-3 não tocam mobile, então o typecheck do mobile só é validado a partir do 4.
