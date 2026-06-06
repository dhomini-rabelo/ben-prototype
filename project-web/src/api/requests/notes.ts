import { authClient } from "@/api/client";
import type { Note, NoteListItem } from "@/api/models/note";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse, ListingResponse } from "@/api/types";

export async function requestListNotes(): Promise<NoteListItem[]> {
  const response = await authClient.get<ListingResponse<NoteListItem>>(
    API_ROUTES.notes.list,
  );

  return response.data.items;
}

export async function requestGetNoteDetail(noteId: string): Promise<Note> {
  const response = await authClient.get<ItemResponse<Note>>(
    API_ROUTES.notes.detail(noteId),
  );

  return response.data.item;
}
