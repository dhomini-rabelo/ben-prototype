import { ID } from './entity/id'

export type WithID<Props> = Props & {
  id: ID
}

export type WithStringID<Props> = Props & {
  id: string
}

export interface TimestampProps {
  createdAt: number
  updatedAt: number
}
