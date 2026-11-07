# Plano — alarme em tela cheia com som para lembretes de horário

## Resumo do plano

### O que muda

#### Checkpoint 1 — servidor registra disparo e instante de cada ação
- **Lembrete guarda as ações.** Cada Parar, Soneca e Concluir fica registrado com o horário do
  disparo e o instante do toque; o app passa a mandar os dois.
- **Sem migração.** Lembretes antigos ficam com a lista vazia.

#### Checkpoint 2 — base nativa do alarme no Android
- **Lib de alarme e permissões.** Entra a `react-native-notify-kit` e a permissão de tela cheia; a
  tela do app passa a abrir por cima do bloqueio e acender a tela.
- **Som próprio.** Um som de alarme embutido no app e um módulo nativo pequeno, versionado no
  repositório, que toca esse som em loop no volume de alarme e se cala sozinho no teto de 10 min,
  mesmo com o app fechado. No iPhone nada disso é carregado e o app abre como hoje.
- **Conferência.** O APK de debug é gerado e o manifest conferido antes de seguir (marco 1).

#### Checkpoint 3 — agendamento, fila e permissão
- **Quem vira alarme.** Só o aviso da hora marcada e as sonecas de um lembrete de horário viram
  alarme em tela cheia; sem a tela cheia liberada, seguem como a notificação de hoje.
- **Fila.** Um alarme por vez, o mais antigo primeiro, sem repetir o mesmo disparo, por cima do
  resumo diário; depois de 10 min sem ação o som para e fica uma notificação de alarme perdido,
  também com o app em segundo plano ou fechado (a notificação de perdido já sai agendada).
- **Abrir pela notificação.** Mostra o título da própria notificação, sem esperar a rede.
- **Permissão.** O app confere a tela cheia ao abrir e ao voltar, e reagenda conforme a resposta
  (marco 2).

#### Checkpoint 4 — ações offline
- **Silencia primeiro.** Parar, Soneca e Concluir param o som e fecham a tela antes de falar com o
  servidor; a ação fica guardada e é reenviada quando a rede volta. Ao reabrir o app, um alarme
  já atendido e ainda não enviado não volta a tocar.
- **Soneca sem rede.** Reagenda o alarme no aparelho na hora; sem as opções do servidor, é de 10 min.
  A soneca tocada na notificação, com o app fechado, volta em tela cheia: a permissão é consultada
  no sistema na hora de reagendar.

#### Checkpoint 5 — tela de alarme, aviso de liberar e configurações
- **Tela de alarme V4.** Hora grande, data, título num balão, Parar, Soneca e Concluir; a Soneca abre
  em tela clara com o slider de 5 min a 2 h e as opções de hoje; na web, "toque para ouvir" quando o
  navegador bloqueia o som.
- **Meta e condicional.** Continuam no painel de hoje; o painel pequeno de alarme sai.
- **Aviso e configurações.** Aviso único para liberar a tela cheia, estado dela nas configurações de
  lembretes e aviso quando as notificações estão negadas.
- **Fechamento.** Versão 1.3.0 nas novidades e as rotas do protótipo desta task removidas.

### Decisões que travei sozinho
- **Som pelo módulo próprio, não pelo canal** (Dúvida 1 = A): o canal da lib não aceita o uso de
  áudio de alarme, então o som em loop no volume de alarme vem do módulo. Custo: código nativo nosso
  para manter, e que toca no silencioso só se confere no aparelho.
- **Só a hora marcada vira alarme**: segui AC-004 contra o trecho de PR-001 que dizia "cada aviso".
- **Soneca tocada na notificação, sem abrir a tela, é de 10 min**: a notificação não tem as opções.
- **Prova do módulo de som por leitura de código** (lane codigo), porque Kotlin não roda nos testes.
- **Ids acrescentados às provas**: T16 cita RT-003, T17 cita RT-004, T06 e T08 citam RT-008.
- **Provas acrescentadas na volta 1**: a seção RT-011 na lane codigo (teto do som e aviso de perdido
  com o app fechado), um caso novo em T06 (ação pendente não reabre o alarme) e o guard de iOS na
  seção RT-001.
- **Provas acrescentadas na volta 2**: T07 confere que a soneca reagenda com a permissão lida do
  sistema, não da memória do app; T14 ganha o caso de update sem conclusão, que não grava ação.
- **Teto de 10 min em dois caminhos**: com o app na frente, o timer do app; fora dele, o próprio
  módulo de som se cala e a notificação de perdido já vem agendada junto do alarme.
- **Simulação de permissão negada no web**, só em desenvolvimento, por `?simular=` na url, para
  provar o aviso e as configurações (S10, S12, S13).
- **A tela abre por cima do bloqueio sempre que o app está na frente**, não só no alarme. Custo:
  quem travar o celular com o app aberto vê o app por cima do bloqueio (ver Riscos).

### O que fica de fora
- Ligar a abertura por cima do bloqueio só durante o alarme (mitigação do risco acima).
- Harness de teste de ponta a ponta: PR-008 roda à mão no browser.
- Captura no aparelho Android: o comportamento real fica para conferir no APK.
- Escolha de som pelo usuário e preenchimento de ações para lembretes antigos.

### Como se prova
AC-001 — a config gerada declara tela cheia, abre por cima do bloqueio e acende a tela, o alarme é
agendado como despertador com tela cheia e o APK compila (T01, T15, T16 na lane teste; RT-013 na lane
codigo); no aparelho, sem captura.
AC-002 — o som é o de alarme, em loop, e para sozinho em 10 min com aviso de perdido (T12, T17 na lane
teste; RT-004 e RT-011 na lane codigo, esta acrescentada para o teto com o app fechado); no
silencioso, sem captura.
AC-003 — a tela mostra hora, data e só o título, inteiro mesmo longo (S01, S07 na lane browser; T19
na lane teste).
AC-004 — o aviso antecipado fica como notificação comum (T03 na lane teste).
AC-005 — com o app aberto, a tela de alarme aparece em até 15 s na web e uma vez só no Android (S01
na lane browser; T10 na lane teste).
AC-006 — Parar fecha, silencia antes da rede e não reabre, nem ao reabrir o app com a ação pendente
(S05 na lane browser; T06, que ganha esse caso, e T13 na lane teste).
AC-007 — Soneca mostra as opções de hoje, fecha e o alarme volta no horário (S02, S04, S18 na lane
browser; T07, T13 na lane teste).
AC-008 — Concluir fecha, silencia e o lembrete sai da lista (S06 na lane browser; T08, T14 na lane
teste).
AC-009 — a tela abre por cima do bloqueio e, depois da ação, o app sai da frente (T16 na lane teste;
RT-013 na lane codigo); no aparelho, sem captura.
AC-010 — o aviso de liberar a tela cheia aparece com o botão e o "Agora não" (S10 na lane browser).
AC-011 — as configurações mostram a tela cheia desligada e o botão de liberar (S12 na lane browser).
AC-012 — meta e condicional abrem o painel de hoje e seguem o canal de hoje (S14, S15 na lane
browser; T04 na lane teste).
AC-013 — sem tela cheia, o lembrete de horário chega como a notificação de hoje (T02 na lane teste).
AC-014 — o resumo diário segue no canal de hoje (T04 na lane teste).
AC-015 — a lista e o detalhe de lembretes ficam iguais (S16, S17 na lane browser).
AC-016 — o slider fica no topo da Soneca, de 5 min a 2 h em passos de 5 (S02, S03 na lane browser).

## Objetivo

Lembrete de horário (`kind: 'alarm'`), no aviso da hora marcada e nas sonecas, vira alarme do
notify-kit em tela cheia no Android (som em loop com `USAGE_ALARM` por um módulo Expo próprio, teto
de 10 min), e no app aberto (Android e web) a tela de alarme V4 substitui o painel pequeno; ações
silenciam no aparelho antes da rede e o servidor registra disparo e instante de cada ação.

## Passos

