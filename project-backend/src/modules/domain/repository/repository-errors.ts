export abstract class DatabaseError extends Error {
  abstract readonly type: string
}

export class ResourceNotFoundError extends DatabaseError {
  public readonly type = 'resource-not-found'

  constructor(description?: string) {
    super(`Resource not found${description ? `: ${description}` : ''}`)
  }
}

export class RepeatedResource extends DatabaseError {
  public readonly type = 'repeated-resource'

  constructor() {
    super('Repeated resource found')
  }
}
