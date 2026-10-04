import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryTopicSummaryRepository } from '@ben/domain-topic/application/__tests__/repositories/topic-summary'
import { TopicSummaryFactory } from '@ben/domain-topic/application/__tests__/factories/topic-summary'
import { GetHistoryContextUseCase } from '../get-history-context'

let topicSummaryRepository: InMemoryTopicSummaryRepository
let topicSummaryFactory: TopicSummaryFactory
let sut: GetHistoryContextUseCase

describe('GetHistoryContextUseCase', () => {
  beforeEach(() => {
    topicSummaryRepository = new InMemoryTopicSummaryRepository()
    topicSummaryFactory = new TopicSummaryFactory(topicSummaryRepository)
    sut = new GetHistoryContextUseCase(topicSummaryRepository)
  })

  describe('successful cases', () => {
    it('groups summaries by requested topic with id and summary', async () => {
      const userId = createID()
      const workSummary = await topicSummaryFactory.create({
        userId,
        topicKey: 'reminder:work:meeting',
        summary: 'Weekly meeting on Monday',
      })
      const homeSummary = await topicSummaryFactory.create({
        userId,
        topicKey: 'task:home:cleaning',
        summary: 'Clean the kitchen',
      })

      const context = await sut.execute({
        userId: userId.toValue(),
        topics: ['reminder:work:meeting', 'task:home:cleaning'],
      })

      expect(context).toEqual({
        'reminder:work:meeting': [
          { id: workSummary.id.toValue(), summary: 'Weekly meeting on Monday' },
        ],
        'task:home:cleaning': [
          { id: homeSummary.id.toValue(), summary: 'Clean the kitchen' },
        ],
      })
    })

    it('returns an empty list for a topic without summaries', async () => {
      const context = await sut.execute({
        userId: createID().toValue(),
        topics: ['reminder:work:unknown'],
      })

      expect(context).toEqual({ 'reminder:work:unknown': [] })
    })

    it('does not include summaries of other users', async () => {
      const userId = createID()
      await topicSummaryFactory.create({
        userId: createID(),
        topicKey: 'reminder:work:meeting',
      })

      const context = await sut.execute({
        userId: userId.toValue(),
        topics: ['reminder:work:meeting'],
      })

      expect(context).toEqual({ 'reminder:work:meeting': [] })
    })

    it('returns an empty object when no topics are requested', async () => {
      const userId = createID()
      await topicSummaryFactory.create({ userId })

      const context = await sut.execute({
        userId: userId.toValue(),
        topics: [],
      })

      expect(context).toEqual({})
    })
  })
})
