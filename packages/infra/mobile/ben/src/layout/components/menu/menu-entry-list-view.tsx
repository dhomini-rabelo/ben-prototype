import { useCapturesCountsData } from '@/layout/hooks/api/use-captures-counts-data'
import type { MenuEntryId } from '@/layout/stores/menu-store'
import { MenuEntryList } from './menu-entry-list'

type MenuEntryListViewProps = {
  onSelect: (id: MenuEntryId) => void
}

export function MenuEntryListView({ onSelect }: MenuEntryListViewProps) {
  const { state } = useCapturesCountsData()

  const variant = state.isLoading
    ? 'loading'
    : state.isError
      ? 'error'
      : 'default'

  const counts = state.data
    ? {
        tasks: state.data.item.tasks.active,
        notes: state.data.item.notes.total,
        reminders: state.data.item.reminders.total,
      }
    : undefined

  return <MenuEntryList variant={variant} counts={counts} onSelect={onSelect} />
}
