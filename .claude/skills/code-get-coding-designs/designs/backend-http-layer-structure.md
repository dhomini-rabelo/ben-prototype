# Backend HTTP Layer Structure

How the `project-backend` HTTP layer under `src/infra/http/` is organized. **All file and folder names use kebab-case**; only exported identifiers stay in their own casing.

## Folder layout

```
src/infra/http/
├── app.ts                         # Express app: route registration + error handler
├── server.ts                      # server entry point
├── repositories.ts                # single source of repository instances
├── middlewares/
│   └── {middleware}.ts
├── presenters/
│   └── {entity}-presenter.ts      # entity → HTTP DTO mapping
└── routes/
    └── {feature}/
        └── {operation}.ts         # one route handler per file
```

## routes/

Each route handler is a single file under a **feature folder** (`routes/{feature}/{operation}.ts`), named after the HTTP operation (`list-tasks.ts`, `get-task-detail.ts`, `update-task-content.ts`). The file exports one named handler function. The handler-level conventions (schemas, instantiation, flow) are documented in the [http-route-handler](../../code-write-code/coding-patterns/http-route-handler.md) coding pattern.

## repositories.ts

A single `repositories.ts` instantiates every repository once and exports the instances. Routes, presenters, and middlewares import these shared instances instead of constructing their own, keeping one source of truth.

```ts
export const taskRepository = new InMemoryTaskRepository()
export const noteRepository = new InMemoryNoteRepository()
```

## presenters/

One presenter per entity (`presenters/{entity}-presenter.ts`) maps domain entities to HTTP response DTOs. See the [http-presenter](../../code-write-code/coding-patterns/http-presenter.md) coding pattern.

## app.ts

`app.ts` wires the Express app: it imports each handler, registers the routes (applying `authMiddleware` where needed), and mounts the error handler **last** so all thrown errors funnel through it.

```ts
const app = Express()

app.post('/auth/login-or-register', loginOrRegister)
app.get('/tasks/list', authMiddleware, listTasks)
app.get('/tasks/:id/detail', authMiddleware, getTaskDetail)

app.use(errorHandler)
```
