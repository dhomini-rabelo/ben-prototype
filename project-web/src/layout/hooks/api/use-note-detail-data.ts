import type { Note } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useNoteDetailData(noteId: string) {
  return useAPIRequest<ItemResponse<Note>>({
    url: API_ROUTES.notes.detail(noteId),
  });
}
