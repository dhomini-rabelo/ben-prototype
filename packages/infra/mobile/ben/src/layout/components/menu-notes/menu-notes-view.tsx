import { MenuListEmpty } from '@/layout/components/menu-list/menu-list-empty'
import { MenuListError } from '@/layout/components/menu-list/menu-list-error'
import { MenuListLoading } from '@/layout/components/menu-list/menu-list-loading'
import { MenuListShell } from '@/layout/components/menu-list/menu-list-shell'
import { useStrings } from '@/layout/hooks/use-strings'
import { useNoteListData } from '@/layout/hooks/api/use-note-list-data'
import { useMenuStore } from '@/layout/stores/menu-store'
import { menuStrings } from '@/layout/strings/menu-strings'
import { MenuNotesList } from './menu-notes-list'

export function MenuNotesView() {
  const { actions, state } = useNoteListData()
  const strings = useStrings(menuStrings)
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu)
  const openDetail = useMenuStore((store) => store.openDetail)
  const notes = state.data?.items ?? []

  return (
    <MenuListShell title={strings.notes} onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message={strings.notesLoadError}
          onRetry={() => actions.refetch()}
        />
      ) : notes.length === 0 ? (
        <MenuListEmpty
          title={strings.notesEmptyTitle}
          description={strings.notesEmptyDescription}
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
