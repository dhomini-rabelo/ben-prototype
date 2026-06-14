# Deep Plan — Split Task Diff Route Handlers

## Context

The diff-related route handlers (`approveTaskDiff`, `rejectTaskDiff`) currently live
together with all other task handlers in the grouped file
`project-backend/src/infra/http/routes/tasks.ts`. The project convention (see
`routes/messages.ts`, `routes/chat.ts`, `routes/auth.ts`, `routes/transcription.ts`)
is one handler-group per file, each file self-contained: it imports and instantiates
its own use cases, defines its own Zod schemas inline, and exports the handler(s).

This plan extracts the two diff handlers into a new `routes/tasks/` subfolder
(mirrors `domain/use-cases/tasks/`), one file per route. It is one of several
parallel plans, so it ONLY creates the two files it owns. It does NOT touch
`app.ts` (wiring) and does NOT delete `tasks.ts` (cleanup is a separate synchronous plan).

## Decisions

- **New subfolder `routes/tasks/`**: keeps the `routes/` directory clean and mirrors
  the existing `domain/use-cases/tasks/` layout.
- **`@/` alias imports unchanged**: although the new files sit one directory deeper,
  all imports use the `@/` path alias, so the import specifiers are identical to those
  in the current `tasks.ts`.
- **Duplicate `taskParamsSchema` inline in each file**: matches the self-contained
  convention in `messages.ts` (each file declares its own schemas). Acceptable per
  the briefing.
- **Verbatim handler bodies**: copied exactly from `tasks.ts` — no behavior change.
- **Each file instantiates only the use case(s) it needs**: `approve-task-diff.ts`
  instantiates `ApproveTaskDiffUseCase`; `reject-task-diff.ts` instantiates
  `RejectTaskDiffUseCase`.

## Files to Create

### `project-backend/src/infra/http/routes/tasks/approve-task-diff.ts` → `approveTaskDiff`

```ts
import { ApproveTaskDiffUseCase } from '@/domain/use-cases/tasks/approve-task-diff'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const approveTaskDiffUseCase = new ApproveTaskDiffUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

export async function approveTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await approveTaskDiffUseCase.execute({
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

### `project-backend/src/infra/http/routes/tasks/reject-task-diff.ts` → `rejectTaskDiff`

```ts
import { RejectTaskDiffUseCase } from '@/domain/use-cases/tasks/reject-task-diff'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const rejectTaskDiffUseCase = new RejectTaskDiffUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

export async function rejectTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await rejectTaskDiffUseCase.execute({
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

- `ApproveTaskDiffUseCase` — `@/domain/use-cases/tasks/approve-task-diff`
- `RejectTaskDiffUseCase` — `@/domain/use-cases/tasks/reject-task-diff`
- `TaskPresenter` — `@/infra/http/presenters/task-presenter`
- `taskRepository` — `@/infra/http/repositories`
- `HttpStatus` — `@/modules/utils/http`
- Handler bodies copied verbatim from `routes/tasks.ts` (lines 121-157).

## Verification

- `npx tsc --noEmit` in `project-backend` compiles with no new errors.
- Both files export the expected named handler (`approveTaskDiff`, `rejectTaskDiff`).
- Handler bodies are byte-identical to the originals in `tasks.ts`.
- No other files modified (no `app.ts`, `tasks.ts` untouched). No formatting run.