Caminhos do mobile relativos a `packages/infra/mobile/ben/`. Verificação no fim de cada checkpoint,
na raiz: `pnpm lint:fix && pnpm typecheck && pnpm test` (o `pnpm test` roda o `test:unit` dos pacotes
de domínio; nos checkpoints 2 a 5 rode também `pnpm --filter @ben/mobile-ben test:unit`).

### Checkpoint 1 — servidor registra disparo e instante de cada ação
1. (RT-009) **packages/domain/chat/src/enterprise/entities/reminder.ts** — tipo `ReminderAction` e
   `actions?: ReminderAction[]` no fim de `ReminderProps` (`:12-31`), sem getter (o helper abaixo e o
   presenter do passo 6 leem `props.actions ?? []`). Sem método que altere estado: a entidade só tem `create` e `reference`
   (`:33,37`) e os use cases gravam por `reminderRepository.update(id, changes)`. Opcional porque as
   linhas já gravadas não têm o campo; o `sqlite-repository.ts:274-320` serializa e reidrata `Date`
   em qualquer profundidade, então não há migration nem passo de schema. No mesmo passo,
   **packages/domain/chat/src/application/utils/reminders.ts** ganha a função pura
   `appendReminderAction(props, action): ReminderAction[]` (devolve `[...(props.actions ?? []),
   action]`), usada pelos passos 2 e 3.
2. (RT-009) **packages/domain/chat/src/application/use-cases/reminders/acknowledge-reminder.ts** —
   Payload (`:11`) ganha `actedAt?: Date`; quando vem, `changes` (`:47`) passa a ser
   `{ acknowledgedUntil, snoozedUntil, actions }`, com `actions = appendReminderAction(reminder.props,
   { type: payload.snoozeUntil ? 'snooze' : 'stop', firedAt, actedAt })` montado **antes** do
   `reminderRepository.update` (`:54`), que o grava junto. Sem `actedAt`, `changes` fica como hoje.
3. (RT-009) **packages/domain/chat/src/application/use-cases/reminders/update-reminder.ts** — Payload
   (`:20`) ganha `firedAt?: Date` e `actedAt?: Date`; com `status: 'done'` e `firedAt`, junto do
   `completedAt` (`:64`) põe em `changes.actions = appendReminderAction(reminder.props, { type:
   'done', firedAt, actedAt: actedAt ?? now ?? new Date() })`, antes do `reminderRepository.update`
   (`:78`). Sem `firedAt` nada é anexado.
4. (RT-009) **packages/domain/chat/src/application/use-cases/reminders/__tests__/acknowledge-reminder.test.ts**
   e **.../update-reminder.test.ts** — T13 e T14, estendendo as suítes existentes com a factory
   `application/__tests__/factories/reminder.ts`, um caso por ramo: parar, soneca, acknowledge sem
   `actedAt` (não grava ação); concluir com `firedAt` e `actedAt`, concluir sem `actedAt` (usa `now`),
   concluir sem `firedAt` (não grava), update com `status: 'active'` e `firedAt` (não grava: só
   `done` anexa).
5. (RT-009) **packages/infra/server-ben/src/routes/reminders/acknowledge-reminder.ts** (`:14-17`) e
   **.../update-reminder.ts** (`:14-51`) — Zod: `actedAt` opcional no acknowledge; `firedAt` e
   `actedAt` opcionais no update, com a mesma coerção de data que `firedAt`/`now` já usam, repassados
   ao use case como `now` é hoje (`:74`).
6. (RT-009) **packages/infra/server-ben/src/presenters/reminder-presenter.ts** (`:8-22`) — `actions`
   no `OverWrite` do `ReminderHttp` como `{ type, firedAt: string, actedAt: string }[]` e no
   mapeamento com `toIso`; `[]` quando o lembrete não tem ações.
7. (RT-009) **src/api/models/reminder.ts** e **src/api/requests/reminders.ts** (mobile) —
   `Reminder.actions`; `AcknowledgeReminderBody.actedAt?: string` (`:45`) e
   `UpdateReminderBody.firedAt?: string`/`actedAt?: string` (`:35`). Quem envia é o passo 25.

### Checkpoint 2 — base nativa do alarme no Android
8. (RT-013, RT-001) **package.json** (mobile) — dependência `react-native-notify-kit@10.10.0` por
   `pnpm --filter @ben/mobile-ben add react-native-notify-kit@10.10.0`.
9. (RT-004) **assets/sounds/ben_alarm.wav** — som próprio do alarme (curto, para loop, licença livre;
   pasta nova). Embutido em `res/raw` pelo `sounds` do plugin `expo-notifications` (passo 12).
