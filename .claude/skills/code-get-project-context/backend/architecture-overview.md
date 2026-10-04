# Backend Ben: arquitetura

Camadas e a direção das dependências (cada seta é "importa de"):

```
infra/server-ben  ->  domain/*  ->  domain/base
      |                  |
      |                  +-> adapters (ports)  -> domain/base
      +-> infra/db, infra/adapters  (implementações das portas e dos repositórios)
modules/{utils,env,tests}  usados por qualquer camada (tests só em devDependencies)
```

- **`packages/domain/base`** (`@ben/domain-base`): primitivas de domínio. `Entity`, `AggregateRoot`, `ValueObject`, `WatchedList`, `ID`, `JsonField`, `Repository` (com cursor e paginação), `UseCase`, erros de domínio e `responses.ts` (`ItemResponse`, `ListingResponse`).
- **`packages/domain/<módulo>`**: entidades, ports de repositório (`application/repositories/`) e use cases. Um módulo só importa de outro como consumidor do dono (ver `packages/domain/ownerships.md`).
- **`packages/adapters`** (`@ben/adapters`): ports de serviços externos em `src/ports/` (`jwt`, `auth-provider`, `agent-provider`, `agent-call-trace`, `transcription-provider`).
- **`packages/infra/adapters`** (`@ben/infra-adapters`): implementações das ports em `src/services/` (JWT, Firebase auth, AssemblyAI, `ben-agent-provider/`).
- **`packages/infra/db`** (`@ben/infra-db`): Prisma (`prisma/schema.prisma`, migrations, `dev.db`), cliente em `src/client/` e repositórios em `src/repos/{in-memory,sqlite}/`.
- **`packages/infra/server-ben`** (`@ben/server-ben`): Express. `app.ts` registra as rotas e o `errorHandler`; `repositories.ts` centraliza a composição das dependências; um handler por arquivo em `routes/<feature>/`; um presenter por entidade em `presenters/`; `middlewares/` com `auth` e `error-handler`.
- **`packages/modules/utils`** (`@ben/modules-utils`): helpers genéricos (`object`, `http`, `types`).
- **`packages/modules/env`** (`@ben/modules-env`): validação do ambiente com Zod.
- **`packages/modules/tests`** (`@ben/modules-tests`): dublês das ports (`adapters/`), `expect-error`, `some`, tipos de factory. Só entra como devDependency.

Imports entre packages usam o nome do package (`@ben/domain-base`, `@ben/adapters`, `@ben/domain-user/application/use-cases/...`). Não existe alias `@/` no backend.

Os padrões de cada camada estão em [code-get-coding-designs](../../code-get-coding-designs/SKILL.md) e [code-write-code](../../code-write-code/SKILL.md).
