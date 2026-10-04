export abstract class DatabaseError extends Error {
  abstract readonly type: string
}

export class ResourceNotFoundError extends DatabaseError {
  public readonly type = 'resource-not-found'

  constructor() {
    super('Resource not found')
  }
}

export class RepeatedResource extends DatabaseError {
  public readonly type = 'repeated-resource'

  constructor() {
    super('Repeated resource found')
  }
}
