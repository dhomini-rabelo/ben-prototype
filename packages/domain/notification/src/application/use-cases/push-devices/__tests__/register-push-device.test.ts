import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryPushDeviceRepository } from '@ben/domain-notification/application/__tests__/repositories/push-device'
import { PushDeviceFactory } from '@ben/domain-notification/application/__tests__/factories/push-device'
import { RegisterPushDeviceUseCase } from '../register-push-device'

let pushDeviceRepository: InMemoryPushDeviceRepository
let pushDeviceFactory: PushDeviceFactory
let sut: RegisterPushDeviceUseCase

describe('RegisterPushDeviceUseCase', () => {
  beforeEach(() => {
    pushDeviceRepository = new InMemoryPushDeviceRepository()
    pushDeviceFactory = new PushDeviceFactory(pushDeviceRepository)
    sut = new RegisterPushDeviceUseCase(pushDeviceRepository)
  })

  describe('successful cases', () => {
    it('creates a device for a new token', async () => {
      const userId = createID()

      const { item, created } = await sut.execute({
        userId: userId.toValue(),
        token: 'ExponentPushToken[new]',
      })

      expect(created).toBe(true)
      expect(item.props.token).toBe('ExponentPushToken[new]')
      expect(item.props.userId.toValue()).toBe(userId.toValue())
      expect(await pushDeviceRepository.count({})).toBe(1)
    })

    it('reuses the device when the same user registers the token again', async () => {
      const userId = createID()
      const existing = await pushDeviceFactory.create({
        userId,
        token: 'ExponentPushToken[same]',
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      })

      const { item, created } = await sut.execute({
        userId: userId.toValue(),
        token: 'ExponentPushToken[same]',
      })

      expect(created).toBe(false)
      expect(item.id.toValue()).toBe(existing.id.toValue())
      expect(item.props.updatedAt.getTime()).toBeGreaterThan(
        new Date('2026-01-01T00:00:00Z').getTime(),
      )
      expect(await pushDeviceRepository.count({})).toBe(1)
    })

    it('transfers the token when another user registers it', async () => {
      const previousUserId = createID()
      const nextUserId = createID()
      const existing = await pushDeviceFactory.create({
        userId: previousUserId,
        token: 'ExponentPushToken[shared]',
      })

      const { item, created } = await sut.execute({
        userId: nextUserId.toValue(),
        token: 'ExponentPushToken[shared]',
      })

      expect(created).toBe(false)
      expect(item.id.toValue()).toBe(existing.id.toValue())
      expect(item.props.userId.toValue()).toBe(nextUserId.toValue())
      expect(await pushDeviceRepository.count({})).toBe(1)
    })
  })
})