10. (RT-004, RT-003, RT-013) **modules/alarm-sound/** — módulo Expo local (autolink da pasta
    `modules/`): `expo-module.config.json` (só `android`), `android/.../AlarmSoundModule.kt` e
    `index.ts` com `requireOptionalNativeModule('AlarmSound')` tipado (devolve `null` onde o módulo
    não existe, como no iOS, em vez de lançar no import). Kotlin: `start(maxDurationMs)` cria
    `MediaPlayer` com `AudioAttributes` `USAGE_ALARM` + `CONTENT_TYPE_SONIFICATION`,
    `isLooping = true`, tocando `res/raw/ben_alarm`, e agenda num `Handler(Looper.getMainLooper())`
    um `postDelayed` que chama `stop()` depois de `maxDurationMs` (teto nativo de RT-011, vale com o
    app em segundo plano ou morto); se já está tocando, não faz nada; `stop()` remove o callback
    pendente, para e libera; `leaveLockScreen()`
    chama `moveTaskToBack(true)` na atividade atual só se o `KeyguardManager` diz que o aparelho está
    travado (AC-009). Único importador: `src/services/alarm-service.ts` (passo 13).
11. (RT-003) **plugins/with-alarm-activity.js** + **plugins/with-alarm-activity.d.ts** — config plugin
    com `withAndroidManifest` que põe `android:showWhenLocked="true"` e `android:turnScreenOn="true"`
    na `.MainActivity`; a transformação fica numa função pura exportada
    (`applyAlarmActivityAttributes(manifest)`) para o T16. O `.d.ts` deixa o teste TS importar o `.js`.
    Pré-requisito do passo 12.
12. (RT-002, RT-003, RT-004, RT-005, RT-013, RT-001) **app.config.ts** — `android.permissions` (`:25`)
    ganha `android.permission.USE_FULL_SCREEN_INTENT` e `android.permission.RECEIVE_BOOT_COMPLETED`;
    `plugins` (`:36`) ganha `react-native-notify-kit` e `./plugins/with-alarm-activity`; o
    `expo-notifications` (`:49`) ganha `sounds: ['./assets/sounds/ben_alarm.wav']`. Nada sob `ios`.
13. (RT-004, RT-013) **src/services/alarm-service.ts** + **alarm-service.web.ts** (novos, início) —
    único importador de `react-native-notify-kit` e de `modules/alarm-sound`. Neste checkpoint:
    `ALARM_CHANNEL` (id `ben-alarme`, importância HIGH, `sound: 'ben_alarm'`, `bypassDnd: true`),
    `ALARM_CATEGORY` (`AndroidCategory.ALARM`), `ensureAlarmChannel()`,
    `startAlarmSound(maxDurationMs)` (repassa ao `start` do módulo; quem chama calcula o restante
    do teto com `getRemainingSoundMs` do passo 18), `stopAlarmSound()`, `leaveLockScreen()`. Toda
    função exportada retorna cedo com `Platform.OS !== 'android'` (no-op ou valor neutro), como
    `notifications-service.ts:45,93` já faz, e o módulo nulo de `requireOptionalNativeModule` também
    vira no-op. O `.web.ts` tem as mesmas assinaturas: som por `HTMLAudioElement` em loop
    (`'blocked'` quando `play()` rejeita) com um `setTimeout(maxDurationMs)` que pausa, o resto no-op.
14. (RT-003, RT-004, RT-005) **src/services/__tests__/alarm-native-config.test.ts** — T15–T18, com
    `vi.mock` de `react-native-notify-kit` e do módulo: T15 chama o export de `app.config.ts` como o
    Expo chama e lê permissões e plugins; T16 roda `applyAlarmActivityAttributes` num manifest mínimo;
    T17 lê `ALARM_CHANNEL`, `ALARM_CATEGORY` e o `sounds` do `expo-notifications`; T18 lê
    `RECEIVE_BOOT_COMPLETED` e o plugin do notify-kit.
15. (RT-001, RT-004, RT-013) **conferência nativa** — `pnpm --filter @ben/mobile-ben android:prebuild`
    e `cd packages/infra/mobile/ben/android && ./gradlew assembleDebug` (a pasta `android/` é gerada e
    fica fora do git). Conferir no manifest mesclado do debug: `USE_FULL_SCREEN_INTENT`,
    `showWhenLocked`/`turnScreenOn` na `MainActivity`, o receiver de reinício da lib; e
    `res/raw/ben_alarm.wav` no APK. Falha de build aqui para o checkpoint.

### Checkpoint 3 — agendamento, fila e permissão
16. (RT-002, RT-005, RT-010, RT-011, RT-013) **src/services/alarm-service.ts** + **.web.ts** (resto da
    API) — `getFullScreenPermission()`, `openFullScreenSettings()`, `scheduleReminderAlarm(input,
    fullScreen)` (trigger por timestamp com `alarmManager: { type: SET_ALARM_CLOCK }`, canal
    `ben-alarme`, `category: ALARM`, `fullScreenAction` só com `fullScreen === 'granted'`, `data` =
    `AlarmNotificationData`, ações Parar e Soneca, id `alarm:{reminderId}`; agenda também, pelo
    notify-kit, a notificação de alarme perdido em `firedAt + 10 min` com id `missed:{reminderId}`,
    para o aviso de perdido sair mesmo com o app em segundo plano ou morto, RT-011; reagendar com o
    mesmo id substitui), `cancelReminderAlarm(reminderId)` (cancela `alarm:` e `missed:`),
    `showMissedAlarmNotification(alarm)` (exibe com o id `missed:{reminderId}`, então substitui a
    agendada em vez de duplicar), `subscribeToAlarmEvents(handler)` (foreground: DELIVERED, PRESS,
    ACTION_PRESS), `registerAlarmBackgroundHandler(handler)` (fora do Android não registra nada) e
    `getInitialAlarm()`, todas com o guard `Platform.OS` do passo 13. O `.web.ts` devolve
    `'unsupported'` na permissão (salvo a simulação do passo 34) e é no-op no resto.
17. (RT-002, RT-005) **src/layout/stores/alarm-permission-store.ts** (novo, primeiro arquivo do
    passo) — store zustand com `fullScreen: FullScreenPermission` (começa `'unsupported'`),
    `notifications: 'granted' | 'denied'` e os setters; é o store que este passo e o passo 20 leem.
    Depois, **src/services/notifications-service.ts** + **.web.ts** —
    `syncReminderNotifications(reminders, fullScreen)` (`:150`) decide por lembrete:
    `kind === 'alarm'` e `nextFireAt` igual a `firesAt` ou a `snoozedUntil` → `scheduleReminderAlarm`
    (tela cheia só se `granted`; senão a notificação de hoje no canal `alarmes`, AC-013); avisos
    antecipados, meta e condicional → `scheduleReminderNotification` de hoje (AC-004, AC-012); o que
    sumiu, foi concluído ou mudou de horário → `cancelReminderAlarm` e `cancelReminderNotification`
    (CB-010). O `data` da notificação comum de lembrete (`scheduleReminderNotification`, `:114`)
    ganha `title` e `kind` além de `{ reminderId, nextFireAt }` (RT-010, CB-001). Novo
    `getNotificationPermissionStatus()` nos dois arquivos (hoje só há o request, `:82`). O tipo
    `NotificationTap` (`:201`) ganha `title` e `kind`, lidos do `data` em `dispatchNotificationTap`
    (`:206-221`). Quando o caminho de um lembrete muda (a tela cheia foi liberada ou negada), o sync
    cancela o caminho que deixou de valer. O único chamador de `syncReminderNotifications`
    (`use-alarm-scheduler.ts:49`) passa `fullScreen` do store deste passo no passo 20.
18. (RT-006, RT-010, RT-011) **src/layout/stores/alarm-store.ts** — `FiredAlarm` novo (ver
    Contratos); `getFiredKey = reminderId:firedAt`; `enqueue` ignora chave repetida e insere ordenado
    por `firedAt` (CB-008); `attachReminders(list)` completa `reminder` quando a lista chega;
    seletor puro `selectVisiblePopup(current, summaryOpen)` em que o alarme vence o resumo (CB-011);
    `ALARM_SOUND_LIMIT_MS = 600000` e o helper puro `getRemainingSoundMs(firedAt, now)`
    (`max(0, firedAt + ALARM_SOUND_LIMIT_MS - now)`), usados por quem inicia o som (passos 22 e
    30); `expireCurrent(now)` chama `stopAlarmSound()` e `showMissedAlarmNotification()` e marca
    `sound: 'off'` (RT-011, caminho com o app na frente; o caminho em segundo plano é o teto nativo
    do passo 10 com a notificação agendada do passo 16); `markFired(keys)` acrescenta chaves ao
    `firedKeys` e tira da fila as entradas com essas chaves (se tirar o `current`, chama
    `stopAlarmSound()` e o próximo vira o atual), para o passo 27 (RT-008); `dismissCurrent` e
    `reset` ficam. No mesmo passo, o consumidor atual do shape,
    **src/layout/components/alarm-popup/alarm-popup-overlay.tsx**, é adaptado para o typecheck do
    checkpoint 3 passar: não renderiza o conteúdo quando `current.reminder === null` (a lista ainda
    não chegou), passa a `AlarmPopupContent` o `reminder` não nulo junto do `firedAt`, e a `key`
    (`:149`) e as requests (`:58-83`) usam `reminderId`. O filtro `goal`/`conditional` fica para o
    passo 32.
19. (RT-010) **src/services/alarm-actions.ts** (novo, início) + **src/services/__tests__/alarm-actions.test.ts**
    — `openAlarmFromNotification(data: AlarmNotificationData)`: enfileira com `sound: 'off'`,
    `reminder: null`, sem rede. Só recebe `AlarmNotificationData`; a conversão do `NotificationTap`
    da notificação comum (`{ reminderId, nextFireAt, title, kind }`, passo 17) em
    `{ reminderId, firedAt: nextFireAt, title, kind }` fica no passo 20, antes da chamada. Suíte
    nova com T19. Pré-requisito do passo 20.
20. (RT-006, RT-007, RT-010) **src/layout/hooks/use-alarm-scheduler.ts** — a checagem de 15 s
    (`CHECK_INTERVAL_MS`, `:11`) enfileira no shape novo (`:34`): `{ reminderId: reminder.id, title:
    reminder.title, kind: reminder.kind, firedAt: reminder.nextFireAt, reminder, sound: 'on' }`;
    `subscribeToAlarmEvents` DELIVERED em primeiro plano enfileira na hora e cancela a notificação
    exibida (um som só, RT-006); o toque na notificação comum (`subscribeToNotificationTaps`, `:56-69`)
    converte o `NotificationTap` em `AlarmNotificationData` (`firedAt: nextFireAt`) e, como o PRESS
    do notify-kit e o `getInitialAlarm()` no mount, chama `openAlarmFromNotification` (passo 19) sem
    o `requestActiveReminders()` antes (RT-010); quando a lista chega, `attachReminders`; um timer
    chama `expireCurrent(Date.now())`. O efeito do sync (`:45-50`) passa a ler `fullScreen` do store
    do passo 17 e depende de `[items, fullScreen]`: quando a permissão muda, ressincroniza sozinho
    com a lista atual.
21. (RT-002) **src/layout/hooks/use-full-screen-permission.ts** — checa `getFullScreenPermission()`
    e `getNotificationPermissionStatus()` ao montar e em `AppState` `'active'` e grava no store do
    passo 17; não chama o sync (a ressincronização vem do efeito do passo 20 quando `fullScreen`
    muda). Montado em `app/(protected)/_layout.tsx` junto dos hooks atuais.
22. (RT-005, RT-011) **index.ts** (raiz do app, novo) + **package.json** (`main`, `:5`) — `index.ts`
    chama `registerAlarmBackgroundHandler(...)` (DELIVERED em background inicia o som com
    `startAlarmSound(getRemainingSoundMs(firedAt, Date.now()))`, então o teto nativo do passo 10
    vale nesse caminho: cobre CB-003 e app morto) e depois `import 'expo-router/entry'`; `main` passa
    a `index.ts`. Fora do Android o registro é no-op (passo 16).
23. (RT-006, RT-010, RT-011) **src/layout/stores/__tests__/alarm-store.test.ts** (pasta nova) —
    T09–T12, com `vi.mock('@/services/alarm-service')` e tempo fixo.
24. (RT-002, RT-005) **src/services/__tests__/alarm-scheduling.test.ts** (novo) e
    **src/services/__tests__/notifications-service.test.ts** (existente) — T01–T03 e T05 no novo; T04
    estende o existente. Ambos chamam `syncReminderNotifications` com `expo-notifications` e
    `react-native-notify-kit` mockados e conferem as chamadas.

### Checkpoint 4 — ações offline
25. (RT-008) **src/storage/pending-alarm-actions-storage.ts** — lista de `PendingAlarmAction` no mesmo
    mecanismo de persistência de `daily-summary-storage.ts` (`AsyncStorage`); chave por
    `reminderId:firedAt:type`. Expõe também `listPendingAlarmKeys(): Promise<Set<string>>`, com as
    chaves `reminderId:firedAt` (o mesmo formato de `getFiredKey`) das ações ainda pendentes.
    Pré-requisito do passo 26.
26. (RT-008, RT-009, RT-012) **src/services/alarm-actions.ts** (resto) — `stopAlarm(alarm)`,
    `snoozeAlarm(alarm, snoozeUntil | null)`, `completeAlarm(alarm)`, `flushPendingAlarmActions()` e
    `restorePendingAlarmKeys()` (lê `listPendingAlarmKeys()` e chama `markFired(keys)` do store, passo
    18: um disparo já atendido sem rede, ou pelo botão da notificação com o app morto, não volta à
    fila quando a lista do servidor ainda traz o `nextFireAt` antigo, RT-008/CB-007).
    Ordem fixa: `stopAlarmSound()` → `cancelReminderAlarm` (ou, na soneca,
    `scheduleReminderAlarm({ reminderId, firedAt: snoozeUntil (ISO), title, kind }, await
    getFullScreenPermission())`: a permissão vem do sistema pelo passo 16, nunca do
    `alarm-permission-store`, que no handler de background do passo 28 está no valor inicial
    `'unsupported'` porque nenhum hook montou; o mesmo vale para qualquer chamador de
    `scheduleReminderAlarm` fora do sync) → `dismissCurrent()` → `leaveLockScreen()` → grava a pendente → tenta a rede
    (`requestAcknowledgeReminder` com `firedAt` do disparo, `snoozeUntil?` e `actedAt` do relógio do
    aparelho; concluir pela request de update com `status: 'done'`, `firedAt`, `actedAt`). Sucesso
    apaga a pendente; falha a mantém. `snoozeUntil` nulo (sem rede, sem opções do servidor) =
    `actedAt + 10 min` (RT-012).
27. (RT-008) **src/layout/hooks/use-pending-alarm-actions.ts** — ao montar, primeiro
    `await restorePendingAlarmKeys()` e só depois `flushPendingAlarmActions()`; chama o flush também
    quando `useConnectivityStore` volta a online (`use-connectivity.ts`); montado em
    `app/(protected)/_layout.tsx`.
28. (RT-008, RT-012) **index.ts** — o handler de background trata ACTION_PRESS: Parar → `stopAlarm`,
    Soneca → `snoozeAlarm(alarm, null)` (10 min; a notificação não tem as opções do servidor). A
    tela cheia da soneca reagendada vem do `getFullScreenPermission()` chamado dentro de
    `snoozeAlarm` (passo 26), não do store.
29. (RT-008, RT-012) **src/services/__tests__/alarm-actions.test.ts** — T06–T08, com serviços, storage
    e requests mockados e o store real; a ordem das chamadas é conferida por `invocationCallOrder`.
    T06 ganha um caso: com uma ação pendente para `reminderId:firedAt`, depois de
    `restorePendingAlarmKeys()`, o `enqueue` de um lembrete da lista com esse `nextFireAt` devolve
    `false` e a fila fica vazia. T07 confere também que `scheduleReminderAlarm` recebe, como segundo
    argumento, o valor devolvido pelo `getFullScreenPermission` mockado (`'granted'`), com o
    `alarm-permission-store` no valor inicial `'unsupported'`.

### Checkpoint 5 — tela de alarme, aviso de liberar e configurações
30. (RT-006, RT-007, RT-010) **src/layout/components/alarm-screen/** (pasta nova) — a partir da Base do
    protótipo (`src/prototipo/alarme-tela-cheia/variacao-4.tsx`, `duration-slider.tsx`, `parts.tsx`,
    `shared.tsx`, `strings-v4.ts`): `alarm-screen.tsx` (hora corrente grande, data, balão só com o
    título, contador "1 de N", Parar, Soneca, Concluir), `alarm-screen-snooze.tsx` (tela clara, slider
    5–120 min de 5 em 5 começando em 15, opções do servidor como hoje), `duration-slider.tsx`,
    `alarm-screen-parts.tsx` e `alarm-screen-overlay.tsx`. Ao montar com `sound: 'on'` chama
    `startAlarmSound(getRemainingSoundMs(firedAt, Date.now()))` (passo 18); com `'blocked'` mostra "toque para ouvir" e o toque tenta de novo (RT-007,
    CB-012). Botões chamam `stopAlarm`/`snoozeAlarm`/`completeAlarm`. Os textos (de `strings-v4.ts`)
    entram antes em `src/layout/strings/alarm-strings.ts`, nas línguas que o arquivo já tem.
31. (RT-006) **app/(protected)/_layout.tsx** — renderiza `<AlarmScreenOverlay />` depois de
    `<DailySummaryPopup />` e de `<AlarmPopupOverlay />`, aberto por `selectVisiblePopup`.
32. (RT-006, RT-009) **src/layout/components/alarm-popup/alarm-popup-overlay.tsx** — passa a tratar
    só `goal` e `conditional` (AC-012) com o mesmo seletor; `resolveAcknowledgedAt` (`:21`) sai: as
    ações mandam `firedAt` do disparo e `actedAt`. A adaptação ao shape novo de `FiredAlarm` já foi
    feita no passo 18; aqui fica só o filtro e a remoção. Apaga `alarm-popup-alarm.tsx`; apaga
    `alarm-popup-snooze.tsx` só se ficar sem importador.
33. (RT-002) **src/layout/components/full-screen-notice/full-screen-notice-sheet.tsx** +
    **src/storage/full-screen-notice-storage.ts** — bottom sheet hospedado na overlay reutilizável que
    o app já tem, `SettingsSheetOverlay` (`src/layout/components/menu-settings/settings-sheet-overlay.tsx`,
    `mobile-bottom-sheet-overlay.md`), com o conteúdo vindo de `variacao-1.tsx` (não copia o bloco
    inline de overlay do protótipo): abre
    uma vez quando `fullScreen === 'denied'` e o flag "visto" não existe; o botão chama
    `openFullScreenSettings()`, "Agora não" grava o flag (AC-010). Montado no `_layout` protegido.
    Textos em `alarm-strings.ts`.
34. (RT-002, infra, pré-requisito de S10, S12 e S13) **src/services/alarm-service.web.ts** e
    **notifications-service.web.ts** — simulação só em `__DEV__`: query
    `?simular=tela-cheia-negada,notificacoes-negadas` gravada em `sessionStorage`; com ela,
    `getFullScreenPermission()` devolve `'denied'` e `getNotificationPermissionStatus()` devolve
    `'denied'`.
35. (RT-002) **src/layout/components/menu-settings/reminders-settings-section.tsx** — linha da tela
    cheia (estado e botão de liberar, AC-011), escrita dentro deste arquivo com o visual de
    `src/prototipo/alarme-tela-cheia/settings-row.tsx` como referência; nada importa de
    `src/prototipo/`, que o passo 37 apaga) e, com notificações
    negadas, o aviso de que os alarmes não tocam com o app fechado e o botão de liberar (CB-013).
    Textos em `src/layout/strings/settings-strings.ts`.
36. (infra, pré-requisito do fechamento do checkpoint 5; nenhum passo o consome) **src/core/app-versions.ts**
    (`:11`) — entrada `1.3.0` no topo descrevendo o alarme.
37. (infra, último, depois dos passos 30 e 35, que partem da Base e de `settings-row.tsx` do protótipo) **remoção do protótipo** — apaga só `app/prototipo/alarme-tela-cheia/` e
    `src/prototipo/alarme-tela-cheia/` (não versionadas; nenhum commit as inclui). As outras pastas de
    `prototipo/` ficam.

## Marcos de validação

### Marco 1 — checkpoint 2 de 5
prova: RT-001, RT-003, RT-004, RT-005, RT-013
lane: teste, codigo
provas: T15, T16, T17, T18; seções `RT-001`, `RT-004` e `RT-013` da lane codigo (com o prebuild e o
`assembleDebug` do passo 15)
motivo: todo o agendamento, a fila, as ações e a tela se apoiam nessa base nativa (lib, canal, som,
manifest). Uma incompatibilidade do notify-kit com o Expo 54 ou com o `expo-notifications`
descoberta no fim joga fora os checkpoints 3 a 5.

### Marco 2 — checkpoint 3 de 5
prova: RT-002, RT-005, RT-006, RT-010, RT-011
lane: teste
provas: T01, T02, T03, T04, T05, T09, T10, T11, T12
motivo: o shape de `FiredAlarm`, a fila e a decisão alarme × notificação são consumidos pelas ações
(checkpoint 4) e pela tela (checkpoint 5); errar aqui obriga a refazer os dois.

## Ondas
onda única

## Contratos

Domínio (`packages/domain/chat`):
```ts
type ReminderAction = { type: 'stop' | 'snooze' | 'done'; firedAt: Date; actedAt: Date }
// ReminderProps
actions?: ReminderAction[]
// application/utils/reminders.ts
appendReminderAction(props: ReminderProps, action: ReminderAction): ReminderAction[]
// AcknowledgeReminderUseCase Payload
{ ...; firedAt: Date; snoozeUntil?: Date; actedAt?: Date }
// UpdateReminderUseCase Payload
{ ...; status?: ...; now?: Date; firedAt?: Date; actedAt?: Date }
```

HTTP (server-ben, Zod e presenter):
```ts
// POST acknowledge: body
{ firedAt: string /* ISO */; snoozeUntil?: string; actedAt?: string }
// POST update: body ganha
{ firedAt?: string; actedAt?: string }
// ReminderHttp ganha
actions: { type: 'stop' | 'snooze' | 'done'; firedAt: string; actedAt: string }[] // [] se ausente
```

Mobile (`src/services/alarm-service.ts` e `.web.ts`, mesmas assinaturas):
```ts
type FullScreenPermission = 'granted' | 'denied' | 'unsupported'
type AlarmNotificationData = { reminderId: string; firedAt: string; title: string; kind: Reminder['kind'] }
ALARM_CHANNEL: { id: 'ben-alarme'; importance: HIGH; sound: 'ben_alarm'; bypassDnd: true }
ensureAlarmChannel(): Promise<void>
getFullScreenPermission(): Promise<FullScreenPermission>
openFullScreenSettings(): Promise<void>
scheduleReminderAlarm(input: AlarmNotificationData, fullScreen: FullScreenPermission): Promise<void>
cancelReminderAlarm(reminderId: string): Promise<void> // cancela `alarm:{id}` e `missed:{id}`
startAlarmSound(maxDurationMs: number): Promise<'playing' | 'blocked'>
stopAlarmSound(): Promise<void>
leaveLockScreen(): void
showMissedAlarmNotification(alarm: FiredAlarm): Promise<void>
subscribeToAlarmEvents(handler: (event: AlarmEvent) => void): () => void
registerAlarmBackgroundHandler(handler: (event: AlarmEvent) => Promise<void>): void
getInitialAlarm(): Promise<AlarmNotificationData | null>
// AlarmEvent = { type: 'delivered' | 'press' | 'stop' | 'snooze'; data: AlarmNotificationData }
```

Mobile (notificações, store, ações, storage):
```ts
syncReminderNotifications(reminders: Reminder[], fullScreen: FullScreenPermission): Promise<void>
getNotificationPermissionStatus(): Promise<'granted' | 'denied'>
type FiredAlarm = { reminderId: string; title: string; kind: Reminder['kind']; firedAt: string;
  reminder: Reminder | null; sound: 'on' | 'off' }
