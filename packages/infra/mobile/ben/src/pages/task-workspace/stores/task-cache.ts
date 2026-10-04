import { queryClient } from '@/core/query-client'
import type { Task } from '@/api/models/task'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'

export function getTaskFromCache(taskId: string): Task | null {
  const data = queryClient.getQueryData<ItemResponse<Task>>([
    API_ROUTES.tasks.detail(taskId),
    undefined,
  ])
  return data?.item ?? null
}

export function invalidateTask(taskId: string) {
  return queryClient.invalidateQueries({
    queryKey: [API_ROUTES.tasks.detail(taskId)],
  })
}
