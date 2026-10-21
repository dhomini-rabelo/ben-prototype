# Escopo: mobile-ajustes — alarmes-goals

Plano completo: `.claude/tasks/2026-10-21_alarmes-goals/plan.md` (leia "Premissas", "Mobile", "Roteiro de teste"). Escopo 6 de 6; depende do 5 (`time-stepper`, store de prefs com os 3 campos novos, popups). App: `packages/infra/mobile/ben`.

## Contrato

- Build: seção Lembretes em Settings (resumo diário ligado/desligado, horário do resumo, horário da manhã); menu de lembretes com badge de tipo; editor no detalhe do lembrete; entrada de versão.
- Files you OWN (relativos a `packages/infra/mobile/ben/`):
  - `src/layout/hooks/use-user-preferences.ts`, `src/api/requests/user-preferences.ts` (se o tipo do body precisar)
  - `src/layout/components/menu-settings/settings-view.tsx`, `src/layout/components/menu-settings/reminders-settings-section.tsx` (novo)
  - `src/layout/strings/settings-strings.ts`, `src/layout/strings/menu-detail-strings.ts`, `src/layout/strings/menu-strings.ts`
  - `src/layout/components/menu-reminders/menu-reminders-list.tsx`, `src/layout/components/menu-reminders/reminder-kind-badge.tsx` (novo)
  - `src/layout/components/menu-detail/reminder-detail.tsx`, `src/layout/components/menu-detail/item-detail-reminder-meta.tsx`, `src/layout/components/menu-detail/reminder-editor.tsx` (novo)
  - `src/core/app-versions.ts`
  — anything else is another agent's scope.

## Decisões vinculantes (extract)

- `use-user-preferences` ganha setters otimistas (mesmo padrão de `showUsdCost`, com rollback e `preferenceSaveFailed`) para `morningTime`, `dailySummaryEnabled`, `dailySummaryTime` via `POST /user-preferences/update`.
- `reminders-settings-section`: título "Lembretes"/"Reminders"; `switch` do resumo diário; horário do resumo com `src/layout/components/ui/time-stepper.tsx` (desabilitado quando o switch está desligado); horário da manhã ("pela manhã" = este horário) com `time-stepper`. Montada em `settings-view.tsx` entre as seções existentes, no padrão `collapsible-section`/títulos do arquivo.
- Lista do menu: `reminder-kind-badge` (Alarme / Goal / Quando acontecer) ao lado do título; lembretes `done` vão para o fim com estilo apagado (mesmo tratamento de tasks finalizadas em `menu-tasks-list.tsx`).
- `item-detail-reminder-meta`: status `active`/`done` (strings `statusActive`/`statusDone` no lugar de `statusUpcoming`/`statusFired`), próximo aviso (`nextFireAt`) e tipo.
- `reminder-editor` (no `reminder-detail`, só para `status active`): alarm = data/hora do evento (`time-stepper` + dia: hoje/amanhã/data atual do evento) e avisos (toggles: no horário, um dia antes, pela manhã, N minutos antes com 15/30/60); goal = horário (`time-stepper`) e recorrência (`segmented-control`: nenhuma, diária, dias úteis; dias úteis = weekdays `[1,2,3,4,5]`) + mensagens só leitura; conditional = frequência (diária, a cada 2 dias, a cada 3 dias, semanal). Salvar = `requestUpdateReminder` (respeitando: recurrence só goal, checkFrequency só conditional, remindAt nunca em conditional); depois invalida o detalhe e os ativos. Botão "Concluir" = `update { status: 'done' }`.
- Datas enviadas em ISO com offset calculado no fuso do aparelho.
- i18n en + pt-BR em todos os textos novos.
- `src/core/app-versions.ts`: nova entrada (siga o formato e a numeração do arquivo) resumindo alarmes com avisos, adiar dinâmico, goals com mensagens, lembretes condicionais e resumo diário.
- Design: leia `.claude/agents-docs/design-advisor/design.md` e `.claude/agents-docs/project-context/ux-philosophy.md`; use `src/layout/components/ui/*`. Não dispare agentes.

## Molde a espelhar

- `src/layout/hooks/use-user-preferences.ts:9-69` — mutação otimista de `showUsdCost`.
- `src/layout/components/menu-settings/settings-view.tsx` e `agent-settings-controls.tsx` — seções de settings.
- `src/layout/components/menu-tasks/menu-tasks-list.tsx:21-22` — ativos x finalizados.
- Skills: `.claude/skills/code-write-code/coding-patterns/frontend/{react-components,react-single-responsibility,minimum-props-strategies,component-variant-maps}.md`.

## Footprint (do not break)

- `src/layout/components/menu-detail/item-detail-content.tsx` passa props para `item-detail-reminder-meta`.
- Popups do escopo 5 e o agendador do escopo 4: só consumir (store de prefs, `time-stepper`, `alarm-store`).

## Estado de git

- Branch: `feat/alarmes-goals` | commit-base: HEAD ao iniciar (commit do escopo 5).

## Critérios de aceitação

- Com Expo web na 8082 + API 3335 (nunca 8081), 390x844: mudar o horário do resumo e recarregar mantém o valor; editar avisos de um alarme muda o "próximo aviso" no detalhe; trocar a recorrência de um goal persiste. Screenshots em `.claude/tmp/` (não commitar).
- `pnpm --filter @ben/mobile-ben typecheck`.
- Na raiz, uma vez no fim (saída em arquivo): `pnpm lint:fix && pnpm typecheck && pnpm test`.
- Commit (só os arquivos deste escopo, sem `git add -A`, sem push): `simple-loop(alarmes-goals): implement — mobile-ajustes`.