ALARM_SOUND_LIMIT_MS = 600000
getRemainingSoundMs(firedAt: string, now: number): number
markFired(keys: Iterable<string>): void // no store
type NotificationTap = { reminderId: string; nextFireAt: string; title: string; kind: Reminder['kind'] }
type AlarmPermissionStore = { fullScreen: FullScreenPermission; notifications: 'granted' | 'denied'; ... }
restorePendingAlarmKeys(): Promise<void>
listPendingAlarmKeys(): Promise<Set<string>> // storage, chaves `reminderId:firedAt`
selectVisiblePopup(current: FiredAlarm | null, summaryOpen: boolean): 'alarm' | 'popup' | 'summary' | null
openAlarmFromNotification(data: AlarmNotificationData): void
stopAlarm(alarm: FiredAlarm): Promise<void>
snoozeAlarm(alarm: FiredAlarm, snoozeUntil: Date | null): Promise<void> // null = actedAt + 10 min; reagenda com await getFullScreenPermission()
completeAlarm(alarm: FiredAlarm): Promise<void>
flushPendingAlarmActions(): Promise<void>
type PendingAlarmAction = { reminderId: string; type: 'stop' | 'snooze' | 'done'; firedAt: string;
  actedAt: string; snoozeUntil?: string }
```

Módulo nativo (`modules/alarm-sound/index.ts`, por `requireOptionalNativeModule`, `null` fora do
Android): `{ start(maxDurationMs: number): Promise<void>; stop(): void; leaveLockScreen(): void } | null`;
`start` agenda o `stop()` nativo depois de `maxDurationMs`. Config plugin: `applyAlarmActivityAttributes(manifest)` exportada de
`plugins/with-alarm-activity.js`.

## Fixtures
veredito: sem mecanismo
a mudar: nada

## Plano de teste
lane: browser, teste, codigo
ambiente: `pnpm dev` na raiz (sobe a API em :3333 e o Expo web em http://localhost:8081; o :8081 já está de pé nesta máquina, a API precisa estar no ar com `.env` válido). Não serve `pnpm dev:mobile` sozinho, porque sem a API não há lembretes.
estado: nenhum (não há mecanismo de fixtures). O estado de cada prova de tela é montado à mão pelo chat do Ben, antes da prova: para "um lembrete vence", diga ao Ben "me lembra de buscar o Leo na escola daqui a 1 minuto" (ou o título que a prova pede) e espere o minuto com a página aberta; para S08 e S09, crie "Revisar o contrato" para daqui a 1 minuto e "Call the dentist" para daqui a 2 minutos e recarregue a página só depois que os dois venceram; para S14 e S15, peça ao Ben um lembrete de meta e um condicional que vençam em 1 minuto; para S10, S12 e S13, abra a url com `?simular=tela-cheia-negada` ou `?simular=notificacoes-negadas` (passo 34; só em desenvolvimento).
url: http://localhost:8081/ — chat do Ben já logado pelo token de dev

### Roteiro — lane browser
S01 (PR-005; AC-003, AC-005, RT-007) [final] com um clique prévio na página, o lembrete "Buscar o Leo na escola" vence → em até 15 s a tela de alarme ocupa a tela toda, com a hora atual grande, a data, o título "Buscar o Leo na escola" num balão sem repetir o horário do compromisso, e os botões "Parar", "Soneca" e "Concluir" (referência: prototipo/v4.png)
S02 (PR-005; AC-007, AC-016) [final] o usuário toca em "Soneca" → abre a escolha da soneca em tela clara com o slider de tempo próprio no topo e, abaixo dele, as opções "10 min", "30 min", "1 h", "2 h" e "amanhã de manhã" (referência: prototipo/v4-2.png)
S03 (PR-005; AC-016) [final] o usuário arrasta o slider até o meio da faixa → o tempo mostrado muda em passos de 5 min, fica entre 5 min e 2 h, e o botão de confirmar repete a duração escolhida (referência: prototipo/v4-3.png)
S04 (PR-005; AC-007) [final] o usuário toca na opção "10 min" → a tela de alarme fecha e o chat reaparece
S05 (PR-005; AC-006) [final] outro lembrete vence e o usuário toca em "Parar" → a tela de alarme fecha e, depois de 15 s, o mesmo aviso não reabre
S06 (PR-005; AC-008) [final] outro lembrete vence e o usuário toca em "Concluir" → a tela fecha e o lembrete já não aparece na lista de lembretes do menu
S07 (PR-006; AC-003) [final] um lembrete com título longo de duas linhas vence → o balão mostra o título inteiro, sem cortar, e "Parar", "Soneca" e "Concluir" continuam visíveis (referência: prototipo/v4-4.png)
S08 (PR-006; CB-008) [final] dois lembretes vencem juntos → a tela mostra o mais antigo primeiro, com o contador "1 de 2" (referência: prototipo/v4-5.png)
S09 (PR-006; CB-008) [final] o usuário toca em "Parar" no primeiro dos dois → aparece o segundo alarme, "Call the dentist"
S10 (PR-006; AC-010) [final] com a permissão de tela cheia simulada como negada, o usuário abre o app → aparece o aviso que explica que sem liberar a tela cheia o alarme chega só como notificação, com um botão que leva à configuração e o botão "Agora não" (referência: prototipo/v4-6.png)
S11 (PR-006; CB-012, RT-007) [final] sem nenhum clique prévio na página, um lembrete vence → a tela de alarme aparece com o aviso "toque para ouvir"
S12 (PR-006; AC-011) [final] com a permissão simulada como negada, o usuário abre as configurações de lembretes → a linha da tela cheia aparece como desligada, com um botão para liberar (referência: prototipo/v4-7.png)
S13 (PR-006; CB-013) [final] com as notificações simuladas como sem permissão, o usuário abre as configurações de lembretes → aparece o aviso de que os alarmes não vão tocar com o app fechado, com um botão para liberar as notificações
S14 (PR-006; AC-012) [final] um lembrete de meta vence → abre o painel de hoje, com as mesmas opções de antes, e não a tela de alarme
S15 (PR-006; AC-012) [final] um lembrete condicional vence → abre o painel de hoje, com as mesmas opções de antes, e não a tela de alarme
S16 (PR-006; AC-015) [final] o usuário abre o menu de lembretes → a lista aparece igual à de hoje
S17 (PR-006; AC-015) [final] o usuário abre o detalhe de um lembrete → o detalhe aparece igual ao de hoje
S18 (PR-008; AC-007) [final] o usuário adia o alarme em 10 min e espera os 10 min → a tela de alarme de "Buscar o Leo na escola" volta, em tela cheia (espera real de 10 min)

### Roteiro — lane teste
comando: `pnpm test` (na raiz); por pacote `pnpm --filter @ben/mobile-ben test:unit` e `pnpm --filter @ben/domain-chat test:unit`
T01 (PR-001; AC-001, RT-002, RT-005) [marco 2] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete de horário com `nextFireAt === firesAt` e tela cheia liberada → é agendado no notify-kit com tela cheia, canal de alarme e alarme de despertador
T02 (PR-001; AC-013, CB-002, RT-002) [marco 2] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — mesmo lembrete com tela cheia negada → usa o canal `alarmes` e a notificação comum de hoje
T03 (PR-001; AC-004) [marco 2] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete cujo `nextFireAt` é um aviso antecipado (minutos antes, manhã, véspera) → fica como notificação comum
T04 (PR-001; AC-012, AC-014) [marco 2] packages/infra/mobile/ben/src/services/__tests__/notifications-service.test.ts — meta, condicional e resumo diário → continuam no canal de hoje (`alarmes` e `resumos`)
T05 (PR-001; CB-010) [marco 2] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete apagado, concluído ou com horário mudado → o disparo antigo é desagendado
T06 (PR-002; AC-006, CB-007, RT-008) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Parar sem rede → o som é silenciado antes da chamada à rede, a ação fica guardada e é reenviada quando a rede volta, sem tocar de novo
T07 (PR-002; AC-007, CB-005, CB-006, RT-012) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Soneca → o alarme local é reagendado na hora, cada nova soneca reagenda de novo, e sem rede a soneca é de 10 min
T08 (PR-002; AC-008, CB-007, RT-008) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Concluir sem rede → fecha e silencia na hora e a ação é reenviada depois
T09 (PR-003; CB-008) [marco 2] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — dois alarmes juntos → o mais antigo é o atual e, ao agir nele, o segundo aparece
T10 (PR-003; AC-005, RT-006) [marco 2] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — notificação recebida com o app aberto e a checagem de 15 s do mesmo disparo → o alarme entra uma vez só
T11 (PR-003; CB-011) [marco 2] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme com o resumo diário aberto → o alarme fica à frente do resumo
T12 (PR-003; AC-002, CB-009, RT-011) [marco 2] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme sem ação por 10 min → o som para e fica uma notificação de alarme perdido
T13 (PR-004; AC-006, AC-007, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/acknowledge-reminder.test.ts — Parar e Soneca → o lembrete guarda o horário do disparo e o instante da ação
T14 (PR-004; AC-008, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/update-reminder.test.ts — Concluir → o lembrete guarda o horário do disparo e o instante da ação, além de `completedAt`
T15 (PR-007; AC-001) [marco 1] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → declara `USE_FULL_SCREEN_INTENT` e o plugin da lib de alarme
T16 (PR-007; AC-001, AC-009, RT-003) [marco 1] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → a atividade principal abre por cima do bloqueio e acende a tela
T17 (PR-007; AC-002, CB-003, RT-004) [marco 1] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — canal de alarme → importância alta, categoria alarme, som próprio embutido e uso de áudio de alarme
T18 (PR-007; CB-004) [marco 1] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → o reagendamento no reinício está declarado
T19 (PR-007; CB-001, RT-010) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — toque na notificação comum → a tela de alarme abre sem som, com título vindo da própria notificação

### RT-001 — lane codigo
Procurar em: `git diff main -- packages/infra/mobile/ben/app.config.ts packages/infra/mobile/ben/modules/ packages/infra/mobile/ben/index.ts packages/infra/mobile/ben/src/services/alarm-service.ts`
Reprova se: alguma chave sob `ios` em `app.config.ts` muda, ou `modules/alarm-sound/expo-module.config.json` declara a plataforma `ios`, ou aparece pasta `ios/` versionada, ou `modules/alarm-sound/index.ts` carrega o módulo de forma que lança fora do Android (`requireNativeModule` sem o guard `Platform.OS === 'android'`; o esperado é `requireOptionalNativeModule`), ou alguma função exportada de `alarm-service.ts` (incluindo `registerAlarmBackgroundHandler`, chamada pelo `index.ts`) chama o notify-kit ou o módulo sem o guard `Platform.OS !== 'android'`.

### RT-004 — lane codigo
Procurar em: `packages/infra/mobile/ben/modules/alarm-sound/android/` (o `AlarmSoundModule.kt`) e
`grep -rn "alarm-sound\|react-native-notify-kit" packages/infra/mobile/ben/src packages/infra/mobile/ben/app packages/infra/mobile/ben/index.ts`
Reprova se: o `AudioAttributes` do `MediaPlayer` não usa `USAGE_ALARM`, o player não tem `isLooping = true`, `start(maxDurationMs)` não agenda um `postDelayed` que chama `stop()`, `stop()` não remove esse callback, não para e não libera o player, ou algum arquivo além de `src/services/alarm-service.ts` importa `alarm-sound` ou `react-native-notify-kit`.

### RT-011 — lane codigo
Procurar em: `packages/infra/mobile/ben/src/services/alarm-service.ts`, `index.ts`, `src/layout/components/alarm-screen/alarm-screen.tsx`
Reprova se: `scheduleReminderAlarm` não agenda, além do alarme, a notificação de perdido em `firedAt + 10 min` com id `missed:{reminderId}`; `cancelReminderAlarm` não cancela esse id; ou algum chamador de `startAlarmSound` (handler do `index.ts`, tela de alarme) não passa `getRemainingSoundMs(firedAt, …)`.

### RT-013 — lane codigo
Procurar em: `packages/infra/mobile/ben/package.json`, `src/services/alarm-service.ts` e a saída do passo 15 (prebuild, `./gradlew assembleDebug` e o manifest mesclado em `android/app/build/intermediates/merged_manifests/debug/`)
Reprova se: a dependência não é `react-native-notify-kit@10.10.0`; `scheduleReminderAlarm` não cria a notificação agendada pelo notify-kit com `alarmManager` `SET_ALARM_CLOCK`, `fullScreenAction` e as ações Parar e Soneca; o `assembleDebug` falha; ou o manifest mesclado não tem `USE_FULL_SCREEN_INTENT`, `showWhenLocked`/`turnScreenOn` na `MainActivity` e o receiver de `BOOT_COMPLETED` do notify-kit.

## Cobertura
13/13 RT · 8/8 PR · 13/13 CB
RT-001 → a seção RT-001 na lane codigo (config e guard de plataforma); T15 na lane teste (só a config Android muda)
RT-002 → T01, T02 na lane teste; S10, S12 na lane browser (permissão simulada)
RT-003 → T16 na lane teste; a seção RT-013 na lane codigo (manifest mesclado)
RT-004 → T17 na lane teste; a seção RT-004 na lane codigo; o mecanismo do `USAGE_ALARM` em `## Desvios da spec`
RT-005 → T01, T18 na lane teste; a seção RT-013 na lane codigo (`SET_ALARM_CLOCK`, receiver de reinício); S18 na lane browser
RT-006 → T10 na lane teste; a parte no aparelho em `## Desvios da spec`
RT-007 → S01, S11 na lane browser
RT-008 → T06, T07, T08 na lane teste
RT-009 → T13, T14 na lane teste
RT-010 → T19 na lane teste
RT-011 → T12 na lane teste (app na frente); a seção RT-011 e a seção RT-004 na lane codigo (segundo plano e app morto)
RT-012 → T07 na lane teste
RT-013 → a seção RT-013 na lane codigo; T15, T17 na lane teste
PR-001 → T01, T02, T03, T04, T05 na lane teste (o trecho "cada aviso vira um alarme" em `## Desvios da spec`)
PR-002 → T06, T07, T08 na lane teste
PR-003 → T09, T10, T11, T12 na lane teste
PR-004 → T13, T14 na lane teste
PR-005 → S01, S02, S03, S04, S05, S06 na lane browser (sem vídeo, ver `## Desvios da spec`)
PR-006 → S07 a S17 na lane browser
PR-007 → T15, T16, T17, T18, T19 na lane teste
PR-008 → S18 (com S01, S04, S05) na lane browser, à mão (ver `## Desvios da spec`)
CB-001 → PR-007 → T19
CB-002 → PR-001 → T02
CB-003 → PR-007 → T17 (o heads-up no aparelho em `## Desvios da spec`)
CB-004 → PR-007 → T18; a seção RT-013 na lane codigo
CB-005 → PR-002 → T07
CB-006 → PR-002 → T07
CB-007 → PR-002 → T06, T08
CB-008 → PR-003, PR-006 → T09, S08, S09
CB-009 → PR-003 → T12
CB-010 → PR-001 → T05
CB-011 → PR-003 → T11
CB-012 → PR-006 → S11
CB-013 → PR-006 → S13

