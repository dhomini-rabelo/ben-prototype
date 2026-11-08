import { Repository } from '@ben/domain-base'

import { PushDevice } from '@ben/domain-notification/enterprise/entities/push-device'

export abstract class PushDeviceRepository extends Repository<PushDevice> {}
