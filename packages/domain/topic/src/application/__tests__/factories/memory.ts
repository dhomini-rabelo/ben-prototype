import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  Memory,
  MemoryProps,
} from '@ben/domain-topic/enterprise/entities/memory'
import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'

export function createMemoryData(data: Partial<MemoryProps> = {}): MemoryProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    key: data.key !== undefined ? data.key : 'familia:nome-familiares',
    value: data.value !== undefined ? data.value : some.text(),
    conversationId:
      data.conversationId !== undefined ? data.conversationId : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
    updatedAt: data.updatedAt !== undefined ? data.updatedAt : new Date(),
  }
}

export class MemoryFactory implements Factory<Memory, MemoryProps> {
  constructor(private memoryRepository: MemoryRepository) {}

  async create(data: Partial<MemoryProps> = {}) {
    return this.memoryRepository.create(createMemoryData(data))
  }

  async createMany(
    commonData: Partial<MemoryProps> = {},
    specificData: Partial<MemoryProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
