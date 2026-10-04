export abstract class ValueObject<Value = any, Response = any> {
  public readonly value: Readonly<Value>

  protected constructor(value: Value) {
    this.value = value
  }

  abstract toValue(): Response
}
