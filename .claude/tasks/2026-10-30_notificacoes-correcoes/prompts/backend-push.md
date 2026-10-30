# Escopo backend-push — push remoto (domínio, db, adapter, rotas)

Raiz: `/home/fael/so/repos/ben-prototype`. Git: branch `fix/notificacoes`, base `6e631f5`. Não commite (o orquestrador commita).

## Contrato

1. **Porto** `packages/adapters/src/ports/push-sender.ts`: `PushMessage { to, title, body, data: Record<string, string>, channelId? }`, `PushDeliveryResult` com `reason: 'unregistered-recipient' | 'other'` em falha, `interface PushSender { send(messages: PushMessage[]): Promise<PushDeliveryResult[]> }`. Exporte como os demais ports.
2. **Adapter** `packages/infra/adapters/src/services/expo-push-sender.ts`: `ExpoPushSender implements PushSender`; POST `https://exp.host/--/api/v2/push/send`, lotes de 100, `Authorization: Bearer` só com token, `DeviceNotRegistered` → `unregistered-recipient`, `fetchFn` injetável no construtor. Exporte em `packages/infra/adapters/src/index.ts`.
3. **Fake** `packages/modules/tests/src/adapters/push-sender.ts` (`FakePushSender`, registra mensagens enviadas e permite marcar tokens como não registrados) + export em `src/index.ts`.
4. **Env** `packages/modules/env/src/env.ts`: `EXPO_ACCESS_TOKEN: z.string().optional()`; linha comentada `# EXPO_ACCESS_TOKEN=` em `deploy/ben.env.example`.
5. **Domínio novo** `packages/domain/notification` (`@ben/domain-notification`), copiando a casca de `packages/domain/topic` (`package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`):
   - `enterprise/entities/push-device.ts`: `PushDevice` com `PushDeviceProps { userId: ID, token: string, createdAt: Date, updatedAt: Date }`.
   - `application/repositories/push-device.ts`: `abstract class PushDeviceRepository extends Repository<PushDevice> {}`.
   - `application/__tests__/repositories/push-device.ts`: repo in-memory de teste (molde: `packages/domain/topic/src/application/__tests__/repositories/`).
   - `application/use-cases/push-devices/register-push-device.ts`: `RegisterPushDeviceUseCase({ userId, token })` — acha por token; existe → atualiza `userId` e `updatedAt`, `created: false`; não existe → cria, `created: true`. Resposta `ItemResponse<PushDevice>` + `created`.
   - `application/use-cases/push-notifications/send-user-push-notification.ts`: `SendUserPushNotificationUseCase({ userId, title, body, data, channelId? })` — busca aparelhos do usuário; nenhum → `{ sentCount: 0, removedCount: 0 }` sem chamar o sender; senão envia, apaga os `unregistered-recipient` e devolve as contagens.
   - Testes em `__tests__/` ao lado de cada use case, um por ramo: criar; reaproveitar token do mesmo usuário; transferir token de outro usuário; enviar a todos os aparelhos do usuário e não aos de outro; sem aparelhos; remover só os não registrados.
   - Aliases: `tsconfig.base.json` paths (como `@ben/domain-topic`) e `vitest.ben-aliases.ts`.
6. **DB** `packages/infra/db`: modelo `PushDevice { id String @id, props String, types String @@map("push_devices") }` em `prisma/schema.prisma`; migration `prisma/migrations/20261030000000_add_push_devices/migration.sql` (molde: `20261021215717_add_conversations_and_memories`); `src/repos/in-memory/push-device.ts` e `src/repos/sqlite/push-device.ts` (molde: `memory.ts` nas duas pastas); dependência `@ben/domain-notification` no `package.json`. Regere o client Prisma pelo script do pacote.
7. **Server** `packages/infra/server-ben`:
   - `repositories.ts`: `pushDeviceRepository` in-memory vs sqlite como os outros.
   - `presenters/push-device-presenter.ts`: `toHttp` tipado `Omit<Serialize<WithID<PushDeviceProps>>, 'userId'>`.
   - `routes/push-devices/register-push-device.ts`: body zod `{ token: z.string().min(1) }`, `userId` de `request.userId`; `201` se `created`, `200` senão; `{ item }`.
   - `routes/push-devices/send-test-push.ts`: instancia `new ExpoPushSender({ accessToken: env.EXPO_ACCESS_TOKEN })` no nível do módulo; chama o use case com title `Ben`, body `Test notification: remote push is working.`, data `{ type: 'test' }`, channelId `alarmes`; `200 { item: { sentCount, removedCount } }`.
   - `app.ts`: `app.post('/push-devices/register', authMiddleware, …)` e `app.post('/push-devices/test', authMiddleware, …)` antes do `errorHandler`; dependência `@ben/domain-notification` no `package.json`.
8. Rode `pnpm install` na raiz depois de criar o pacote.

## Moldes

- Shiplog (`/home/fael/so/repos/project-manager/packages`): `adapters/src/ports/push-sender.ts`, `infra/adapters/src/push-sender/expo-push-sender.ts`, `domain/notification/src/application/use-cases/{push-devices,push-notifications}/` + `__tests__`, `modules/tests/src/adapters/push-sender.ts`. Diferenças: Ben é Express 5 (não Hono), multiusuário (envio por `userId`, não broadcast) e persiste props/types em JSON.
- Ben: rota com `request.userId` em `server-ben/src/routes/reminders/acknowledge-reminder.ts:33`; adapter instanciado em módulo em `routes/transcription.ts:7`; registro de rotas em `app.ts:84-98`.

## Convenções (caminhos em `.claude/skills/`)

`code-get-coding-designs/designs/{backend-domain-structure,backend-adapters-and-services-structure,backend-http-layer-structure,domain-ownership,monorepo-structure}.md`; `code-write-code/general-coding-practices.md`; `code-write-code/coding-patterns/{automated-testing,lint,general-code-preferences}.md`; `code-write-code/coding-patterns/backend/{domain-entity-declaration,use-case-structure,use-case-response-structure,http-route-handler,http-presenter,backend-code-preferences}.md`.

## Não quebrar

`app.ts` (rotas existentes e `errorHandler` por último); `repositories.ts` (wiring atual); env obrigatório atual (a var nova é opcional); migrations existentes intactas.

## Arquivos seus

Tudo acima em `packages/adapters`, `packages/infra/adapters`, `packages/modules/{tests,env}`, `packages/domain/notification`, `packages/infra/db`, `packages/infra/server-ben`, `tsconfig.base.json`, `vitest.ben-aliases.ts`, `deploy/ben.env.example`, `pnpm-lock.yaml`. Não toque em `packages/infra/mobile`.

## Aceite

- Use cases com testes por ramo passando em `pnpm test`.
- `pnpm typecheck` e `pnpm lint` na raiz passam.
- Rotas registradas com `authMiddleware` e o contrato acima (status 201/200, `{ item }`).
