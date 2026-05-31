export enum QueryTypes {
  CONTAINS = 'contains',
  LOWER_OR_EQUAL = 'lowerOrEqual',
  GREATER = 'greater',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'notIn',
  NOT_NULL = 'notNull',
  NOT_EQUAL = 'notEqual',
}

export abstract class Query {
  abstract readonly queryType: QueryTypes
}

export class ContainsQuery extends Query {
  readonly queryType = QueryTypes.CONTAINS

  constructor(
    public readonly params: {
      input: string
    },
  ) {
    super()
  }
}

export class LowerOrEqualQuery extends Query {
  readonly queryType = QueryTypes.LOWER_OR_EQUAL

  constructor(
    public readonly params: {
      input: number | Date
    },
  ) {
    super()
  }
}

export class GreaterQuery extends Query {
  readonly queryType = QueryTypes.GREATER

  constructor(
    public readonly params: {
      input: number | Date
    },
  ) {
    super()
  }
}

export class BetweenQuery extends Query {
  readonly queryType = QueryTypes.BETWEEN

  constructor(
    public readonly params: {
      from: number | Date
      to: number | Date
    },
  ) {
    super()
  }
}

export class InQuery extends Query {
  readonly queryType = QueryTypes.IN

  constructor(
    public readonly params: {
      input: (number | string)[]
    },
  ) {
    super()
  }
}

export class NotInQuery extends Query {
  readonly queryType = QueryTypes.NOT_IN

  constructor(
    public readonly params: {
      input: (number | string)[]
    },
  ) {
    super()
  }
}

export class NotNullQuery extends Query {
  readonly queryType = QueryTypes.NOT_NULL

  constructor() {
    super()
  }
}

export class NotEqualQuery extends Query {
  readonly queryType = QueryTypes.NOT_EQUAL

  constructor(
    public readonly params: {
      input: any
    },
  ) {
    super()
  }
}
