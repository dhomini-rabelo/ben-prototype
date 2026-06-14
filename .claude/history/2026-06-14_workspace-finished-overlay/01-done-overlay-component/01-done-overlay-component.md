# Deep Plan — Plan 1 [Frontend]: `WorkspaceDoneOverlay` component

## Context

Build the celebratory completion overlay shown when a Task Workspace task is finished, matching the `project-design` `workspace-finished` state: a `pointer-events-none` overlay anchored to the bottom of the workspace, with a dark rounded pill toast containing a `Check` icon and the friend-tone copy **"nice. that one's done."**, plus a subtle full-surface dim.

This is **Plan 1** of a parallel multi-plan task. It is purely presentational and self-contained:

- It owns ONLY new files under `project-web/src/pages/task-workspace/components/workspace-done-overlay/`.
- It must NOT touch `page.tsx` (owned by Plan 2, which decides when to render it), nor `text-content/`, `todo-content/`, `workspace-footer/` (Plan 1b).
- It carries NO finished-status check itself. Plan 2 mounts it conditionally when `task.status === "finished"`.
- It must take NO required props so it can be dropped in without configuration.

### Reference design (verbatim, from `project-design/src/pages/app/workspace-finished.tsx`)

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

### Relevant project-web facts (verified)

- `Typography` lives at `@/layout/components/ui/typography` and supports `variant="body-md"` + `className`. (`project-web/src/layout/components/ui/typography.tsx`)
- `cn` helper lives at `@/layout/utils/styles`. (`project-web/src/layout/utils/styles.ts`)
- Icons come from `lucide-react` (`Check` available).
- Color tokens used by the design all exist in `project-web/src/core/global.css`: `--color-primary` (#121213), `--color-on-primary` (#ffffff), `--color-on-surface` (#1a1c1c), `--color-surface`. So `bg-primary/95`, `text-on-primary`, `bg-on-surface/5` all resolve unchanged.
- Workspace layout (`project-web/src/pages/task-workspace/page.tsx`): root is `relative flex min-h-dvh flex-col items-center`; the column is `w-full max-w-120` centered. The fixed `header` and `footer` are both `fixed left-1/2 z-50 w-full max-w-120 -translate-x-1/2`.

## Decisions

1. **Align the overlay to the workspace column, not the full viewport.** The briefing asks to match the `max-w-120` centered column so the toast sits over the workspace content rather than the raw viewport. So instead of the design's bare `fixed inset-0`, I use the same column-anchoring pattern as the workspace header/footer: `fixed bottom-0 left-1/2 w-full max-w-120 -translate-x-1/2`. This keeps the toast horizontally centered within the workspace column on wide screens (consistent with the rest of the page), while still spanning the full column on mobile.

2. **Use `z-40`, below the fixed `z-50` header/footer.** In project-design the overlay was `z-30` and the shell chrome was `z-40` — i.e. the overlay sat just below the chrome. project-web's chrome is `z-50`, so the faithful equivalent is `z-40`: above the workspace `main` content but below the footer/header. This preserves the design intent (toast floats over content, footer/header stay on top) and keeps the dim from covering the footer chrome.

3. **Keep `pointer-events-none`.** The whole overlay is non-interactive so taps/clicks pass through to content beneath — matching the design and the briefing requirement.

4. **Vertical anchoring (`pb-44`).** Keep the design's `pb-44` so the pill floats above where the footer sits. Since the overlay is now bottom-anchored (`bottom-0`) rather than `inset-0`, `items-end` + `pb-44` still positions the pill the same distance from the bottom. The dim (`bg-on-surface/5`) is applied to the overlay container so it covers the column area; this is a subtle 5% dim consistent with the design's intent of drawing focus to the completion moment.

5. **No props, default export rules.** The component takes no props (named export `WorkspaceDoneOverlay`, function declaration, per react-components pattern). Single file — no sub-components needed, so no folder-splitting and no barrel/index file (per memory: no export-only files).

6. **Naming / structure.** kebab-case file `workspace-done-overlay.tsx`, PascalCase export `WorkspaceDoneOverlay`, located in its own folder per the medium/big component page-structure convention (`components/{component-name}/{component-name}.tsx`), matching siblings like `text-content/text-content.tsx` and `workspace-footer/workspace-footer.tsx`.

## Files to Create

### `project-web/src/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay.tsx`

```tsx
import { Check } from "lucide-react";
import { Typography } from "@/layout/components/ui/typography";

export function WorkspaceDoneOverlay() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-40 flex h-dvh w-full max-w-120 -translate-x-1/2 items-end justify-center bg-on-surface/5 pb-44">
      <div className="flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-on-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <Check className="size-4" strokeWidth={2.25} />
        <Typography variant="body-md" className="text-on-primary">
          nice. that one's done.
        </Typography>
      </div>
    </div>
  );
}
```

Notes on the adaptation vs. the design source:

- `fixed inset-0` → `fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-120 h-dvh` to anchor the dim/toast to the centered workspace column instead of the full viewport (Decision 1). `h-dvh` preserves the full-height dim behavior that `inset-0` gave, while `bottom-0` + `items-end` keeps the toast bottom-anchored.
- `z-30` → `z-40` to sit below project-web's `z-50` chrome but above content (Decision 2).
- The pill markup, copy, icon (`Check`, `size-4`, `strokeWidth={2.25}`), gap, padding, radius, shadow, `bg-primary/95`, `text-on-primary`, and `bg-on-surface/5` are kept verbatim from the design — all tokens exist in project-web.
- `cn` is not needed here because there are no conditional/merged classes and the component takes no `className` prop (kept prop-free per Decision 5). It is intentionally omitted to avoid an unused import.

## Files to Modify

None. Plan 2 will import and conditionally render `WorkspaceDoneOverlay` in `page.tsx`; that change is out of scope for this plan.

## Existing Code to Reuse

- `Typography` from `@/layout/components/ui/typography` (`variant="body-md"`, `text-on-primary`).
- `Check` icon from `lucide-react` (consistent with project-web icon usage).
- Theme tokens from `project-web/src/core/global.css` (`primary`, `on-primary`, `on-surface`).
- Column-anchoring pattern (`fixed left-1/2 z-* w-full max-w-120 -translate-x-1/2`) mirrored from the workspace `header`/`footer` in `project-web/src/pages/task-workspace/page.tsx` so the overlay aligns with the workspace column.

## Verification

- `cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit` passes with the new file (no type errors, no unused imports).
- Manual/visual self-check against the reference: dark pill, `Check` icon, copy "nice. that one's done.", bottom-anchored within the `max-w-120` column, `pointer-events-none`, subtle `bg-on-surface/5` dim, soft shadow.

No formatting step (`npm run lint:fix`) is run, per the task instructions.
