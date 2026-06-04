import { Plus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useTaskTodosStore } from "../../stores/task-todos-store";

export function AddTodoRow() {
  const addTodo = useTaskTodosStore((s) => s.addTodo);
  const [value, setValue] = useState("");

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    void addTodo(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-on-surface-variant">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant">
        <Plus className="size-3" strokeWidth={2} />
      </span>
      <input
        type="text"
        value={value}
        placeholder="add item"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        className="min-w-0 flex-1 border-none bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0"
      />
    </div>
  );
}
