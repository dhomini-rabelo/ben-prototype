# Plan 2 [Frontend] (parallel): Refactor content components — Simple Plan

Refactor the task-workspace content components to self-subscribe to the Plan 1
state layer (chat-style: components read stores/utils directly, no action
props), fix the textarea anti-pattern, and add memoization. The task continues
to come from the existing `useWorkspaceTask()` hook (single source of truth =
React Query); only mutations/actions move to `useTaskStore`.

**Files OWNED by this plan (touch only these, all under
`project-web/src/pages/task-workspace/`):**
- `components/text-content/text-content.tsx`
- `components/todo-content/todo-content.tsx`
- `components/todo-content/todo-list-item.tsx`
- `components/todo-content/add-todo-row.tsx`

**Confirmed NOT touched:** `page.tsx`, the chrome components (folder 03),
`hooks/use-workspace-task.ts`, `hooks/use-task-workspace.ts`, the stores, and
the utils (Plan 1 owns the stores/utils — this plan only imports from them).

---

## Plan

1. **Make the text content self-mutating and fix the textarea anti-pattern**
   - File: `components/text-content/text-content.tsx`.
   - Keep reading the task from `useWorkspaceTask()` and keep the `readOnly`
     prop.
   - Drop the `onEdit` prop; obtain the edit action by subscribing to
     `editText` from `useTaskStore` (imported from `../../stores/task-store`)
     and invoke it on commit.
   - Replace the remount hack (the `key={`${task.id}:${content}`}` +
     uncontrolled `defaultValue` textarea on lines 53–56) with a controlled
     textarea: local state seeded from `task.textContent`, re-synced when the
     active task or its text content changes (effect keyed on task id + text
     content), `value`/`onChange` wired, and the edit action committed on blur
     only when the value actually changed.
   - Keep the pending-diff branch (before/after rendering) visually identical.

2. **Make the todo content self-mutating and consume the shared sort util**
   - File: `components/todo-content/todo-content.tsx`.
   - Keep reading the task from `useWorkspaceTask()` and keep the `readOnly`
     prop.
   - Drop the `onToggle` and `onAdd` props; read `toggleTodo` (and, if
     `add-todo-row` delegates upward, `addTodo`) from `useTaskStore`.
   - Replace the inline sort (lines 38–40) with `sortByOrder(task.todoItems ?? [])`
     imported from `../../utils/todo-order`.
   - Keep the pending-diff branch and the `<AddTodoRow />` / `<TodoListItem />`
     composition; wire each item's toggle to the store action (still suppressed
     when `readOnly`).

3. **Keep the list item pure and memoize it**
   - File: `components/todo-content/todo-list-item.tsx`.
   - Keep it purely presentational (props in, no store access) so it stays
     reusable across both the normal and diff branches — no signature change.
   - Wrap the export in `memo(...)` to match chat's memoization of leaf render
     components.

4. **Decide the add-row's wiring and keep it consistent**
   - File: `components/todo-content/add-todo-row.tsx`.
   - Keep its local input state and commit-on-Enter/blur behavior.
   - Prefer reading `addTodo` directly from `useTaskStore` (propless pattern)
     and dropping the `onAdd` prop; keeping `onAdd` is acceptable only if it
     stays consistent with how `todo-content` wires it (step 2). Pick one and
     apply it in both files.

5. **Confirm the resulting public contract (consumed by Plan 4)**
   - `<TextContent readOnly?={boolean} />` — `onEdit` removed.
   - `<TodoContent readOnly?={boolean} />` — `onToggle` and `onAdd` removed.
   - `<TodoListItem>` signature unchanged (`title`, `done?`, `diff?`,
     `onToggle?`), now a memoized export.
   - `<AddTodoRow>` — either propless (preferred) or retaining `onAdd?`,
     consistent with step 4.
   - Imports must resolve against Plan 1's exports: `useTaskStore` (with
     `editText`, `toggleTodo`, `addTodo`) from `stores/task-store`, and
     `sortByOrder` from `utils/todo-order`.

---

## Out of scope / rules
- Do not modify `page.tsx`, the chrome components, `hooks/use-workspace-task.ts`,
  `hooks/use-task-workspace.ts`, or any file outside the four owned components.
- Do not create or edit the stores/utils — only import from Plan 1's exports.
- Do not run `npm run lint:fix` (a single global `tsc --noEmit` runs after all
  plans).

## Verification
- After all plans, `npx tsc --noEmit` must pass with these components importing
  `useTaskStore` and `sortByOrder` from Plan 1's paths.
