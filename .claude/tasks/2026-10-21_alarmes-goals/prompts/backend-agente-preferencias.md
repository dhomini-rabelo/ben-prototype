# Escopo: backend-agente-preferencias — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Premissas", "Modelo de dados" e "Agente"). Escopo 1 de 6.

## Contrato

- Build: tipos da agenda no port do agente; o agente passa a receber agora + fuso + goals ativos e a devolver alarm/conditional com avisos, `newGoals` e `goalUpdates`; preferências de usuário ganham `morningTime`, `dailySummaryEnabled`, `dailySummaryTime`; `POST /chat` aceita `timeZone`.
- Files you OWN:
  - `packages/adapters/src/ports/agent-provider.ts`
  - `packages/infra/adapters/src/services/ben-agent-provider/generate-reply/{schemas,to-agent-reply,system-prompt,format-system-prompt}.ts`
  - `packages/infra/adapters/src/services/ben-agent-provider/index.ts`
  - `packages/modules/tests/src/adapters/agent-service.ts`
  - `packages/domain/user/src/enterprise/entities/user.ts`
  - `packages/domain/user/src/application/utils/user-preferences.ts`
  - `packages/domain/user/src/application/use-cases/user-preferences/update-user-preferences.ts` (+ `__tests__/update-user-preferences.test.ts`, `__tests__/get-user-preferences.test.ts`)
  - `packages/domain/user/src/application/use-cases/auth/login-or-register.ts`
  - `packages/domain/user/src/application/__tests__/factories/user.ts`
  - `packages/infra/server-ben/src/presenters/user-preferences-presenter.ts`
  - `packages/infra/server-ben/src/routes/user-preferences/update-user-preferences.ts`
  - `packages/infra/server-ben/src/routes/chat.ts`
  — anything else is another agent's scope.

## Decisões vinculantes (extract)

- Port (`agent-provider.ts`), exportar:
  ```ts
  export type ReminderKind = 'alarm' | 'goal' | 'conditional'
  export type ReminderAlert = { kind: 'at-event' } | { kind: 'day-before' } | { kind: 'morning-of' } | { kind: 'minutes-before'; minutes: number }
  export type GoalRecurrence = { type: 'none' } | { type: 'daily' } | { type: 'weekdays'; weekdays: number[] } // 0 = domingo
  export type CheckFrequency = { type: 'daily' } | { type: 'every-n-days'; days: number } | { type: 'weekly' }
  export type SnoozeOption = '10-minutes' | '30-minutes' | '1-hour' | '2-hours' | 'tomorrow-morning'
  export interface GoalDraft { title: string; startsAt: string; recurrence: GoalRecurrence; messages: string[] }
  export interface GoalMessagesDraft { goalId: string; messages: string[] }
  export interface ActiveGoal { id: string; title: string; messages: string[] }
  ```
  `ReminderDraft` ganha opcionais `kind?: 'alarm' | 'conditional'`, `alerts?: ReminderAlert[]`, `checkFrequency?: CheckFrequency` (`remindAt` passa a aceitar null para conditional, se ainda não aceitar). `AgentReply` ganha `newGoals: GoalDraft[]`, `goalUpdates: GoalMessagesDraft[]`. `GenerateReplyPayload` ganha `now: string` (ISO), `timeZone: string` (IANA), `activeGoals: ActiveGoal[]`.
- `schemas.ts` (Zod, saída estruturada): no reminder, `kind` enum, `alerts` com `minutes` nullable, `checkFrequency` nullable; arrays `newGoals` e `goalUpdates`. Sem `.optional()` em campos de saída estruturada: use nullable e converta em `to-agent-reply.ts` (descarta `minutes-before` sem minutos; `kind` ausente = alarm).
- `system-prompt.ts`: seção "Agora" com o instante formatado no fuso do usuário (dia da semana, data, hora) + o IANA; regra: datas sempre ISO 8601 com offset do fuso; "um dia antes" → `day-before`, "pela manhã" → `morning-of`, "N minutos/horas antes" → `minutes-before`, sem frase → `[at-event]`; "quando X acontecer" sem data → `kind conditional`, `remindAt null`, frequência padrão `daily` salvo se o usuário disser outra; fluxo de goal: quando o usuário fala de um hábito/objetivo com horário (ex.: academia às 11h), o Ben PERGUNTA se quer salvar como goal e não grava; só preenche `newGoals` no turno seguinte se o usuário confirmar; `messages` = frases motivacionais/problemas ditas pelo usuário, curtas e literais; para acrescentar mensagens a um goal existente use `goalUpdates` com ids da lista "Goals ativos" (seção no prompt com id, título e mensagens). `format-system-prompt.ts` espelha as regras de saída.
- `index.ts`: passa `now`, `timeZone`, `activeGoals` para `buildSystemPrompt` (e o que o format precisar).
- Preferências: `UserProps` ganha `morningTime: string | null`, `dailySummaryEnabled: boolean | null`, `dailySummaryTime: string | null`; `resolveUserPreferences` resolve defaults `'08:00'`, `true`, `'08:00'` (padrão existente). Update aceita os 3 (validação `HH:mm`, 00:00-23:59, `ValidationError` senão). `login-or-register` grava `null`.
- `POST /chat`: body + `timeZone?: string`; validar com `Intl.DateTimeFormat(undefined, { timeZone })` em try/catch, fallback `'UTC'`. Passa `now: new Date().toISOString()`, `timeZone`, `activeGoals: []` (o escopo 2 preenche). `newGoals`/`goalUpdates` ainda são ignorados aqui (escopo 2 persiste).

## Molde a espelhar

- `packages/domain/user/src/application/utils/user-preferences.ts` — `resolveUserPreferences`, defaults de prefs nullable.
- `packages/domain/user/src/enterprise/entities/user.ts` — já importa `AgentEffort` de `@ben/adapters` (precedente dos tipos no port).
- `packages/infra/server-ben/src/routes/chat.ts:32-46` (schema do body) e `:142-172` (generateReply + persistCaptures).
- Skills: `.claude/skills/code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,http-route-handler,http-presenter}.md`.

## Footprint (do not break)

- `packages/domain/chat/src/application/use-cases/captures/persist-captures.ts` consome `ReminderDraft` (campos novos opcionais: não deve quebrar).
- `packages/infra/server-ben/src/presenters/agent-reply-presenter.ts`, `packages/domain/task/src/application/use-cases/tasks/create-task-message.ts` usam `AgentReply`/agente: rodar typecheck desses pacotes.
- Fake do agente em `packages/modules/tests/src/adapters/agent-service.ts` deve devolver `newGoals: []`, `goalUpdates: []`.

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do plano).

## Critérios de aceitação

- Testes de update/get-user-preferences cobrem defaults e validação `HH:mm`.
- `pnpm --filter @ben/domain-user test:unit`, `pnpm --filter @ben/infra-adapters typecheck`, `pnpm --filter @ben/server-ben typecheck`.
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — backend-agente-preferencias`.
