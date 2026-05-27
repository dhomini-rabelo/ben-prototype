import { AnyRecord } from '@/modules/utils'

export enum ValueTypes {
  ARRAY_APPEND = 'ARRAY_APPEND',
  DELETE_ARRAY_INDEX = 'DELETE_ARRAY_INDEX',
}

export abstract class ValueQuery<Value = any, T extends AnyRecord = any> {
  abstract readonly valueType: ValueTypes
  abstract readonly type: 'set' | 'remove'
  abstract readonly params: T
  abstract createValueExpression(propName: string): string
  abstract getValue(value: Value): Value

  protected createExpressionValueName(propName: string, paramName: string) {
    return `:${propName}_${this.constructor.name}_${paramName}`
  }
}

export class ArrayAppendValueQuery<
  Data extends any[] = any[],
> extends ValueQuery {
  readonly valueType = ValueTypes.ARRAY_APPEND
  readonly type = 'set'

  constructor(
    readonly params: {
      value: Data
    },
  ) {
    super()
  }

  createValueExpression(propName: string) {
    return `list_append(#${propName}, ${this.createExpressionValueName(propName, 'value')})`
  }

  getValue(value: Array<Data>) {
    return [...value, ...this.params.value]
  }
}

export class DeleteArrayIndexValueQuery<
  Data extends any[] = any[],
> extends ValueQuery {
  readonly valueType = ValueTypes.DELETE_ARRAY_INDEX
  readonly type = 'remove'

  constructor(
    readonly params: {
      index: number
    },
  ) {
    super()
  }

  createValueExpression(propName: string) {
    return `${propName}[${this.params.index}]`
  }

  getValue(value: Array<Data>) {
    return value.filter((_, index) => index !== this.params.index)
  }
}
