import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'
import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import { NoteRepository } from '@ben/domain-chat/application/repositories/note'
import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { TopicRepository } from '@ben/domain-topic/application/repositories/topic'
import { TopicSummaryRepository } from '@ben/domain-topic/application/repositories/topic-summary'
import { UserRepository } from '@ben/domain-user/application/repositories/user'
import { env } from '@ben/modules-env'
import {
  InMemoryConversationRepository,
  InMemoryMemoryRepository,
  InMemoryMessageRepository,
  InMemoryNoteRepository,
  InMemoryPushDeviceRepository,
  InMemoryReminderRepository,
  InMemoryTaskRepository,
  InMemoryTopicRepository,
  InMemoryTopicSummaryRepository,
  InMemoryUserRepository,
  SqliteConversationRepository,
  SqliteMemoryRepository,
  SqliteMessageRepository,
  SqliteNoteRepository,
  SqlitePushDeviceRepository,
  SqliteReminderRepository,
  SqliteTaskRepository,
  SqliteTopicRepository,
  SqliteTopicSummaryRepository,
  SqliteUserRepository,
  getPrismaClient,
} from '@ben/infra-db'

const useSqlite = env.PERSISTENCE_DRIVER === 'sqlite'
const prisma = useSqlite ? getPrismaClient() : null

export const conversationRepository: ConversationRepository = useSqlite
  ? new SqliteConversationRepository(prisma!)
  : new InMemoryConversationRepository()

export const memoryRepository: MemoryRepository = useSqlite
  ? new SqliteMemoryRepository(prisma!)
  : new InMemoryMemoryRepository()

export const messageRepository: MessageRepository = useSqlite
  ? new SqliteMessageRepository(prisma!)
  : new InMemoryMessageRepository()

export const noteRepository: NoteRepository = useSqlite
  ? new SqliteNoteRepository(prisma!)
  : new InMemoryNoteRepository()

export const pushDeviceRepository: PushDeviceRepository = useSqlite
  ? new SqlitePushDeviceRepository(prisma!)
  : new InMemoryPushDeviceRepository()

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
