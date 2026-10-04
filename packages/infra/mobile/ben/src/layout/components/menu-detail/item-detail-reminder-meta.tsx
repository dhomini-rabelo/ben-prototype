import { View } from 'react-native'
import type { ReminderStatus } from '@/api/models/reminder'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'

type ItemDetailReminderMetaProps = {
  firesAtRelative?: string
  firesAtAbsolute?: string
  status?: ReminderStatus
}

export function ItemDetailReminderMeta({
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailReminderMetaProps) {
  const isFired = status === 'fired'

  return (
    <View className="gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
      <View className="flex-row items-center gap-2">
        {firesAtRelative && (
          <Typography
            variant="body-md"
            className={cn(
              'font-semibold',
              isFired ? 'text-on-surface-variant' : 'text-on-surface',
            )}
          >
            {firesAtRelative}
          </Typography>
        )}
        {status && (
          <View
            className={cn(
              'rounded-full px-1.5 py-px',
              isFired ? 'bg-surface-container-high' : 'bg-primary/10',
            )}
          >
            <Typography
              variant="label-caps"
              className={cn(
                'font-mono',
                isFired ? 'text-on-surface-variant/70' : 'text-primary',
              )}
            >
              {status}
            </Typography>
          </View>
        )}
      </View>
      {firesAtAbsolute && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {firesAtAbsolute}
        </Typography>
      )}
    </View>
  )
}