## Desvios da spec
- **PR-001, "cada aviso do lembrete vira um alarme"**: contradiz AC-004, que o usuário reescreveu no
  gate. AC-004 vence: só o aviso da hora marcada (e a soneca) vira alarme, e T03 prova que o aviso
  antecipado fica como notificação comum.
- **RT-004, canal "com uso de áudio de alarme (`USAGE_ALARM`)"**: o canal do notify-kit fixa
  `USAGE_NOTIFICATION`. Pela Dúvida 1 = A, o canal novo leva som próprio e importância alta, a
  categoria alarme vai na notificação, e o `USAGE_ALARM` com loop vem do módulo `alarm-sound`
  (passo 10). Conferido por código (seção RT-004 na lane codigo), não no aparelho: que o som toca no
  silencioso não tem doc oficial nem captura nesta task.
- **PR-005, "vídeo"**: o roteiro aprovado não tem vídeo; S01 a S06 provam por passos de tela com
  captura.
- **PR-008, "teste de ponta a ponta marcado"**: o projeto não tem harness e2e. S18 (com S01, S04 e
  S05) roda à mão na lane browser, com espera real de 10 min.
- **No aparelho, sem captura (AC-001, AC-002, AC-009, CB-003, CB-004, parte de RT-006)**: o plano
  prova a config gerada (T15 a T18), o build (passo 15) e o código; o comportamento no Android real
  fica para o usuário conferir no APK.
