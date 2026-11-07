# Revisão do plano — rodada 2 — alarme-tela-cheia

## Veredito
corrigir

## Convenções carregadas
- Doc de contexto: /CLAUDE.md (raiz) e o cartão `projeto.md`, os mesmos da rodada 1.
- Lidos na rodada 1: `code-get-coding-designs/SKILL.md` + `designs/mobile-services-layer-structure.md`;
  `code-write-code/SKILL.md` + `frontend/frontend-code-preferences.md`,
  `mobile/mobile-bottom-sheet-overlay.md` e `lint.md`.
- Lidos nesta rodada, que faltavam: `code-write-code/coding-patterns/backend/domain-entity-declaration.md`,
  `backend/backend-code-preferences.md`, `backend/http-presenter.md`, `backend/http-route-handler.md` e
  `coding-patterns/automated-testing.md`.
- Código conferido nesta rodada: `reminder.ts` (entidade), `acknowledge-reminder.ts`, `update-reminder.ts`
  (use cases), `application/utils/reminders.ts`, `sqlite-repository.ts:272-320`, `reminder-presenter.ts`,
  as rotas `acknowledge-reminder.ts`/`update-reminder.ts`, os campos do mobile `requests/reminders.ts:35-48`,
  `app.config.ts:14,25,36,49`, `eslint.config.mjs` da raiz (`:220`), `tsconfig.json` do app,
  `vitest.config.ts:11`, `package.json:5`, `app-versions.ts`, os consumidores de `useAlarmStore`/`FiredAlarm`
  e `use-alarm-scheduler.ts:25-70`.

## Bloqueios

### 1. A soneca não diz de onde vem o `fullScreen` do `scheduleReminderAlarm`, e no background o store está vazio — implementabilidade (RT-005, RT-012)
Onde: plano.md:284-285 (passo 26: "na soneca, `scheduleReminderAlarm` no novo horário"), plano.md:294-295
(passo 28: Soneca no handler de background) e `## Contratos` plano.md:396 e 421.
Regra: o contrato é `scheduleReminderAlarm(input, fullScreen: FullScreenPermission)`, mas o passo 26 não diz
de onde `snoozeAlarm` tira o segundo argumento. A fonte óbvia é o `alarm-permission-store` do passo 17,
mas ela erra no caminho do passo 28. Ali o handler roda no `index.ts` com o app morto, nenhum
`use-full-screen-permission` montou, e o store está no valor inicial `'unsupported'` (plano.md:208). A soneca
tocada na notificação reagendaria o alarme sem `fullScreenAction`, e ele voltaria como heads-up, não em tela
cheia. O implementador teria que perguntar: "leio o store ou consulto a permissão?"
Conserto: no passo 26, `snoozeAlarm` reagenda com
`scheduleReminderAlarm({ reminderId, firedAt: snoozeUntil, title, kind }, await getFullScreenPermission())`.
O `getFullScreenPermission()` do passo 16 consulta o sistema e funciona sem a árvore React. O mesmo
critério vale para qualquer outro chamador de `scheduleReminderAlarm` fora do sync. No passo 29, o T07
(soneca) confere que `scheduleReminderAlarm` recebe o valor devolvido pelo `getFullScreenPermission`
mockado. Atualize a linha de `snoozeAlarm` em `## Contratos` se a assinatura mudar.

## Notas
- plano.md:332-335 (passo 35): "a partir de `settings-row.tsx`" aponta para
  `src/prototipo/alarme-tela-cheia/settings-row.tsx`, que o passo 37 apaga. Diga que a linha é escrita dentro
  de `reminders-settings-section.tsx` (ou nomeie o arquivo novo em `menu-settings/`) e que nada importa de
  `src/prototipo/`. A nota do passo 37 ("depois do passo 30, que copia a Base") deve citar o passo 35 também.
- plano.md:112-114 (passo 1): o getter `actions` não tem leitor. O helper e o presenter leem
  `props.actions ?? []`, e nenhuma entidade do domínio declara getter. Pode sair. Não fere regra.
- plano.md:131-135 (passo 4): `automated-testing.md` pede um teste por ramo. Vale um caso de update com
  `status: 'active'` e `firedAt`, que não grava ação, para fechar o ramo "só `done` anexa".

## Bloqueios da rodada anterior
1. Ação gravada depois do `update` → **corrigido**. Ver plano.md:112-130: a entidade fica sem método que
   altere estado, e `appendReminderAction` mora em `application/utils/reminders.ts` (o arquivo existe).
   `actions` entra em `changes` antes do `update` em acknowledge (`:54`) e update (`:78`), conferido no
   código. O `sqlite-repository.ts:292-303` serializa arrays e objetos em profundidade e marca as `Date`,
   então a premissa "sem migration" se sustenta.
