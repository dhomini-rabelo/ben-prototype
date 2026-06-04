# Plan 2 [Frontend] (parallel): Refactor content components — Deep Plan

## Context

The task-workspace content components (`text-content`, `todo-content`,
`todo-list-item`, `add-todo-row`) currently receive every mutation as an action
prop (`onEdit`, `onToggle`, `onAdd`) drilled from `page.tsx` through the
monolith hook `hooks/use-task-workspace.ts`. Plan 1 has already shipped the
state foundation:

- `stores/task-store/index.ts` exports `useTaskStore` (Zustand) with actions
  `editText(value)`, `toggleTodo(itemId)`, `addTodo(title)` (all
  `Promise<void>`), and reads the live task from the React Query cache itself.
- `utils/todo-order.ts` exports `sortByOrder(todoItems)` and `nextOrder(...)`.
- `hooks/use-workspace-task.ts` exports `useWorkspaceTask(): Task | null`
  (React Query is the single source of truth for the task data).

This plan rewires the four content components to the chat-style pattern:
each component self-subscribes to the store action it needs (mirroring
`chat/components/chat-footer/chat-footer.tsx`, which reads `useVoiceStore`
selectors directly), drops its action props, and keeps only the presentational
`readOnly` prop where the page derives editability. It also fixes the
`text-content` controlled/uncontrolled anti-pattern and memoizes the leaf list
item.

Task data continues to flow from `useWorkspaceTask()` (React Query). Only the
mutations move to `useTaskStore`. The store actions already read the live
todo/text content from the cache, so the components pass only identifiers
(`itemId`, the new `title`, the edited text value) — no domain data threading.

### Owned files (modify ONLY these)
- `project-web/src/pages/task-workspace/components/text-content/text-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/todo-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/todo-list-item.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/add-todo-row.tsx`

### Explicitly NOT touched
`page.tsx`, chrome components (folder 03), `hooks/use-task-workspace.ts`,
`hooks/use-workspace-task.ts`, the stores, and the utils. Those are owned by
Plan 1 (done) and the parallel chrome/integration plans (in progress).

## Decisions

1. **Selector usage idiom.** Read each action with a narrow selector:
   `const editText = useTaskStore((s) => s.editText);`. This matches the
   minimum-props strategy ("Zustand stores with selectors") and chat's
   `useVoiceStore(selectVoiceStatus)` usage. One selector per action.

2. **`add-todo-row` reads `addTodo` from the store directly (propless).** The
   simple plan prefers the propless pattern and requires `todo-content` and
   `add-todo-row` to stay consistent. Since `todo-content` no longer holds
   `onAdd`, `add-todo-row` self-subscribes to `addTodo`. `AddTodoRow` becomes
   propless (`<AddTodoRow />`). Its commit function will `void addTodo(trimmed)`
   (the action is `Promise<void>`; the row does not await it, keeping the
   existing synchronous clear-on-commit UX).

3. **`todo-list-item` stays purely presentational + memoized.** Its signature
   is unchanged (`title`, `done?`, `diff?`, `onToggle?`) so it is reusable by
   both the normal branch (with `onToggle`) and the diff branch (without). It is
   wrapped in `memo(...)` using chat's exact idiom: declare
   `TodoListItemComponent` internally, then `export const TodoListItem =
   memo(TodoListItemComponent)`.

4. **Controlled textarea in `text-content`.** Replace the
   `key={`${task.id}:${content}`}` + `defaultValue` remount hack with a
   controlled textarea backed by local `useState`. A `useEffect` keyed on
   `task.id` and the canonical `content` re-seeds the local value whenever the
   active task or its server-side text content changes (e.g. after a voice
   transcription mutation invalidates and refetches the task). `onChange`
   updates local state; `onBlur` commits `editText(value)` only when the value
   differs from the canonical `content`. The store's `editText` also guards on
   `value === task.textContent`, so this is defense-in-depth, not the sole
   guard.

   The diff branch renders before the textarea/local-state hooks would be
   reached, but React requires hooks to run unconditionally on every render.
   The current early `return null` (no task) and the diff-branch early return
   already sit *before* any hook in the original file. To keep hook order valid
   with the new `useState`/`useEffect`, the hooks must be declared at the top of
   the component, before the `if (!task)` / `if (diff)` early returns. The
   effect therefore tolerates `task` being `null` (it reads
   `task?.textContent ?? ""`).

5. **`void` for fire-and-forget actions in handlers.** Store actions return
   promises but the components do not await them inside synchronous event
   handlers; prefix calls with `void` to satisfy the linter's
   no-floating-promises posture, matching chat (`void useTaskStore.getState()
   .sendText(text)`).

## Files to Modify

### `components/text-content/text-content.tsx`

Drop `onEdit`; read `editText` from the store. Move hooks above early returns.
Replace the remount hack with a controlled textarea seeded/synced via
`useState` + `useEffect`. Keep the diff branch visually identical.

