# Backend Domain Structure

How the `project-backend` domain layer is organized. **All file and folder names use kebab-case**; only exported identifiers (classes, functions) follow their own casing.

## Folder layout

The domain layer lives under `src/domain/` and is split into three siblings:

```
src/domain/
├── entities/        # concrete domain entities (user, message, task, ...)
├── use-cases/       # application use cases, grouped by feature
│   ├── auth/
│   ├── captures/
│   ├── messages/
│   ├── tasks/
│   ├── topics/
│   └── transcription/
├── utils/           # util functions shared by many use-cases
│   ├── auth.ts
│   └── tasks.ts
└── validation/      # validation functions shared by many use-cases (none yet)
```

## use-cases/

Each use case is a single file under a **feature folder** (`use-cases/{feature}/{use-case-name}.ts`). The file exports one `UseCase` class with a single `execute` method, receiving its dependencies (repositories, services) through the constructor.

```ts
import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { UseCase } from '@/modules/domain/use-case'

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

`utils/` holds **util functions that are reused by many use-cases**. There is one file per subject (`utils/{subject}.ts`, e.g. `auth.ts`, `tasks.ts`), exporting plain functions — not classes.

Use this folder only when the helper is shared across multiple use-cases. Logic used by a single use-case stays inside that use-case file.

```ts
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ID } from '@/modules/domain/entity/id'

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

Use-cases import these helpers with the `@/domain/utils/{subject}` alias:

```ts
import { loadOwnedTask } from '@/domain/utils/tasks'
```

## validation/

`validation/` mirrors `utils/` but holds **validation functions that are reused by many use-cases**. Same rules: one file per subject (`validation/{subject}.ts`), exporting plain functions, used only when the validation is shared across multiple use-cases.

This folder is empty for now — create it the first time a validation helper needs to be shared.
