import type { Message } from "../../../api/models/message";
import { API_ROUTES } from "../../../api/routes";
import { useAPICursorPaginated } from "../use-api-cursor-paginated";

export function useMessageListData() {
  return useAPICursorPaginated<Message>({
    url: API_ROUTES.messages.list,
  });
}
