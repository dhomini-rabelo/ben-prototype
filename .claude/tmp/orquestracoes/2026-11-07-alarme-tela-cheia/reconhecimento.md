# Reconhecimento — alarme em tela cheia com som para lembretes de horário

## Estado atual
veredito: confirma
Tudo o que a spec supõe bate com o código: um canal `alarmes` HIGH sem som próprio, uma notificação local por lembrete no `nextFireAt` (identificador = id do lembrete), painel pequeno por checagem de 15 s, acknowledge que guarda só `acknowledgedUntil`, e `USE_EXACT_ALARM` já declarado.

## Unidade afetada
mais de uma: `packages/infra/mobile/ben` (principal: nativo, tela, serviço de notificação, fila) e, só para RT-009, `packages/domain/chat` + `packages/infra/server-ben`. Slider de soneca (AC-016) e soneca offline não exigem mudança de rota no servidor (ver Mapa).

## Lane de cada RT e PR
- RT-001 → codigo — `packages/infra/mobile/ben/app.config.ts` (permissões/plugins só em `android`), `eas.json`; o revisor confere que nada de `ios` mudou.
- RT-002 → teste — T01, T02 (checagem e reagendamento conforme a permissão) + codigo em `app.config.ts` (permissão `USE_FULL_SCREEN_INTENT`).
- RT-003 → teste — T15, T16 (config plugin gerado); a prova de que acende a tela de verdade é só em aparelho, fora do que a run alcança (ver Premissas).
- RT-004 → teste — T17 (configuração do canal e do som) + codigo no módulo/plugin nativo; ligada à Dúvida 1.
- RT-005 → teste — T01, T18 (alarme exato e reagendamento no reinício).
- RT-006 → teste — T10 (notificação recebida com o app aberto não abre o alarme duas vezes e só um som).
- RT-007 → browser — S11 (aviso "toque para ouvir" na web sem clique prévio) e S01 (com clique).
- RT-008 → teste — T06, T07, T08.
- RT-009 → teste — T13, T14 (suítes do domínio).
- RT-010 → teste — T19 (alarme aberto pela notificação mostra título sem esperar a rede).
- RT-011 → teste — T12.
- RT-012 → teste — T07 (soneca de 10 min offline); opções do servidor continuam em `get-snooze-options.test.ts` (já existe).
- RT-013 → codigo — `packages/infra/mobile/ben/package.json` (dependência `react-native-notify-kit`) e `app.config.ts` (plugin).
- PR-001 → teste — `packages/infra/mobile/ben/src/services/__tests__/notifications-service.test.ts` (existente, estender) e novo `alarm-scheduling.test.ts` na mesma pasta; `pnpm --filter @ben/mobile-ben test:unit`.
- PR-002 → teste — novo `src/services/__tests__/alarm-actions.test.ts`; `pnpm --filter @ben/mobile-ben test:unit`.
- PR-003 → teste — novo `src/layout/stores/__tests__/alarm-store.test.ts`; mesmo comando.
- PR-004 → teste — `packages/domain/chat/src/application/use-cases/reminders/__tests__/acknowledge-reminder.test.ts` e `update-reminder.test.ts` (existentes, estender); `pnpm --filter @ben/domain-chat test:unit`.
- PR-005 → browser — http://localhost:8081/ (login automático pelo token de dev).
- PR-006 → browser — http://localhost:8081/ (menu e configurações) com simulação da permissão (ver Armadilhas).
- PR-007 → teste — novo `packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts` que importa o config plugin; `pnpm --filter @ben/mobile-ben test:unit`.
- PR-008 → browser — http://localhost:8081/ (ver RT problemáticos: o "ponta a ponta" como suíte não existe; vira S18).

