# Deep Plan — Plan 2 [Frontend]: Integrate `WorkspaceDoneOverlay` into the workspace page

## Context

This is the **synchronous merge step** of the parallel `workspace-finished-overlay` task. It runs **last and alone**, after Plan 1a (the `WorkspaceDoneOverlay` component) and Plan 1b finish.

The goal: wire the already-built `WorkspaceDoneOverlay` into the Task Workspace page so it renders only when the task is finished, layered above the page content but below the fixed header/footer chrome, without blocking any interaction.

### What already exists in `page.tsx` (verified)

`project-web/src/pages/task-workspace/page.tsx` (`TaskWorkspace`) already:

- Computes the finished signal on line 94: `const isFinished = task.status === "finished";` (already used to drive `readOnly` on `TodoContent`/`TextContent`).
- Renders a `<header className="fixed top-0 left-1/2 z-50 ...">` and a `<footer className="fixed bottom-0 left-1/2 z-50 ...">` — both fixed chrome at **`z-50`**.
- Renders `<main className="flex w-full max-w-120 flex-1 flex-col px-5 pt-16">` for content (no explicit z-index → default stacking, below any positioned `z-*` element).
- Root is `<div className="relative flex min-h-dvh flex-col items-center bg-surface text-on-surface">`.
- Returns early for loading / error states before line 94, so the overlay JSX only needs to live in the final loaded-state `return`.

### What the component (Plan 1a) provides — verified against its deep plan

From `.claude/current-tasks/workspace-finished-overlay/01-done-overlay-component/01-done-overlay-component.md`:

- **Export name:** `WorkspaceDoneOverlay` (named export, no props required).
- **Import path:** `project-web/src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx` → imported as `./components/workspace-done-overlay/workspace-done-overlay`.
- **Self-contained layering:** the component itself is `fixed ... z-40 ... pointer-events-none`, bottom-anchored to the `max-w-120` column with `h-dvh`. It carries its own positioning, dim, and non-interactivity — this plan adds **no** wrapper styling.

> Note on the `z-30` vs `z-40` discrepancy: the start-briefing text mentions `z-30`, but the **component's deep plan is authoritative** for what it ships and uses `z-40` (Decision 2 there: project-web chrome is `z-50`, so the faithful "just below chrome" value is `z-40`). The task instruction explicitly says to align with the component plan (`z-40` under `z-50` chrome). This plan therefore relies on the component's own `z-40`; it does **not** add or override any z-index. No action needed in `page.tsx` for layering beyond placing the element inside the same root so it shares the stacking context.

## Decisions

1. **Render conditionally on the existing `isFinished` signal.** Reuse `const isFinished = task.status === "finished";` (already on line 94) rather than re-deriving the status. The overlay is mounted only while finished and fully unmounted otherwise (`{isFinished && <WorkspaceDoneOverlay />}`), so there is no stale overlay and no need for the component to carry a status check (consistent with Plan 1a Decision: the component carries no finished-status check).

2. **No layering work in `page.tsx`; rely on the component's own `z-40` + `fixed`.** Because the overlay is `fixed` with an explicit `z-40`, and the header/footer are `fixed z-50`, the chrome paints above the overlay and the overlay paints above the non-positioned `<main>` content — regardless of DOM order. This satisfies "above content, below header/footer" purely via z-index. No `relative`/`z-*` changes are made to `main`, `header`, or `footer`.

3. **Placement in the JSX tree: after `<footer>`, as the last child of the root `<div>`.** Two reasons: (a) it keeps DOM order matching paint intent (content → footer chrome → overlay element listed last reads naturally as an "overlay"), and (b) it keeps the overlay inside the same root stacking context as the chrome so the `z-40` vs `z-50` comparison is apples-to-apples. Functionally any position inside the root works (z-index decides), but last-child is the clearest.

4. **No new props, no new state, no new effects.** The component takes no props; integration is a single conditional render. Nothing else in `page.tsx` changes.

5. **Import ordering matches the existing local-component import block.** Add the import alongside the other `./components/...` imports (the existing block on lines 7–13), keeping the relative-import grouping the file already uses.

## Files to Modify

### `project-web/src/pages/task-workspace/page.tsx`

**Edit 1 — add the import.** Place it with the existing local component imports. Insert it after the `WorkspaceTopBar` import (line 13) so the new `components/...` import stays in the same group:

```tsx
import { WorkspaceTopBar } from "./components/workspace-top-bar/workspace-top-bar";
import { WorkspaceDoneOverlay } from "./components/workspace-done-overlay/workspace-done-overlay";
```

**Edit 2 — conditionally render the overlay as the last child of the root `<div>`, after `<footer>`.** Change the closing of the loaded-state `return` from:

```tsx
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6"
      >
        <WorkspaceSubThreadBanner />
        <DiffBar />
        <WorkspaceFooter />
      </footer>
    </div>
  );
}
```

to:

```tsx
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-120 -translate-x-1/2 flex-col gap-2 bg-surface px-4 pt-2 pb-6"
      >
        <WorkspaceSubThreadBanner />
        <DiffBar />
        <WorkspaceFooter />
      </footer>

      {isFinished && <WorkspaceDoneOverlay />}
    </div>
  );
}
```

No other lines change. `isFinished` is already declared on line 94 and already referenced by `TodoContent`/`TextContent`, so the new usage reuses it without introducing a variable.

## Existing Code to Reuse

- `const isFinished = task.status === "finished";` — already computed on line 94 of `page.tsx`; reused as the render gate (no new derivation).
- `WorkspaceDoneOverlay` from `./components/workspace-done-overlay/workspace-done-overlay` — built by Plan 1a; imported and rendered as-is, no props.
- The root `<div className="relative ...">` stacking context and the existing `z-50` header/footer — the overlay's own `z-40` layers correctly relative to these without any change here.

## Verification

- `cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit` passes (the import resolves once Plan 1a's file exists; no type errors, no unused imports).
- Self-check against intent:
  - Overlay renders only when `task.status === "finished"` (gated by `isFinished`), and is absent otherwise.
  - Overlay (`z-40`) sits above `<main>` content and below the fixed `header`/`footer` (`z-50`), so the top-bar reopen affordance stays clickable.
  - Overlay is `pointer-events-none` (from the component itself), so it never blocks clicks/taps on the content or chrome beneath it.

No formatting step (`npm run lint:fix`) is run, per the task instructions.
