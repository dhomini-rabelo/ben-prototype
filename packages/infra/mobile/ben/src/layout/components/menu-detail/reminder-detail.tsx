import { useEffect } from 'react'
import { isAxiosError } from 'axios'
import { useReminderDetailData } from '@/layout/hooks/api/use-reminder-detail-data'
import {
  absoluteDateTime,
  firesAtRelative,
  relativeTime,
} from '@/layout/utils/format-time'
import {
  cancelReminderNotification,
  rescheduleReminderNotification,
} from '@/services/notifications-service'
import { ItemDetailContent } from './item-detail-content'
import { ItemDetailError } from './item-detail-error'
import { ItemDetailGone } from './item-detail-gone'
import { ItemDetailLoading } from './item-detail-loading'
import { ItemDetailRoot } from './item-detail-root'

type ReminderDetailProps = {
  reminderId: string
  onClose: () => void
}

export function ReminderDetail({ reminderId, onClose }: ReminderDetailProps) {
  const { actions, state } = useReminderDetailData(reminderId)
  const reminder = state.data?.item
  const isNotFound =
    isAxiosError(state.error) && state.error.response?.status === 404
  const isGone =
    (state.isError && isNotFound) ||
    (!state.isLoading && !state.isError && !reminder)

  useEffect(() => {
    if (state.isLoading) {
      return
    }
    if (reminder) {
      void rescheduleReminderNotification(reminder)
      return
    }
    if (isGone) {
      void cancelReminderNotification(reminderId)
    }
  }, [state.isLoading, reminder, isGone, reminderId])

  return (
    <ItemDetailRoot kind="reminder" onClose={onClose}>
      {state.isLoading ? (
        <ItemDetailLoading />
      ) : isGone ? (
        <ItemDetailGone />
      ) : state.isError ? (
        <ItemDetailError onRetry={() => actions.refetch()} />
      ) : reminder ? (
        <ItemDetailContent
          title={reminder.title}
          body={reminder.body ?? undefined}
          status={reminder.status}
          firesAtRelative={firesAtRelative(reminder.firesAt)}
          firesAtAbsolute={
            reminder.firesAt ? absoluteDateTime(reminder.firesAt) : undefined
          }
          capturedAtAbsolute={absoluteDateTime(reminder.capturedAt)}
          capturedAtRelative={relativeTime(reminder.capturedAt)}
        />
      ) : null}
    </ItemDetailRoot>
  )
}
