import { ValueObject } from '@ben/domain-base/entity/value-object'

export class JsonField<Value = unknown> extends ValueObject<Value, string> {
  public toValue(): string {
    return JSON.stringify(this.value)
  }
}
