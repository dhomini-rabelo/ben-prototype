import { AnyRecord } from '@/modules/utils'

import { Entity } from './entity'

export abstract class AggregateRoot<
  Props extends AnyRecord = any,
> extends Entity<Props> {}
