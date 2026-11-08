# Backend Ben: estrutura do código

Caminhos relativos à raiz do repositório.

## Domínio

- `packages/domain/base/src/`: `entity/` (`entity`, `aggregate-root`, `value-object`, `watched-list`, `id`, `json-field`), `repository/` (`repository`, `queries`, `cursor`, `repository-errors`), `use-case/` (`use-case`, `responses`), `errors/domain-errors.ts`, `types/entity-props.ts`.
- `packages/domain/<módulo>/src/enterprise/entities/`: entidades do módulo.
- `packages/domain/<módulo>/src/application/repositories/`: ports de repositório.
- `packages/domain/<módulo>/src/application/use-cases/<grupo>/`: um use case por arquivo, com testes em `__tests__/` ao lado.
- `packages/domain/<módulo>/src/application/{utils,validation,types}/`: helpers do módulo (`user/utils/{agent-models,user-preferences}`, `task/validation`, `chat/utils/reminders` com o cálculo de agendamento, `chat/types`).
- `packages/domain/notification/src/`: `enterprise/entities/push-device`, `application/repositories/push-device`, `application/use-cases/{push-devices,push-notifications}/` (o módulo é consumidor de `PushSender` de `@ben/adapters`).
- `packages/domain/ownerships.md`: dono e consumidor entre módulos.

Módulos e use cases: ver [description.md](./description.md).

## Adapters e módulos

- `packages/adapters/src/ports/`: `jwt`, `auth-provider`, `agent-provider`, `agent-call-trace`, `transcription-provider`, `push-sender` (`PushSender`, `PushMessage`, `PushDeliveryResult`).
- `packages/modules/utils/src/`: `object`, `http`, `types`.
- `packages/modules/env/src/env.ts`: schema Zod do ambiente.
- `packages/modules/tests/src/`: `adapters/` (dublês `jwt-service`, `auth-provider`, `agent-service`, `transcription-provider`, `push-sender`), `validation/expect-error`, `utils/some`, `typings/factory`.

## Infra

- `packages/infra/db/`: `prisma/` (schema com `conversations`, `memories` e `push_devices` além das demais tabelas, migrations, `dev.db`), `prisma.config.ts`, `scripts/`, `src/client/` (`prisma`, `database-url`), `src/repos/in-memory/`, `src/repos/sqlite/` (um arquivo por entidade mais `sqlite-repository`).
- `packages/infra/adapters/src/services/`: `jwt`, `firebase-auth-provider`, `assemblyai-transcription-provider`, `expo-push-sender`, `ben-agent-provider/` (`generate-reply/ com as tools `history-context-tool` e `older-messages-tool`).
- `packages/infra/server-ben/src/`: `server.ts` (entrada), `app.ts`, `repositories.ts`, `routes/` (`auth/`, `messages/`, `captures/`, `notes/`, `reminders/` (lista, detalhe, `update`, `acknowledge`, `snooze-options`, `daily-summary`), `tasks/`, `agent-preferences/`, `user-preferences/`, `push-devices/` (`register-push-device`, `send-test-push`), `chat.ts`, `transcription.ts`), `presenters/` (um por entidade, inclusive `push-device-presenter`), `middlewares/` (`auth`, `error-handler`).
- Raiz do repositório: `Dockerfile`, `.dockerignore`, `deploy/` (`deploy-ben.sh`, `ben.caddy`, `ben.env.example`) e `.github/workflows/deploy.yml` (deploy do backend, ver [technology-stack.md](./technology-stack.md)); `tsconfig.base.json` e `vitest.ben-aliases.ts` mapeiam os aliases `@ben/*`, inclusive `@ben/domain-notification`.
