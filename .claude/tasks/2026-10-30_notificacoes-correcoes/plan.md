# Plano — notificacoes-correcoes

Branch `fix/notificacoes`, base `6e631f5`. Raiz: `/home/fael/so/repos/ben-prototype`. `M` = `packages/infra/mobile/ben`.
Fontes vinculantes: `recon.md` (mapa), `briefing-3.md` (Gate 1 e Gate 2 em project-manager/.claude/tmp/orquestracoes/2026-10-30-achar-chat-notificacoes/).

## Premissas assumidas

Decisões do usuário (Gate 1/2, não reabrir): canais novos `alarmes` (HIGH) e `resumos` (DEFAULT); `USE_EXACT_ALARM`; notes continuam no body (não mexer em `notifications-service.ts:64`); push remoto entra; o único evento de push é um push de teste aos aparelhos do usuário (sem agendador, sem push de lembrete/resposta/tarefa); a loop entrega código testado + `checklist-externo.md` e não pausa para ações externas; `google-services.json` continua versionado e só ganha `android.googleServicesFile` no `app.config.ts`; teste final = testes unitários novos + `pnpm --filter @ben/mobile-ben typecheck` + `pnpm typecheck`, `pnpm lint`, `pnpm test` na raiz, sem APK nem aparelho.

Decididas pelo planner:
1. **P1 — disparo do push de teste (PROVISÓRIA, depende da pergunta Q1 do lote):** botão "Send test notification" em `M/src/layout/components/menu-settings/reminders-settings-section.tsx`, que chama `POST /push-devices/test` e mostra o resultado. Se o usuário escolher outra opção, o escopo `mobile-notificacoes` troca só o item 7 do contrato.
2. Token de push por usuário: `PushDevice { userId, token, createdAt, updatedAt }`. Registro é upsert por token: token existente com outro `userId` passa para o usuário atual (aparelho trocou de conta). Sem rota de desregistro no logout (fica em melhorias fora do escopo).
3. Módulo de domínio novo `@ben/domain-notification` em `packages/domain/notification`, espelhando `packages/domain/topic` (o pacote mais recente) e o molde Shiplog `project-manager/packages/domain/notification`. Ele só usa `ID` de usuário, sem importar outro módulo; `ownerships.md` só muda se surgir import entre módulos.
4. Persistência no formato do Ben: modelo Prisma `PushDevice { id, props, types } @@map("push_devices")` + migration nova. Unicidade do token garantida pelo use case (props é JSON, sem UNIQUE).
5. Contrato REST (estilo `/{feature}/{ação}` do `app.ts`):
   - `POST /push-devices/register` (auth), body `{ token: string }` (zod, min 1) → `201 { item }` quando cria, `200 { item }` quando já existia; `item = { id, token, createdAt, updatedAt }` (sem `userId`).
   - `POST /push-devices/test` (auth), sem body → `200 { item: { sentCount, removedCount } }`; usuário sem aparelho → `200` com `sentCount: 0`.
6. Envio genérico por usuário: `SendUserPushNotificationUseCase({ userId, title, body, data, channelId })` envia a todos os aparelhos do usuário e apaga os com `unregistered-recipient`. A rota de teste o chama com copy fixa (title `Ben`, body `Test notification: remote push is working.`, data `{ type: 'test' }`, channelId `alarmes`). Eventos futuros reusam o use case.
7. Env: `EXPO_ACCESS_TOKEN: z.string().optional()` em `packages/modules/env/src/env.ts`; `ExpoPushSender` manda `Authorization: Bearer` só quando definido. Linha comentada em `deploy/ben.env.example`.
8. `ExpoPushSender` em `packages/infra/adapters/src/services/expo-push-sender.ts` (Ben põe impls em `services/`), com `fetchFn` injetável. Teste dele não é exigido (critério decidido cobre só use cases e mobile); se `@ben/infra-adapters` já tiver Vitest, um teste com `fetchFn` falso é bem-vindo.
9. Mobile sem `expo-device`: `getExpoPushToken` só roda em Android, exige permissão concedida e `projectId` (`Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId`), e devolve `null` em qualquer exceção (emulador sem Play Services etc.). Evita dependência nova só para `Device.isDevice`.
10. Canal antes de permissão: `requestNotificationPermission` cria os canais primeiro; `auth-bootstrap.ts:28` continua chamando-a. A promise da permissão fica memorizada no módulo para o boot e o registro do token não dispararem dois prompts.
11. Canal legado `default` é apagado (`deleteNotificationChannelAsync('default')`) ao garantir os canais. Nomes visíveis: `alarmes` → "Reminders", `resumos` → "Daily summary". Lembretes de todos os kinds (alarm/goal/conditional) vão para `alarmes`; resumo diário para `resumos`.
12. Cold start: ao assinar taps, o serviço lê `Notifications.getLastNotificationResponse()`, despacha se tiver dados de lembrete e chama `clearLastNotificationResponse()`; taps são deduplicados por `request.identifier` + `notification.date`. API não depreciada da expo-notifications 0.32.17.
13. Push remoto de teste no tap: sem `reminderId` → o app só abre (o handler atual ignora; nada a mudar).
14. Vitest novo no mobile: `vitest` em devDependencies (`^3.2.7`, mesma versão dos domínios), `M/vitest.config.ts` com alias `@` → `src` e `vi.mock` de `expo-notifications`, `expo-constants` e `react-native`; script `test:unit` (entra no `pnpm test` da raiz via `pnpm -r --if-present test:unit`).