2. Typecheck quebrado nos checkpoints 3 e 4 → **corrigido**. Ver plano.md:234-239 (o passo 18 adapta
   `alarm-popup-overlay.tsx`) e plano.md:246-248 (o passo 20 enfileira o shape novo). Os únicos consumidores
   de `FiredAlarm`/`useAlarmStore` fora do store são esses dois arquivos (grep), e os dois mudam no
   checkpoint 3. A quebra entre os passos 17 e 20 está declarada em Riscos (plano.md:592) e fecha dentro do
   checkpoint.
3. Store consumido antes de nascer → **corrigido**. Ver plano.md:207-209: o store é o primeiro arquivo do
   passo 17, e o passo 21 (plano.md:257-260) só grava nele.
4. Teto de 10 min em segundo plano → **corrigido**. Os pontos que cobrem isso:
   - teto nativo por `postDelayed`: plano.md:155-160;
   - notificação de perdido agendada em `firedAt + 10 min` e cancelada por `cancelReminderAlarm`:
     plano.md:198-202;
   - som de background iniciado com o restante do teto: plano.md:262-264;
   - `Contratos`: plano.md:430-431;
   - lanes RT-004 e RT-011: plano.md:492-499.
5. Alarme atendido volta a tocar → **corrigido**. Ver plano.md:231-233 (`markFired`), plano.md:276-277
   (`listPendingAlarmKeys`), plano.md:281-283 e 290-291 (restaura antes do flush) e plano.md:298-300 (caso
   novo em T06). A corrida que sobra está declarada em Riscos (plano.md:594-596) e é mitigada por
   `markFired`.
6. iOS quebra no import → **corrigido**. Ver plano.md:154-155 e 178-179 (guard `Platform.OS`),
   plano.md:204-205 e 265, e a lane RT-001 (plano.md:488-490). A premissa aberta (plano.md:642-645)
   **está fechada**: `node_modules/expo-modules-core` (3.0.30, Expo 54) exporta `requireOptionalNativeModule`
   em `src/requireNativeModule.ts:32`, reexportado por `src/index.ts:17`. O workspace usa
   `nodeLinker: hoisted` (`pnpm-workspace.yaml:8`), e o app já importa `expo-modules-core`
   (`src/services/audio-service.ts:9`). O caminho alternativo do plano não será preciso.

Pendências da `## Parcial` da rodada 1, conferidas:
- Backend (passos 1, 5 e 6): `ReminderAction` exportado ao lado de `ReminderProps`, como pede
  `domain-entity-declaration.md`. O presenter estende o `OverWrite` sobre o `Omit`, como pede
  `http-presenter.md`, e o `actions` opcional vira campo obrigatório com `[]`. As rotas repetem o
  `z.iso.datetime({ offset: true }).optional()` que `firedAt`/`now` já usam
  (`acknowledge-reminder.ts:14-17`, `update-reminder.ts:51,74`). Ok.
- Testes: T13 e T14 estendem `application/use-cases/reminders/__tests__/{acknowledge,update}-reminder.test.ts`
  (existem), com a factory `application/__tests__/factories/reminder.ts` (existe), conforme
  `automated-testing.md`. As suítes mobile ficam em `src/**/__tests__/*.test.ts`, coberto por `vitest.config.ts:11`.
- Linhas do mobile: `requests/reminders.ts:35` (`UpdateReminderBody`) e `:45` (`AcknowledgeReminderBody`),
  `app.config.ts:25` (permissions), `:36` (plugins), `:49` (`expo-notifications`) e `eslint.config.mjs:220`
  da raiz (globals de `plugins/**`) batem. `app-versions.ts` está em `src/core/` e a primeira entrada é a 1.2.0,
  perto da `:11`. `reminders-settings-section.tsx` e `settings-sheet-overlay.tsx` existem.
- `tsconfig.json` do app inclui `**/*.ts`, que cobre `index.ts` da raiz, `plugins/*.d.ts` e
  `modules/alarm-sound/index.ts`. O eslint pega `${MOBILE}/**/*.{ts,tsx}`. Ok.

## Novos nesta rodada
- Bloqueio 1 (o `fullScreen` da soneca). O passo 26 mudou nesta volta, mas a linha da soneca vem da rodada 1
  e escapou antes.

## Spec em dúvida
nenhum

## Premissas
- `## Desvios de padrão` (plano.md:561-575): aceitos os cinco.
  - teste do plugin em `src/services/__tests__` com `.d.ts`: o `vitest.config.ts:11` só inclui `src/**`;
  - pasta `modules/`;
  - `main` → `index.ts`;
  - `alarm-actions.ts` sem sufixo `-service`: suíte fixada pelo roteiro;
  - simulação de permissão nos `.web.ts`, só em `__DEV__`.
  Os motivos batem com o código conferido.
- O getter `actions` sobrou como nota, não como bloqueio. `domain-entity-declaration.md` não proíbe getter.
- Não refiz a conferência de cobertura spec → plano (RT/PR/CB/T0n). A rodada 1 a fechou (13/13 RT, 8/8 PR,
  13/13 CB) e os consertos não tiraram passo nenhum, só acrescentaram.
