import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryTopicSummaryRepository } from '@ben/domain-topic/application/__tests__/repositories/topic-summary'
import { TopicSummaryFactory } from '@ben/domain-topic/application/__tests__/factories/topic-summary'
import { InMemoryConversationRepository } from '@ben/domain-topic/application/__tests__/repositories/conversation'
import { ConversationFactory } from '@ben/domain-topic/application/__tests__/factories/conversation'
import { toConversationKey } from '@ben/domain-topic/application/utils/conversations'
import { GetHistoryContextUseCase } from '../get-history-context'

let topicSummaryRepository: InMemoryTopicSummaryRepository
let topicSummaryFactory: TopicSummaryFactory
let conversationFactory: ConversationFactory
let sut: GetHistoryContextUseCase

describe('GetHistoryContextUseCase', () => {
  beforeEach(() => {
    topicSummaryRepository = new InMemoryTopicSummaryRepository()
    topicSummaryFactory = new TopicSummaryFactory(topicSummaryRepository)
    const conversationRepository = new InMemoryConversationRepository()
    conversationFactory = new ConversationFactory(conversationRepository)
    sut = new GetHistoryContextUseCase(
      topicSummaryRepository,
      conversationRepository,
    )
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

    it('includes the active conversation without being requested', async () => {
      const userId = createID()
      const conversation = await conversationFactory.create({
        userId,
        summary: 'Resumo da conversa',
      })

      const context = await sut.execute({
        userId: userId.toValue(),
        topics: [],
      })

      expect(context).toEqual({
        [toConversationKey(conversation)]: [
          { id: conversation.id.toValue(), summary: 'Resumo da conversa' },
        ],
      })
    })

    it('does not include an expired conversation', async () => {
      const userId = createID()
      await conversationFactory.create({
        userId,
        lastMessageAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      })

      const context = await sut.execute({
        userId: userId.toValue(),
        topics: [],
      })

      expect(context).toEqual({})
    })

    it('does not include the conversation of another user', async () => {
      await conversationFactory.create({ userId: createID() })

      const context = await sut.execute({
        userId: createID().toValue(),
        topics: [],
      })

      expect(context).toEqual({})
    })
  })
})