## Convenções aplicáveis

Caminhos relativos a `.claude/skills/`:
- `code-get-coding-designs/designs/backend-domain-structure.md`, `backend-adapters-and-services-structure.md`, `backend-http-layer-structure.md`, `domain-ownership.md`, `monorepo-structure.md`
- `code-get-coding-designs/designs/mobile-services-layer-structure.md`, `api-client-structure.md`
- `code-write-code/general-coding-practices.md`, `coding-patterns/automated-testing.md`, `coding-patterns/lint.md`, `coding-patterns/general-code-preferences.md`
- Backend: `coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-route-handler,http-presenter,backend-code-preferences}.md`
- Mobile: `coding-patterns/frontend/{frontend-code-preferences,react-components}.md`

## Escopos (sequenciais)

1. **backend-push** → `prompts/backend-push.md`. Domínio, db, porto + adapter, env, rotas.
2. **mobile-notificacoes** → `prompts/mobile-notificacoes.md`. Canais, permissão, cold start, exact alarm, googleServicesFile, token e registro, botão de teste, Vitest do mobile e `checklist-externo.md`.

Footprints disjuntos; o contrato REST está fixado na premissa 5. Ordem recomendada backend → mobile para o implementador mobile ler as rotas reais. Não há dependência de build entre eles.

## Melhorias estruturais (dentro dos contratos)

- `PushDevicePresenter.toHttp` tipado como `Omit<Serialize<WithID<PushDeviceProps>>, 'userId'>`: prop nova da entidade quebra o presenter até ser serializada ou omitida.
- Ids de canal num único objeto `as const` (`NOTIFICATION_CHANNELS`) com `Record<NotificationChannelId, ChannelConfig>` para a configuração: canal novo sem configuração vira erro de tipo, e `ensureAndroidChannels` itera o record.
- `.web.ts` exporta exatamente as mesmas funções; o teste do mobile não cobre isso, então o typecheck do consumidor é a rede (callers importam um caminho só).

## Melhorias estruturais sugeridas (fora do escopo)

- Desregistrar o token no logout (`POST /push-devices/unregister`).
- Agendador no servidor para push de lembrete vencido (reusaria `SendUserPushNotificationUseCase`).
- E2E do server-ben (não existe suíte hoje).

## Critérios de aceite (globais)

- Todos os `scheduleNotificationAsync` passam `channelId`; canal `default` não é mais criado.
- Canais existem antes do primeiro `requestPermissionsAsync`.
- Tap em notificação com app morto abre o alarme do lembrete (via `getLastNotificationResponse`).
- `app.config.ts`: `USE_EXACT_ALARM` em `android.permissions` e `android.googleServicesFile: './google-services.json'`.
- Token registrado após login; `POST /push-devices/test` envia aos aparelhos do usuário e limpa tokens mortos.
- Testes novos: use cases `RegisterPushDeviceUseCase` e `SendUserPushNotificationUseCase` (um teste por ramo) e `M/src/services/__tests__/notifications-service.test.ts`.
- Passam: `pnpm --filter @ben/mobile-ben typecheck`, `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- `checklist-externo.md` escrito no task_dir.

## Fora do escopo

Push de lembrete/resumo/resposta/tarefa pelo servidor; qualquer agendador; mexer no body das notes; build de APK, consoles do Firebase/EAS, env de produção, `git push`; mudar o `android/` gerado; design sandbox.