## RT problemáticos
- RT-004 + RT-013 não se cumprem juntos como escritos: o canal do notify-kit fixa `USAGE_NOTIFICATION` (`react-native-notify-kit@10.10.0/android/src/main/java/app/notifee/core/ChannelManager.java:78`) e a lib inteira não tem `USAGE_ALARM`; `loopSound` só liga `FLAG_INSISTENT` sobre esse som, que o modo silencioso corta. Ver Dúvida 1.
- AC-004 diz que só o aviso da hora marcada vira alarme; PR-001 diz "cada aviso do lembrete vira um alarme". Premissa: AC-004 (aprovada no gate) manda; ver Premissas.
- PR-008 (marcada "ponta a ponta"): o app não tem harness e2e (o vitest do app é ambiente node, só `.ts`, sem Playwright). Atribuída a `browser` (S18, o trecho que PR-005 ainda não cobre: o alarme voltar depois da soneca); o resto do fluxo já está em S01 a S05.
- PR-006 e AC-010/AC-011/CB-013 pedem "permissão simulada como negada" no web: o serviço de notificações do web é no-op (`notifications-service.web.ts`) e hoje não há simulação nenhuma. Precisa nascer no plano (ver Armadilhas).
- AC-009 (celular volta ao bloqueio) e AC-001/CB-004 em aparelho real: sem emulador ou aparelho conferido, só dá para provar a configuração gerada (T15 a T18) e o diff; marcar `(sem captura)` como a spec já faz.

