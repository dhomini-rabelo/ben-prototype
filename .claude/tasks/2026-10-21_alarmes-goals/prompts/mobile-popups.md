# Escopo: mobile-popups — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Premissas", "Mobile", "Roteiro de teste"). Escopo 5 de 6; depende do 4 (models, requests, `alarm-store`, `use-alarm-scheduler`, `scheduleDailySummaryNotification`). App: `packages/infra/mobile/ben`.

## Contrato

- Build: popup global in-app para o lembrete disparado (alarm, goal, conditional) com adiar dinâmico e horário livre; popup do resumo diário no horário configurado; preferências novas hidratadas no store.
- Files you OWN (relativos a `packages/infra/mobile/ben/`):
  - `src/layout/components/alarm-popup/` (novos): `alarm-popup-overlay.tsx` (host, lê `alarm-store.current`), `alarm-popup-alarm.tsx`, `alarm-popup-goal.tsx`, `alarm-popup-conditional.tsx`, `alarm-popup-snooze.tsx` (opções dinâmicas + "outro horário")
  - `src/layout/components/ui/time-stepper.tsx` (novo; reutilizado no escopo 6)
  - `src/layout/strings/alarm-strings.ts` (novo, en + pt-BR)
  - `src/layout/hooks/use-daily-summary.ts`, `src/layout/components/daily-summary/daily-summary-popup.tsx`, `src/storage/daily-summary-storage.ts` (novos)
  - `src/layout/stores/user-preferences-store.ts`, `src/layout/hooks/use-user-preferences-sync.ts`
  - `app/(protected)/_layout.tsx`
  — anything else is another agent's scope.

## Decisões vinculantes (extract)

- Overlay no padrão bottom sheet do app (`coding-patterns/mobile/mobile-bottom-sheet-overlay.md`), montado uma vez em `app/(protected)/_layout.tsx`; mostra `alarm-store.current`; fecha com `dismissCurrent` e chama `refreshActiveReminders` após qualquer ação.
- Alarm: título, horário do evento (`firesAt`, formatado no fuso do aparelho), ações: **OK** (`acknowledge { firedAt }`), **Adiar** (abre `alarm-popup-snooze`), **Concluir** (`update { status: 'done' }`).
- Snooze: busca `GET /reminders/:id/snooze-options?at=<Date.now() ISO>` ao abrir (relógio do aparelho, para funcionar com `page.clock`); mostra cada opção com rótulo localizado (10 min, 30 min, 1 h, 2 h, amanhã de manhã) e o horário resultante; mais **Outro horário** com `time-stepper` (hora/minuto, passo de 5 min, data = hoje ou amanhã se o horário já passou); escolher = `acknowledge { firedAt, snoozeUntil }`. Horário livre inválido (≤ agora) desabilita o confirmar.
- Goal: título, "hoje às HH:mm", lista das `messages` salvas (só leitura, destaque visual de cartão), ações **Feito** (`acknowledge { firedAt }`; se `recurrence.type === 'none'`, `update { status: 'done' }`) e **Adiar**.
- Conditional: pergunta "Já aconteceu? {título}" com **Sim** (`update { status: 'done' }`) e **Ainda não** (`acknowledge { firedAt }`), e um seletor de frequência (diária, a cada 2 dias, a cada 3 dias, semanal → `daily`, `every-n-days 2|3`, `weekly`); mudar o seletor chama `update { checkFrequency }` antes do "Ainda não".
- Resumo diário: `use-daily-summary` lê `dailySummaryEnabled`/`dailySummaryTime` do store; tick de 15 s; quando a hora local do aparelho ≥ `dailySummaryTime` e a data local ainda não foi mostrada (`daily-summary-storage`, AsyncStorage, chave por data `YYYY-MM-DD`), busca `GET /reminders/daily-summary?date=&timeZone=` e mostra `daily-summary-popup` (seções Alarmes, Goals, Perguntas pendentes; vazio = mensagem curta). Em nativo agenda `scheduleDailySummaryNotification` quando as prefs mudam (cancela se desligado). O popup de resumo tem prioridade visual: se houver alarme na fila, mostra o resumo primeiro e o alarme depois.
- Store de preferências ganha `morningTime`, `dailySummaryEnabled`, `dailySummaryTime` (+ setters) com defaults `'08:00'`, `true`, `'08:00'`; o sync hidrata os 3 do `GET /user-preferences`. Os setters que salvam no servidor e a UI de settings são do escopo 6.
- Textos en + pt-BR em `alarm-strings.ts` via `useStrings`. Voz do Ben: curta, minúscula onde o app já usa, sem jargão.
- Design: leia `.claude/agents-docs/design-advisor/design.md` e `.claude/agents-docs/project-context/ux-philosophy.md` antes de desenhar; use `src/layout/components/ui/{button,segmented-control,typography}.tsx`. Não dispare agentes.

## Molde a espelhar

- `src/layout/components/menu-settings/settings-sheet-overlay.tsx` + `settings-sheet.tsx` — overlay/bottom sheet existente.
- `src/layout/strings/settings-strings.ts` — formato `Localized` en/pt-BR.
- `src/storage/language-storage.ts` — persistência local.
- Skills: `.claude/skills/code-write-code/coding-patterns/mobile/mobile-bottom-sheet-overlay.md`, `coding-patterns/frontend/{react-components,react-single-responsibility,component-variant-maps}.md`.

## Footprint (do not break)

- `use-user-preferences.ts` e `settings-view.tsx` usam `showUsdCost` do store: preserve.
- `useAlarmScheduler()` já está em `app/(protected)/_layout.tsx` (escopo 4): só acrescente os overlays.

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do escopo 4).

## Critérios de aceitação

- Com Expo web na 8082 + API 3335 (nunca 8081), viewport 390x844, um alarme vencido abre o popup; Adiar lista opções vindas do servidor; OK/Concluir fecham e não reabrem o mesmo disparo. Screenshot rápido do popup de alarme, goal e conditional em `.claude/tmp/` (não commitar).
- `pnpm --filter @ben/mobile-ben typecheck`.
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — mobile-popups`.
