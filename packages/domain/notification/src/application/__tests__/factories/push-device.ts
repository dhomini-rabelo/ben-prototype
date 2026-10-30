import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  PushDevice,
  PushDeviceProps,
} from '@ben/domain-notification/enterprise/entities/push-device'
import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'

export function createPushDeviceData(
  data: Partial<PushDeviceProps> = {},
): PushDeviceProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    token:
      data.token !== undefined
        ? data.token
        : `ExponentPushToken[${some.uuid()}]`,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
    updatedAt: data.updatedAt !== undefined ? data.updatedAt : new Date(),
  }
}

export class PushDeviceFactory implements Factory<PushDevice, PushDeviceProps> {
  constructor(private pushDeviceRepository: PushDeviceRepository) {}

  async create(data: Partial<PushDeviceProps> = {}) {
    return this.pushDeviceRepository.create(createPushDeviceData(data))
  }

  async createMany(
    commonData: Partial<PushDeviceProps> = {},
    specificData: Partial<PushDeviceProps>[] = [],
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
