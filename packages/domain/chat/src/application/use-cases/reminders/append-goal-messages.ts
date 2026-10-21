import { GoalMessagesDraft } from '@ben/adapters'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { createID } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  updates: GoalMessagesDraft[]
}

export class AppendGoalMessagesUseCase implements UseCase<void> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<void> {
    const goals = await this.reminderRepository.findMany({
      userId: createID(payload.userId),
      kind: 'goal',
    })

    for (const update of payload.updates) {
      const goal = goals.find((item) => item.id.toValue() === update.goalId)
      if (!goal) continue

      const messages = [...goal.props.messages]
      for (const raw of update.messages) {
        const text = raw.trim()
        if (text.length > 0 && !messages.includes(text)) messages.push(text)
      }

      await this.reminderRepository.update(goal.id, { messages })
    }
  }
}
