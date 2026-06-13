import { MenuListEmpty } from '@/layout/components/menu-list/menu-list-empty'
import { MenuListError } from '@/layout/components/menu-list/menu-list-error'
import { MenuListLoading } from '@/layout/components/menu-list/menu-list-loading'
import { MenuListShell } from '@/layout/components/menu-list/menu-list-shell'
import { useNoteListData } from '@/layout/hooks/api/use-note-list-data'
import { useMenuStore } from '@/layout/stores/menu-store'
import { MenuNotesList } from './menu-notes-list'

export function MenuNotesView() {
  const { actions, state } = useNoteListData()
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu)
  const openDetail = useMenuStore((store) => store.openDetail)
  const notes = state.data?.items ?? []

  return (
    <MenuListShell title="Notes" onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your notes"
          onRetry={() => actions.refetch()}
        />
      ) : notes.length === 0 ? (
        <MenuListEmpty
          title="no notes yet"
          description="talk to Ben — he'll save the keepers."
        />
      ) : (
        <MenuNotesList
          notes={notes}
          onSelect={(id) => openDetail({ kind: 'note', id })}
        />
      )}
    </MenuListShell>
  )
}
