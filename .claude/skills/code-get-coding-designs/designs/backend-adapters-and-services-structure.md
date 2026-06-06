# Backend Adapters and Services Structure

How the `project-backend` ports-and-adapters layers are organized. The **port** (the contract the domain depends on) lives in `src/adapters/`; the **implementation** lives in `src/infra/services/`. **All file and folder names use kebab-case**; only exported identifiers (classes, interfaces) follow their own casing.

## Folder layout

```
src/
├── adapters/
│   ├── {provider}.ts              # port: interface or abstract class + Payload/Response types
│   └── repositories/
│       └── {entity}-repository.ts # port: abstract class extending Repository<Entity>
└── infra/
    └── services/
        ├── {provider-impl}.ts                 # concrete implementation of a provider port
        └── repositories/
            └── in-memory-{entity}-repository.ts # concrete repository implementation
```

## Provider ports

A provider port is one file under `adapters/` that declares the contract the domain needs from an external capability (auth, transcription, agent, jwt). It exports the typed `Payload`/`Response` shapes next to the contract, declared as an `interface` (or an `abstract class` when the service is stateful).

```ts
export type GetUserFromTokenPayload = {
  token: string
}

export type GetUserFromTokenResponse = {
  id: string
  name: string
}

export interface AuthProviderService {
  getUserFromToken(
    payload: GetUserFromTokenPayload,
  ): Promise<GetUserFromTokenResponse | null>
}
```

## Repository ports

Each repository port is one file under `adapters/repositories/`, named after its entity (`{entity}-repository.ts`). It is an `abstract class` that extends the generic `Repository<Entity>` base and adds entity-specific methods only when needed.

```ts
import { Repository } from '@/modules/domain/repository/repository'
import { Task } from '@/domain/entities/task'

export abstract class TaskRepository extends Repository<Task> {}
```

## Implementations

Concrete implementations live under `infra/services/`. A provider implementation `implements` (or `extends`) its port; an in-memory repository extends the shared `InMemoryRepository` base and `implements` its port, sitting under `infra/services/repositories/` with the `in-memory-` prefix.

```ts
export class FirebaseAuthProviderService implements AuthProviderService {
  async getUserFromToken(payload: GetUserFromTokenPayload) {
    // ...
  }
}

export class InMemoryTaskRepository
  extends InMemoryRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
}
```

Use-cases and the HTTP layer depend on the **port**, never on the implementation, so the concrete service can be swapped without touching the domain.
