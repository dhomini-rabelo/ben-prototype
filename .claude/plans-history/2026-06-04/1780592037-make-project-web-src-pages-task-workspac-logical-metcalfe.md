# Align task-workspace page structure with chat page

## Context

`chat/page.tsx` and `task-workspace/page.tsx` solve the same shape of problem
(fixed header + scrollable main + fixed footer measured by a `ResizeObserver`),
but they're built differently:

- **Chat** keeps the entire layout **inline in a single `page.tsx`** — the
  `header`/`main`/`footer` markup, the `FOOTER_GAP` constant, the `footerRef`,
  `footerHeight` state and the `ResizeObserver` `useLayoutEffect` all live in the
  page component. Auth is handled **only** by the `<Auth />` router wrapper; the
  page has no JWT check of its own.
- **Task-workspace** extracts that same layout into a separate
  `WorkspaceShell` component (slot props: `topBar`, `topBanner`, `banner`,
  `diffBar`, `footer`, `children`) **and** duplicates the auth check inline in
  the page (`page.tsx:30-34` reads the JWT cookie and redirects to login).

Goal: make task-workspace mirror chat's structure — collapse the shell back
into the page so the layout is inline in one file, and rely solely on the router
`<Auth />` wrapper for auth.

Note: the route is **already** nested under `<Auth />` in
[router.tsx:13-16](project-web/src/core/router.tsx#L13-L16), so the "move to auth"
ask is largely satisfied. The remaining work is removing the page's redundant
inline auth check so auth lives only in the router (matching Chat).

## Changes

### 1. Inline the layout into `task-workspace/page.tsx`

File: [project-web/src/pages/task-workspace/page.tsx](project-web/src/pages/task-workspace/page.tsx)

Mirror the inline structure of
[chat/page.tsx](project-web/src/pages/chat/page.tsx):

- Add `FOOTER_GAP = 16` module constant (same value chat uses).
- Import `useLayoutEffect`, `useRef`, `useState` from `react`.
- Drop the `import { WorkspaceShell }` line.
- Inside `TaskWorkspace`, add `footerRef`/`footerHeight` state and the
  `ResizeObserver` `useLayoutEffect` — copied verbatim from the current
  `WorkspaceShell` (workspace-shell.tsx:22-36).
- Replace the `<WorkspaceShell ...>` return JSX (page.tsx:88-102) with the
  inline `header`/`main`/`footer` markup currently in `WorkspaceShell`,
  substituting each slot for the concrete component:
  - `header` → `<WorkspaceTopBar />` + `<WorkspaceTopBanner />`
  - `main` → the existing `task.contentType === "todo" ? <TodoContent .../> : <TextContent .../>` block as `children`
  - `footer` → `<WorkspaceSubThreadBanner />` + `<DiffBar />` + `<WorkspaceFooter />`
  - Preserve the workspace shell's exact Tailwind classes (note: the workspace
    header intentionally has **no** `h-16` and `main` uses `px-5 pt-16` — keep
    these workspace-specific values; do not copy chat's `px-4 pt-20`/`h-16`).
- Keep the existing loading and error early-return blocks unchanged.

### 2. Remove the redundant inline auth check (delegate to router `<Auth />`)

Same file. Auth is already centralized in the router, so the page should not
re-check it (chat doesn't):

- Delete the `useEffect` at page.tsx:30-34 that reads `Cookies.get(JWT_COOKIE)`
  and redirects to `ROUTES.login`.
- Remove the now-unused imports: `Cookies` (`js-cookie`) and `JWT_COOKIE`.
- Keep `useNavigate`/`navigate` and `ROUTES` — still used by the error state's
  "Back to chat" button (`navigate(ROUTES.chat)`).

### 3. Delete the now-unused shell component

- Delete [project-web/src/pages/task-workspace/components/workspace-shell/workspace-shell.tsx](project-web/src/pages/task-workspace/components/workspace-shell/workspace-shell.tsx)
  and its empty `workspace-shell/` folder. It has exactly one consumer (the page),
  which no longer imports it.

### 4. Router

- No change needed — `TaskWorkspace` is already inside the `<Auth />` group in
  [router.tsx](project-web/src/core/router.tsx). Confirm it stays there.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npm run lint:fix
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

- Grep to confirm no dangling references: `grep -rn "WorkspaceShell\|workspace-shell\|JWT_COOKIE" project-web/src/pages/task-workspace`.
- Run the web app, log in, open a task workspace (`/tasks/:taskId`):
  - header/footer stay fixed, main content is padded by footer height (footer
    resize still reflows main padding — `ResizeObserver` works inline).
  - todo vs text content render per `contentType`; diff bar / sub-thread banner
    still appear in the footer.
  - Visiting `/tasks/:taskId` without a JWT cookie still redirects to login (now
    via the router `<Auth />` wrapper, not the page).