## Mapa do código
- [packages/infra/mobile/ben/src/services/notifications-service.ts:114](packages/infra/mobile/ben/src/services/notifications-service.ts#L114) — `scheduleReminderNotification`: uma notificação de data por lembrete no `nextFireAt` (canal `alarmes`); é onde nasce o novo agendamento do alarme. `syncReminderNotifications` (:150) reagenda tudo e cancela o resto, menos o resumo; `subscribeToNotificationTaps` (:224) entrega `{reminderId, nextFireAt}`.
- [packages/infra/mobile/ben/src/services/notifications-service.ts:44](packages/infra/mobile/ben/src/services/notifications-service.ts#L44) — `ensureAndroidChannels`: cria `alarmes` e `resumos` e apaga o canal `default`. O canal de alarme novo precisa de id novo (canal Android não troca som depois de criado).
- `packages/infra/mobile/ben/src/services/notifications-service.web.ts` — no-op no web; o alarme no web vem só do overlay.
- [packages/infra/mobile/ben/src/layout/hooks/use-alarm-scheduler.ts:13](packages/infra/mobile/ben/src/layout/hooks/use-alarm-scheduler.ts#L13) — checagem de 15 s (`CHECK_INTERVAL_MS`), enfileira `{reminder, firedAt: nextFireAt}` e trata o toque na notificação. Aqui entra o evento de primeiro plano do notify-kit (RT-006).
- `packages/infra/mobile/ben/src/layout/stores/alarm-store.ts` — fila Zustand, `firedKeys` (`id:firedAt`) evita repetição, `current = queue[0]` (mais antigo primeiro: CB-008 já é o comportamento); sem teste hoje.
- [packages/infra/mobile/ben/src/layout/components/alarm-popup/alarm-popup-overlay.tsx:21](packages/infra/mobile/ben/src/layout/components/alarm-popup/alarm-popup-overlay.tsx#L21) — `resolveAcknowledgedAt` já manda `max(firedAt, agora do aparelho)` como `firedAt` do acknowledge (o instante da ação já viaja, mas se confunde com o disparo); linhas 52-90 mapeiam Parar = acknowledge sem soneca, Soneca = acknowledge com `snoozeUntil`, Concluir = update `status: done`; `isSummaryOpen` (:139) esconde o alarme atrás do resumo (CB-011 pede o contrário).
- `packages/infra/mobile/ben/src/layout/components/alarm-popup/alarm-popup-{alarm,snooze,goal,conditional}.tsx` — painéis de hoje; goal e conditional ficam (AC-012). `alarm-popup-snooze.tsx` chama `requestSnoozeOptions` (src/api/requests/reminders.ts:83).
- `packages/infra/mobile/ben/src/api/requests/reminders.ts:59,71` — `requestUpdateReminder`, `requestAcknowledgeReminder`; é onde a fila de ações pendentes (RT-008) reenvia.
- `packages/infra/mobile/ben/src/layout/strings/alarm-strings.ts` — dicionário `Localized` de alarme (opções de soneca); ganha os textos novos (Parar, Soneca, Concluir, slider, "toque para ouvir", aviso de liberar).
- `packages/infra/mobile/ben/src/layout/components/menu-settings/reminders-settings-section.tsx:29` — seção real de lembretes; recebe a linha de tela cheia e o aviso de notificações (AC-011, CB-013).
- `packages/infra/mobile/ben/app/(protected)/_layout.tsx:15` — monta `useAlarmScheduler`, `DailySummaryPopup` e `AlarmPopupOverlay`; a tela de alarme entra aqui, acima do resumo.
- [packages/infra/mobile/ben/app.config.ts:24](packages/infra/mobile/ben/app.config.ts#L24) — `permissions` do Android (hoje `RECORD_AUDIO`, `USE_EXACT_ALARM`) e `plugins` (expo-notifications com ícone; `./plugins/with-release-signing`). `plugins/with-release-signing.js` é o modelo de config plugin do repo (usa `withAppBuildGradle`).
- `packages/infra/mobile/ben/vitest.config.ts` — `include: ['src/**/*.test.ts']`, ambiente node: teste do config plugin (`plugins/*.js`) só roda se o plugin ficar importável de dentro de `src/` ou o include for ampliado.
- `packages/infra/mobile/ben/src/core/app-versions.ts:11` — `APP_VERSIONS`; entrada nova no topo define a versão do Expo (`app.config.ts` lê `CURRENT_APP_VERSION`).
- [packages/domain/chat/src/application/use-cases/reminders/acknowledge-reminder.ts:25](packages/domain/chat/src/application/use-cases/reminders/acknowledge-reminder.ts#L25) — aceita `snoozeUntil` qualquer instante depois de `firedAt` (só rejeita `SNOOZE_BEFORE_FIRED_AT`): a soneca livre do slider (5 min a 2 h) já funciona sem mudar rota, Zod nem use case; o corpo Zod está em `packages/infra/server-ben/src/routes/reminders/acknowledge-reminder.ts:14` (`firedAt`, `snoozeUntil` opcional).
- `packages/domain/chat/src/application/use-cases/reminders/update-reminder.ts:62` — `status: 'done'` grava `completedAt`; sem `firedAt`. É onde o Concluir ganharia o registro (RT-009).
- `packages/domain/chat/src/enterprise/entities/reminder.ts:11` — `ReminderProps`; campo novo de registro de ação entra aqui. `packages/infra/db/prisma/schema.prisma:28` guarda `props` como texto JSON: sem migration. `packages/infra/server-ben/src/presenters/reminder-presenter.ts` expõe os campos (derivado de `ReminderProps`).
- `packages/domain/chat/src/application/utils/reminders.ts:207` — `computeNextFireAt`: `nextFireAt` é o próximo instante entre os alertas (`listAlertInstants`) e `snoozedUntil`. O cliente identifica "hora marcada" quando `nextFireAt === firesAt`, e a soneca quando `nextFireAt === snoozedUntil`; os demais instantes são avisos antecipados (AC-004).
- Notify-kit 10.10.0 (conferido no tarball do npm): `android/src/main/AndroidManifest.xml` declara `RECEIVE_BOOT_COMPLETED`, `SCHEDULE_EXACT_ALARM`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`, e a `FullScreenNotificationActivity` (NoDisplay, `showWhenLocked`, `turnScreenOn`) que abre a `launchActivity` do app; `FullScreenIntentUtils.canUseFullScreenIntent` (android/.../utility/FullScreenIntentUtils.java:34) cobre o Android 14+; gatilho com `AlarmType.SET_ALARM_CLOCK` existe (src/types/Trigger.ts:69); `RebootBroadcastReceiver` reagenda no reinício.
- Protótipo a imitar visualmente (`prototipo.md › Escolha › Base`): `packages/infra/mobile/ben/src/prototipo/alarme-tela-cheia/variacao-4.tsx` (tela), `variacao-1.tsx` (Glow, aviso de liberar, linha de configurações), `duration-slider.tsx`, `strings-v4.ts`, `strings.ts`, `parts.tsx`, `shared.tsx`, `settings-row.tsx`, `data.ts`, `variation-types.ts`; rota `packages/infra/mobile/ben/app/prototipo/alarme-tela-cheia/v4.tsx`. O último passo do plano remove `packages/infra/mobile/ben/app/prototipo/` e `packages/infra/mobile/ben/src/prototipo/` (git mostra as duas pastas como `??`).

## Padrão da vizinhança
Serviço de plataforma em `src/services/*.ts` com par `.web.ts` no-op e teste em `src/services/__tests__/` que mocka `expo-notifications`, `expo-constants` e `react-native` com `vi.hoisted` (ver `notifications-service.test.ts`, 309 linhas). Estado de tela em stores Zustand em `src/layout/stores/`; lógica pura em `.ts` para ser testável (o vitest do app é node, sem componentes). Textos por dicionário `Localized` com `useStrings`/`getStrings`. Config nativo por config plugin em `plugins/*.js` (`with-release-signing.js`). Use cases de domínio com teste ao lado e props em JSON.

## Reuso disponível
- `useAlarmStore` (fila, deduplicação por `id:firedAt`, ordem mais antigo primeiro) e `getFiredKey`.
- `requestAcknowledgeReminder`, `requestUpdateReminder`, `requestSnoozeOptions` e `alarmStrings.snoozeOptions`.
- `AcknowledgeReminderUseCase` já aceita soneca livre (slider sem mudança de servidor); `listSnoozeOptions` segue para a lista.
- Protótipo V4 completo (tela, slider com `PanResponder`, bottom sheet de liberar, linha de configurações) como ponto de partida visual.
- `@react-native-community/netinfo` já é dependência (detectar rede ao reenviar ações), `expo-audio` já é dependência (som no web e no overlay), `AsyncStorage` (fila de ações pendentes e preferências).

## Memórias que se aplicam
- .claude/memory/business-rules/razao-de-negocio-e-casos-de-uso-v1.md — desatualizada frente ao código ("sem OS notification / alarmes mockados"); não usar como estado atual.
- As demais categorias de memória estão vazias.

## Fixtures
veredito: sem mecanismo
estado: nenhum
a mudar: nada

## Roteiro de comprovação
ambiente: `pnpm dev` na raiz (sobe a API em :3333 e o Expo web em http://localhost:8081; o :8081 já está de pé nesta máquina, a API precisa estar no ar com `.env` válido). Não serve `pnpm dev:mobile` sozinho, porque sem a API não há lembretes.
estado: nenhum (não há mecanismo; o estado é montado no passo do plano: um lembrete de horário que vence em 1 minuto, criado pelo chat do Ben, e dois lembretes para a fila; ver Armadilhas)
url: http://localhost:8081/ — chat do Ben já logado pelo token de dev

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

comando: `pnpm test` (na raiz); por pacote `pnpm --filter @ben/mobile-ben test:unit` e `pnpm --filter @ben/domain-chat test:unit`
T01 (PR-001; AC-001, RT-002, RT-005) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete de horário com `nextFireAt === firesAt` e tela cheia liberada → é agendado no notify-kit com tela cheia, canal de alarme e alarme de despertador
T02 (PR-001; AC-013, CB-002, RT-002) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — mesmo lembrete com tela cheia negada → usa o canal `alarmes` e a notificação comum de hoje
T03 (PR-001; AC-004) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete cujo `nextFireAt` é um aviso antecipado (minutos antes, manhã, véspera) → fica como notificação comum
T04 (PR-001; AC-012, AC-014) [final] packages/infra/mobile/ben/src/services/__tests__/notifications-service.test.ts — meta, condicional e resumo diário → continuam no canal de hoje (`alarmes` e `resumos`)
T05 (PR-001; CB-010) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-scheduling.test.ts — lembrete apagado, concluído ou com horário mudado → o disparo antigo é desagendado
T06 (PR-002; AC-006, CB-007) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Parar sem rede → o som é silenciado antes da chamada à rede, a ação fica guardada e é reenviada quando a rede volta, sem tocar de novo
T07 (PR-002; AC-007, CB-005, CB-006, RT-012) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Soneca → o alarme local é reagendado na hora, cada nova soneca reagenda de novo, e sem rede a soneca é de 10 min
T08 (PR-002; AC-008, CB-007) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — Concluir sem rede → fecha e silencia na hora e a ação é reenviada depois
T09 (PR-003; CB-008) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — dois alarmes juntos → o mais antigo é o atual e, ao agir nele, o segundo aparece
T10 (PR-003; AC-005, RT-006) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — notificação recebida com o app aberto e a checagem de 15 s do mesmo disparo → o alarme entra uma vez só
T11 (PR-003; CB-011) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme com o resumo diário aberto → o alarme fica à frente do resumo
T12 (PR-003; AC-002, CB-009, RT-011) [final] packages/infra/mobile/ben/src/layout/stores/__tests__/alarm-store.test.ts — alarme sem ação por 10 min → o som para e fica uma notificação de alarme perdido
T13 (PR-004; AC-006, AC-007, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/acknowledge-reminder.test.ts — Parar e Soneca → o lembrete guarda o horário do disparo e o instante da ação
T14 (PR-004; AC-008, RT-009) [final] packages/domain/chat/src/application/use-cases/reminders/__tests__/update-reminder.test.ts — Concluir → o lembrete guarda o horário do disparo e o instante da ação, além de `completedAt`
T15 (PR-007; AC-001) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → declara `USE_FULL_SCREEN_INTENT` e o plugin da lib de alarme
T16 (PR-007; AC-001, AC-009) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → a atividade principal abre por cima do bloqueio e acende a tela
T17 (PR-007; AC-002, CB-003) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — canal de alarme → importância alta, categoria alarme, som próprio embutido e uso de áudio de alarme
T18 (PR-007; CB-004) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-native-config.test.ts — config gerada → o reagendamento no reinício está declarado
T19 (PR-007; CB-001, RT-010) [final] packages/infra/mobile/ben/src/services/__tests__/alarm-actions.test.ts — toque na notificação comum → a tela de alarme abre sem som, com título vindo da própria notificação

## Armadilhas
- Som no silencioso: ver Dúvida 1. Com notify-kit puro, o loop vem de `FLAG_INSISTENT` sobre som de canal `USAGE_NOTIFICATION`, que o modo silencioso corta; marcar RT-004 como cumprido com isso seria falso.
- A `MainActivity` gerada precisa de `showWhenLocked` e `turnScreenOn` por config plugin (`android/` é ignorado pelo git). A `FullScreenNotificationActivity` do notify-kit já os tem, mas é só um atalho NoDisplay que abre a `launchActivity`; sem o plugin a tela abre atrás do bloqueio e o celular segue apagado (RT-003).
- Uma notificação por lembrete: o servidor devolve só o próximo `nextFireAt`. O "hora marcada" é `nextFireAt === firesAt`; a soneca é `nextFireAt === snoozedUntil`. Depois de Parar offline o próximo aviso só é reagendado quando a lista volta, por isso a ação local precisa reagendar sozinha (RT-008).
- Parar/Soneca/Concluir com o app morto: o evento do notify-kit chega por handler em segundo plano, que precisa estar registrado na entrada do app (`expo-router/entry`), antes de qualquer tela. Sem isso a ação se perde.
- `resolveAcknowledgedAt` hoje manda `max(firedAt, agora)` no campo `firedAt`; ao registrar o instante da ação (RT-009) o instante real e o disparo precisam ir em campos separados, e o instante vem do aparelho (reenvio offline não pode usar a hora do servidor, ou o sinal de 5 min mente).
- O web não tem simulação de permissão. A prova S10, S12 e S13 pede um comutador só de desenvolvimento (por exemplo, parâmetro de URL lido apenas no web e em `__DEV__`), que o plano precisa criar e documentar.
- Montar o estado: não existe rota para criar lembrete; nascem pelo chat/agente. `POST /reminders/:id/update` aceita `remindAt` e recalcula `nextFireAt`, serve para trazer um lembrete existente para "daqui a 1 min". Autoplay do web: S01 exige clique antes; S11 exige não clicar. S18 tem espera real de 10 min.
- O vitest do app só inclui `src/**/*.test.ts` em ambiente node: teste de config plugin (`plugins/*.js`) e de tela não roda sem ampliar `include` ou deixar a lógica em `.ts` dentro de `src/`.
- Compatibilidade, o que foi e o que não foi conferido: `react-native-notify-kit@10.10.0` (publicada em 2026-10-28; peer deps `expo: *` e `react-native >=0.73`; plugin para Expo CNG; Expo Go não suportado) cabe no RN 0.81.5 e no SDK 54 pelos metadados. Não foi rodado `expo prebuild` nem gradle aqui: a conferência de verdade (os dois plugins juntos, `expo-notifications` e notify-kit, no mesmo manifest, sem conflito de permissões nem receivers) é passo do plano com `pnpm --filter @ben/mobile-ben android:prebuild` e `assembleDebug`. Cada lib usa ids de canal próprios; `expo-notifications` continua para token de push, resumo diário e avisos antecipados.
- Troca de canal: `alarmes` hoje não muda de som depois de criado; o alarme novo usa canal de id novo, e `ensureAndroidChannels` não pode apagá-lo.
- O último passo do plano remove as duas pastas de protótipo e põe uma entrada nova em `APP_VERSIONS`.

## Dúvidas
- O som no silencioso (RT-004) conflita com o notify-kit (RT-013): a lib fixa `USAGE_NOTIFICATION` no som do canal e não tem `USAGE_ALARM`, então `loopSound` não toca no silencioso. Como entregar o som de alarme? — candidatas: (A) notify-kit para agendar, tela cheia, reinício e ações + um módulo Expo pequeno e versionado no repositório que toca o som em loop com `USAGE_ALARM` (iniciado pela tela de alarme, parado por Parar/Soneca/Concluir, com o teto de 10 min) | (B) só notify-kit com `loopSound`: não exige código nativo próprio, mas no silencioso e no vibrar o alarme é mudo (AC-002 cumprido só com o volume de notificação ligado) | (C) módulo nativo próprio completo, sem notify-kit (reabre a escolha do gate e o custo). Recomendo: A, porque preserva a escolha do usuário pelo notify-kit e é o único caminho que garante o silencioso.

## Premissas
- AC-004 vale como escrita: só o aviso da hora marcada (e a soneca dele) toca como alarme em tela cheia; avisos antecipados ficam como notificação comum. A frase "cada aviso do lembrete vira um alarme" de PR-001 é lida como "cada notificação agendada"; o teste T03 cobre a diferença.
- RT-009 (como registrar): o acknowledge ganha o instante da ação (campo do corpo, vindo do aparelho) e o `update` com `status: done` ganha o `firedAt` e o instante; o domínio guarda uma lista de ações no `props` do lembrete (JSON, sem migration). Não é rota nova: reaproveita `/reminders/:id/acknowledge` e `/reminders/:id/update`. O servidor muda, mas o contrato é só acréscimo de campos opcionais; isso cruza unidades (mobile + domain-chat + server-ben).
- Soneca livre (AC-016): o servidor já aceita qualquer `snoozeUntil` depois de `firedAt`; nenhuma rota, Zod nem use case muda por causa do slider. O mobile limita a faixa a 5 min a 2 h em passos de 5.
- Local do registro (RT-009): no domínio de chat, junto de `acknowledgedUntil`/`completedAt`, porque é lá que o acknowledge já mora e `ReminderPresenter` já deriva de `ReminderProps`.
- "Horário" em RT-010 é dado de agendamento (`firesAt`), não texto da tela; a tela mostra só o título (AC-003). O título vai nos dados da notificação.
- Sem aparelho nem emulador Android conferido nesta máquina: AC-001, AC-009 e CB-004 em aparelho real ficam sem captura, como a spec já marca.
- Prova de tela no web: Expo web :8081 com a biblioteca `playwright` e o Chrome local em 390x844 (o Playwright MCP pode não existir); prints de referência em `prototipo/v4*.png` da pasta da run.
- `expo-notifications` continua para push remoto, resumo diário, avisos antecipados e permissão geral; notify-kit cuida só do alarme da hora marcada (decisão do reconhecimento, não da spec).

veredito: complexa
