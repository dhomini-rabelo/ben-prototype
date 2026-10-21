import type { ReminderKind } from '@/api/models/reminder'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { View } from 'react-native'

type ReminderKindBadgeProps = {
  kind: ReminderKind
}

export function ReminderKindBadge({ kind }: ReminderKindBadgeProps) {
  const strings = useStrings(menuStrings)

  return (
    <View className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-px">
      <Typography
        variant="label-caps"
        className="font-mono text-on-surface-variant"
      >
        {strings.reminderKinds[kind]}
      </Typography>
    </View>
  )
}
