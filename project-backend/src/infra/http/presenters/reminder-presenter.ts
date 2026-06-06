import { Reminder } from '@/domain/entities/reminder'

type ReminderStatus = 'upcoming' | 'fired'

interface ReminderHttp {
  id: string
  title: string
  firesAt: string | null
  body: string | null
  status: ReminderStatus
  capturedAt: string
}

export class ReminderPresenter {
  static toHttp(reminder: Reminder): ReminderHttp {
    return {
      id: reminder.id.toValue(),
      title: reminder.props.title,
      firesAt: reminder.props.remindAt,
      body: reminder.props.notes,
      status: ReminderPresenter.resolveStatus(reminder.props.remindAt),
      capturedAt: reminder.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(reminder: Reminder): ReminderHttp {
    return ReminderPresenter.toHttp(reminder)
  }

  private static resolveStatus(remindAt: string | null): ReminderStatus {
    if (!remindAt) {
      return 'upcoming'
    }

    return new Date(remindAt).getTime() > Date.now() ? 'upcoming' : 'fired'
  }
}
