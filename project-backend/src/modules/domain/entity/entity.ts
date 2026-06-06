import { ID, createID } from '@/modules/domain/entity/id'

export abstract class Entity<Props extends Record<string, any> = any> {
  private _id: ID
  public props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: ID) {
    this.props = props
    this._id = id ?? createID()
  }

  public getProp(propName: string) {
    return {
      ...this.props,
      id: this._id,
    }[propName]
  }

  public isEqual(entity: Entity<object>) {
    return entity === this || entity.id.toValue() === this._id.toValue()
  }
}

export type EntityWithStatic<EntityClass extends Entity> = EntityClass & {
  create(props: EntityClass['props']): EntityClass
  reference(id: ID, props: EntityClass['props']): EntityClass
}
