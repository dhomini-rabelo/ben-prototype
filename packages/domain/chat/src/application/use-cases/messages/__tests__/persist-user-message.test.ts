import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { some } from '@ben/modules-tests'

import { InMemoryMessageRepository } from '@ben/domain-chat/application/__tests__/repositories/message'
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
      expect(stored.props.costUsd).toBeNull()
      expect(stored.props.interactionCostUsd).toBeNull()
      expect(stored.props.voiceDurationMs).toBeNull()
      expect(stored.props.createdAt).toEqual(now)
    })

    it('stores the voice duration given for the message', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        voiceDurationMs: 4200,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.voiceDurationMs).toBe(4200)
    })

    it('stores a null voice duration when it is explicitly null', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        voiceDurationMs: null,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.voiceDurationMs).toBeNull()
    })

    it('stores the transcription cost given for the message', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        costUsd: 0.0035,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.costUsd).toBe(0.0035)
      expect(stored.props.interactionCostUsd).toBeNull()
    })
  })
})
