import type { CapturesCountsResponse } from "@/api/responses/captures";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useCapturesCountsData() {
  return useAPIRequest<ItemResponse<CapturesCountsResponse>>({
    url: API_ROUTES.captures.counts,
  });
}
