import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'
import { FakePushSender } from '@ben/modules-tests'

import { InMemoryPushDeviceRepository } from '@ben/domain-notification/application/__tests__/repositories/push-device'
import { PushDeviceFactory } from '@ben/domain-notification/application/__tests__/factories/push-device'
import { SendUserPushNotificationUseCase } from '../send-user-push-notification'

let pushDeviceRepository: InMemoryPushDeviceRepository
let pushDeviceFactory: PushDeviceFactory
let pushSender: FakePushSender
let sut: SendUserPushNotificationUseCase

const message = {
  title: 'Ben',
  body: 'Hello',
  data: { type: 'test' },
  channelId: 'alarmes',
}

describe('SendUserPushNotificationUseCase', () => {
  beforeEach(() => {
    pushDeviceRepository = new InMemoryPushDeviceRepository()
    pushDeviceFactory = new PushDeviceFactory(pushDeviceRepository)
    pushSender = new FakePushSender()
    sut = new SendUserPushNotificationUseCase(pushDeviceRepository, pushSender)
  })

  describe('successful cases', () => {
    it('sends to every device of the user and to no device of another user', async () => {
      const userId = createID()
      await pushDeviceFactory.create({ userId, token: 'token-a' })
      await pushDeviceFactory.create({ userId, token: 'token-b' })
      await pushDeviceFactory.create({
        userId: createID(),
        token: 'token-other',
      })

      const result = await sut.execute({ userId: userId.toValue(), ...message })

      expect(result).toEqual({ sentCount: 2, removedCount: 0 })
      expect(pushSender.sent.map((sent) => sent.to).sort()).toEqual([
        'token-a',
        'token-b',
      ])
      expect(pushSender.sent[0]).toMatchObject(message)
    })

    it('does not call the sender when the user has no devices', async () => {
      await pushDeviceFactory.create({
        userId: createID(),
        token: 'token-other',
      })

      const result = await sut.execute({
        userId: createID().toValue(),
        ...message,
      })

      expect(result).toEqual({ sentCount: 0, removedCount: 0 })
      expect(pushSender.sent).toHaveLength(0)
    })

    it('removes only the devices the provider reports as unregistered', async () => {
      const userId = createID()
      await pushDeviceFactory.create({ userId, token: 'token-valid' })
      await pushDeviceFactory.create({ userId, token: 'token-stale' })
      pushSender.unregisteredTokens.add('token-stale')

      const result = await sut.execute({ userId: userId.toValue(), ...message })

      const remaining = await pushDeviceRepository.findMany({})
      expect(result).toEqual({ sentCount: 1, removedCount: 1 })
      expect(remaining.map((device) => device.props.token)).toEqual([
        'token-valid',
      ])
    })
  })
})
