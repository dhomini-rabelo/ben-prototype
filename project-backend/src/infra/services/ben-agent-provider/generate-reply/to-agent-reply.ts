import { AgentReply } from '@/adapters/agent-provider'
import { z } from 'zod'
import { agentReplySchema } from './schemas'

type AgentReplyOutput = z.infer<typeof agentReplySchema>

export function toAgentReply(output: AgentReplyOutput): AgentReply {
  return {
    ...output,
    newReminders: output.newReminders.map((reminder) => ({
      title: reminder.title,
      remindAt: reminder.remindAt ?? undefined,
      notes: reminder.notes ?? undefined,
    })),
    newTasks: output.newTasks.map((task) => ({
      title: task.title,
      contentType: task.contentType,
      textContent: task.textContent ?? undefined,
      todoItems: task.todoItems ?? undefined,
    })),
  }
}
