# Escopo mobile-notificacoes — canais, permissão, cold start, push no app, testes e checklist

Raiz: `/home/fael/so/repos/ben-prototype`. `M` = `packages/infra/mobile/ben`. Git: branch `fix/notificacoes`, base `6e631f5` (mais os commits do escopo backend-push). Não commite.

## Decisões vinculantes

Canais `alarmes` (HIGH, nome "Reminders") e `resumos` (DEFAULT, nome "Daily summary"); `USE_EXACT_ALARM`; notes continuam no body (não mexer em `notifications-service.ts:64`); `google-services.json` fica versionado, só adicionar `android.googleServicesFile`. Rotas do backend: `POST /push-devices/register` body `{ token }` → `201|200 { item }`; `POST /push-devices/test` → `200 { item: { sentCount, removedCount } }`. O mobile não importa domínio: tipos próprios em `M/src/api/models/`.

## Contrato

1. `M/src/services/notifications-service.ts`:
   - Troque `ANDROID_CHANNEL_ID` (:6) por `NOTIFICATION_CHANNELS` (`as const`) + `Record<NotificationChannelId, …>` com nome e importância; `ensureAndroidChannels()` (:18-26) cria os dois e apaga o legado `default`.
   - `channelId` no trigger do lembrete (:67-70, `alarmes`) e do resumo diário (:125-129, `resumos`).
   - `requestNotificationPermission` (:40-50) garante os canais antes de consultar/pedir permissão e memoriza a promise no módulo (boot e registro do token não abrem dois prompts).
   - `subscribeToNotificationTaps` (:142-158): ao assinar, lê `Notifications.getLastNotificationResponse()`, despacha se tiver `reminderId`/`nextFireAt` e chama `clearLastNotificationResponse()`; dedup por `request.identifier` + `notification.date` entre cold start e listener.
   - Nova `getExpoPushToken(): Promise<string | null>`: só Android; `null` sem permissão concedida, sem `projectId` (`Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId`) ou em qualquer exceção. Sem `expo-device`.
2. `M/src/services/notifications-service.web.ts`: no-op de toda função exportada nova, mesmas assinaturas (`getExpoPushToken` → `null`).
3. `M/src/api/routes.ts`: `pushDevices: { register: '/push-devices/register', test: '/push-devices/test' }`. `M/src/api/models/push-device.ts` (tipos da resposta) e `M/src/api/requests/push-devices.ts` com `requestRegisterPushDevice(token)` e `requestSendTestPush()` (molde: `M/src/api/requests/reminders.ts`).
4. `M/src/layout/hooks/use-push-device-registration.ts`: com `userId` (de `useAuthStore`), `await requestNotificationPermission()` → `getExpoPushToken()` → `requestRegisterPushDevice`; falha silenciosa. Monte-o ao lado de `useAlarmScheduler()` (ache o chamador com grep).
5. `M/app.config.ts`: `android.permission.USE_EXACT_ALARM` em `android.permissions` (:22-31, hoje só RECORD_AUDIO) e `android.googleServicesFile: './google-services.json'`. Não toque em `M/android/`.
6. Vitest no mobile: `vitest` `^3.2.7` em devDependencies, `M/vitest.config.ts` com alias `@` → `src` e mocks (`vi.mock`) de `expo-notifications`, `expo-constants`, `react-native`; script `"test:unit": "vitest run --config vitest.config.ts"`; `pnpm install` na raiz. Teste em `M/src/services/__tests__/notifications-service.test.ts`, um caso por comportamento: canais criados antes da permissão; legado `default` apagado; lembrete agendado com `channelId: 'alarmes'`; resumo com `'resumos'`; permissão memorizada (um prompt só); cold start despacha e limpa; dados sem `reminderId` não despacham; tap duplicado despacha uma vez; `getExpoPushToken` devolve token, e `null` fora do Android, sem permissão, sem projectId e quando a lib lança.
7. Botão de push de teste (PROVISÓRIO, depende da resposta do usuário à Q1; se vier outra decisão, o orquestrador avisa): em `M/src/layout/components/menu-settings/reminders-settings-section.tsx`, ação "Send test notification" que chama `requestSendTestPush()` e mostra "Sent to N device(s)" ou erro. Siga o visual da própria seção.
8. Escreva `/home/fael/so/repos/ben-prototype/.claude/tasks/2026-10-30_notificacoes-correcoes/checklist-externo.md` (passos numerados, sem executar nada): (1) Firebase `test-ben-1e234`: app Android `com.benprototype.app` existe e Cloud Messaging API (V1) ativa; (2) gerar chave de conta de serviço FCM v1 e subir em `eas credentials` (Android, projeto `ba75dfd9-8220-4674-bb35-a7f9c812bb99`, owner `dhomini07`); (3) opcional: token de acesso Expo em `EXPO_ACCESS_TOKEN` no env do deploy de ben.df07.site, só se "enhanced push security" estiver ligado; (4) deploy do server com a migration (o Dockerfile roda `migrate:deploy` no start); (5) rebuild do APK (sem expo-updates, as correções só chegam com APK novo); (6) disparar o push de teste pelo meio decidido na Q1 e conferir com o app aberto e em segundo plano; (7) conferir em Configurações do Android os canais "Reminders"/"Daily summary" e o acesso a alarmes exatos.

## Convenções (caminhos em `.claude/skills/`)

`code-get-coding-designs/designs/{mobile-services-layer-structure,api-client-structure}.md`; `code-write-code/general-coding-practices.md`; `code-write-code/coding-patterns/{automated-testing,lint,general-code-preferences}.md`; `code-write-code/coding-patterns/frontend/{frontend-code-preferences,react-components}.md`.

## Não quebrar

`M/src/core/auth-bootstrap.ts:28` (continua chamando `requestNotificationPermission`); `M/src/layout/hooks/use-alarm-scheduler.ts:6-9,49,56-71` (assinaturas de `syncReminderNotifications` e `subscribeToNotificationTaps` e o formato `NotificationTap`); `M/src/layout/hooks/use-daily-summary.ts` (schedule/cancel do resumo); `syncReminderNotifications` preservando `DAILY_SUMMARY_ID`.

## Arquivos seus

Tudo em `packages/infra/mobile/ben` listado acima, `pnpm-lock.yaml` e `checklist-externo.md`. Não toque no backend.

## Aceite

- `pnpm --filter @ben/mobile-ben typecheck`, `pnpm typecheck`, `pnpm lint` e `pnpm test` (que passa a incluir o `test:unit` do mobile) passam.
- Itens 1-8 entregues; `.web.ts` com as mesmas exportações do `.ts`.
