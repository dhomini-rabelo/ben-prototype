# Backend Domain Structure

How each domain module `packages/domain/<module>` (`@ben/domain-<module>`) is organized. **All file and folder names use kebab-case**; only exported identifiers (classes, functions) follow their own casing.

## Folder layout

Each module has `src/enterprise/` and `src/application/`, with the use cases, repository ports and shared helpers split into these siblings:

```
packages/domain/<module>/src/
├── index.ts
├── enterprise/
│   └── entities/              # concrete domain entities
└── application/
    ├── repositories/          # repository ports, one per entity
    ├── use-cases/             # application use cases, grouped by feature
    │   └── {feature}/
    │       ├── {use-case-name}.ts
    │       └── __tests__/{use-case-name}.test.ts
    ├── utils/                 # util functions shared by many use-cases
    │   └── {entity}.ts
    └── validation/            # validation functions shared by many use-cases
        └── {entity}.ts
```

## use-cases/

Each use case is a single file under a **feature folder** (`application/use-cases/{feature}/{use-case-name}.ts`). The file exports one `UseCase` class with a single `execute` method, receiving its dependencies (repositories, services) through the constructor.

```ts
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  limit?: number
}

type Response = Message[]

export class ListMessagesUseCase implements UseCase<Response> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    return this.messageRepository.findMany({ userId: payload.userId })
  }
}
```

## utils/

`utils/` holds **util functions that are reused by many use-cases**. There is one file per entity, named after it (`application/utils/{entity}.ts`, e.g. `tasks.ts`, `auth.ts`), exporting plain functions — not classes.

Use this folder only when the helper is shared across multiple use-cases. Logic used by a single use-case stays inside that use-case file.

```ts
import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { Task } from '@ben/domain-task/enterprise/entities/task'
import { DangerErrors, DomainError } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export async function loadOwnedTask(
  taskRepository: TaskRepository,
  taskId: string,
  userId: string,
): Promise<Task> {
  const task = await taskRepository.findUnique({ id: new ID(taskId) })

  if (!task || task.props.userId !== userId) {
    throw new DomainError({
      code: 'TASK_NOT_FOUND',
      errorType: DangerErrors.NOT_FOUND,
    })
  }

  return task
}
```

Use-cases import these helpers with the package alias `@ben/domain-<module>/application/utils/{entity}`:

```ts
import { loadOwnedTask } from '@ben/domain-task/application/utils/tasks'
```

## validation/

`application/validation/` mirrors `application/utils/` but holds **validation functions that are reused by many use-cases** — guards that assert a domain invariant and throw a `DomainError`/`ValidationError` when it is broken. Same rules: one file per entity, named after it (`validation/{entity}.ts`), exporting plain functions, used only when the validation is shared across multiple use-cases.

```ts
import { Task, TaskContentType } from '@ben/domain-task/enterprise/entities/task'
import { DangerErrors, DomainError } from '@ben/domain-base'

export function ensureTaskContentType(
  task: Task,
  contentType: TaskContentType,
): void {
  if (task.props.contentType !== contentType) {
    throw new DomainError({
      code: 'TASK_CONTENT_TYPE_MISMATCH',
      errorType: DangerErrors.DATA_INTEGRITY,
    })
  }
}
```

Use-cases call these guards directly in `execute`, keeping the flow reading as `load → ensure → apply`:

```ts
import { ensureTaskContentType } from '@ben/domain-task/application/validation/task'

ensureTaskContentType(task, 'text')
```
