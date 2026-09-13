import { MessageRepository } from '@/adapters/repositories/message-repository'
import { NoteRepository } from '@/adapters/repositories/note-repository'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { TaskRepository } from '@/adapters/repositories/task-repository'
import { TopicRepository } from '@/adapters/repositories/topic-repository'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { env } from '@/infra/services/env'
import { getPrismaClient } from '@/infra/services/prisma'
import { InMemoryMessageRepository } from '@/infra/services/repositories/in-memory-message-repository'
import { InMemoryNoteRepository } from '@/infra/services/repositories/in-memory-note-repository'
import { InMemoryReminderRepository } from '@/infra/services/repositories/in-memory-reminder-repository'
import { InMemoryTaskRepository } from '@/infra/services/repositories/in-memory-task-repository'
import { InMemoryTopicRepository } from '@/infra/services/repositories/in-memory-topic-repository'
import { InMemoryTopicSummaryRepository } from '@/infra/services/repositories/in-memory-topic-summary-repository'
import { InMemoryUserRepository } from '@/infra/services/repositories/in-memory-user-repository'
import { SqliteMessageRepository } from '@/infra/services/repositories/sqlite-message-repository'
import { SqliteNoteRepository } from '@/infra/services/repositories/sqlite-note-repository'
import { SqliteReminderRepository } from '@/infra/services/repositories/sqlite-reminder-repository'
import { SqliteTaskRepository } from '@/infra/services/repositories/sqlite-task-repository'
import { SqliteTopicRepository } from '@/infra/services/repositories/sqlite-topic-repository'
import { SqliteTopicSummaryRepository } from '@/infra/services/repositories/sqlite-topic-summary-repository'
import { SqliteUserRepository } from '@/infra/services/repositories/sqlite-user-repository'

const useSqlite = env.PERSISTENCE_DRIVER === 'sqlite'
const prisma = useSqlite ? getPrismaClient() : null

export const messageRepository: MessageRepository = useSqlite
  ? new SqliteMessageRepository(prisma!)
  : new InMemoryMessageRepository()

export const noteRepository: NoteRepository = useSqlite
  ? new SqliteNoteRepository(prisma!)
  : new InMemoryNoteRepository()

export const reminderRepository: ReminderRepository = useSqlite
  ? new SqliteReminderRepository(prisma!)
  : new InMemoryReminderRepository()

export const taskRepository: TaskRepository = useSqlite
  ? new SqliteTaskRepository(prisma!)
  : new InMemoryTaskRepository()

export const topicRepository: TopicRepository = useSqlite
  ? new SqliteTopicRepository(prisma!)
  : new InMemoryTopicRepository()

export const topicSummaryRepository: TopicSummaryRepository = useSqlite
  ? new SqliteTopicSummaryRepository(prisma!)
  : new InMemoryTopicSummaryRepository()

export const userRepository: UserRepository = useSqlite
  ? new SqliteUserRepository(prisma!)
  : new InMemoryUserRepository()
