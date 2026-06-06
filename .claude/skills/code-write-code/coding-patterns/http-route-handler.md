# HTTP Route Handler Patterns

How to write a route handler file in `project-backend` (`src/infra/http/routes/{feature}/{operation}.ts`). The folder layout is covered by the [backend HTTP layer structure](../../code-get-coding-designs/designs/backend-http-layer-structure.md) design; these patterns cover the file contents.

## Declare schemas and dependencies at module level

- Define the Zod schemas and instantiate the use-case (with its injected repositories/services from the shared `repositories.ts`) once at module level, outside the handler, so they are reused across requests.
- Name each Zod schema after its request source: `bodySchema`, `paramsSchema`, `querySchema` (prefix with the resource when a file has several, e.g. `taskParamsSchema`).

```typescript
// Correct way
const taskParamsSchema = z.object({ id: z.string() })

const getTaskDetailUseCase = new GetTaskDetailUseCase(taskRepository)

export async function getTaskDetail(/* ... */) {}
```

## Keep the handler a thin parse → execute → present flow

- Export one named handler per file with the `(req, res, next)` signature.
- Wrap the body in `try/catch` and forward every error to `next(err)` — never format errors in the handler; the central error handler maps them.
- Parse the request with the schemas, read the authenticated user from `req.userId`, call `useCase.execute(...)`, then return the presented result with an `HttpStatus` code.

```typescript
// Wrong way
export async function getTaskDetail(req: Request, res: Response) {
  const task = await getTaskDetailUseCase.execute({
    userId: req.userId,
    taskId: req.params.id, // unvalidated
  })
  return res.status(200).json(task) // magic number, unpresented entity
}

// Correct way
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
