# Plan 1 — Split read & lifecycle task routes into per-route files

## Context

The four read/lifecycle task route handlers currently live grouped in
`project-backend/src/infra/http/routes/tasks.ts`. The project convention
(`routes/messages.ts`, `routes/chat.ts`, `routes/auth.ts`,
`routes/transcription.ts`) is one self-contained route handler per file: each
file imports and instantiates its own use case(s), defines its own Zod schema(s)
inline, imports shared infra (`taskRepository`, `TaskPresenter`, `HttpStatus`,
express types, `zod`), and exports the handler function.

This plan extracts four handlers into a new `routes/tasks/` subfolder (mirrors
the `domain/use-cases/tasks/` structure). Handler bodies are copied verbatim — no
behavior change.

## Decisions

- New folder `routes/tasks/` with one file per route, kebab-case filenames
  matching the use-case filenames (`list-tasks.ts`, `get-task-detail.ts`,
  `finish-task.ts`, `reopen-task.ts`).
- Each file is fully self-contained. Small schema duplication
  (`taskParamsSchema`, `listQuerySchema`) across files is accepted, matching the
  existing convention (`messages.ts` defines its own `listQuerySchema`).
- Import style copied verbatim from `tasks.ts` / `messages.ts`: alphabetized `@/`
  imports first, then `express`, then `zod`.
- Only `taskParamsSchema` is included in files that use it; `listTasks` uses only
  `listQuerySchema`. No unused schemas/use cases are imported.
- Do NOT modify `app.ts`. Do NOT delete `tasks.ts`. Do NOT run lint:fix.
  (handled by sibling/synchronous plans).

## Files to Create

### `project-backend/src/infra/http/routes/tasks/list-tasks.ts`

```ts
import { ListTasksUseCase } from '@/domain/use-cases/tasks/list-tasks'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  status: z.enum(['active', 'finished']).optional(),
})

const listTasksUseCase = new ListTasksUseCase(taskRepository)

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(req.query)

    const result = await listTasksUseCase.execute({
      userId: req.userId,
      status: query.status ?? 'active',
    })

    return res.status(HttpStatus.OK).json({
      items: result.items.map((task) => TaskPresenter.toListItemHttp(task)),
    })
  } catch (err) {
    next(err)
  }
}
```

### `project-backend/src/infra/http/routes/tasks/get-task-detail.ts`

```ts
import { GetTaskDetailUseCase } from '@/domain/use-cases/tasks/get-task-detail'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const getTaskDetailUseCase = new GetTaskDetailUseCase(taskRepository)

export async function getTaskDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getTaskDetailUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

### `project-backend/src/infra/http/routes/tasks/finish-task.ts`

```ts
import { FinishTaskUseCase } from '@/domain/use-cases/tasks/finish-task'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const finishTaskUseCase = new FinishTaskUseCase(taskRepository)

export async function finishTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await finishTaskUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

### `project-backend/src/infra/http/routes/tasks/reopen-task.ts`

```ts
import { ReopenTaskUseCase } from '@/domain/use-cases/tasks/reopen-task'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const reopenTaskUseCase = new ReopenTaskUseCase(taskRepository)

export async function reopenTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reopenTaskUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
```

## Existing Code to Reuse

- `ListTasksUseCase` — `@/domain/use-cases/tasks/list-tasks`
- `GetTaskDetailUseCase` — `@/domain/use-cases/tasks/get-task-detail`
- `FinishTaskUseCase` — `@/domain/use-cases/tasks/finish-task`
- `ReopenTaskUseCase` — `@/domain/use-cases/tasks/reopen-task`
- `TaskPresenter` — `@/infra/http/presenters/task-presenter`
- `taskRepository` — `@/infra/http/repositories`
- `HttpStatus` — `@/modules/utils/http`
- Convention reference: `routes/messages.ts`, current `routes/tasks.ts`

## Verification

- All four files exist under `routes/tasks/` with the correct named exports.
- `npx tsc --noEmit` passes in `project-backend` (no new type errors from owned files).
- Handler bodies match `tasks.ts` verbatim.
- `app.ts` and `tasks.ts` untouched; no lint:fix run.
