# Plan 1 [Frontend] (parallel) — Sidebar count badges + loading/error

## Plan line

**Plan 1 [Frontend] (parallel)**: Add the counts API client (route + response type + hook) and render the count badges + loading/error states in the menu sidebar of `project-web`.

## Goal

The menu sidebar (`project-web`) currently shows no counts. The design specifies count badges and sidebar-level loading/error states. Consume the dedicated count-only endpoint and render the design exactly:

- **Tasks** badge → `"N active"` (formatted)
- **Notes** badge → plain total number
- **Reminders** badge → plain total number
- **Settings** → no badge
- **Loading** → animated skeleton pill (`h-4 w-12 animate-pulse rounded-full bg-outline-variant/40`)
- **Error** → em-dash (`—`) dimmed (`text-on-surface-variant/60`)

## Contract this plan consumes (fixed; backend plan provides it)

```
GET /captures/counts        (auth)
200 →
{
  "tasks":     { "active": number },
  "notes":     { "total":  number },
  "reminders": { "total":  number }
}
```

## Files this plan OWNS (project-web only)

- `src/api/routes.ts` — add a `captures: { counts: "/captures/counts" }` group.
- A new response/type file under `src/api/responses/` (or `src/api/types.ts` extension) for the counts shape.
- A new hook `src/layout/hooks/api/use-captures-count-data.ts` built on the existing `useAPIRequest`.
- `src/layout/components/menu/menu-sidebar.tsx` — add `variant` + `counts` props and the `CountBadge` rendering (replicate the design component).
- `src/layout/components/menu/menu-overlay.tsx` — wire the hook so the sidebar (when `view === "menu"`) receives counts and the loading/error variant.

This plan must **not** touch any `project-backend` file. The backend plan runs in parallel and provides the contract above.

## Reference (existing patterns to reuse)

- Design source of truth for the sidebar + badge component:
  `project-design/src/layout/components/menu-sidebar.tsx` (the `CountBadge`, `variant`, `counts` API, skeleton + dash states — replicate this).
- Design sidebar states: `project-design/src/pages/app/menu-sidebar-{populated,loading,error}.tsx`.
- API routes: `project-web/src/api/routes.ts`.
- Response/type shapes: `project-web/src/api/types.ts`, `src/api/responses/*`, `src/api/models/*`.
- Base hook: `project-web/src/layout/hooks/use-api-request.ts` (`useAPIRequest`), and existing domain hooks `src/layout/hooks/api/use-task-list-data.ts`, `use-note-list-data.ts`, `use-reminder-list-data.ts`.
- Current sidebar to modify: `project-web/src/layout/components/menu/menu-sidebar.tsx` and `menu-overlay.tsx` (+ `menu-store`).
- Follow memory conventions: one component per file; no barrel/index re-export-only files; import concrete modules directly.

## Notes

- The sidebar is an overlay rendered over `/chat`; counts should load when the menu overlay is open at the `menu` view. Map the hook's `isLoading` → `variant="loading"` and `isError` → `variant="error"`, otherwise pass the resolved `counts`.
