# Deep Plan — Content & composer "done" treatment

## Context

When a Task Workspace task is **finished** (`task.status === "finished"`), the workspace content
and composer must match the `project-design` `workspace-finished` state:

- **Content** — the whole content area dims (`opacity-60`) and every line renders
  struck-through (`line-through`), for both content types (`text-content` and `todo-content`).
- **Composer** — the disabled composer placeholder reads `"reopen to keep editing"` instead of
  the current `"Ask Ben to edit…"`.

### Key constraint: finished ≠ readOnly

`page.tsx` (owned by another parallel plan — **must not touch**) passes
`readOnly={isFinished || hasPendingDiff}` into the content components. The pending-diff preview is
therefore also `readOnly`, but it must **not** get the done treatment (it already has its own diff
styling). So the done treatment must key off the **finished status specifically**, read internally
by each content component via the existing `useWorkspaceTask` hook — not off the incoming `readOnly`
prop, and not off a new prop from `page.tsx`.

### Verified facts from the codebase

- `useWorkspaceTask()` (`hooks/use-workspace-task.ts`) returns `Task | null` and is **already
  called** in both `text-content.tsx` and `todo-content.tsx`. So `task.status === "finished"` is
  available with zero new wiring.
- `TaskStatus = "created" | "active" | "finished"` (`src/api/models/task.ts`).
- In both content components the **diff branch returns early** before the normal render. Because the
  done treatment must apply only to the "normal finished view, not the pending-diff preview", the
  finished styling is added **only to the post-diff (normal) render path** — the diff branch stays
  untouched.
- `text-content.tsx` and `todo-content.tsx` do **not** currently import `cn`; `todo-list-item.tsx`
  already imports `cn` from `@/layout/utils/styles`.
- The design reference (`project-design/src/pages/app/workspace-finished.tsx`) uses
  `<section className="... opacity-60">` and per-line `... text-on-surface-variant line-through`,
  and `<ChatInput mode="disabled" placeholder="reopen to keep editing" />`.
- `ChatInput.Input` (`layout/components/chat-input/chat-input-input.tsx`) takes a `placeholder`
  string prop; `WorkspaceFooter` already passes `placeholder="Ask Ben to edit…"` and already
  disables the composer with `disabled={task?.status === "finished"}`.

## Decisions

1. **Detect finished internally.** Each content component computes `const isFinished =
   task.status === "finished";` from the already-available `task`. No new props, no `page.tsx`
   change. The existing `readOnly` prop is left fully intact for its current behavior
   (textarea `readOnly`, hiding the add-todo row, disabling toggles).

2. **Apply done styling only on the normal render path** (after the early diff return), so the
   pending-diff preview keeps its own styling and is never struck through.

3. **text-content** — add `opacity-60` to the `<section>` and `line-through` to the `<textarea>`
   when finished, using `cn(...)`. The textarea is already `readOnly` when finished (since
   `readOnly = isFinished || hasPendingDiff`), so no value/interaction change is needed — only the
   visual treatment. Keep the placeholder and all other classes as-is.

