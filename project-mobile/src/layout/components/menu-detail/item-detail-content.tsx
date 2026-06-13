import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import type { ReminderStatus } from '@/api/models/reminder'
import { Typography } from '@/layout/components/ui/typography'
import { ItemDetailCapturedMeta } from './item-detail-captured-meta'
import { ItemDetailReminderMeta } from './item-detail-reminder-meta'

type ItemDetailContentProps = {
  title?: string
  body?: ReactNode
  capturedAtAbsolute?: string
  capturedAtRelative?: string
  firesAtRelative?: string
  firesAtAbsolute?: string
  status?: ReminderStatus
}

export function ItemDetailContent({
  title,
  body,
  capturedAtAbsolute,
  capturedAtRelative,
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailContentProps) {
  return (
    <View className="gap-3 px-5 pb-5">
      {title && (
        <Typography variant="headline-lg" className="text-on-surface">
          {title}
        </Typography>
      )}

      {(firesAtRelative || firesAtAbsolute) && (
        <ItemDetailReminderMeta
          firesAtRelative={firesAtRelative}
          firesAtAbsolute={firesAtAbsolute}
          status={status}
        />
      )}

      {body && (
        <ScrollView className="max-h-72 pr-1">
          <Typography variant="body-md" className="text-on-surface">
            {body}
          </Typography>
        </ScrollView>
      )}

      {(capturedAtAbsolute || capturedAtRelative) && (
        <ItemDetailCapturedMeta
          absolute={capturedAtAbsolute}
          relative={capturedAtRelative}
        />
      )}
    </View>
  )
}
