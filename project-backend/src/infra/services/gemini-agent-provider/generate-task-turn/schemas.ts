import { z } from 'zod'

const proposedTodoItemSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  done: z.boolean(),
  order: z.number(),
  diff: z.enum(['added', 'removed', 'unchanged']),
})

const proposedTaskChangesSchema = z.union([
  z.object({
    contentType: z.literal('text'),
    after: z.string(),
  }),
  z.object({
    contentType: z.literal('todo'),
    items: z.array(proposedTodoItemSchema),
  }),
])

export const taskTurnReplySchema = z.object({
  message: z.string(),
  proposedChanges: proposedTaskChangesSchema.nullable(),
  updatedSummary: z.string(),
})
