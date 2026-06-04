# Deep Plan — Plan 4 [Frontend] (sync): Page integration + remove the monolithic hook

## Context (grounded against the real files on disk)

This is the final merge step of the task-workspace refactor. Plans 1–3 are already
implemented and verified on disk. This plan rewrites `page.tsx` into a thin,
chat-style orchestrator that wires the stores and composes the now-propless
self-subscribing components, then deletes the dead monolithic hook.

### Files this plan OWNS (touches ONLY these two)
- `project-web/src/pages/task-workspace/page.tsx` — full rewrite.
- `project-web/src/pages/task-workspace/hooks/use-task-workspace.ts` — delete.

### Confirmed by reading the real files

**Deletion safety** — `grep -rn "use-task-workspace\|useTaskWorkspace" src/` returns exactly
three hits: `page.tsx:17` (import), `page.tsx:21` (call), and the hook's own definition
(`use-task-workspace.ts:35`). Once `page.tsx` stops importing it, deletion is safe.

**Kept hook** — `hooks/use-workspace-task.ts` exports `useWorkspaceTask(): Task | null`
and is imported by `workspace-top-bar`, `diff-bar`, `workspace-banner`, `workspace-footer`,
`text-content`, `todo-content`. Must NOT be removed.

**Component contracts (verified on disk, all propless / self-guarding):**
- `WorkspaceTopBar` — `./components/workspace-top-bar/workspace-top-bar` (memo, no props, `return null` when `!task`).
- `DiffBar` — `./components/diff-bar/diff-bar` (memo, no props, `return null` when `!task?.pendingDiff`).
- `WorkspaceTopBanner`, `WorkspaceSubThreadBanner` — `./components/workspace-banner/workspace-banner` (both memo, no props, self-`null`).
- `WorkspaceFooter` — `./components/workspace-footer/workspace-footer` (memo, no props; owns recording vs. idle branch, draft atom, send).
- `WorkspaceShell` — `./components/workspace-shell/workspace-shell` (props `topBar`, `topBanner?`, `banner?`, `diffBar?`, `footer`, `children`; owns the footer `ResizeObserver`; tolerates `null`/`undefined` slots).
- `TextContent` — `./components/text-content/text-content` (`{ readOnly?: boolean }`, `onEdit` removed).
- `TodoContent` — `./components/todo-content/todo-content` (`{ readOnly?: boolean }`, `onToggle`/`onAdd` removed).

**Store contracts (verified on disk):**
- `useTaskStore` — `./stores/task-store`. Has `setTaskId(taskId)`, `reset()`, plus all mutations.
- `useVoiceStore` — `./stores/voice-store`. `useVoiceStore.getState().subscribeMicPermission()` returns a cleanup `() => void`.
- `useConnectivity()` — `../chat/hooks/use-connectivity` (drives `useConnectivityStore`, exactly as chat page does).

**Data source (verified on disk):**
- `useTaskDetailData(taskId)` → `useAPIRequest(...)` → `{ state: { data, isLoading, isError }, actions: { refetch, invalidate, ... } }`.
- `task` is read via the kept `useWorkspaceTask()` (`state.data?.item ?? null`).

**Auth guard (current page.tsx lines 23–27):**
`useEffect(() => { if (!Cookies.get(JWT_COOKIE)) navigate(ROUTES.login); }, [navigate])`.

**Loading / error screens (current page.tsx lines 29–65):** preserved verbatim, except
the action wiring is repointed: Retry → `useTaskDetailData(taskId).actions.refetch`,
Back → `navigate(ROUTES.chat)`.

---

## Plan

