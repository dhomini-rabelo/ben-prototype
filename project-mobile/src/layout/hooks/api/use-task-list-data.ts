import type { TaskStatus } from '@/api/models/task'
import type { TaskListItem } from '@/api/responses/task'
import { API_ROUTES } from '@/api/routes'
import type { ListingResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

interface UseTaskListDataProps {
  status?: TaskStatus
}

export function useTaskListData({ status }: UseTaskListDataProps = {}) {
  return useAPIRequest<ListingResponse<TaskListItem>>({
    url: API_ROUTES.tasks.list,
    params: status ? { status } : undefined,
  })
}
