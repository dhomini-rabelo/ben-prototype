import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'
import { InMemoryNoteRepository } from '@/adapters/repositories/in-memory-note-repository'
import { InMemoryReminderRepository } from '@/adapters/repositories/in-memory-reminder-repository'
import { InMemoryTaskRepository } from '@/adapters/repositories/in-memory-task-repository'
import { InMemoryTopicRepository } from '@/adapters/repositories/in-memory-topic-repository'
import { InMemoryTopicSummaryRepository } from '@/adapters/repositories/in-memory-topic-summary-repository'

export const messageRepository = new InMemoryMessageRepository()
export const topicRepository = new InMemoryTopicRepository()
export const topicSummaryRepository = new InMemoryTopicSummaryRepository()
export const noteRepository = new InMemoryNoteRepository()
export const reminderRepository = new InMemoryReminderRepository()
export const taskRepository = new InMemoryTaskRepository()
