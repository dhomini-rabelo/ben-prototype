import { InMemoryMessageRepository } from '@/infra/services/repositories/in-memory-message-repository'
import { InMemoryNoteRepository } from '@/infra/services/repositories/in-memory-note-repository'
import { InMemoryReminderRepository } from '@/infra/services/repositories/in-memory-reminder-repository'
import { InMemoryTaskRepository } from '@/infra/services/repositories/in-memory-task-repository'
import { InMemoryTopicRepository } from '@/infra/services/repositories/in-memory-topic-repository'
import { InMemoryTopicSummaryRepository } from '@/infra/services/repositories/in-memory-topic-summary-repository'

export const messageRepository = new InMemoryMessageRepository()
export const topicRepository = new InMemoryTopicRepository()
export const topicSummaryRepository = new InMemoryTopicSummaryRepository()
export const noteRepository = new InMemoryNoteRepository()
export const reminderRepository = new InMemoryReminderRepository()
export const taskRepository = new InMemoryTaskRepository()
