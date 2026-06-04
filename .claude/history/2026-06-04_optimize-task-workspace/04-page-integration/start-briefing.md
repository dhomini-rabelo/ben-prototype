# Plan 3 [Frontend] (sync): Page integration + remove the monolithic hook

**Plan line:** Plan 3 [Frontend] (sync)
**Justification:** This is the merge step. It depends on the state layer (Plan 1) and the refactored component signatures (both Plan 2 plans). It owns **only** `page.tsx` and the deletion of `hooks/use-task-workspace.ts` — files no other plan touches — so there is no conflict, but it must run **last and alone** because it composes everything produced by the earlier plans.

## Goal

Rewrite `page.tsx` into a thin, chat-style composition that wires the stores and composes the refactored components (which now self-subscribe). Then delete the now-dead monolithic `hooks/use-task-workspace.ts`.

## Files this plan OWNS
- `page.tsx` (rewrite)
- `hooks/use-task-workspace.ts` (delete — replaced by stores)
- Keep `hooks/use-workspace-task.ts` (still used by components).

## Required behavior in the rewritten page.tsx

Mirror `chat/page.tsx`'s shape (thin orchestrator). The page should:
1. **Auth guard** — keep the `Cookies.get(JWT_COOKIE)` → redirect-to-login effect (page.tsx lines 23–27).
2. **Wire stores on mount:**
   - `useConnectivity()` (from `chat/hooks/use-connectivity`) to drive the connectivity store.
   - `useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])` (mirror chat page line 29) — returns the cleanup.
   - Set the active task id: `const setTaskId = useTaskStore((s) => s.setTaskId)` + an effect `useEffect(() => setTaskId(taskId), [taskId, setTaskId])` (get `taskId` from `useParams`). Also `reset()` transient state on unmount.
3. **Loading / error states** — keep the existing loading screen and the error screen (with Retry → `useTaskDetailData(taskId).actions.refetch` and "Back to chat" → `navigate(ROUTES.chat)`). Read `task`, `isLoading`, `isError` from `useTaskDetailData(taskId)` / `useWorkspaceTask()`.
4. **Compose the shell** with the refactored, propless components:
   ```tsx
   <WorkspaceShell
     topBar={<WorkspaceTopBar />}
     topBanner={/* top-banner component from workspace-banner */}
     banner={/* sub-thread banner component from workspace-banner */}
     diffBar={<DiffBar />}
     footer={<WorkspaceFooter />}
   >
     {task.contentType === "todo"
       ? <TodoContent readOnly={isFinished} />
       : <TextContent readOnly={isFinished || hasPendingDiff} />}
   </WorkspaceShell>
   ```
   Use the **exact exported component names** defined by the chrome plan (folder 03) for the banner pieces and footer.
5. Remove all the inline `render*` helpers — that logic now lives in `workspace-banner`, `workspace-footer`, and `diff-bar`.

> `isFinished` / `hasPendingDiff` are still derived from `task` for the content `readOnly` props. Everything else (offline, voice status, draft, sub-thread, mutations) is read inside the components from stores.

## After rewrite
Delete `hooks/use-task-workspace.ts` and confirm nothing imports it (the page was its only consumer).

## Out of scope / rules
- Do not modify the stores, utils, or any component (earlier plans own them) — only import and compose.
- Do **not** run `npm run lint:fix` (Stage 6 handles formatting globally).

## Verification
- `npx tsc --noEmit` in `project-web` must pass.
- Manually trace the render: loading → error/retry → todo task (toggle/add, finish/reopen, diff approve/reject) → text task (edit, diff) → voice (record/transcribe/error) → offline banner. All wiring should resolve through the stores.
