import { useEffect } from 'react'
import { View } from 'react-native'
import { MenuSidebarView } from '@/layout/components/menu/menu-sidebar-view'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { NoteDetail } from '@/layout/components/menu-detail/note-detail'
import { ReminderDetail } from '@/layout/components/menu-detail/reminder-detail'
import { MenuNotesView } from '@/layout/components/menu-notes/menu-notes-view'
import { MenuRemindersView } from '@/layout/components/menu-reminders/menu-reminders-view'
import { SettingsView } from '@/layout/components/menu-settings/settings-view'
import { MenuTasksView } from '@/layout/components/menu-tasks/menu-tasks-view'
import { useMenuStore } from '@/layout/stores/menu-store'

export function Menu() {
  const view = useMenuStore((store) => store.view)
  const detailTarget = useMenuStore((store) => store.detailTarget)
  const isSettingsOpen = useMenuStore((store) => store.isSettingsOpen)
  const closeDetail = useMenuStore((store) => store.closeDetail)
  const closeSettings = useMenuStore((store) => store.closeSettings)
  const reset = useMenuStore((store) => store.reset)

  useEffect(() => () => reset(), [reset])

  return (
    <View className="flex-1 bg-surface-container-lowest">
      {view === 'menu' && <MenuSidebarView />}
      {view === 'tasks' && <MenuTasksView />}
      {view === 'notes' && <MenuNotesView />}
      {view === 'reminders' && <MenuRemindersView />}

      {detailTarget && (
        <View className="absolute inset-x-0 bottom-0">
          <MenuSheet>
            {detailTarget.kind === 'note' ? (
              <NoteDetail noteId={detailTarget.id} onClose={closeDetail} />
            ) : (
              <ReminderDetail
                reminderId={detailTarget.id}
                onClose={closeDetail}
              />
            )}
          </MenuSheet>
        </View>
      )}

      {isSettingsOpen && (
        <View className="absolute inset-x-0 bottom-0">
          <SettingsView onClose={closeSettings} />
        </View>
      )}
    </View>
  )
}
