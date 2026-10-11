import { useEffect } from 'react'
import { MenuListEmpty } from '@/layout/components/menu-list/menu-list-empty'
import { MenuListError } from '@/layout/components/menu-list/menu-list-error'
import { MenuListLoading } from '@/layout/components/menu-list/menu-list-loading'
import { MenuListShell } from '@/layout/components/menu-list/menu-list-shell'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { useReminderListData } from '@/layout/hooks/api/use-reminder-list-data'
import { useMenuStore } from '@/layout/stores/menu-store'
import { menuStrings } from '@/layout/strings/menu-strings'
import { syncReminderNotifications } from '@/services/notifications-service'
import { MenuRemindersList } from './menu-reminders-list'

export function MenuRemindersView() {
  const { actions, state } = useReminderListData()
  const strings = useStrings(menuStrings)
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu)
  const openDetail = useMenuStore((store) => store.openDetail)
  const reminders = state.data?.items ?? []

  useEffect(() => {
    if (state.isLoading || state.isError || !state.data) {
      return
    }
    void syncReminderNotifications(state.data.items)
  }, [state.isLoading, state.isError, state.data])

  return (
    <MenuListShell title={strings.reminders} onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message={strings.remindersLoadError}
          onRetry={() => actions.refetch()}
        />
      ) : reminders.length === 0 ? (
        <MenuListEmpty
          title={strings.remindersEmptyTitle}
          description={
            <>
              {strings.remindersEmptySay}{' '}
              <Typography
                variant="body-md"
                className="font-mono text-[14px] text-on-surface"
              >
                {strings.remindersEmptyPhrase}
              </Typography>{' '}
              {strings.remindersEmptyCatch}
            </>
          }
        />
      ) : (
        <MenuRemindersList
          reminders={reminders}
          onSelect={(id) => openDetail({ kind: 'reminder', id })}
        />
      )}
    </MenuListShell>
  )
}
