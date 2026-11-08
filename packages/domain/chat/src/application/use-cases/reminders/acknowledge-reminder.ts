import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import {
  appendReminderAction,
  computeNextFireAt,
} from '@ben/domain-chat/application/utils/reminders'
import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
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
  firedAt: Date
  snoozeUntil?: Date
  actedAt?: Date
}

export class AcknowledgeReminderUseCase implements UseCase<
  ItemResponse<Reminder>
> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Reminder>> {
    const reminder = await this.reminderRepository.get({
      id: createID(payload.reminderId),
      userId: createID(payload.userId),
    })

    if (
      payload.snoozeUntil &&
      payload.snoozeUntil.getTime() <= payload.firedAt.getTime()
    ) {
      throw new ValidationError({
        errorField: 'snoozeUntil',
        code: 'SNOOZE_BEFORE_FIRED_AT',
      })
    }

    const current = reminder.props.acknowledgedUntil
    const acknowledgedUntil =
      current && current.getTime() > payload.firedAt.getTime()
        ? current
        : payload.firedAt
    const snoozedUntil = payload.snoozeUntil ?? null

    const actions = payload.actedAt
      ? appendReminderAction(reminder.props, {
          type: payload.snoozeUntil ? 'snooze' : 'stop',
          firedAt: payload.firedAt,
          actedAt: payload.actedAt,
        })
      : undefined

    const changes = {
      acknowledgedUntil,
      snoozedUntil,
      ...(actions && { actions }),
    }
    const nextFireAt = computeNextFireAt(
      { ...reminder.props, ...changes },
      payload.morningTime,
    )

    const item = await this.reminderRepository.update(reminder.id, {
      ...changes,
      nextFireAt,
    })
    return { item }
  }
}