- **RT-010, "título e horário"**: a tela mostra só o título (AC-003); o horário do disparo viaja no
  `data` da notificação para a fila e as ações, sem aparecer.

## Desvios de padrão
- passo 14 — testes ficam em `src/**/__tests__` (`vitest.config.ts` inclui só `src/**/*.test.ts`) e
  `plugins/**` tem regras de JS próprias (`eslint.config.mjs:220`) — o teste do plugin vive em
  `src/services/__tests__/alarm-native-config.test.ts` e importa `plugins/with-alarm-activity.js` por um
  `.d.ts` ao lado, porque o roteiro fixou esse caminho e o plugin precisa continuar JS para o Expo.
- passo 10 — o app não tem pasta `modules/` nem convenção para módulo nativo — cria
  `modules/alarm-sound/` porque a Dúvida 1 = A pede um módulo Expo versionado, e a pasta `android/` é
  gerada e fora do git.
- passo 22 — a entrada do app é `expo-router/entry` direto no `main` do `package.json` — passa a
  `index.ts`, porque o handler de background do notify-kit tem de ser registrado antes do router.
- passos 19 e 26 — `src/services/` guarda `{capability}-service.ts`, único importador de um SDK —
  `src/services/alarm-actions.ts` não tem sufixo nem SDK (orquestra store, serviços, storage e
  requests), porque o roteiro fixou a suíte em `src/services/__tests__/alarm-actions.test.ts`.
