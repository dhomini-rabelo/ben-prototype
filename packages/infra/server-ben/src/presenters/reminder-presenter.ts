import {
  Reminder,
  ReminderActionType,
  ReminderProps,
} from '@ben/domain-chat/enterprise/entities/reminder'
import { Serialize, WithID } from '@ben/domain-base'
import { OverWrite } from '@ben/modules-utils'

type ReminderHttp = OverWrite<
  Omit<
    Serialize<WithID<ReminderProps>>,
    'userId' | 'remindAt' | 'notes' | 'createdAt' | 'actions'
  >,
  {
    firesAt: string | null
    body: string | null
    capturedAt: string
    nextFireAt: string | null
    snoozedUntil: string | null
    acknowledgedUntil: string | null
    completedAt: string | null
    actions: { type: ReminderActionType; firedAt: string; actedAt: string }[]
  }
>

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export class ReminderPresenter {
  static toHttp(reminder: Reminder): ReminderHttp {
    const { props } = reminder
    return {
      id: reminder.id.toValue(),
      title: props.title,
      kind: props.kind,
      status: props.status,
      firesAt: props.remindAt,
      body: props.notes,
      capturedAt: props.createdAt.toISOString(),
      timeZone: props.timeZone,
      alerts: props.alerts,
      recurrence: props.recurrence,
      messages: props.messages,
      checkFrequency: props.checkFrequency,
      nextFireAt: toIso(props.nextFireAt),
      snoozedUntil: toIso(props.snoozedUntil),
      acknowledgedUntil: toIso(props.acknowledgedUntil),
      completedAt: toIso(props.completedAt),
      actions: (props.actions ?? []).map((action) => ({
        type: action.type,
        firedAt: action.firedAt.toISOString(),
        actedAt: action.actedAt.toISOString(),
      })),
    }
  }

  static toListItemHttp(reminder: Reminder): ReminderHttp {
    return ReminderPresenter.toHttp(reminder)
  }
}
