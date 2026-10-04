import { randomUUID } from 'node:crypto'

export const some = {
  uuid: () => randomUUID(),
  text: () => `text-${randomUUID().slice(0, 8)}`,
  email: () => `${randomUUID().slice(0, 8)}@example.com`,
  integer: (max = 1000) => Math.floor(Math.random() * max),
  boolean: () => Math.random() < 0.5,
}
