import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { InMemoryMessageRepository } from '@/domain/__tests__/repositories/message'
import { MessageFactory } from '@/domain/__tests__/factories/message'
import { AgentCallTrace } from '@ben/adapters'
import { GetMessageTraceUseCase } from '../get-message-trace'

const trace: AgentCallTrace = {
  status: 'ok',
  error: null,
  modelId: 'model-id',
  modelSlug: 'model-slug',
  effort: 'low',
  startedAt: '2026-01-01T00:00:00.000Z',
  finishedAt: '2026-01-01T00:00:01.000Z',
  latencyMs: 1000,
  totalUsage: {
    inputTokens: 1,
    outputTokens: 2,
    totalTokens: 3,
    reasoningTokens: null,
  },
  steps: [],
}

let messageRepository: InMemoryMessageRepository
let messageFactory: MessageFactory
let sut: GetMessageTraceUseCase

describe('GetMessageTraceUseCase', () => {
  beforeEach(() => {
    messageRepository = new InMemoryMessageRepository()
    messageFactory = new MessageFactory(messageRepository)
    sut = new GetMessageTraceUseCase(messageRepository)
  })

  describe('successful cases', () => {
    it('returns the message of the user', async () => {
      const userId = createID()
      const message = await messageFactory.create({
        userId,
        role: 'ben',
        trace,
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        messageId: message.id.toValue(),
      })

      expect(item.id.isEqual(message.id)).toBe(true)
      expect(item.props.trace).toEqual(trace)
    })
  })

  describe('validation cases', () => {
    it('rejects an unknown message', async () => {
      const userId = createID()

      await expectError(
        () =>
          sut
            .execute({ userId: userId.toValue(), messageId: some.uuid() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a message that belongs to another user', async () => {
      const message = await messageFactory.create({ userId: createID() })

      await expectError(
        () =>
          sut
            .execute({ userId: some.uuid(), messageId: message.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })
  })
})
