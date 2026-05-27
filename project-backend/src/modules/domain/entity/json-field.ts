import { ValueObject } from '@/modules/domain/entity/value-object'

export class JsonField<Value = unknown> extends ValueObject<Value, string> {
  public toValue(): string {
    return JSON.stringify(this.value)
  }
}