```tsx
import { useEffect, useState, type FocusEvent } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { useTaskStore } from "../../stores/task-store";

type TextContentProps = {
  readOnly?: boolean;
};

export function TextContent({ readOnly }: TextContentProps) {
  const task = useWorkspaceTask();
  const editText = useTaskStore((s) => s.editText);

  const content = task?.textContent ?? "";
  const [value, setValue] = useState(content);

  useEffect(() => {
    setValue(content);
  }, [task?.id, content]);

  if (!task) {
    return null;
  }

  const diff =
    task.pendingDiff?.changes.contentType === "text"
      ? task.pendingDiff.changes
      : null;

  if (diff) {
    return (
      <section className="flex flex-1 flex-col gap-3 pt-2">
        {diff.before.length > 0 && (
          <Typography
            variant="body-md"
            className="rounded-lg bg-diff-removed/60 px-3 py-2 leading-relaxed text-diff-removed-fg line-through"
          >
            {diff.before}
          </Typography>
        )}
        <Typography
          variant="body-md"
          className="rounded-lg bg-diff-added px-3 py-2 leading-relaxed text-diff-added-fg ring-1 ring-diff-added-outline/60"
        >
          {diff.after}
        </Typography>
      </section>
    );
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (event.target.value !== content) {
      void editText(event.target.value);
    }
  }

  return (
    <section className="flex flex-1 flex-col pt-2">
      <textarea
        value={value}
        readOnly={readOnly}
        placeholder="tell Ben what to put here…"
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleBlur}
        className="min-h-60 flex-1 resize-none border-none bg-transparent text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
      />
    </section>
  );
}
```

### `components/todo-content/todo-content.tsx`

Drop `onToggle`/`onAdd`; read `toggleTodo` from the store. Use `sortByOrder`.
`AddTodoRow` becomes propless. Diff branch unchanged.

```tsx
import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { useTaskStore } from "../../stores/task-store";
import { sortByOrder } from "../../utils/todo-order";
import { AddTodoRow } from "./add-todo-row";
import { TodoListItem } from "./todo-list-item";

type TodoContentProps = {
  readOnly?: boolean;
};

export function TodoContent({ readOnly }: TodoContentProps) {
  const task = useWorkspaceTask();
  const toggleTodo = useTaskStore((s) => s.toggleTodo);

  if (!task) {
    return null;
  }

  const diff =
    task.pendingDiff?.changes.contentType === "todo"
      ? task.pendingDiff.changes
      : null;

  if (diff) {
    return (
      <section className="flex flex-1 flex-col gap-1 pt-2">
        {diff.items.map((item) => (
          <TodoListItem
            key={`${item.id}-${item.diff}`}
            title={item.title}
            done={item.done}
            diff={item.diff}
          />
        ))}
      </section>
    );
  }

  const todoItems = sortByOrder(task.todoItems ?? []);

  return (
    <section className="flex flex-1 flex-col gap-1 pt-2">
      {todoItems.map((item) => (
        <TodoListItem
          key={item.id}
          title={item.title}
          done={item.done}
          onToggle={readOnly ? undefined : () => void toggleTodo(item.id)}
        />
      ))}
      {!readOnly && <AddTodoRow />}
    </section>
  );
}
```

### `components/todo-content/todo-list-item.tsx`

Keep purely presentational; wrap export in `memo`.

```tsx
import { Check } from "lucide-react";
import { memo } from "react";
import { Typography } from "../../../../layout/components/ui/typography";
import { cn } from "../../../../layout/utils/styles";
import type { TodoItemDiff } from "../../../../api/models/task";

type TodoListItemProps = {
  title: string;
  done?: boolean;
  diff?: TodoItemDiff;
  onToggle?: () => void;
};

function TodoListItemComponent({ title, done, diff, onToggle }: TodoListItemProps) {
  // body unchanged
}

export const TodoListItem = memo(TodoListItemComponent);
```

### `components/todo-content/add-todo-row.tsx`

Drop `onAdd`; read `addTodo` from the store; commit with `void addTodo(trimmed)`.

```tsx
import { Plus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useTaskStore } from "../../stores/task-store";

export function AddTodoRow() {
  const addTodo = useTaskStore((s) => s.addTodo);
  const [value, setValue] = useState("");

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    void addTodo(trimmed);
    setValue("");
  }
  // handleKeyDown + JSX unchanged
}
```

## Existing Code to Reuse

- `useTaskStore` from `../../stores/task-store` (Plan 1) — actions `editText`,
  `toggleTodo`, `addTodo`.
- `sortByOrder` from `../../utils/todo-order` (Plan 1).
- `useWorkspaceTask` from `../../hooks/use-workspace-task` (unchanged).
- `Typography`, `cn`, `TodoItemDiff` — existing layout/api imports, unchanged.
- `memo` idiom copied from `chat/components/chat-footer/chat-footer.tsx`
  (`export const X = memo(XComponent)`).
- Selector idiom copied from chat's `useVoiceStore(selector)` and the
  minimum-props "Zustand stores with selectors" strategy.

## Verification

- Mentally type-check only the owned files:
  - `useTaskStore((s) => s.editText | s.toggleTodo | s.addTodo)` resolve against
    `TaskStore` (Plan 1 `types.ts`). All return promises; `void`-prefixed calls
    are valid.
  - `sortByOrder(task.todoItems ?? [])` returns `TodoItem[]`.
  - `<AddTodoRow />` (propless) and `<TextContent readOnly?>` /
    `<TodoContent readOnly?>` (no action props) are the new public signatures.
  - `TodoListItem` keeps the same prop shape; `memo` preserves the component
    type so existing `<TodoListItem .../>` call sites are unaffected.
- A project-wide `tsc --noEmit` will still FAIL until the page-integration plan
  removes the dropped props from `page.tsx`. That is expected and out of scope.
- Do NOT run `npm run lint:fix`.

## Deviations
None anticipated. `add-todo-row` chooses the propless variant (decision 2),
which the briefing explicitly lists as preferred.
