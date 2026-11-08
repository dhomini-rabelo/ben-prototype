import { DraggableSheetOverlay } from '@/layout/components/draggable-sheet-overlay'
import { MenuEntryListView } from '@/layout/components/menu/menu-entry-list-view'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import type { MenuEntryId } from '@/layout/stores/menu-store'

type ChatMenuSheetProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: MenuEntryId) => void
}

export function ChatMenuSheet({
  isOpen,
  onClose,
  onSelect,
}: ChatMenuSheetProps) {
  return (
    <DraggableSheetOverlay isOpen={isOpen} onClose={onClose}>
      <MenuSheet>
        <MenuEntryListView onSelect={onSelect} />
      </MenuSheet>
    </DraggableSheetOverlay>
  )
}
