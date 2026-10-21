import { z } from 'zod'

const reminderAlertSchema = z.object({
  kind: z.enum(['at-event', 'day-before', 'morning-of', 'minutes-before']),
  minutes: z.number().nullable(),
})

const checkFrequencySchema = z.object({
  type: z.enum(['daily', 'every-n-days', 'weekly']),
  days: z.number().nullable(),
})

const reminderDraftSchema = z.object({
  title: z.string(),
  kind: z.enum(['alarm', 'conditional']),
  remindAt: z.string().nullable(),
  notes: z.string().nullable(),
  alerts: z.array(reminderAlertSchema),
  checkFrequency: checkFrequencySchema.nullable(),
})

const goalRecurrenceSchema = z.object({
  type: z.enum(['none', 'daily', 'weekdays']),
  weekdays: z.array(z.number()).nullable(),
})

const goalDraftSchema = z.object({
  title: z.string(),
  startsAt: z.string(),
  recurrence: goalRecurrenceSchema,
  messages: z.array(z.string()),
})

const goalMessagesDraftSchema = z.object({
  goalId: z.string(),
  messages: z.array(z.string()),
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

const conversationUpdateSchema = z.object({
  slug: z.string(),
  summary: z.string(),
})

const userMemorySchema = z.object({
  key: z.string(),
  value: z.string(),
})

export const agentReplySchema = z.object({
  message: z.string(),
  newReminders: z.array(reminderDraftSchema),
  newNotes: z.array(noteDraftSchema),
  newTasks: z.array(taskDraftSchema),
  newGoals: z.array(goalDraftSchema),
  goalUpdates: z.array(goalMessagesDraftSchema),
  historyTopics: z.array(historyTopicSchema),
  conversation: conversationUpdateSchema,
  memories: z.array(userMemorySchema),
})
