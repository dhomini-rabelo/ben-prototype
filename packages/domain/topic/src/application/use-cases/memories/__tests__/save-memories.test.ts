import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryMemoryRepository } from '@ben/domain-topic/application/__tests__/repositories/memory'
import { MemoryFactory } from '@ben/domain-topic/application/__tests__/factories/memory'
import { SaveMemoriesUseCase } from '../save-memories'

let memoryRepository: InMemoryMemoryRepository
let memoryFactory: MemoryFactory
let sut: SaveMemoriesUseCase

describe('SaveMemoriesUseCase', () => {
  beforeEach(() => {
    memoryRepository = new InMemoryMemoryRepository()
    memoryFactory = new MemoryFactory(memoryRepository)
    sut = new SaveMemoriesUseCase(memoryRepository)
  })

  describe('successful cases', () => {
    it('creates a memory with the conversation id', async () => {
      const userId = createID()
      const conversationId = createID()

      const { items } = await sut.execute({
        userId: userId.toValue(),
        memories: [{ key: 'familia:nome-familiares', value: 'Mae: Maria' }],
        conversationId: conversationId.toValue(),
      })

      expect(items).toHaveLength(1)
      expect(items[0].props.value).toBe('Mae: Maria')
      expect(items[0].props.conversationId?.toValue()).toBe(
        conversationId.toValue(),
      )
    })

    it('updates the same key without duplicating', async () => {
      const userId = createID()
      await memoryFactory.create({
        userId,
        key: 'familia:nome-familiares',
        value: 'antigo',
      })

      await sut.execute({
        userId: userId.toValue(),
        memories: [{ key: 'familia:nome-familiares', value: 'novo' }],
        conversationId: null,
      })

      const memories = await memoryRepository.findMany({ userId })
      expect(memories).toHaveLength(1)
      expect(memories[0].props.value).toBe('novo')
    })

    it('normalizes the key to kebab-case', async () => {
      const { items } = await sut.execute({
        userId: createID().toValue(),
        memories: [{ key: 'Família:Nome Familiares', value: 'valor' }],
        conversationId: null,
      })

      expect(items[0].props.key).toBe('familia:nome-familiares')
    })

    it('discards keys without 2 segments and empty values', async () => {
      const { items } = await sut.execute({
        userId: createID().toValue(),
        memories: [
          { key: 'familia', value: 'valor' },
          { key: 'a:b:c', value: 'valor' },
          { key: 'familia:nome', value: '   ' },
        ],
        conversationId: null,
      })

      expect(items).toEqual([])
    })

    it('does not touch the same key of another user', async () => {
      const otherMemory = await memoryFactory.create({
        userId: createID(),
        key: 'familia:nome-familiares',
        value: 'outro',
      })

      await sut.execute({
        userId: createID().toValue(),
        memories: [{ key: 'familia:nome-familiares', value: 'meu' }],
        conversationId: null,
      })

      const stored = await memoryRepository.get({ id: otherMemory.id })
      expect(stored.props.value).toBe('outro')
    })
  })
})
