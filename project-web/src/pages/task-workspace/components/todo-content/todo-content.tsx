import { useWorkspaceTask } from "../../hooks/use-workspace-task";
import { AddTodoRow } from "./add-todo-row";
import { TodoListItem } from "./todo-list-item";

type TodoContentProps = {
  readOnly?: boolean;
  onToggle?: (itemId: string) => void;
  onAdd?: (title: string) => void;
};

export function TodoContent({ readOnly, onToggle, onAdd }: TodoContentProps) {
  const task = useWorkspaceTask();

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

  const todoItems = [...(task.todoItems ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <section className="flex flex-1 flex-col gap-1 pt-2">
      {todoItems.map((item) => (
        <TodoListItem
          key={item.id}
          title={item.title}
          done={item.done}
          onToggle={readOnly ? undefined : () => onToggle?.(item.id)}
        />
      ))}
      {!readOnly && <AddTodoRow onAdd={onAdd} />}
    </section>
  );
}
