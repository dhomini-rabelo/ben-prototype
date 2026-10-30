import {
  PushDevice,
  PushDeviceProps,
} from '@ben/domain-notification/enterprise/entities/push-device'
import { Serialize, WithID } from '@ben/domain-base'

type PushDeviceHttp = Omit<Serialize<WithID<PushDeviceProps>>, 'userId'>

export class PushDevicePresenter {
  static toHttp(pushDevice: PushDevice): PushDeviceHttp {
    return {
      id: pushDevice.id.toValue(),
      token: pushDevice.props.token,
      createdAt: pushDevice.props.createdAt.toISOString(),
      updatedAt: pushDevice.props.updatedAt.toISOString(),
    }
  }
}
