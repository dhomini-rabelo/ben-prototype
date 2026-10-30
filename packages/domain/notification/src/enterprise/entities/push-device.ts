import { Entity, ID } from '@ben/domain-base'

export interface PushDeviceProps {
  userId: ID
  token: string
  createdAt: Date
  updatedAt: Date
}

export class PushDevice extends Entity<PushDeviceProps> {
  static create(props: PushDeviceProps) {
    return new PushDevice(props)
  }

  static reference(id: ID, props: PushDeviceProps) {
    return new PushDevice(props, id)
  }
}
