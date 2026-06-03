export type TaskContentType = "text" | "todo";

export type TaskStatus = "created" | "active" | "finished";

export type TodoItemDiff = "added" | "removed" | "unchanged";

export interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  order: number;
}

export interface TodoItemWithDiff extends TodoItem {
  diff: TodoItemDiff;
}

export type TaskDiffChanges =
  | { contentType: "text"; before: string; after: string }
  | { contentType: "todo"; items: TodoItemWithDiff[] };

export interface PendingDiff {
  turnId: string;
  proposedBy: "ben";
  changes: TaskDiffChanges;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  contentType: TaskContentType;
  textContent: string | null;
  todoItems: TodoItem[] | null;
  pendingDiff: PendingDiff | null;
  summary: string;
  status: TaskStatus;
  lastActivityAt: string;
  finishedAt: string | null;
  createdAt: string;
}
