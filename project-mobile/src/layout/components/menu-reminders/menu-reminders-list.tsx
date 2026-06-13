import type { ReminderListItem } from '@/api/models/reminder'
import { MenuListRow } from '@/layout/components/menu-list/menu-list-row'
import { Typography } from '@/layout/components/ui/typography'
import { firesAtRelative, relativeTime } from '@/layout/utils/format-time'
import { View } from 'react-native'

type MenuRemindersListProps = {
  reminders: ReminderListItem[]
  onSelect: (reminderId: string) => void
}

export function MenuRemindersList({
  reminders,
  onSelect,
}: MenuRemindersListProps) {
  const upcoming = reminders.filter(
    (reminder) => reminder.status === 'upcoming',
  )
  const fired = reminders.filter((reminder) => reminder.status === 'fired')

  return (
    <View className="flex flex-col gap-2">
      {upcoming.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            Upcoming
          </Typography>
          <View className="flex flex-col">
            {upcoming.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                trailing={firesAtRelative(reminder.firesAt)}
                emphasizeTrailing
                supporting={`captured ${relativeTime(reminder.capturedAt)}`}
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
            Fired
          </Typography>
          <View className="flex flex-col">
            {fired.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                trailing={firesAtRelative(reminder.firesAt)}
                supporting="fired"
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
