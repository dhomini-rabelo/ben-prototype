import { z } from 'zod'

const reminderDraftSchema = z.object({
  title: z.string(),
  remindAt: z.string().nullable(),
  notes: z.string().nullable(),
})

const noteDraftSchema = z.object({
  title: z.string(),
  body: z.string(),
})

const taskDraftSchema = z.object({
  title: z.string(),
  contentType: z.enum(['text', 'todo']),
  textContent: z.string().nullable(),
  todoItems: z.array(z.string()).nullable(),
})

const historyTopicSchema = z.object({
  topic: z.string(),
  summary: z.string(),
})

export const agentReplySchema = z.object({
  message: z.string(),
  newReminders: z.array(reminderDraftSchema),
  newNotes: z.array(noteDraftSchema),
  newTasks: z.array(taskDraftSchema),
  historyTopics: z.array(historyTopicSchema),
})
