import {
  AgentReply,
  CheckFrequency,
  GoalRecurrence,
  ReminderAlert,
} from '@ben/adapters'
import { z } from 'zod'
import { agentReplySchema } from './schemas'

type AgentReplyOutput = z.infer<typeof agentReplySchema>
type AlertOutput = AgentReplyOutput['newReminders'][number]['alerts'][number]
type FrequencyOutput = NonNullable<
  AgentReplyOutput['newReminders'][number]['checkFrequency']
>
type RecurrenceOutput = AgentReplyOutput['newGoals'][number]['recurrence']

function toAlert(alert: AlertOutput): ReminderAlert | null {
  if (alert.kind !== 'minutes-before') return { kind: alert.kind }
  if (alert.minutes === null || alert.minutes <= 0) return null
  return { kind: 'minutes-before', minutes: alert.minutes }
}

function toCheckFrequency(frequency: FrequencyOutput): CheckFrequency {
  if (frequency.type !== 'every-n-days') return { type: frequency.type }
  if (frequency.days === null || frequency.days < 1) return { type: 'daily' }
  return { type: 'every-n-days', days: frequency.days }
}

function toRecurrence(recurrence: RecurrenceOutput): GoalRecurrence {
  if (recurrence.type !== 'weekdays') return { type: recurrence.type }
  const weekdays = (recurrence.weekdays ?? []).filter(
    (day) => Number.isInteger(day) && day >= 0 && day <= 6,
  )
  return weekdays.length > 0
    ? { type: 'weekdays', weekdays }
    : { type: 'daily' }
}

export function toAgentReply(output: AgentReplyOutput): AgentReply {
  return {
    ...output,
    newReminders: output.newReminders.map((reminder) => ({
      title: reminder.title,
      kind: reminder.kind,
      remindAt: reminder.remindAt ?? undefined,
      notes: reminder.notes ?? undefined,
      alerts: reminder.alerts
        .map(toAlert)
        .filter((alert): alert is ReminderAlert => alert !== null),
      checkFrequency: reminder.checkFrequency
        ? toCheckFrequency(reminder.checkFrequency)
        : undefined,
    })),
    newTasks: output.newTasks.map((task) => ({
      title: task.title,
      contentType: task.contentType,
      textContent: task.textContent ?? undefined,
      todoItems: task.todoItems ?? undefined,
    })),
    newGoals: output.newGoals.map((goal) => ({
      title: goal.title,
      startsAt: goal.startsAt,
      recurrence: toRecurrence(goal.recurrence),
      messages: goal.messages,
    })),
  }
}
