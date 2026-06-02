# Deep Plan — Split task message & content/todos routes

## Context

The task route handlers are currently grouped in
`project-backend/src/infra/http/routes/tasks.ts`. The repo convention (see
`routes/messages.ts`, `routes/chat.ts`, `routes/auth.ts`) is one handler per file,
each self-contained: imports and instantiates its own use case(s), declares its own
Zod schema(s) inline, and exports the handler.

This plan moves three handlers into a new `routes/tasks/` subfolder (mirrors
`domain/use-cases/tasks/`):

- `createTaskMessage`
- `updateTaskContent`
- `updateTaskTodos`

Behavior must be identical — handler bodies copied verbatim from `tasks.ts`.

## Decisions

- New folder `routes/tasks/` is created (per briefing). Only the three owned files
  are added; nothing else is touched.
- Each file duplicates the small `taskParamsSchema` (`{ id: z.string() }`) — explicitly
  sanctioned by the briefing and matches the per-file self-contained convention.
- `createTaskMessage` instantiates `CreateTaskMessageUseCase(taskRepository, new GeminiAgentProviderService())`.
  The shared `tasks.ts` keeps a named `agentService` const; here it is inlined into the
  constructor call exactly as the briefing specifies, since the file owns only one use case.
- `updateTaskContent` / `updateTaskTodos` instantiate their single use case with `taskRepository`.
- Import ordering / formatting matches existing files; no `lint:fix` run (handled later).
- Do NOT modify `app.ts` or delete `tasks.ts` (other plans handle wiring/cleanup).

## Existing Code to Reuse

- Use cases: `@/domain/use-cases/tasks/create-task-message`,
  `.../update-task-content`, `.../update-task-todos` (verified present).
- `taskRepository` from `@/infra/http/repositories`.
- `GeminiAgentProviderService` from `@/infra/services/gemini-agent-provider`.
- `TaskPresenter` from `@/infra/http/presenters/task-presenter`.
- `HttpStatus` from `@/modules/utils/http`.
- Express `NextFunction, Request, Response`; `z` from `zod`.
- Handler bodies copied verbatim from `tasks.ts` lines 98-119, 159-179, 181-201.

## Files to Create

### `project-backend/src/infra/http/routes/tasks/create-task-message.ts`

```ts
import { CreateTaskMessageUseCase } from '@/domain/use-cases/tasks/create-task-message'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { GeminiAgentProviderService } from '@/infra/services/gemini-agent-provider'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const createTaskMessageUseCase = new CreateTaskMessageUseCase(
  taskRepository,
  new GeminiAgentProviderService(),
)

const taskParamsSchema = z.object({
  id: z.string(),
})

const messageBodySchema = z.object({
  content: z.string().min(1),
})

export async function createTaskMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = messageBodySchema.parse(req.body)

    const result = await createTaskMessageUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      message: body.content,
    })

    return res.status(HttpStatus.OK).json({
      item: TaskPresenter.toHttp(result.item),
      benMessage: result.benMessage,
    })
  } catch (err) {
    next(err)
  }
}
```

### `project-backend/src/infra/http/routes/tasks/update-task-content.ts`

```ts
import { UpdateTaskContentUseCase } from '@/domain/use-cases/tasks/update-task-content'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateTaskContentUseCase = new UpdateTaskContentUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

const contentBodySchema = z.object({
  textContent: z.string(),
})

export async function updateTaskContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = contentBodySchema.parse(req.body)

    const result = await updateTaskContentUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      textContent: body.textContent,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

### `project-backend/src/infra/http/routes/tasks/update-task-todos.ts`

```ts
import { UpdateTaskTodosUseCase } from '@/domain/use-cases/tasks/update-task-todos'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateTaskTodosUseCase = new UpdateTaskTodosUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

const todosBodySchema = z.object({
  todoItems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      done: z.boolean(),
      order: z.number(),
    }),
  ),
})

export async function updateTaskTodos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = todosBodySchema.parse(req.body)

    const result = await updateTaskTodosUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      todoItems: body.todoItems,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

## Verification

- `cd project-backend && npx tsc --noEmit` passes (no new type errors introduced by
  the three new files).
- Each new file exports exactly the expected handler name.
- Handler bodies are byte-for-byte identical to the originals in `tasks.ts`.
- `tasks.ts` and `app.ts` left untouched.
