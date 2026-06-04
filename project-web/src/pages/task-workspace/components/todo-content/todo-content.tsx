import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { useTaskTodosStore } from "../../stores/task-todos-store";
import { sortByOrder } from "../../utils/todo-order";
import { AddTodoRow } from "./add-todo-row";
import { TodoListItem } from "./todo-list-item";

type TodoContentProps = {
  readOnly?: boolean;
};

export function TodoContent({ readOnly }: TodoContentProps) {
  const task = useWorkspaceTask();
  const toggleTodo = useTaskTodosStore((s) => s.toggleTodo);

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
