import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@/modules/domain/entity/id'
import { some } from '@/modules/tests'

import { InMemoryMessageRepository } from '@/domain/__tests__/repositories/message'
import { PersistUserMessageUseCase } from '../persist-user-message'

const now = new Date('2026-03-10T12:00:00.000Z')

let messageRepository: InMemoryMessageRepository
let sut: PersistUserMessageUseCase

describe('PersistUserMessageUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    messageRepository = new InMemoryMessageRepository()
    sut = new PersistUserMessageUseCase(messageRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful cases', () => {
    it('persists a user message with role user and null capture and trace', async () => {
      const userId = createID()
      const content = some.text()

      const { item } = await sut.execute({
        userId: userId.toValue(),
        content,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.userId.isEqual(userId)).toBe(true)
      expect(stored.props.role).toBe('user')
      expect(stored.props.content).toBe(content)
      expect(stored.props.capture).toBeNull()
      expect(stored.props.trace).toBeNull()
      expect(stored.props.createdAt).toEqual(now)
    })
  })
})
