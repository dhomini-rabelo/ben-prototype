import { Complement, isFieldInProps, KeyOf, showObject } from '@/modules/utils'

import { DangerErrors, DomainError } from '../domain-errors'
import { Entity, EntityWithStatic } from '../entity/entity'
import { ID } from '../entity/id'
import { WithID } from '../types'
import { Query } from './queries'
import { ValueQuery } from './query-values'

export type RepositoryIndexes<Indexes extends string> = Indexes | 'id'

export type IndexFieldSet<EntityClass extends Entity> =
  | [KeyOf<WithID<EntityClass['props']>>]
  | [KeyOf<WithID<EntityClass['props']>>, KeyOf<WithID<EntityClass['props']>>]

export type QueryFilters<Indexes extends string = ''> = {
  index?: Indexes
  limit?: number
  paginationData?: any
  sortDescending?: boolean
}

export type QueryResponse<T> = {
  data: T[]
  nextPaginationData?: any
}

export abstract class Repository<
  EntityClass extends Entity,
  Indexes extends string = '',
> {
  protected abstract indexes: Record<
    RepositoryIndexes<Indexes>,
    IndexFieldSet<EntityClass>
  >

  abstract create(props: EntityClass['props']): Promise<EntityClass>

  abstract update<Response extends boolean | undefined = undefined>(
    id: ID,
    newProps: Partial<Complement<EntityClass['props'], ValueQuery>>,
    options?: { returnUpdated?: Response },
  ): Promise<Response extends true ? EntityClass : null>

  abstract reuseUpdate(
    entity: EntityClass,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass>

  abstract updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass[]>

  abstract delete(id: ID): Promise<void>

  abstract get(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass>

  abstract findUnique(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass | null>

  abstract findFirst(
    props: Partial<WithID<EntityClass['props']>>,
    filters?: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<EntityClass | null>

  abstract findMany(
    props?: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters?: QueryFilters<Indexes>,
  ): Promise<QueryResponse<EntityClass>>

  abstract findAll(
    props?: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    filters?: Omit<QueryFilters<Indexes>, 'paginationData' | 'limit'>,
  ): Promise<EntityClass[]>

  abstract countItems(
    props: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<number>

  abstract reset(): Promise<void>

  protected validateIndex(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    indexName: Indexes | 'id' = 'id',
  ): void {
    const indexFields = this.indexes[indexName]
    if (!indexFields) {
      throw new DomainError({
        code: 'INDEX_NOT_DEFINED',
        errorType: DangerErrors.DATA_INTEGRITY,
        variables: [
          `Index "${indexName}" is not defined. ${showObject(props)}`,
        ],
      })
    }

    const partitionKey = indexFields[0]
    if (!isFieldInProps(String(partitionKey), props)) {
      throw new DomainError({
        code: 'MISSING_PARTITION_KEY',
        errorType: DangerErrors.DATA_INTEGRITY,
        variables: [String(partitionKey), showObject(props)],
      })
    }
  }
}

export abstract class InMemoryRepository<
  EntityClass extends Entity,
  Indexes extends string = '',
> extends Repository<EntityClass, Indexes> {
  protected abstract entity: EntityWithStatic<EntityClass>
  protected items: EntityClass[] = []
  protected defaultQueryValues: Partial<WithID<EntityClass['props']>> = {}
  protected abstract indexes: Record<
    RepositoryIndexes<Indexes>,
    IndexFieldSet<EntityClass>
  >

  async create(props: EntityClass['props']) {
    const newItem = this.entity.create(props)
    this.items.push(newItem)
    return structuredClone(newItem)
  }

  async save(entity: EntityClass) {
    const itemIndex = this.items.findIndex((item) => item.id.isEqual(entity.id))
    if (itemIndex === -1) {
      this.items.push(entity)
    } else {
      this.items[itemIndex] = entity
    }
    return structuredClone(entity)
  }

  async update<Response extends boolean | undefined = undefined>(
    id: ID,
    newProps: Partial<Complement<EntityClass['props'], ValueQuery>>,
    options: { returnUpdated?: Response } = {},
  ): Promise<Response extends true ? EntityClass : null> {
    const item = await this.getInMemory({ id })

    item.props = {
      ...item.props,
      ...Object.fromEntries(
        Object.entries(newProps).map(([key, value]) =>
          value instanceof ValueQuery
            ? [key, value.getValue(item.getProp(key))]
            : [key, value],
        ),
      ),
    }

    return (
      options.returnUpdated === true ? structuredClone(item) : null
    ) as Response extends true ? EntityClass : null
  }

  async reuseUpdate(
    entity: EntityClass,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const item = await this.getInMemory({ id: entity.id })

    item.props = {
      ...item.props,
      ...Object.fromEntries(
        Object.entries(newProps).map(([key, value]) =>
          value instanceof ValueQuery
            ? [key, value.getValue(item.getProp(key))]
            : [key, value],
        ),
      ),
    }

    return structuredClone(item)
  }

  async updateMany(
    query: Partial<EntityClass['props']>,
    newProps: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, query))
    this.validateIndex(query, filters.index)

    items.forEach((item) => {
      item.props = {
        ...item.props,
        ...newProps,
      }
    })

    return structuredClone(items)
  }

  async delete(id: ID) {
    this.items = this.items.filter((item) => !item.id.isEqual(id))
  }

  async get(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    if (itemsFound.length > 1) {
      const { RepeatedResource } = await import('./repository-errors')
      throw new RepeatedResource()
    } else if (itemsFound.length === 0) {
      const { ResourceNotFoundError } = await import('./repository-errors')
      throw new ResourceNotFoundError()
    }
    return structuredClone(itemsFound[0])
  }

  protected async getInMemory(
    props: Partial<WithID<EntityClass['props']>>,
    _filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    if (itemsFound.length > 1) {
      const { RepeatedResource } = await import('./repository-errors')
      throw new RepeatedResource()
    } else if (itemsFound.length === 0) {
      const { ResourceNotFoundError } = await import('./repository-errors')
      throw new ResourceNotFoundError()
    }

    return itemsFound[0]
  }

  async findUnique(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass | null> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )
    if (itemsFound.length > 1) {
      const { RepeatedResource } = await import('./repository-errors')
      throw new RepeatedResource()
    }
    return itemsFound.length === 1 ? structuredClone(itemsFound[0]) : null
  }

  async findFirst(
    props: Partial<WithID<EntityClass['props']>>,
    filters: Pick<QueryFilters<Indexes>, 'index'> = {},
  ): Promise<EntityClass | null> {
    this.validateIndex(props, filters.index)

    const itemsFound = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    return itemsFound.length >= 1 ? structuredClone(itemsFound[0]) : null
  }

  async findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>> = {},
    filters: QueryFilters<Indexes> = {},
  ): Promise<QueryResponse<EntityClass>> {
    this.validateIndex(props, filters.index)

    const { limit, paginationData, sortDescending = false, index } = filters
    let items = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    const sortKey = this.getSortKey(index)
    if (sortKey) {
      items = items.sort((firstItem, secondItem) => {
        const firstValue = firstItem.getProp(sortKey as string)
        const secondValue = secondItem.getProp(sortKey as string)

        return sortDescending
          ? secondValue - firstValue
          : firstValue - secondValue
      })
    }

    const paginationDataIndex = items.findIndex(
      (item) => item.id.toString() === paginationData,
    )

    items = items.filter(
      (_, i) => paginationDataIndex === -1 || i > paginationDataIndex,
    )
    items = items.filter((_, i) => !limit || i < limit)

    return {
      data: structuredClone(items),
      nextPaginationData:
        limit && items.at(limit - 1)?.id.toValue()
          ? items.at(limit - 1)?.id.toString()
          : undefined,
    }
  }

  async findAll(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>> = {},
    filters: Omit<QueryFilters<Indexes>, 'paginationData' | 'limit'> = {},
  ): Promise<EntityClass[]> {
    this.validateIndex(props, filters.index)

    const { sortDescending = false, index } = filters
    let items = this.items.filter((item) =>
      this.compare(item, {
        ...this.defaultQueryValues,
        ...props,
      }),
    )

    const sortKey = this.getSortKey(index)
    if (sortKey) {
      items = items.sort((firstItem, secondItem) => {
        const firstValue = firstItem.getProp(sortKey as string)
        const secondValue = secondItem.getProp(sortKey as string)

        return sortDescending
          ? secondValue - firstValue
          : firstValue - secondValue
      })
    }

    return structuredClone(items)
  }

  async countItems(
    props: Partial<EntityClass['props']>,
    filters: Pick<QueryFilters<Indexes>, 'index'>,
  ): Promise<number> {
    const itemsFound = await this.findMany(props, filters)
    return itemsFound.data.length
  }

  async reset() {
    this.items = []
  }

  protected compare(
    item: EntityClass,
    props: Partial<WithID<EntityClass['props']>>,
  ): boolean {
    return Object.entries(props)
      .filter(([, value]) => value !== undefined)
      .every(([fieldName, fieldValue]: [string, any]) => {
        const prop = item.getProp(fieldName)

        if (prop instanceof ID && fieldValue instanceof ID) {
          return prop.isEqual(fieldValue)
        } else if (typeof prop === 'string' && typeof fieldValue === 'string') {
          return prop.includes(fieldValue)
        }

        if (fieldValue instanceof Query) {
          return fieldValue.runExpression(prop)
        }

        return prop === fieldValue
      })
  }

  protected getSortKey(
    indexName: Indexes | 'id' = 'id',
  ): KeyOf<WithID<EntityClass['props']>> | null {
    const indexFields = this.indexes[indexName]
    const isCompositeIndex = indexFields && indexFields.length === 2

    if (isCompositeIndex) {
      return indexFields[1]
    }

    return null
  }
}