- passo 34 — serviço só embrulha o SDK — os `.web.ts` ganham a simulação de permissão negada, só em
  `__DEV__`, porque S10, S12 e S13 não têm outro jeito de negar permissão no web.

## Riscos
- `showWhenLocked` fixo na `MainActivity` deixa o app visível por cima do bloqueio também quando ele
  estava aberto ao travar (segurança). Mitigação candidata, fora do RT-003 como escrito: o módulo
  ligar `setShowWhenLocked` só durante o alarme.
- O som do canal e o loop do módulo podem se sobrepor por ~1 s na entrega.
- DELIVERED em background com o app morto depende do headless task do notify-kit: conferir no
  aparelho.
- Dois plugins (`expo-notifications` e notify-kit) mexem no mesmo manifest; o passo 15 é a primeira
  vez que isso compila.
- O passo 15 precisa de Android SDK e Gradle nesta máquina (WSL); sem eles o marco 1 fica só com a
  lane teste e a parte de build vira pendência declarada.
- T15 importa `app.config.ts` no vitest node: se a config ler env ou módulos de runtime, o teste
  precisa de mocks.
- A deduplicação (T10) depende de o `firedAt` do `data` da notificação ser a mesma string ISO que o
  `nextFireAt` vindo do servidor.
- `syncReminderNotifications` muda de assinatura: o único chamador (`use-alarm-scheduler.ts:49`)
  quebra no typecheck entre os passos 17 e 20, dentro do mesmo checkpoint 3.
