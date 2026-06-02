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

export type Serialize<Props> = {
  [K in keyof Props]: Props[K] extends ID
    ? string
    : Props[K] extends ID | null
      ? string | null
      : Props[K] extends Date
        ? string
        : Props[K] extends Date | null
          ? string | null
          : Props[K]
}
