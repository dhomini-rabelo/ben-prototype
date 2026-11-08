import { createID, ItemResponse, UseCase } from '@ben/domain-base'

import { PushDevice } from '@ben/domain-notification/enterprise/entities/push-device'
import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'

interface Payload {
  userId: string
  token: string
}

type Response = ItemResponse<PushDevice> & { created: boolean }

export class RegisterPushDeviceUseCase implements UseCase<Response> {
  constructor(private pushDeviceRepository: PushDeviceRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const userId = createID(payload.userId)
    const existingDevice = await this.pushDeviceRepository.findFirst({
      token: payload.token,
    })

    if (existingDevice) {
      const item = await this.pushDeviceRepository.update(existingDevice.id, {
        userId,
        updatedAt: new Date(),
      })

      return { item, created: false }
    }

    const now = new Date()
    const item = await this.pushDeviceRepository.create({
      userId,
      token: payload.token,
      createdAt: now,
      updatedAt: now,
    })

    return { item, created: true }
  }
}