### 1. Imports (the thin set)
- `Cookies` from `js-cookie`; `useEffect` from `react`; `useNavigate`, `useParams` from `react-router`.
- `JWT_COOKIE` from `../../api/client`; `ROUTES` from `../../core/routes`.
- `Typography` from `../../layout/components/ui/typography` (loading + error screens).
- `useTaskDetailData` from `../../layout/hooks/api/use-task-detail-data`.
- `useWorkspaceTask` from `./hooks/use-workspace-task`.
- `useConnectivity` from `../chat/hooks/use-connectivity`.
- `useVoiceStore` from `./stores/voice-store`.
- `useTaskStore` from `./stores/task-store`.
- Components: `WorkspaceShell`, `WorkspaceTopBar`, `WorkspaceTopBanner`, `WorkspaceSubThreadBanner`, `DiffBar`, `WorkspaceFooter`, `TextContent`, `TodoContent`.
- Remove: every `lucide-react` icon import, `ChatBanner`, `ChatInputDesign`, `RecordingBarDesign`, `SubThreadBanner`, and `useTaskWorkspace` (all now live inside child components).

### 2. The `TaskWorkspace` component body
- `const navigate = useNavigate();`
- `const { taskId = "" } = useParams<{ taskId: string }>();`
- `const { state, actions } = useTaskDetailData(taskId);` — for `isLoading`, `isError`, `refetch`.
- `const task = useWorkspaceTask();` — the single source of truth for the task.
- `const setTaskId = useTaskStore((store) => store.setTaskId);`

### 3. Lifecycle effects (mirror chat page exactly)
- Auth guard: `useEffect(() => { if (!Cookies.get(JWT_COOKIE)) navigate(ROUTES.login); }, [navigate]);`
- Connectivity: `useConnectivity();` (called for its side effect, like chat page line 21).
- Mic permission: `useEffect(() => useVoiceStore.getState().subscribeMicPermission(), []);` (chat page line 29 — returns the cleanup).
- Task id + reset transient state on unmount:
  ```tsx
  useEffect(() => {
    setTaskId(taskId);
    return () => useTaskStore.getState().reset();
  }, [taskId, setTaskId]);
  ```
  Using `useTaskStore.getState().reset` in the cleanup keeps the effect deps minimal
  (no need to subscribe to `reset`), matching how chat uses `useVoiceStore.getState()`.

### 4. Loading screen (preserve verbatim)
`if (state.isLoading)` → existing centered "loading your workspace…" `Typography`.

### 5. Error / empty screen (preserve markup, repoint actions)
`if (state.isError || !task)` → existing centered "couldn't load this one" with two buttons:
- Retry → `onClick={() => void actions.refetch()}`
- Back to chat → `onClick={() => navigate(ROUTES.chat)}`

### 6. Derive the two content read-only flags only
- `const isFinished = task.status === "finished";`
- `const hasPendingDiff = task.pendingDiff !== null;`
Everything else (offline, voice, draft, sub-thread, mutations) lives in the children.

### 7. Compose the shell (propless slots)
```tsx
<WorkspaceShell
  topBar={<WorkspaceTopBar />}
  topBanner={<WorkspaceTopBanner />}
  banner={<WorkspaceSubThreadBanner />}
  diffBar={<DiffBar />}
  footer={<WorkspaceFooter />}
>
  {task.contentType === "todo" ? (
    <TodoContent readOnly={isFinished} />
  ) : (
    <TextContent readOnly={isFinished || hasPendingDiff} />
  )}
</WorkspaceShell>
```
No `render*` helpers; no action props anywhere.

### 8. Delete the monolith hook
`rm project-web/src/pages/task-workspace/hooks/use-task-workspace.ts` after the rewrite removes its only importer.

---

## Out of scope / rules
- Modify ONLY `page.tsx`; delete ONLY `hooks/use-task-workspace.ts`.
- Do not edit any store, util, content, or chrome component — only import and compose.
- Keep `hooks/use-workspace-task.ts`.
- Do NOT run `npm run lint:fix` (handled globally afterward).

## Verification
- `grep` for the monolith hook returns no importers after rewrite.
- `npx tsc --noEmit` in `project-web` must pass clean.
- Trace the render: loading → error/retry/back → todo task → text task → diff →
  voice → offline banner, all wiring resolving through the stores.
