import { PushSender } from '@ben/adapters'
import { createID, UseCase } from '@ben/domain-base'

import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'

interface Payload {
  userId: string
  title: string
  body: string
  data: Record<string, string>
  channelId?: string
}

interface Response {
  sentCount: number
  removedCount: number
}

export class SendUserPushNotificationUseCase implements UseCase<Response> {
  constructor(
    private pushDeviceRepository: PushDeviceRepository,
    private pushSender: PushSender,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const devices = await this.pushDeviceRepository.findMany({
      userId: createID(payload.userId),
    })

    if (devices.length === 0) {
      return { sentCount: 0, removedCount: 0 }
    }

    const results = await this.pushSender.send(
      devices.map((device) => ({
        to: device.props.token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        channelId: payload.channelId,
      })),
    )

    const unregisteredTokens = new Set(
      results
        .filter(
          (result) =>
            result.status === 'failed' &&
            result.reason === 'unregistered-recipient',
        )
        .map((result) => result.to),
    )
    const unregisteredDevices = devices.filter((device) =>
      unregisteredTokens.has(device.props.token),
    )

    await Promise.all(
      unregisteredDevices.map((device) =>
        this.pushDeviceRepository.delete(device.id),
      ),
    )

    return {
      sentCount: results.filter((result) => result.status === 'delivered')
        .length,
      removedCount: unregisteredDevices.length,
    }
  }
}
