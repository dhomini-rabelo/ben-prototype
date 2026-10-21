import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import {
  fromZonedParts,
  occursOnLocalDate,
} from '@ben/domain-chat/application/utils/reminders'
import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
import { createID, UseCase, ValidationError } from '@ben/domain-base'

interface Payload {
  userId: string
  date: string
  timeZone: string
}

interface Response {
  alarms: Reminder[]
  goals: Reminder[]
  conditionals: Reminder[]
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export class GetDailySummaryUseCase implements UseCase<Response> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const endOfDay = this.resolveEndOfDayExclusive(
      payload.date,
      payload.timeZone,
    )

    const reminders = await this.reminderRepository.findMany(
      { userId: createID(payload.userId), status: 'active' },
      { orderBy: 'createdAt', order: 'asc' },
    )

    const occurs = (reminder: Reminder) =>
      occursOnLocalDate(reminder.props, payload.date, payload.timeZone)

    return {
      alarms: reminders.filter(
        (item) => item.props.kind === 'alarm' && occurs(item),
      ),
      goals: reminders.filter(
        (item) => item.props.kind === 'goal' && occurs(item),
      ),
      conditionals: reminders.filter(
        (item) =>
          item.props.kind === 'conditional' &&
          item.props.nextFireAt !== null &&
          item.props.nextFireAt.getTime() < endOfDay.getTime(),
      ),
    }
  }

  private resolveEndOfDayExclusive(date: string, timeZone: string): Date {
    const match = DATE_PATTERN.exec(date)
    if (!match) {
      throw new ValidationError({ errorField: 'date', code: 'INVALID_DATE' })
    }
    try {
      return fromZonedParts(
        {
          year: Number(match[1]),
          month: Number(match[2]),
          day: Number(match[3]) + 1,
          hour: 0,
          minute: 0,
          second: 0,
        },
        timeZone,
      )
    } catch {
      throw new ValidationError({
        errorField: 'timeZone',
        code: 'INVALID_TIME_ZONE',
      })
    }
  }
}
