import { TaskTurnReply } from '@/adapters/agent-provider'
import { z } from 'zod'
import { taskTurnReplySchema } from './schemas'

type TaskTurnReplyOutput = z.infer<typeof taskTurnReplySchema>

export function toTaskTurnReply(output: TaskTurnReplyOutput): TaskTurnReply {
  const { proposedChanges } = output

  if (proposedChanges?.contentType !== 'todo') {
    return { ...output, proposedChanges }
  }

  return {
    ...output,
    proposedChanges: {
      contentType: 'todo',
      items: proposedChanges.items.map((item) => ({
        ...item,
        id: item.id ?? undefined,
      })),
    },
  }
}
