import type {
  CheckFrequency,
  GoalRecurrence,
  ReminderAlert,
} from '@ben/adapters'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { computeNextFireAt } from '@ben/domain-chat/application/utils/reminders'
import {
  Reminder,
  ReminderProps,
  ReminderStatus,
} from '@ben/domain-chat/enterprise/entities/reminder'
import {
  createID,
  ItemResponse,
  UseCase,
  ValidationError,
} from '@ben/domain-base'

interface Payload {
  userId: string
  reminderId: string
  morningTime: string
  title?: string
  remindAt?: string
  alerts?: ReminderAlert[]
  recurrence?: GoalRecurrence
  checkFrequency?: CheckFrequency
  status?: ReminderStatus
  now?: Date
}

export class UpdateReminderUseCase implements UseCase<ItemResponse<Reminder>> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Reminder>> {
    const reminder = await this.reminderRepository.get({
      id: createID(payload.reminderId),
      userId: createID(payload.userId),
    })
    const { kind } = reminder.props

    this.validate(payload, kind)

    const changes: Partial<ReminderProps> = {}
    if (payload.title !== undefined) changes.title = payload.title
    if (payload.remindAt !== undefined) changes.remindAt = payload.remindAt
    if (payload.alerts !== undefined) changes.alerts = payload.alerts
    if (payload.recurrence !== undefined)
      changes.recurrence = payload.recurrence
    if (payload.checkFrequency !== undefined) {
      changes.checkFrequency = payload.checkFrequency
    }

    const scheduleChanged =
      payload.remindAt !== undefined ||
      payload.alerts !== undefined ||
      payload.recurrence !== undefined ||
      payload.checkFrequency !== undefined
    if (scheduleChanged) changes.snoozedUntil = null

    if (payload.status !== undefined) {
      changes.status = payload.status
      changes.completedAt =
        payload.status === 'done' ? (payload.now ?? new Date()) : null
    }

    const merged = {
      ...reminder.props,
      ...changes,
      acknowledgedUntil: this.resolveAnchor(
        reminder,
        payload.now,
        scheduleChanged,
      ),
    }
    changes.nextFireAt = computeNextFireAt(merged, payload.morningTime)

    const item = await this.reminderRepository.update(reminder.id, changes)
    return { item }
  }

  private resolveAnchor(
    reminder: Reminder,
    now: Date | undefined,
    scheduleChanged: boolean,
  ) {
    const { acknowledgedUntil, createdAt } = reminder.props
    const anchor = acknowledgedUntil ?? createdAt
    if (!scheduleChanged || !now || now.getTime() <= anchor.getTime()) {
      return acknowledgedUntil
    }
    return now
  }

  private validate(payload: Payload, kind: ReminderProps['kind']) {
    if (payload.recurrence !== undefined && kind !== 'goal') {
      throw new ValidationError({
        errorField: 'recurrence',
        code: 'REMINDER_RECURRENCE_ONLY_GOAL',
      })
    }
    if (payload.checkFrequency !== undefined && kind !== 'conditional') {
      throw new ValidationError({
        errorField: 'checkFrequency',
        code: 'REMINDER_CHECK_FREQUENCY_ONLY_CONDITIONAL',
      })
    }
    if (payload.remindAt !== undefined) {
      if (kind === 'conditional') {
        throw new ValidationError({
          errorField: 'remindAt',
          code: 'REMINDER_REMIND_AT_NOT_CONDITIONAL',
        })
      }
      if (Number.isNaN(new Date(payload.remindAt).getTime())) {
        throw new ValidationError({
          errorField: 'remindAt',
          code: 'INVALID_REMIND_AT',
        })
      }
    }
  }
}
