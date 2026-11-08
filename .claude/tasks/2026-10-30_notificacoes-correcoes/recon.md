# Recon — notificacoes-correcoes (nota: passa de 60 linhas porque o delta pediu 3 respostas extras) (base 6e631f5, branch fix/notificacoes)
Raiz do produto: /home/fael/so/repos/ben-prototype. M = packages/infra/mobile/ben. Auditoria: r2-auditoria.md (project-manager/.claude/tmp/orquestracoes/2026-10-30-achar-chat-notificacoes/).

## Mapa de arquivos
M/src/services/notifications-service.ts | canais, permissão, agenda local, tap | 6-26 canal, 40-50 permissão, 60-71 e 122-130 triggers sem channelId, 142-158 tap
M/src/services/notifications-service.web.ts | no-op web; mesma API a espelhar | 1-30
M/src/core/auth-bootstrap.ts | pede permissão no boot, antes de canal | 28
M/src/layout/hooks/use-alarm-scheduler.ts | sync, tap, enqueueDue, resumo | 49 sync, 221-234 enqueueDue, 247-266 tap
M/src/layout/hooks/use-daily-summary.ts | agenda/cancela resumo diário | 98-118 (arquivo de 125)
M/app.config.ts | permissions, plugin notifications, extra.eas | 22-31 android, 47-53 plugin, 74-76 projectId
M/google-services.json | config FCM, versionado no git | arquivo todo
M/package.json | sem expo-device, sem script test | 14 typecheck, 30 expo-constants
M/src/api/requests/reminders.ts | molde de request para novo push-devices | arquivo todo
M/src/api/models/reminder.ts | Reminder: kind alarm/goal/conditional | 1-40
M/credentials/ , M/android/ | ignorados pelo git do app | n/a
packages/infra/server-ben/src/app.ts | Express 5, rotas + authMiddleware | 1-90 (imports 1-32, rotas 49-100)
packages/infra/server-ben/src/repositories.ts | wiring in-memory vs sqlite por repo | 1-70
packages/infra/server-ben/src/routes/chat.ts | POST /chat síncrono, persiste captures | 122, 208, 225
packages/infra/db/prisma/schema.prisma | modelos props/types JSON; migrations em prisma/migrations | 28-34 Reminder, 76-82 User
packages/domain/user/src/enterprise/entities/user.ts | User sem campo de push | 1-30
packages/domain/chat/src/application/use-cases/captures/persist-captures.ts | cria Reminder alarm/goal/conditional | 82-87, 121, 157-161
packages/adapters/src/ports/ + packages/infra/adapters/src/{index.ts,services/} | portos e impls externos | index.ts 4 linhas
packages/modules/env/src/env.ts | zod do env; sem token Expo | 12-26
packages/modules/tests/src/{index.ts,adapters/} | Fakes de portos para testes | index.ts 1-8
vitest.ben-aliases.ts | aliases de pacotes @ben/* para Vitest | 5-20
deploy/ben.env.example | env de produção (ben.df07.site) | 1-12
packages/domain/ownerships.md | regras dono->consumidor entre domínios | 1-25

## Molde a espelhar
Push do Shiplog (project-manager, commits 980b14d..d31111d; fonte atual em /home/fael/so/repos/project-manager/packages):
- adapters/src/ports/push-sender.ts: porto `PushSender.send(PushMessage[]) -> PushDeliveryResult[]` (to,title,body,data,channelId?; reason 'unregistered-recipient'|'other').
- infra/adapters/src/push-sender/expo-push-sender.ts: POST https://exp.host/--/api/v2/push/send, chunk 100, Bearer opcional, DeviceNotRegistered -> unregistered.
- domain/notification: RegisterPushDevice (find por token, update ou create) + BroadcastPushNotification (envia, apaga tokens DeviceNotRegistered).
- infra/db: tabela push_devices (id, token UNIQUE, createdAt, updatedAt) + repo + mapper; migration 20261012000000.
- server: POST /api/push-devices (201 criado / 200 existente); env SHIPLOG_EXPO_ACCESS_TOKEN opcional.
- mobile: services/notification-service.ts (getExpoPushToken: Device.isDevice, projectId, canal antes de pedir permissão; handler; tap) + hooks/use-push-notifications.ts (registra no boot; tap abre tela) + fallback local.
Mapeia 1:1: porto, ExpoPushSender, ordem canal->permissão->token, request de registro, env opcional do token.
Difere: (a) Ben é Express 5 (app.ts, `response.status().json`, errorHandler), não Hono; (b) Shiplog é single-user, push_devices sem userId e broadcast para todos; Ben tem User (login Firebase) então token precisa de userId e envio por usuário; (c) Ben guarda entidades como props/types JSON em string (schema.prisma), não colunas; (d) pacote @ben/domain-notification é novo (alias em vitest.ben-aliases.ts, ownerships.md, package.json/tsconfig do db e server); (e) Ben não tem pasta e2e do server (não encontrado) nem Hono container.

## Footprint
M/src/core/auth-bootstrap.ts:28 | único chamador de requestNotificationPermission
M/src/layout/hooks/use-alarm-scheduler.ts:8,49,247 | importa syncReminderNotifications e subscribeToNotificationTaps
M/src/layout/hooks/use-daily-summary.ts | importa schedule/cancelDailySummaryNotification
M/src/api/client.ts (existe, só confirmado por ls) | cliente HTTP onde o request de push entraria
Nenhum código usa getExpoPushTokenAsync nem expo-device (grep em src/app vazio).

## Armadilhas
- notifications-service.ts:6 canal 'default' sai de uso; agenda 60-71/122-130 sem channelId cai no canal fallback da lib (BaseNotificationBuilder.kt:61-62).
- Duas variantes (.ts e .web.ts): toda função nova exportada precisa de no-op no .web.ts.
- Goals/resumo não têm data de tap (data só em lembrete, :64-69); resumo diário em :126 sem data.
- Usuário decidiu notes manter no body (:64): não mexer.
- USE_EXACT_ALARM vai em app.config.ts:25 permissions (hoje só RECORD_AUDIO); android/ é gerado e ignorado, o manifest só muda no prebuild.
- google-services.json está rastreado; não é ignorado (.gitignore do app não cita) e app.config.ts não define android.googleServicesFile; build.gradle sem plugin google-services. Shiplog ignora o arquivo e usa googleServicesFile.
- Mobile não importa domínio (CLAUDE.md); cada tipo de push fica nos tipos próprios do mobile.
- Migration SQLite: Dockerfile:27 roda `migrate:deploy` no start do container, então migration nova entra sozinha no deploy.
- Tap em push remoto: data do push precisa ser string->string (PushMessage.data Record<string,string>).

## Sinal de teste
- Existente: Vitest só nos domínios (`pnpm test` -> test:unit de domain/{user,chat,task,topic,transcription}); ex.: domain/chat/.../reminders/__tests__/*.test.ts.
- Mobile: sem vitest/jest nem script test (package.json:6-15); testar notifications-service exige criar config Vitest no mobile com mock de expo-notifications/react-native e alias '@/' (novo). Typecheck mobile: `pnpm --filter @ben/mobile-ben typecheck`; lint na raiz `eslint .`.
- Backend push: use cases novos testáveis com FakePushSender + repo in-memory (padrão dos domínios); ExpoPushSender testável com fetchFn injetado (como o Shiplog). Sem E2E de server encontrado.
- Entrega real (prompt Android 13+, FCM, Doze, alarme exato): só em aparelho; fora do teste final decidido (sem APK).

## Firebase / EAS (pergunta 2)
- M/google-services.json: project_id `test-ben-1e234` (project_number 732856740267); único client android package_name `com.benprototype.app` (mobilesdk_app_id 1:732856740267:android:c7247df5daff6d487f0aee). BATE com app.config.ts:21 android.package e ios bundle.
- EAS: owner `dhomini07` (app.config.ts:6), extra.eas.projectId ba75dfd9-8220-4674-bb35-a7f9c812bb99 (:74-76); eas.json tem profiles development/preview/production, sem config de credenciais.
- Server: env.ts não tem token Expo; ben.env.example também não. FIREBASE_* do server são de auth (Admin), não de push. SHIPLOG_EXPO_ACCESS_TOKEN opcional no molde (Bearer só se "enhanced security" ligado no Expo).
- AÇÃO EXTERNA (não executada): (1) Firebase console: confirmar app Android com.benprototype.app e que Cloud Messaging API (V1) está ativa no projeto test-ben-1e234; (2) gerar chave de conta de serviço FCM v1 e subir no EAS (credentials android, projeto ba75dfd9...) sob owner dhomini07; (3) criar/usar token de acesso Expo e pô-lo em /etc/env do deploy de ben.df07.site (se enhanced security); (4) rebuild do APK (push só funciona em build com googleServicesFile); (5) SHA-1 do keystore já é exigido pelo Google Sign-In (README:68-73), não por push.

## Eventos (pergunta 3, só candidatos)
Locais hoje: lembrete alarm/goal/conditional agendado por Reminder.nextFireAt (notifications-service.ts:60-71, sync use-alarm-scheduler.ts:49); resumo diário DAILY (:122-130).
Candidatos a push do servidor (sem decidir): lembrete/alarm vencendo (servidor não tem scheduler/cron/setInterval: grep vazio), resumo diário, resposta do Ben (POST /chat é síncrono, chat.ts:225, push só serviria para app fechado/jobs futuros), tarefa com diff pendente (routes/tasks/*), lembretes criados via captures (persist-captures.ts).

## Veredito de complexidade
1. Uma frente só? não: mobile (canais, tap, permissões) + server/db/domínio/adapters (push).
2. Footprint <=6 arquivos? não: ~25 arquivos (ver mapa) e novo pacote de domínio.
3. Molde claro? sim, parcial: Shiplog push, mas Express+multi-user+props/types divergem (ver Difere).
4. Zero decisão em aberto? não: quais eventos disparam push, token por usuário, versionar google-services.json, alvo de teste do mobile.
5. Zero lógica nova? não: envio por usuário, agendador/trigger no servidor para eventos, config de teste do mobile.
veredito: complexa — falham 1, 2, 4 e 5 (backend+mobile, footprint grande, eventos de push a decidir, envio por usuário novo)
partição: não — push espelha o molde Shiplog; linha natural: A) mobile (canais/permissão/cold start/exact alarm/testes) e B) push remoto (domínio+db+adapter+rota+mobile token).
