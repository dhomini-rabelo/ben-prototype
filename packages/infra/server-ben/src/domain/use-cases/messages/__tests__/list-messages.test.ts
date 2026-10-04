import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryMessageRepository } from '@/domain/__tests__/repositories/message'
import { MessageFactory } from '@/domain/__tests__/factories/message'
import { ListMessagesUseCase } from '../list-messages'

const baseTime = new Date('2026-01-01T00:00:00.000Z').getTime()

function minutesAfterBase(minutes: number) {
  return new Date(baseTime + minutes * 60_000)
}

let messageRepository: InMemoryMessageRepository
let messageFactory: MessageFactory
let sut: ListMessagesUseCase

async function createMessagesForUser(userId: string, amount: number) {
  const owner = createID(userId)
  return Promise.all(
    Array.from({ length: amount }).map((_, index) =>
      messageFactory.create({
        userId: owner,
        content: `message-${index}`,
        createdAt: minutesAfterBase(index),
      }),
    ),
  )
}

describe('ListMessagesUseCase', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    messageFactory = new MessageFactory(messageRepository)
    sut = new ListMessagesUseCase(messageRepository)
  })

  describe('successful cases', () => {
    it('lists the user messages newest first', async () => {
      const userId = createID()
      await messageFactory.createMany(
        { userId },
        [
          { content: 'oldest', createdAt: minutesAfterBase(1) },
          { content: 'newest', createdAt: minutesAfterBase(3) },
          { content: 'middle', createdAt: minutesAfterBase(2) },
        ],
        3,
      )

      const response = await sut.execute({ userId: userId.toValue() })

      expect(response.items.map((message) => message.props.content)).toEqual([
        'newest',
        'middle',
        'oldest',
      ])
      expect(response.hasMore).toBe(false)
      expect(response.nextCursor).toBeNull()
    })

    it('does not list messages of other users', async () => {
      const userId = createID()
      const mine = await messageFactory.create({ userId })
      await messageFactory.createMany({ userId: createID() })

      const response = await sut.execute({ userId: userId.toValue() })

      expect(response.items).toHaveLength(1)
      expect(response.items[0].id.isEqual(mine.id)).toBe(true)
    })

    it('applies the default limit of 20 and reports hasMore with a next cursor', async () => {
      const userId = createID()
      await createMessagesForUser(userId.toValue(), 25)

      const response = await sut.execute({ userId: userId.toValue() })

      expect(response.items).toHaveLength(20)
      expect(response.hasMore).toBe(true)
      expect(response.nextCursor).toEqual(expect.any(String))
    })

    it('returns the next page when given the cursor of the previous page', async () => {
      const userId = createID()
      await createMessagesForUser(userId.toValue(), 25)
      const firstPage = await sut.execute({ userId: userId.toValue() })

      const secondPage = await sut.execute({
        userId: userId.toValue(),
        cursor: firstPage.nextCursor,
      })

      expect(secondPage.items.map((message) => message.props.content)).toEqual([
        'message-4',
        'message-3',
        'message-2',
        'message-1',
        'message-0',
      ])
      expect(secondPage.hasMore).toBe(false)
      expect(secondPage.nextCursor).toBeNull()
    })

    it('respects an explicit limit', async () => {
      const userId = createID()
      await createMessagesForUser(userId.toValue(), 5)

      const response = await sut.execute({
        userId: userId.toValue(),
        limit: 2,
      })

      expect(response.items.map((message) => message.props.content)).toEqual([
        'message-4',
        'message-3',
      ])
      expect(response.hasMore).toBe(true)
      expect(response.nextCursor).toEqual(expect.any(String))
    })

    it('returns an empty list with hasMore false when the user has no messages', async () => {
      const response = await sut.execute({ userId: createID().toValue() })

      expect(response).toEqual({ items: [], hasMore: false, nextCursor: null })
    })
  })
})
