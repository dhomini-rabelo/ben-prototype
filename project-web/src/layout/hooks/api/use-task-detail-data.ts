import type { Task } from "../../../api/models/task";
import { API_ROUTES } from "../../../api/routes";
import type { ItemResponse } from "../../../api/types";
import { useAPIRequest } from "../use-api-request";

export function useTaskDetailData(taskId: string) {
  return useAPIRequest<ItemResponse<Task>>({
    url: API_ROUTES.tasks.detail(taskId),
  });
}
