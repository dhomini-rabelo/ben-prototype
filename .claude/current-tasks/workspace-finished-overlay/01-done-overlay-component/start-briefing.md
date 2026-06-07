# Start briefing — Done-overlay (toast) component

**Plan 1 [Frontend] (parallel)**: Create the celebratory done-overlay (toast) component as a new, self-contained component.

## Goal

Build the celebratory completion overlay shown when a Task Workspace task is finished, matching the `project-design` `workspace-finished` state. It is a `pointer-events-none` overlay anchored to the bottom of the screen with a dark pill toast containing a `Check` icon and the friend-tone copy **"nice. that one's done."**.

Reference design (verbatim, from `project-design/src/pages/app/workspace-finished.tsx`):

```jsx
<div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-center bg-on-surface/5 pb-44">
  <div className="flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
    <Check className="size-4" strokeWidth={2.25} />
    <Typography variant="body-md" className="text-on-primary">
      nice. that one's done.
    </Typography>
  </div>
</div>
```

Adapt tokens/primitives to `project-web` conventions (its `Typography` / UI primitives, `lucide-react` `Check`, `cn` helper). Match the screen width constraints used elsewhere in the workspace (`max-w-120`, centered) if needed so the toast aligns with the workspace column rather than the full viewport — make a reasonable, justified decision consistent with the workspace layout.

## Files owned (only these — all NEW)

- `project-web/src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx`
- (any additional new files strictly inside that folder, if needed)

## Must NOT touch

- `page.tsx` (owned by Plan 2, which integrates this component).
- `text-content/`, `todo-content/`, `workspace-footer/` (owned by Plan 1b).

The component must be exported and ready to be rendered by `page.tsx` (conditionally, when `task.status === "finished"`). It should not contain the finished-status check itself — it is a pure presentational overlay (Plan 2 decides when to render it).
