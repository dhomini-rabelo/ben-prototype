APPROVED_WITH_RESALVAS

# Review r1 — notificacoes-correcoes (diff 484e620..HEAD: c2598f9 backend-push, a58657a mobile-notificacoes)

## Completude (critérios de aceite e decisões vinculantes)
- Todos os `scheduleNotificationAsync` levam `channelId`: lembrete `alarmes` (notifications-service.ts:132), resumo `resumos` (:192). OK.
- Canais criados antes da permissão: `resolveNotificationPermission` chama `ensureAndroidChannels` antes de `getPermissionsAsync`/`requestPermissionsAsync` (:69-70); legado `default` apagado (:54). Canais HIGH/DEFAULT com nomes "Reminders"/"Daily summary". OK.
- Cold start: `getLastNotificationResponse` + `clearLastNotificationResponse` depois do listener, dedupe por `identifier:date` (:206-237). `useAlarmScheduler` busca os lembretes no próprio onTap, então o despacho no subscribe não depende de dados carregados. OK.
- app.config.ts: `android.permission.USE_EXACT_ALARM` + `googleServicesFile`. OK. Body com notes (:64 original) intocado.
- Token registrado após login: `usePushDeviceRegistration` montado em `app/(protected)/_layout.tsx` ao lado de `useAlarmScheduler`, keyed por `userId` (troca de usuário re-registra e transfere). OK.
- `.web.ts` exporta exatamente as mesmas funções do `.ts` (inclui `getExpoPushToken` → null). OK.
- Migration SQL coerente com o modelo Prisma `PushDevice` (`push_devices`, id/props/types TEXT), igual ao molde. OK.
- Transferência de token entre usuários: `RegisterPushDeviceUseCase` acha por token e atualiza `userId`; testado. OK.
- `requestNotificationPermission` memoriza a promise e zera em falha; o hook de registro captura erro; o boot já marca `isReady` antes. OK.
- REST: `/push-devices/register` (201/200, `{item}` sem userId via presenter) e `/push-devices/test` (200 `{item:{sentCount,removedCount}}`), ambos com `authMiddleware` antes do `errorHandler`. OK.
- Testes: RegisterPushDevice (3 ramos), SendUserPushNotification (3 ramos), mobile notifications-service.test.ts cobre todos os casos do contrato. Botão "Send test notification" em Reminders. checklist-externo.md com os 7 passos. OK.

## Ressalvas (não bloqueiam)
1. packages/infra/mobile/ben/src/services/notifications-service.ts:82-90 — o resultado memorizado nunca é renovado: se o primeiro pedido der `false`, a sessão inteira devolve `false` mesmo após o usuário conceder nas Configurações. Hoje não quebra nada porque `getExpoPushToken` reconsulta `getPermissionsAsync`, mas qualquer chamador futuro que confie no booleano ficará preso. Registrar; se incomodar, memorizar só enquanto pendente ou só o `true`.
2. packages/infra/mobile/ben/src/services/notifications-service.ts:44-55 — `ensureAndroidChannels` (2 set + 1 delete nativos) roda a cada `scheduleReminderNotification`, logo N vezes por `syncReminderNotifications`. Funciona, é redundante; poderia memorizar a promise como a da permissão.
3. packages/domain/notification/src/application/use-cases/push-devices/register-push-device.ts:17-38 — upsert por token sem unicidade no banco (props em JSON, migration sem índice): dois registros concorrentes do mesmo token criam duas linhas e o push sai duplicado. Risco baixo (o hook dispara uma vez por userId).
4. packages/infra/mobile/ben/src/layout/hooks/use-push-device-registration.ts:30 — `registerPushDevice()` sem `void`; o repo marca promises soltas com `void` (use-alarm-scheduler.ts:49, auth-bootstrap.ts:31). Cosmético.
5. packages/infra/adapters/src/services/expo-push-sender.ts — sem teste do adapter (lotes de 100, mapeamento `DeviceNotRegistered`, header só com token). O contrato não exigia; registrar como lacuna.

## Premissas assumidas
- `sentCount` conta tickets `ok` da Expo (aceitos pelo serviço), não recibos de entrega no aparelho — coerente com a premissa do implementador.
- A existência de `getLastNotificationResponse`/`clearLastNotificationResponse` síncronos em expo-notifications ~0.32 foi aceita pelo typecheck já executado; não reverifiquei.
- Testes/typecheck/lint não reexecutados (resultados no extrato).
