import { authClient } from "./client";
import type {
  Task,
  TaskListItem,
  TaskMessageReply,
  TodoItem,
} from "./models/task";
import { API_ROUTES } from "./routes";
import type { ItemResponse, ListingResponse } from "./types";

export async function listActiveTasks(): Promise<TaskListItem[]> {
  const response = await authClient.get<ListingResponse<TaskListItem>>(
    API_ROUTES.tasks.list,
    { params: { status: "active" } },
  );

  return response.data.items;
}

export async function getTaskDetail(taskId: string): Promise<Task> {
  const response = await authClient.get<ItemResponse<Task>>(
    API_ROUTES.tasks.detail(taskId),
  );

  return response.data.item;
}

export async function sendTaskMessage(
  taskId: string,
  content: string,
): Promise<TaskMessageReply> {
  const response = await authClient.post<ItemResponse<Task> & { benMessage: string }>(
    API_ROUTES.tasks.createMessage(taskId),
    { content },
  );

  return { task: response.data.item, benMessage: response.data.benMessage };
}

export async function approveTaskDiff(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.approveDiff(taskId),
  );

  return response.data.item;
}

export async function rejectTaskDiff(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.rejectDiff(taskId),
  );

  return response.data.item;
}

export async function updateTaskContent(
  taskId: string,
  textContent: string,
): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.updateContent(taskId),
    { textContent },
  );

  return response.data.item;
}

export async function updateTaskTodos(
  taskId: string,
  todoItems: TodoItem[],
): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.updateTodos(taskId),
    { todoItems },
  );

  return response.data.item;
}

export async function finishTask(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.finish(taskId),
  );

  return response.data.item;
}

export async function reopenTask(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.reopen(taskId),
  );

  return response.data.item;
}
