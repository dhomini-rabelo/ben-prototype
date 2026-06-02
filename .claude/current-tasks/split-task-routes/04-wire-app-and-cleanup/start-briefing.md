**Plan 2 [Backend] (sync)**: Rewire app.ts to the new task route files and delete the old tasks.ts

## Goal

After Plan 1 (all three parallel plans) has created one file per task route under
`project-backend/src/infra/http/routes/tasks/`, update `app.ts` to import each handler
from its new file and delete the now-empty grouped `routes/tasks.ts`.

## Files owned by this plan

- `project-backend/src/infra/http/app.ts` (modify — only the task route imports)
- `project-backend/src/infra/http/routes/tasks.ts` (delete)

## Required end state

Replace the single grouped import block in `app.ts`:

```ts
import {
  approveTaskDiff,
  createTaskMessage,
  finishTask,
  getTaskDetail,
  listTasks,
  rejectTaskDiff,
  reopenTask,
  updateTaskContent,
  updateTaskTodos,
} from '@/infra/http/routes/tasks'
```

with one import per new file:

```ts
import { approveTaskDiff } from '@/infra/http/routes/tasks/approve-task-diff'
import { createTaskMessage } from '@/infra/http/routes/tasks/create-task-message'
import { finishTask } from '@/infra/http/routes/tasks/finish-task'
import { getTaskDetail } from '@/infra/http/routes/tasks/get-task-detail'
import { listTasks } from '@/infra/http/routes/tasks/list-tasks'
import { rejectTaskDiff } from '@/infra/http/routes/tasks/reject-task-diff'
import { reopenTask } from '@/infra/http/routes/tasks/reopen-task'
import { updateTaskContent } from '@/infra/http/routes/tasks/update-task-content'
import { updateTaskTodos } from '@/infra/http/routes/tasks/update-task-todos'
```

The `app.<method>('/tasks/...', authMiddleware, handler)` route registration lines stay
unchanged. Delete `project-backend/src/infra/http/routes/tasks.ts`.

## Rules

- This plan runs LAST and alone (sync). It depends on all Plan 1 files existing.
- Do NOT change any route paths, middleware order, or handler behavior.
- Verify with `npx tsc --noEmit` (formatting is handled once at the very end by the main agent).
