import { beforeEach, describe, expect, it } from 'vitest'

import { createID, ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryMessageRepository } from '@ben/domain-chat/application/__tests__/repositories/message'
import { MessageFactory } from '@ben/domain-chat/application/__tests__/factories/message'
import {
  ListMessageHistoryUseCase,
  MESSAGE_HISTORY_PAGE_SIZE,
} from '../list-message-history'

const baseTime = new Date('2026-01-01T00:00:00.000Z').getTime()

function minutesAfterBase(minutes: number) {
  return new Date(baseTime + minutes * 60_000)
}

let messageRepository: InMemoryMessageRepository
let messageFactory: MessageFactory
let sut: ListMessageHistoryUseCase

async function createMessagesForUser(userId: string, amount: number) {
  const owner = createID(userId)
  const messages = []
  for (let index = 0; index < amount; index++) {
    messages.push(
      await messageFactory.create({
        userId: owner,
        content: `message-${index}`,
        createdAt: minutesAfterBase(index),
      }),
    )
  }
  return messages
}

const contents = (items: Array<{ props: { content: string } }>) =>
  items.map((message) => message.props.content)

describe('ListMessageHistoryUseCase', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    messageFactory = new MessageFactory(messageRepository)
    sut = new ListMessageHistoryUseCase(messageRepository)
  })

  describe('successful cases', () => {
    it('excludes the anchor and the messages newer than it', async () => {
      const userId = createID()
      const messages = await createMessagesForUser(userId.toValue(), 5)

      const response = await sut.execute({
        userId: userId.toValue(),
        beforeMessageId: messages[3].id.toValue(),
      })

      expect(contents(response.items)).toEqual([
        'message-0',
        'message-1',
        'message-2',
      ])
    })

    it('returns at most 15 messages in chronological order', async () => {
      const userId = createID()
      const messages = await createMessagesForUser(userId.toValue(), 21)

      const response = await sut.execute({
        userId: userId.toValue(),
        beforeMessageId: messages[20].id.toValue(),
      })

      expect(response.items).toHaveLength(MESSAGE_HISTORY_PAGE_SIZE)
      expect(contents(response.items)).toEqual(
        Array.from({ length: 15 }, (_, index) => `message-${index + 5}`),
      )
      expect(response.hasMore).toBe(true)
    })

    it('pages to older messages through nextCursor without overlap', async () => {
      const userId = createID()
      const messages = await createMessagesForUser(userId.toValue(), 21)
      const firstPage = await sut.execute({
        userId: userId.toValue(),
        beforeMessageId: messages[20].id.toValue(),
      })

      const secondPage = await sut.execute({
        userId: userId.toValue(),
        cursor: firstPage.nextCursor!,
      })

      expect(contents(secondPage.items)).toEqual([
        'message-0',
        'message-1',
        'message-2',
        'message-3',
        'message-4',
      ])
      expect(secondPage.hasMore).toBe(false)
      expect(secondPage.nextCursor).toBeNull()
    })

    it('ignores messages of other users', async () => {
      const userId = createID()
      const messages = await createMessagesForUser(userId.toValue(), 2)
      await createMessagesForUser(createID().toValue(), 3)

      const response = await sut.execute({
        userId: userId.toValue(),
        beforeMessageId: messages[1].id.toValue(),
      })

      expect(contents(response.items)).toEqual(['message-0'])
    })
  })

  describe('error cases', () => {
    it('throws ResourceNotFoundError when the anchor belongs to another user', async () => {
      const [foreignMessage] = await createMessagesForUser(
        createID().toValue(),
        1,
      )

      await expect(
        sut.execute({
          userId: createID().toValue(),
          beforeMessageId: foreignMessage.id.toValue(),
        }),
      ).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
  })
})
