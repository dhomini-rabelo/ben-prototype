import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'
import { Memory } from '@ben/domain-topic/enterprise/entities/memory'
import { toKebabSlug } from '@ben/domain-topic/application/utils/keys'
import { createID } from '@ben/domain-base'
import { ListingResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface MemoryInput {
  key: string
  value: string
}

interface Payload {
  userId: string
  memories: MemoryInput[]
  conversationId: string | null
}

type Response = ListingResponse<Memory>

const MEMORY_KEY_SEGMENTS = 2

export class SaveMemoriesUseCase implements UseCase<Response> {
  constructor(private memoryRepository: MemoryRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const items: Memory[] = []

    for (const memoryInput of payload.memories) {
      const key = this.normalizeKey(memoryInput.key)
      const value = memoryInput.value.trim()

      if (!key || !value) {
        continue
      }

      items.push(await this.upsertMemory(payload, key, value))
    }

    return { items }
  }

  private normalizeKey(rawKey: string): string | null {
    const segments = rawKey.split(':').map(toKebabSlug)

    if (
      segments.length !== MEMORY_KEY_SEGMENTS ||
      segments.some((segment) => !segment)
    ) {
      return null
    }

    return segments.join(':')
  }

  private async upsertMemory(
    payload: Payload,
    key: string,
    value: string,
  ): Promise<Memory> {
    const userId = createID(payload.userId)
    const conversationId = payload.conversationId
      ? createID(payload.conversationId)
      : null
    const existingMemory = await this.memoryRepository.findFirst({
      userId,
      key,
    })

    if (existingMemory) {
      return this.memoryRepository.update(existingMemory.id, {
        value,
        conversationId,
        updatedAt: new Date(),
      })
    }

    const now = new Date()

    return this.memoryRepository.create({
      userId,
      key,
      value,
      conversationId,
      createdAt: now,
      updatedAt: now,
    })
  }
}