4. **todo-content** — add `opacity-60` to the normal-render `<section>` when finished. For the
   per-line `line-through`, pass a new optional `finished` flag into `TodoListItem` so the title is
   struck through **regardless of `done`** (briefing: "Every todo line reads as struck through,
   regardless of whether it was checked off"). The `AddTodoRow` is already hidden when finished
   because `readOnly` is true when finished — no change needed there.

5. **todo-list-item** — extend with an optional `finished?: boolean` prop. When `finished`, the
   title gets `line-through` (and a muted color consistent with the design's
   `text-on-surface-variant`). The existing `done`, `isAdded`, `isRemoved` styling is preserved; the
   diff branch in `todo-content` never passes `finished`, so diff rows are unaffected. Using a flag
   (rather than relying on `done`) ensures unchecked items in a finished task are also struck
   through.

6. **workspace-footer** — compute `isFinished` from the already-read `task` and pass
   `placeholder={isFinished ? "reopen to keep editing" : "Ask Ben to edit…"}`. The existing
   `disabled={task?.status === "finished"}` stays unchanged.

## Files to Modify

### 1. `project-web/src/pages/task-workspace/components/text-content/text-content.tsx`

Add the `cn` import:

```tsx
import { useState, type FocusEvent } from "react";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskContentStore } from "@/pages/task-workspace/stores/task-content-store";
```

Derive `isFinished` after the `if (!task) return null;` guard (so `task` is non-null):

```tsx
  if (!task) {
    return null;
  }

  const isFinished = task.status === "finished";
```

Apply the treatment **only on the normal render path** (the diff branch is unchanged):

```tsx
  return (
    <section
      className={cn("flex flex-1 flex-col pt-2", isFinished && "opacity-60")}
    >
      <textarea
        value={value}
        readOnly={readOnly}
        placeholder="tell Ben what to put here…"
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleBlur}
        className={cn(
          "min-h-60 flex-1 resize-none border-none bg-transparent text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0",
          isFinished && "text-on-surface-variant line-through",
        )}
      />
    </section>
  );
```

> Note: the diff `if (diff) { ... }` block and the `handleBlur` function stay exactly as they are.

### 2. `project-web/src/pages/task-workspace/components/todo-content/todo-content.tsx`

Add the `cn` import:

```tsx
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskTodosStore } from "@/pages/task-workspace/stores/task-todos-store";
import { sortByOrder } from "@/pages/task-workspace/utils/todo-order";
import { cn } from "@/layout/utils/styles";
import { AddTodoRow } from "./add-todo-row";
import { TodoListItem } from "./todo-list-item";
```

Derive `isFinished` after the `if (!task) return null;` guard:

```tsx
  if (!task) {
    return null;
  }

  const isFinished = task.status === "finished";
```

Apply the treatment **only on the normal render path** (diff branch unchanged):

```tsx
  const todoItems = sortByOrder(task.todoItems ?? []);

  return (
    <section
      className={cn("flex flex-1 flex-col gap-1 pt-2", isFinished && "opacity-60")}
    >
      {todoItems.map((item) => (
        <TodoListItem
          key={item.id}
          title={item.title}
          done={item.done}
          finished={isFinished}
          onToggle={readOnly ? undefined : () => void toggleTodo(item.id)}
        />
      ))}
      {!readOnly && <AddTodoRow />}
    </section>
  );
```

> Note: the diff `if (diff) { ... }` block stays exactly as it is — `TodoListItem` rows inside the
> diff branch do **not** receive `finished`, so diff styling is preserved.

### 3. `project-web/src/pages/task-workspace/components/todo-content/todo-list-item.tsx`

Add an optional `finished` prop and apply `line-through` to the title when finished, independent of
`done`:

```tsx
type TodoListItemProps = {
  title: string;
  done?: boolean;
  diff?: TodoItemDiff;
  finished?: boolean;
  onToggle?: () => void;
};

function TodoListItemComponent({
  title,
  done,
  diff,
  finished,
  onToggle,
}: TodoListItemProps) {
```

In the title `<Typography>` className, add the finished case (everything else unchanged):

```tsx
      <Typography
        variant="body-md"
        className={cn(
          "flex-1 leading-snug",
          done && "text-on-surface-variant line-through",
          isRemoved && "text-diff-removed-fg line-through",
          isAdded && "text-diff-added-fg",
          !done && !isRemoved && !isAdded && "text-on-surface",
          finished && "text-on-surface-variant line-through",
        )}
      >
        {title}
      </Typography>
```

> `finished` is only ever passed from the normal (non-diff) render path, so it never collides with
> `isAdded`/`isRemoved`. Placed last so it wins for unchecked items, matching "struck through
> regardless of whether it was checked off". `cn` (tailwind-merge) dedupes the repeated
> `line-through`/color classes safely.

### 4. `project-web/src/pages/task-workspace/components/workspace-footer/workspace-footer.tsx`

Compute `isFinished` from the already-read `task` and swap the placeholder; keep `disabled` as-is:

```tsx
function WorkspaceFooterComponent() {
  const voiceStatus = useVoiceStore(selectVoiceStatus);
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput();
  const task = useWorkspaceTask();

  if (voiceStatus === "recording") {
    return <RecordingBar />;
  }

  const isFinished = task?.status === "finished";

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isFinished}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input
        placeholder={isFinished ? "reopen to keep editing" : "Ask Ben to edit…"}
      />
      <ChatInput.ActionButton />
    </ChatInput.Root>
  );
}
```

> `isFinished` reuses the exact same `task?.status === "finished"` expression already used for
> `disabled`, keeping the disabled-when-finished behavior identical.

## Existing Code to Reuse

- **`useWorkspaceTask()`** — already imported and called in `text-content.tsx`, `todo-content.tsx`,
  and `workspace-footer.tsx`. No new hook wiring.
- **`cn`** (`@/layout/utils/styles`) — already used in `todo-list-item.tsx`; reused for conditional
  classes in `text-content.tsx` and `todo-content.tsx`. `cn` uses `tailwind-merge`, so duplicated
  `line-through`/text-color utilities resolve cleanly.
- **`task.status` / `TaskStatus`** (`@/api/models/task`) — existing typed field;
  `"finished"` is a valid literal.
- **Existing `readOnly` behavior** — left untouched in all three components; the done treatment is
  layered purely on top via the internally-derived `isFinished`.

## Impact on other flows

- **Pending-diff preview**: unchanged. The done styling is added only after the early `if (diff)`
  return, and the diff-branch `TodoListItem`s never receive `finished`.
- **Active / created tasks**: `isFinished` is `false`, so all new conditional classes are no-ops and
  the current appearance is preserved.
- **`page.tsx`**: not touched. Content components read finished status internally, as required.
- **`ChatInput.Input` / `chat-input` primitives**: not modified — only the `placeholder` value
  passed from `workspace-footer` changes (the prop already exists).
- **`workspace-done-overlay/`**: not touched (owned by another plan).

## Verification

From `project-web`:

```bash
cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit
```

Expect no type errors. (No formatting / `lint:fix` step per instructions.)

Manual sanity (optional): a finished task's text and todo content render dimmed and struck through,
the composer shows "reopen to keep editing", while a task with a pending diff still shows diff
styling (not struck through) and an active task is unchanged.
