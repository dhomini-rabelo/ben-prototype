import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryConversationRepository } from '@ben/domain-topic/application/__tests__/repositories/conversation'
import { ConversationFactory } from '@ben/domain-topic/application/__tests__/factories/conversation'
import { RecordConversationUseCase } from '../record-conversation'

const HOUR_MS = 60 * 60 * 1000

let conversationRepository: InMemoryConversationRepository
let conversationFactory: ConversationFactory
let sut: RecordConversationUseCase

describe('RecordConversationUseCase', () => {
  beforeEach(() => {
    conversationRepository = new InMemoryConversationRepository()
    conversationFactory = new ConversationFactory(conversationRepository)
    sut = new RecordConversationUseCase(conversationRepository)
  })

  describe('successful cases', () => {
    it('creates a conversation with a normalized slug and a 24h expiration', async () => {
      const lastMessageAt = new Date()

      const { item } = await sut.execute({
        userId: createID().toValue(),
        slug: 'Encontro Família!',
        summary: 'Resumo',
        lastMessageAt,
      })

      expect(item.props.slug).toBe('encontro-familia')
      expect(item.props.expiresAt.getTime()).toBe(
        lastMessageAt.getTime() + 24 * HOUR_MS,
      )
    })

    it('updates the active conversation and keeps its slug', async () => {
      const userId = createID()
      const active = await conversationFactory.create({
        userId,
        slug: 'original',
        lastMessageAt: new Date(Date.now() - HOUR_MS),
      })
      const lastMessageAt = new Date()

      const { item } = await sut.execute({
        userId: userId.toValue(),
        slug: 'novo-slug',
        summary: 'Novo resumo',
        lastMessageAt,
      })

      expect(item.id.toValue()).toBe(active.id.toValue())
      expect(item.props.slug).toBe('original')
      expect(item.props.summary).toBe('Novo resumo')
      expect(item.props.lastMessageAt).toEqual(lastMessageAt)
      expect(await conversationRepository.count({ userId })).toBe(1)
    })

    it('creates a new conversation when the existing one has expired', async () => {
      const userId = createID()
      const expired = await conversationFactory.create({
        userId,
        lastMessageAt: new Date(Date.now() - 48 * HOUR_MS),
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        slug: 'nova',
        summary: 'Resumo',
        lastMessageAt: new Date(),
      })

      expect(item.id.toValue()).not.toBe(expired.id.toValue())
      expect(item.props.slug).toBe('nova')
    })

    it('ignores the active conversation of another user', async () => {
      const otherConversation = await conversationFactory.create({
        userId: createID(),
      })

      const { item } = await sut.execute({
        userId: createID().toValue(),
        slug: 'minha',
        summary: 'Resumo',
        lastMessageAt: new Date(),
      })

      expect(item.id.toValue()).not.toBe(otherConversation.id.toValue())
      expect(otherConversation.props.slug).toBe('encontro-familiar')
    })
  })
})
