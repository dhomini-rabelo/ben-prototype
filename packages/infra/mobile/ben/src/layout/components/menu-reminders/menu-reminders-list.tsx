import type { Language } from '@/core/languages'
import type { ReminderListItem } from '@/api/models/reminder'
import { MenuListRow } from '@/layout/components/menu-list/menu-list-row'
import { Typography } from '@/layout/components/ui/typography'
import { firesAtRelative, relativeTime } from '@/layout/utils/format-time'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { ReminderKindBadge } from '@/layout/components/menu-reminders/reminder-kind-badge'
import { View } from 'react-native'

function nextFireLabel(reminder: ReminderListItem, language: Language) {
  return firesAtRelative(reminder.nextFireAt ?? reminder.firesAt, language)
}

type MenuRemindersListProps = {
  reminders: ReminderListItem[]
  onSelect: (reminderId: string) => void
}

export function MenuRemindersList({
  reminders,
  onSelect,
}: MenuRemindersListProps) {
  const language = useLanguage()
  const strings = useStrings(menuStrings)
  const upcoming = reminders.filter((reminder) => reminder.status === 'active')
  const fired = reminders.filter((reminder) => reminder.status === 'done')

  return (
    <View className="flex flex-col gap-2">
      {upcoming.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            {strings.upcomingHeading}
          </Typography>
          <View className="flex flex-col">
            {upcoming.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                badge={<ReminderKindBadge kind={reminder.kind} />}
                trailing={nextFireLabel(reminder, language)}
                emphasizeTrailing
                supporting={strings.capturedSupporting(
                  relativeTime(reminder.capturedAt, language),
                )}
                onPress={() => onSelect(reminder.id)}
              />
            ))}
          </View>
        </>
      )}

      {fired.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="mt-4 px-3 text-on-surface-variant"
          >
            {strings.firedHeading}
          </Typography>
          <View className="flex flex-col">
            {fired.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                badge={<ReminderKindBadge kind={reminder.kind} />}
                trailing={firesAtRelative(reminder.firesAt, language)}
                supporting={strings.firedSupporting}
                muted
                onPress={() => onSelect(reminder.id)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  )
}
