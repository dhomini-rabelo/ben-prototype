# Start briefing — Integrate done-overlay into the workspace page

**Plan 2 [Frontend] (sync)**: Render the done-overlay in the Task Workspace page when the task is finished. Runs **last and alone**.

## Goal

Integrate the `WorkspaceDoneOverlay` component (created by Plan 1a at
`project-web/src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx`)
into the workspace page so it renders when `task.status === "finished"`.

`page.tsx` already computes `const isFinished = task.status === "finished";`. Render the overlay conditionally when `isFinished` is true, layered above the content (respect z-index ordering against the fixed header `z-50` and footer `z-50` — the design overlay uses `z-30` and is `pointer-events-none`, so it sits below the interactive header/footer and does not block the reopen affordance in the top-bar menu).

## Files owned (only this)

- `project-web/src/pages/task-workspace/page.tsx`

## Dependencies

- Depends on Plan 1a (the `WorkspaceDoneOverlay` component must exist). Runs after Plan 1a and Plan 1b finish.

## Must NOT touch

- Any component file owned by Plan 1a or Plan 1b. This plan only wires the overlay into `page.tsx`.
