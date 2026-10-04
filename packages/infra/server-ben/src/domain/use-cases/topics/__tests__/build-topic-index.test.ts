import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryTopicRepository } from '@/domain/__tests__/repositories/topic'
import { TopicFactory } from '@/domain/__tests__/factories/topic'
import { BuildTopicIndexUseCase } from '../build-topic-index'

let topicRepository: InMemoryTopicRepository
let topicFactory: TopicFactory
let sut: BuildTopicIndexUseCase

describe('BuildTopicIndexUseCase', () => {
  beforeEach(() => {
    topicRepository = new InMemoryTopicRepository()
    topicFactory = new TopicFactory(topicRepository)
    sut = new BuildTopicIndexUseCase(topicRepository)
  })

  describe('successful cases', () => {
    it('returns the topic keys of the user', async () => {
      const userId = createID()
      await topicFactory.createMany({ userId }, [
        { key: 'reminder:work:meeting' },
        { key: 'task:home:cleaning' },
      ])

      const keys = await sut.execute({ userId: userId.toValue() })

      expect(keys).toEqual(['reminder:work:meeting', 'task:home:cleaning'])
    })

    it('returns each key once when the same key is stored more than once', async () => {
      const userId = createID()
      await topicFactory.createMany({ userId, key: 'reminder:work:meeting' })

      const keys = await sut.execute({ userId: userId.toValue() })

      expect(keys).toEqual(['reminder:work:meeting'])
    })

    it('ignores topics of other users', async () => {
      const userId = createID()
      await topicFactory.create({ userId, key: 'reminder:work:mine' })
      await topicFactory.create({
        userId: createID(),
        key: 'reminder:work:theirs',
      })

      const keys = await sut.execute({ userId: userId.toValue() })

      expect(keys).toEqual(['reminder:work:mine'])
    })

    it('returns an empty list when the user has no topics', async () => {
      const keys = await sut.execute({ userId: createID().toValue() })

      expect(keys).toEqual([])
    })
  })
})
