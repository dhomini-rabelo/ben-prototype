import { EntityWithStatic } from '@ben/domain-base'

import { PushDevice } from '@ben/domain-notification/enterprise/entities/push-device'
import { PushDeviceRepository } from '@ben/domain-notification/application/repositories/push-device'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqlitePushDeviceRepository
  extends SqliteRepository<PushDevice>
  implements PushDeviceRepository
{
  protected entity = PushDevice as unknown as EntityWithStatic<PushDevice>
  protected tableName = 'push_devices'
}
