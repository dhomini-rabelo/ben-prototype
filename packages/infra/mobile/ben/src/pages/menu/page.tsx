import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { NoteDetail } from '@/layout/components/menu-detail/note-detail'
import { ReminderDetail } from '@/layout/components/menu-detail/reminder-detail'
import { MenuNotesView } from '@/layout/components/menu-notes/menu-notes-view'
import { MenuRemindersView } from '@/layout/components/menu-reminders/menu-reminders-view'
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
import { MenuTasksView } from '@/layout/components/menu-tasks/menu-tasks-view'
import { useMenuStore } from '@/layout/stores/menu-store'

export function Menu() {
  const router = useRouter()
  const view = useMenuStore((store) => store.view)
  const detailTarget = useMenuStore((store) => store.detailTarget)
  const closeDetail = useMenuStore((store) => store.closeDetail)
  const reset = useMenuStore((store) => store.reset)

  useEffect(() => () => reset(), [reset])

  useEffect(() => {
    if (view === 'menu') router.back()
  }, [view, router])

  return (
    <View className="flex-1 bg-surface-container-lowest">
      {view === 'tasks' && <MenuTasksView />}
      {view === 'notes' && <MenuNotesView />}
      {view === 'reminders' && <MenuRemindersView />}

      <SettingsSheetOverlay isOpen={detailTarget != null} onClose={closeDetail}>
        {detailTarget && (
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
        )}
      </SettingsSheetOverlay>
    </View>
  )
}
