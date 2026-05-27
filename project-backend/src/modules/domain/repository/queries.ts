import { AnyRecord } from '@/modules/utils'

export enum QueryTypes {
  GREATER_THAN = 'GREATER_THAN',
  LOWER_OR_EQUAL = 'LOWER_OR_EQUAL',
  BETWEEN = 'BETWEEN',
  BEGINS_WITH = 'BEGINS_WITH',
  AND = 'AND',
}

export abstract class Query<
  Value = string | number,
  T extends AnyRecord = any,
> {
  abstract readonly queryType: QueryTypes
  abstract readonly params: T
  abstract createQuery(propName: string): string
  abstract runExpression(value: Value): boolean

  protected createExpressionValueName(propName: string, paramName: string) {
    return `:${propName}_${this.constructor.name}_${paramName}`
  }
}

export class GreaterThanQuery extends Query {
  readonly queryType = QueryTypes.GREATER_THAN

  constructor(
    readonly params: {
      value: number
    },
  ) {
    super()
  }

  createQuery(propName: string) {
    return `#${propName} > ${this.createExpressionValueName(propName, 'value')}`
  }

  runExpression(value: number) {
    return value > this.params.value
  }
}

export class LowerOrEqualQuery extends Query {
  readonly queryType = QueryTypes.LOWER_OR_EQUAL

  constructor(
    readonly params: {
      value: number
    },
  ) {
    super()
  }

  createQuery(propName: string) {
    return `#${propName} <= ${this.createExpressionValueName(propName, 'value')}`
  }

  runExpression(value: number) {
    return value <= this.params.value
  }
}

export class BetweenQuery extends Query {
  readonly queryType = QueryTypes.BETWEEN

  constructor(
    readonly params: {
      start: number
      end: number
    },
  ) {
    super()
  }

  createQuery(propName: string) {
    return `#${propName} BETWEEN ${this.createExpressionValueName(propName, 'start')} AND ${this.createExpressionValueName(propName, 'end')}`
  }

  runExpression(value: number) {
    return value > this.params.start && value < this.params.end
  }
}

export class BeginsWithQuery extends Query<string> {
  readonly queryType = QueryTypes.BEGINS_WITH

  constructor(
    readonly params: {
      value: string
    },
  ) {
    super()
  }

  createQuery(propName: string) {
    return `begins_with(#${propName}, ${this.createExpressionValueName(propName, 'value')})`
  }

  runExpression(value: string) {
    return value.startsWith(this.params.value)
  }
}

export class AndQuery<T = string | number> extends Query<T> {
  readonly queryType = QueryTypes.AND

  constructor(
    readonly params: {
      queries: Query<T>[]
    },
  ) {
    super()
  }

  createQuery(propName: string) {
    return `(${this.params.queries.map((query) => query.createQuery(propName)).join(' AND ')})`
  }

  runExpression(value: T) {
    return this.params.queries.every((query) => query.runExpression(value))
  }
}
