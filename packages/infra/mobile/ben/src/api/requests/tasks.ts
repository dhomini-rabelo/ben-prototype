import { authClient } from '@/api/client'
import type { Task, TodoItem } from '@/api/models/task'
import type { TaskListItem, TaskMessageReply } from '@/api/responses/task'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse, ListingResponse } from '@/api/types'

export async function requestListActiveTasks(): Promise<TaskListItem[]> {
  const response = await authClient.get<ListingResponse<TaskListItem>>(
    API_ROUTES.tasks.list,
    { params: { status: 'active' } },
  )

  return response.data.items
}

export async function requestGetTaskDetail(taskId: string): Promise<Task> {
  const response = await authClient.get<ItemResponse<Task>>(
    API_ROUTES.tasks.detail(taskId),
  )

  return response.data.item
}

export async function requestSendTaskMessage(
  taskId: string,
  content: string,
): Promise<TaskMessageReply> {
  const response = await authClient.post<
    ItemResponse<Task> & { benMessage: string }
  >(API_ROUTES.tasks.createMessage(taskId), { content })

  return { task: response.data.item, benMessage: response.data.benMessage }
}

export async function requestApproveTaskDiff(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.approveDiff(taskId),
  )

  return response.data.item
}

export async function requestRejectTaskDiff(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.rejectDiff(taskId),
  )

  return response.data.item
}

export async function requestUpdateTaskContent(
  taskId: string,
  textContent: string,
): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.updateContent(taskId),
    { textContent },
  )

  return response.data.item
}

export async function requestUpdateTaskTodos(
  taskId: string,
  todoItems: TodoItem[],
): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.updateTodos(taskId),
    { todoItems },
  )

  return response.data.item
}

export async function requestFinishTask(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.finish(taskId),
  )

  return response.data.item
}

export async function requestReopenTask(taskId: string): Promise<Task> {
  const response = await authClient.post<ItemResponse<Task>>(
    API_ROUTES.tasks.reopen(taskId),
  )

  return response.data.item
}
