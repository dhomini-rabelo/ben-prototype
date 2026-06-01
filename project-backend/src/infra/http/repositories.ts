import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'
import { InMemoryTopicRepository } from '@/adapters/repositories/in-memory-topic-repository'
import { InMemoryTopicSummaryRepository } from '@/adapters/repositories/in-memory-topic-summary-repository'

export const messageRepository = new InMemoryMessageRepository()
export const topicRepository = new InMemoryTopicRepository()
export const topicSummaryRepository = new InMemoryTopicSummaryRepository()
