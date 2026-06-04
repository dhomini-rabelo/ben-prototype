import type { TodoItem } from "../../../api/models/task";

export function nextOrder(todoItems: TodoItem[]): number {
  return todoItems.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

export function sortByOrder(todoItems: TodoItem[]): TodoItem[] {
  return [...todoItems].sort((a, b) => a.order - b.order);
}