- RT-008, corrida na reabertura: se a lista do servidor chegar antes da leitura do `AsyncStorage`
  em `restorePendingAlarmKeys`, o disparo pendente pode entrar na fila por um instante;
  `markFired` o tira e para o som (passo 18), mas a tela pode piscar.
- No Android o aviso de perdido pode vir de dois lados (agendado no passo 16 e `expireCurrent` com
  o app na frente); os dois usam o id `missed:{reminderId}`, então o segundo substitui o primeiro.

## Lista da volta 1 (revisao-plano-1.md)
- Bloqueio 1 (ação não gravada) → consertado: passos 1, 2 e 3 e `## Contratos` (`actions` entra em
  `changes` antes do `update`, helper `appendReminderAction` em `application/utils/reminders.ts`).
- Bloqueio 2 (typecheck quebrado nos checkpoints 3 e 4) → consertado: passo 18 adapta o
  `alarm-popup-overlay.tsx` ao shape novo; passo 20 enfileira o shape novo; passo 32 fica só com o
  filtro e a remoção.
- Bloqueio 3 (passo 17 usava store do passo 21) → consertado sem renumerar: o store nasce no passo
  17 e o passo 21 fica só com o hook.
- Bloqueio 4 (teto de 10 min em segundo plano) → consertado: passos 10, 13, 16, 18, 22 e 30,
  `## Contratos`, seção RT-004 e nova seção RT-011 na lane codigo.
- Bloqueio 5 (alarme atendido volta a tocar) → consertado: passos 18 (`markFired`), 25
  (`listPendingAlarmKeys`), 26 (`restorePendingAlarmKeys`), 27 e 29 (caso novo em T06).
- Bloqueio 6 (iOS quebra no import) → consertado: passos 10, 13, 16 e 22 e a seção RT-001.
- Nota 1 (overlay do aviso) → tratada no passo 33 (`SettingsSheetOverlay`).
- Nota 2 (`nextFireAt` → `firedAt`, `NotificationTap`) → tratada nos passos 17, 19 e 20.
- Nota 3 (ressincronização) → tratada nos passos 20 e 21: o efeito do sync depende de
  `[items, fullScreen]` e o hook só grava o store.
- Nota 4 (aviso de serviço no passo 34) → nada a fazer; o revisor aceitou.

## Lista da volta 2 (revisao-plano-2.md)
- Bloqueio 1 (`fullScreen` da soneca no background) → consertado: passo 26 (`snoozeAlarm` reagenda
  com `await getFullScreenPermission()`, nunca com o store), passo 28 (nota do handler), passo 29
  (T07 confere o argumento) e o comentário de `snoozeAlarm` em `## Contratos` (assinatura igual).
  Premissa nova sobre o `canUseFullScreenIntent` no headless task.
- Nota 1 (passo 35 parte de `settings-row.tsx`) → consertado: passo 35 escreve a linha dentro de
  `reminders-settings-section.tsx` e não importa de `src/prototipo/`; passo 37 cita os passos 30 e 35.
- Nota 2 (getter `actions` sem leitor) → consertado: passo 1 sem getter.
- Nota 3 (T14 sem o caso `status: 'active'` + `firedAt`) → consertado: passo 4 ganha o caso.
- Premissa do `requireOptionalNativeModule` → atualizada como fechada pelo revisor.
- `## Cobertura` sem mudança: T07 e T14 já cobriam RT-012 e RT-009.

## Premissas
- **Dúvida 1 = A** (assumida pelo orquestrador): notify-kit agenda, abre a tela cheia, reagenda no
  reinício e dá as ações; um módulo Expo próprio toca o som em loop com `USAGE_ALARM`, iniciado pela
  tela de alarme (e pelo DELIVERED em background) e parado por Parar, Soneca, Concluir e pelo teto.
- AC-004 prevalece sobre PR-001.
- RT-010: a tela mostra só o título; o horário é dado de agendamento.
- `actions` é opcional e não tem migration: o repositório SQLite guarda e reidrata `Date` em
  profundidade, e as linhas antigas ficam sem o campo (`[]` no presenter). Não há passo de schema.
- `react-native-notify-kit@10.10.0` tem config plugin Expo e receiver de reinício próprio (conferido
  no reconhecimento); `RECEIVE_BOOT_COMPLETED` é declarado também no `app.config.ts` para o T18 ter o
  que ler.
- A pasta `modules/` autolinka no Expo 54 sem configuração extra.
- Soneca tocada na própria notificação (sem a tela) é de 10 min: a notificação não tem as opções do
  servidor.
- A notificação comum de lembrete passa a levar `title` e `kind` no `data` (RT-010, CB-001).
- O canal novo é `ben-alarme`; o `alarmes` de hoje continua para avisos antecipados, meta,
  condicional e tela cheia negada.
- A simulação de permissão negada é só de desenvolvimento, por query `?simular=` guardada em
  `sessionStorage`.
- O som `ben_alarm.wav` é escolhido pelo implementador entre sons de licença livre.
- Os títulos de S08 ("Revisar o contrato" e "Call the dentist") e o modo de montar o estado pelo chat
  são escolha do plano: o roteiro não fixa o primeiro título.
- Commit ao fim de cada checkpoint, como pede o `CLAUDE.md`.
- `requireOptionalNativeModule` existe no `expo-modules-core` do Expo 54: fechada pelo revisor na
  rodada 2 (`node_modules/expo-modules-core` 3.0.30, `src/requireNativeModule.ts:32`, workspace
  `nodeLinker: hoisted`). O caminho alternativo com `requireNativeModule` não será preciso.
- `getFullScreenPermission()` se apoia no `canUseFullScreenIntent` do notify-kit
  (`FullScreenIntentUtils.java:34`, conferido no reconhecimento), uma consulta ao sistema que
  assumo funcionar no headless task do handler de background, sem atividade nem árvore React (base
  do conserto da volta 2 no passo 26; não li o corpo do método). Se no aparelho falhar ali, o efeito é a soneca da notificação voltar como heads-up, não
  em tela cheia; conferir no APK.
- O import de `react-native-notify-kit` no iOS não lança (a lib também suporta iOS); o que muda o
  comportamento no iOS é só chamar a lib, e isso fica atrás do guard `Platform.OS`.
- O notify-kit substitui uma notificação (agendada ou exibida) que recebe o mesmo id; é nisso que
  se apoiam o `missed:{reminderId}` e a soneca que reagenda `alarm:{reminderId}`.
- O teto conta a partir de `firedAt` (por disparo), não do início do som: o app aberto 3 min
  depois toca no máximo 7 min.
