import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { PushDevice } from '@ben/domain-notification/enterprise/entities/push-device'
import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'

export class InMemoryPushDeviceRepository
  extends InMemoryRepository<PushDevice>
  implements PushDeviceRepository
{
  protected entity = PushDevice as unknown as EntityWithStatic<PushDevice>
}
