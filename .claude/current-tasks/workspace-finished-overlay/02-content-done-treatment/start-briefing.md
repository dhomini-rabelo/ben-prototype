# Start briefing — Content & composer "done" treatment

**Plan 1 [Frontend] (parallel)**: Apply the "done" visual treatment to the workspace content and composer when the task is finished.

## Goal

When a Task Workspace task is finished (`task.status === "finished"`), match the `project-design` `workspace-finished` state:

1. **Content treatment** — the finished content gets a muted, struck-through look:
   - Container `opacity-60`.
   - Each text/todo line uses `line-through`.
   - This must apply for both content types: `text-content` and `todo-content`.
   - IMPORTANT: the strike-through/opacity applies **only when finished**, NOT for the pending-diff read-only case. `text-content` currently receives `readOnly={isFinished || hasPendingDiff}`, so do not key the "done" treatment off `readOnly` alone — the components must distinguish the finished state (read the task status internally via the existing `useWorkspaceTask` hook).

2. **Composer copy** — when finished, the composer placeholder must read **"reopen to keep editing"** (the composer is already disabled via `disabled={task?.status === "finished"}`; only the placeholder copy needs to change when finished, otherwise keep the current "Ask Ben to edit…").

Reference (verbatim design):
- Content: `<section className="... opacity-60">` with each line `className="... line-through">`.
- Composer: `<ChatInput mode="disabled" placeholder="reopen to keep editing" />`.

## Files owned (only these)

- `project-web/src/pages/task-workspace/components/text-content/text-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/todo-content.tsx` (and its `todo-list-item.tsx` if needed for line-through)
- `project-web/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`

## Must NOT touch

- `page.tsx` (owned by Plan 2). Content components must read the finished status themselves via `useWorkspaceTask` rather than receiving a new prop from `page.tsx`.
- `workspace-done-overlay/` (owned by Plan 1a).

Keep existing read-only behavior intact; only add the finished visual treatment and the composer placeholder copy on top of it.
