import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'
import { some } from '@/modules/tests'

import { InMemoryTopicRepository } from '@/domain/__tests__/repositories/topic'
import { InMemoryTopicSummaryRepository } from '@/domain/__tests__/repositories/topic-summary'
import { TopicFactory } from '@/domain/__tests__/factories/topic'
import { PersistTopicSummariesUseCase } from '../persist-topic-summaries'

let topicRepository: InMemoryTopicRepository
let topicFactory: TopicFactory
let topicSummaryRepository: InMemoryTopicSummaryRepository
let sut: PersistTopicSummariesUseCase

describe('PersistTopicSummariesUseCase', () => {
  beforeEach(() => {
    topicRepository = new InMemoryTopicRepository()
    topicFactory = new TopicFactory(topicRepository)
    topicSummaryRepository = new InMemoryTopicSummaryRepository()
    sut = new PersistTopicSummariesUseCase(
      topicRepository,
      topicSummaryRepository,
    )
  })

  describe('successful cases', () => {
    it('creates the topic and the summary when the topic does not exist', async () => {
      const userId = createID()

      await sut.execute({
        userId: userId.toValue(),
        topics: [{ topic: 'reminder:work:meeting', summary: 'Weekly meeting' }],
      })

      const topics = await topicRepository.findMany({ userId })
      const summaries = await topicSummaryRepository.findMany({ userId })
      expect(topics).toHaveLength(1)
      expect(topics[0].props.key).toBe('reminder:work:meeting')
      expect(summaries).toHaveLength(1)
      expect(summaries[0].props.topicKey).toBe('reminder:work:meeting')
      expect(summaries[0].props.summary).toBe('Weekly meeting')
    })

    it('reuses the existing topic and only adds the summary', async () => {
      const userId = createID()
      await topicFactory.create({ userId, key: 'reminder:work:meeting' })

      await sut.execute({
        userId: userId.toValue(),
        topics: [{ topic: 'reminder:work:meeting', summary: 'Weekly meeting' }],
      })

      expect(await topicRepository.findMany({ userId })).toHaveLength(1)
      expect(await topicSummaryRepository.findMany({ userId })).toHaveLength(1)
    })

    it('links the summary to the message when a message id is given', async () => {
      const userId = createID()
      const messageId = some.uuid()

      await sut.execute({
        userId: userId.toValue(),
        topics: [{ topic: 'reminder:work:meeting', summary: 'Weekly meeting' }],
        messageId,
      })

      const [summary] = await topicSummaryRepository.findMany({ userId })
      expect(summary.props.messageId?.toValue()).toBe(messageId)
    })

    it('stores a null message id when none is given', async () => {
      const userId = createID()

      await sut.execute({
        userId: userId.toValue(),
        topics: [{ topic: 'reminder:work:meeting', summary: 'Weekly meeting' }],
      })

      const [summary] = await topicSummaryRepository.findMany({ userId })
      expect(summary.props.messageId).toBeNull()
    })

    it('persists every topic of a multi-topic payload', async () => {
      const userId = createID()

      await sut.execute({
        userId: userId.toValue(),
        topics: [
          { topic: 'reminder:work:meeting', summary: 'Weekly meeting' },
          { topic: 'task:home:cleaning', summary: 'Clean the kitchen' },
        ],
      })

      const topics = await topicRepository.findMany({ userId })
      const summaries = await topicSummaryRepository.findMany({ userId })
      expect(topics.map((topic) => topic.props.key).sort()).toEqual([
        'reminder:work:meeting',
        'task:home:cleaning',
      ])
      expect(summaries.map((summary) => summary.props.summary).sort()).toEqual([
        'Clean the kitchen',
        'Weekly meeting',
      ])
    })

    it('persists nothing when the topics list is empty', async () => {
      const userId = createID()

      await sut.execute({ userId: userId.toValue(), topics: [] })

      expect(await topicRepository.count({ userId })).toBe(0)
      expect(await topicSummaryRepository.count({ userId })).toBe(0)
    })
  })
})
