import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryConversationRepository } from '@ben/domain-topic/application/__tests__/repositories/conversation'
import { InMemoryMemoryRepository } from '@ben/domain-topic/application/__tests__/repositories/memory'
import { ConversationFactory } from '@ben/domain-topic/application/__tests__/factories/conversation'
import { MemoryFactory } from '@ben/domain-topic/application/__tests__/factories/memory'
import { LoadAgentContextUseCase } from '../load-agent-context'

const HOUR_MS = 60 * 60 * 1000

let conversationFactory: ConversationFactory
let memoryFactory: MemoryFactory
let sut: LoadAgentContextUseCase

describe('LoadAgentContextUseCase', () => {
  beforeEach(() => {
    const conversationRepository = new InMemoryConversationRepository()
    const memoryRepository = new InMemoryMemoryRepository()
    conversationFactory = new ConversationFactory(conversationRepository)
    memoryFactory = new MemoryFactory(memoryRepository)
    sut = new LoadAgentContextUseCase(conversationRepository, memoryRepository)
  })

  describe('successful cases', () => {
    it('returns the most recent active conversation and only the user memories', async () => {
      const userId = createID()
      const now = Date.now()
      await conversationFactory.create({
        userId,
        slug: 'older',
        lastMessageAt: new Date(now - 3 * HOUR_MS),
      })
      const recent = await conversationFactory.create({
        userId,
        slug: 'recent',
        lastMessageAt: new Date(now - HOUR_MS),
      })
      await memoryFactory.create({ userId, key: 'familia:nome-familiares' })
      await memoryFactory.create({ userId, key: 'casa:endereco' })
      await memoryFactory.create({ userId: createID(), key: 'outro:valor' })

      const context = await sut.execute({ userId: userId.toValue() })

      expect(context.activeConversation?.id.toValue()).toBe(recent.id.toValue())
      expect(context.memories.map((memory) => memory.props.key)).toEqual([
        'casa:endereco',
        'familia:nome-familiares',
      ])
    })

    it('returns null when the conversation has expired', async () => {
      const userId = createID()
      await conversationFactory.create({
        userId,
        lastMessageAt: new Date(Date.now() - 48 * HOUR_MS),
      })

      const context = await sut.execute({ userId: userId.toValue() })

      expect(context.activeConversation).toBeNull()
    })
  })
})
