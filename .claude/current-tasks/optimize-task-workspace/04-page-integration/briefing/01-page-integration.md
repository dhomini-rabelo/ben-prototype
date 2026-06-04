# Plan 4 [Frontend] (sync) — Simple Plan: Page integration + remove the monolithic hook

This is the final merge step. It rewrites `page.tsx` into a thin, chat-style
orchestrator that wires the stores and composes the propless components produced
by the earlier plans, then deletes the now-dead monolithic hook. It runs last and
alone.

**Files this plan OWNS (touches ONLY these two):**
- `project-web/src/pages/task-workspace/page.tsx` — full rewrite.
- `project-web/src/pages/task-workspace/hooks/use-task-workspace.ts` — delete.

**Confirmed kept / NOT touched:**
- `project-web/src/pages/task-workspace/hooks/use-workspace-task.ts` — KEEP.
  It is still imported by `workspace-top-bar`, `diff-bar`, `todo-content`,
  `text-content`, and the new `workspace-banner` (verified via repo grep), so it
  is the live single source of truth for the task and must not be removed.
- All stores, utils, content components, and chrome components (owned by Plans
  1–3) are only imported and composed here, never modified.

**Grounding — confirmed by reading the real files:**
- `page.tsx` currently imports the monolith hook and reads everything off the
  `workspace` object, with four inline `render*` helpers (top banner, banner,
  diff bar, footer). These helpers' logic now lives in the Plan 3 containers.
- `chat/page.tsx` is the shape to mirror: it calls `useConnectivity()`, runs
  `useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])`, and
  composes self-subscribing components with no action props.
- Repo grep confirms `useTaskWorkspace` is referenced ONLY by its own definition
  file and by `page.tsx` (two references, both in `page.tsx`) — so deleting the
  hook is safe once `page.tsx` no longer imports it.
- The task / loading / error data comes from `useTaskDetailData(taskId)` which
  returns `{ state: { data, isLoading, isError }, actions: { refetch, invalidate } }`;
  the task itself is read through the kept `useWorkspaceTask()`.

---

## Plan

1. **Strip the page down to a thin orchestrator**
   - Remove the monolith hook usage and every inline render helper, banner,
     diff-bar, and footer construction from the page; that logic now lives in the
     self-subscribing components.
   - The page no longer holds or passes any action callbacks or transient state —
     each composed piece reads what it needs from the stores on its own.

2. **Wire the stores and lifecycle on mount**
   - Drive the connectivity store by invoking the shared chat connectivity hook,
     exactly as the chat page does.
   - Subscribe to microphone-permission changes on mount and clean the
     subscription up on unmount, mirroring the chat page.
   - Register the active task id (taken from the route params) into the task
     store whenever it changes, and reset the task store's transient state when
     the page unmounts.

3. **Keep the authentication guard**
   - Preserve the existing behavior that redirects to the login screen when no
     auth session cookie is present.

4. **Keep the loading and error/empty states**
   - Show the existing loading screen while the task is loading.
   - Show the existing error screen when loading fails or no task exists, with a
     Retry action (refetch the task detail) and a Back-to-chat action
     (navigate to the chat route).
   - The task, loading flag, and error flag are read from the task-detail data
     source / the kept workspace-task hook — not from the deleted monolith hook.

5. **Compose the workspace shell from propless components**
   - Mount the shell with its slots filled by the chrome components, each with no
     props: top bar, top banner, sub-thread banner, diff bar, and footer (using
     the exact exported names from the chrome plan).
   - Render the task body by content type: the todo body when the task is a todo
     list, otherwise the text body, passing each only its read-only flag.
   - The read-only flags are still derived from the task here: read-only when the
     task is finished, and additionally read-only for text when a diff is pending.

6. **Delete the dead monolithic hook**
   - Once the page no longer imports it, delete the monolithic workspace hook and
     confirm (via repo search) that nothing else references it.

---

## Concrete wiring reference (for the implementer — exact names/paths)

The rewritten `page.tsx` composes, with no action props:

```tsx
<WorkspaceShell
  topBar={<WorkspaceTopBar />}
  topBanner={<WorkspaceTopBanner />}
  banner={<WorkspaceSubThreadBanner />}
  diffBar={<DiffBar />}
  footer={<WorkspaceFooter />}
>
  {task.contentType === "todo"
    ? <TodoContent readOnly={isFinished} />
    : <TextContent readOnly={isFinished || hasPendingDiff} />}
</WorkspaceShell>
```

- Exact imported component names:
  `WorkspaceTopBar` (`./components/workspace-top-bar/workspace-top-bar`),
  `DiffBar` (`./components/diff-bar/diff-bar`),
  `WorkspaceTopBanner` and `WorkspaceSubThreadBanner`
  (`./components/workspace-banner/workspace-banner`),
  `WorkspaceFooter` (`./components/workspace-footer/workspace-footer`),
  `WorkspaceShell` (`./components/workspace-shell/workspace-shell`),
  `TextContent` (`./components/text-content/text-content`),
  `TodoContent` (`./components/todo-content/todo-content`).
- Store wiring effects:
  - `useConnectivity()` from `../chat/hooks/use-connectivity`.
  - `useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])`
    (`useVoiceStore` from `./stores/voice-store`).
  - `const setTaskId = useTaskStore((s) => s.setTaskId)` +
    `useEffect(() => setTaskId(taskId), [taskId, setTaskId])` with `taskId` from
    `useParams`; plus `reset()` from `useTaskStore` called on unmount
    (`useTaskStore` from `./stores/task-store`).
- Auth guard: keep the `Cookies.get(JWT_COOKIE)` → `navigate(ROUTES.login)`
  effect (current lines 23–27).
- Loading/error: keep both screens; Retry → `useTaskDetailData(taskId).actions.refetch`,
  Back → `navigate(ROUTES.chat)`; read `task` via `useWorkspaceTask()` and
  `isLoading` / `isError` via `useTaskDetailData(taskId).state`.
- Derived for content `readOnly` only: `isFinished = task.status === "finished"`,
  `hasPendingDiff = task.pendingDiff !== null`. Everything else (offline, voice,
  draft, sub-thread, mutations) is read inside the components from the stores.

---

## Out of scope / rules
- Modify ONLY `page.tsx`; delete ONLY `hooks/use-task-workspace.ts`. Do not edit
  any store, util, content, or chrome component — only import and compose them.
- Keep `hooks/use-workspace-task.ts`.
- Do NOT run `npm run lint:fix` (a later stage handles global formatting).

## Verification
- After the rewrite, repo grep for the monolith hook returns no importers; then
  delete it.
- `npx tsc --noEmit` in `project-web` must pass.
- Trace the render manually: loading → error/retry → todo task (toggle/add,
  finish/reopen, diff approve/reject) → text task (edit, diff) → voice
  (record/transcribe/error) → offline banner — all wiring resolving through the
  stores, no action props on any composed component.
