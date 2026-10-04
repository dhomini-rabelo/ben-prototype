import type { NoteListItem } from '@/api/models/note'
import { API_ROUTES } from '@/api/routes'
import type { ListingResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useNoteListData() {
  return useAPIRequest<ListingResponse<NoteListItem>>({
    url: API_ROUTES.notes.list,
  })
}
