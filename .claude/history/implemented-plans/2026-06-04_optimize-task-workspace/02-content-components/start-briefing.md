# Plan 2 [Frontend] (parallel): Refactor content components

**Plan line:** Plan 2 [Frontend] (parallel)
**Justification:** Depends only on the state layer from Plan 1. It owns **only** `components/text-content/` and `components/todo-content/` — a disjoint file set from the parallel chrome plan (Plan 2, folder 03), so the two run in parallel with no conflict. Runs after Plan 1 because it consumes `useTaskStore`, `sortByOrder`, etc.

## Goal

Refactor the task content components to consume the Plan 1 stores/utils directly (chat-style: components self-subscribe, no action props), fix the textarea anti-pattern, and add memoization. Keep them reading the task via the existing `useWorkspaceTask()` hook (single source of truth = React Query). This mirrors how chat components read state from stores + selectors instead of receiving everything as props.

## Files this plan OWNS (only these)
- `components/text-content/text-content.tsx`
- `components/todo-content/todo-content.tsx`
- `components/todo-content/todo-list-item.tsx`
- `components/todo-content/add-todo-row.tsx`

## Required changes

### text-content.tsx
- Keep reading `task` via `useWorkspaceTask()`.
- **Drop the `onEdit` prop.** Call `useTaskStore((s) => s.editText)` and invoke it on commit.
- Keep the `readOnly` prop (the page derives it from finished/pendingDiff state).
- **Fix the key-prop anti-pattern (line 54).** Today it forces a remount via `key={`${task.id}:${content}`}` with an uncontrolled `defaultValue`. Replace with a **controlled** textarea: local `useState` seeded from `task.textContent`, synced when the task content changes (e.g. a `useEffect` keyed on `task.id` + content, or a derived-state pattern), `value`/`onChange` wired, and `editText(value)` committed on blur (only when changed). Remove the `key` hack.
- Keep the diff-rendering branch (before/after) exactly as-is visually.

### todo-content.tsx
- Keep reading `task` via `useWorkspaceTask()`.
- **Drop `onToggle`/`onAdd` props.** Read `toggleTodo` and `addTodo` from `useTaskStore`.
- Keep the `readOnly` prop.
- Replace the inline sort (lines 38–40) with `sortByOrder(task.todoItems ?? [])` from `../../utils/todo-order`.
- Keep the diff branch and the `<AddTodoRow />` / `<TodoListItem />` composition.

### todo-list-item.tsx
- Keep it a pure presentational component (props in, no store access) so it stays reusable for both the normal and diff branches.
- Wrap the export in `memo(...)` (chat memoizes heavy/leaf render components, e.g. `ChatFooter`, `ChatTopBanner`).

### add-todo-row.tsx
- Keep local input state. It may either keep its `onAdd` prop (called by `todo-content`) **or** read `addTodo` from the store directly. Prefer reading `addTodo` from `useTaskStore` to match the propless pattern, but keeping the prop is acceptable if cleaner — just stay consistent with how `todo-content` wires it.

## Contract notes for the parallel/integration plans
After this plan, the public signatures become:
- `<TextContent readOnly?={boolean} />` (no `onEdit`).
- `<TodoContent readOnly?={boolean} />` (no `onToggle`/`onAdd`).

The page-integration plan (Plan 4) will render them with only `readOnly`.

## Out of scope / rules
- Do **not** modify `page.tsx`, the old `use-task-workspace.ts`, or any file outside the owned set.
- Do **not** create or edit the stores/utils (Plan 1 owns them) — only import from them.
- Do **not** run `npm run lint:fix`.

## Verification
- `npx tsc --noEmit` is run once globally after all plans; ensure imports resolve against Plan 1's exports (`useTaskStore`, `sortByOrder`).
