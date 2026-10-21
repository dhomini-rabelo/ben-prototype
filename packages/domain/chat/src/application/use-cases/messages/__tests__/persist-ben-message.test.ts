import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { some } from '@ben/modules-tests'

import { InMemoryMessageRepository } from '@ben/domain-chat/application/__tests__/repositories/message'
import { AgentCallTrace } from '@ben/adapters'
import { MessageCapture } from '@ben/domain-chat/enterprise/entities/message'
import { PersistBenMessageUseCase } from '../persist-ben-message'

const now = new Date('2026-03-10T12:00:00.000Z')

function traceWithCost(costUsd: number | null): AgentCallTrace {
  return { ...trace, totalUsage: { ...trace.totalUsage, costUsd } }
}

const trace: AgentCallTrace = {
  status: 'ok',
  error: null,
  modelId: null,
  modelSlug: null,
  effort: null,
  startedAt: '2026-03-10T11:59:59.000Z',
  finishedAt: '2026-03-10T12:00:00.000Z',
  latencyMs: 1000,
  totalUsage: {
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    reasoningTokens: null,
    costUsd: null,
  },
  steps: [],
}

let messageRepository: InMemoryMessageRepository
let sut: PersistBenMessageUseCase

describe('PersistBenMessageUseCase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
    messageRepository = new InMemoryMessageRepository()
    sut = new PersistBenMessageUseCase(messageRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful cases', () => {
    it('persists a ben message with the given content, capture and trace', async () => {
      const userId = createID()
      const capture: MessageCapture = { kind: 'task', itemId: createID() }
      const content = some.text()

      const { item } = await sut.execute({
        userId: userId.toValue(),
        content,
        capture,
        trace,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.userId.isEqual(userId)).toBe(true)
      expect(stored.props.role).toBe('ben')
      expect(stored.props.content).toBe(content)
      expect(stored.props.capture).toEqual(capture)
      expect(stored.props.trace).toEqual(trace)
      expect(stored.props.createdAt).toEqual(now)
    })

    it('defaults capture and trace to null when omitted', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.capture).toBeNull()
      expect(stored.props.trace).toBeNull()
      expect(stored.props.costUsd).toBeNull()
      expect(stored.props.interactionCostUsd).toBeNull()
    })

    it('stores the trace cost and sums it with the trigger cost as the interaction cost', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        trace: traceWithCost(0.01),
        triggerCostUsd: 0.0035,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.costUsd).toBe(0.01)
      expect(stored.props.interactionCostUsd).toBeCloseTo(0.0135)
    })

    it('uses only the trace cost when there is no trigger cost', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        trace: traceWithCost(0.01),
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.costUsd).toBe(0.01)
      expect(stored.props.interactionCostUsd).toBe(0.01)
    })

    it('uses only the trigger cost when the trace has no cost', async () => {
      const { item } = await sut.execute({
        userId: createID().toValue(),
        content: some.text(),
        trace: traceWithCost(null),
        triggerCostUsd: 0.0035,
      })

      const stored = await messageRepository.get({ id: item.id })
      expect(stored.props.costUsd).toBeNull()
      expect(stored.props.interactionCostUsd).toBe(0.0035)
    })
  })
})
