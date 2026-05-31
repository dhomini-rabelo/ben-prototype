import { AnyRecord, Complement, KeyOf } from '@/modules/utils/types'

import { Entity, EntityWithStatic } from '../entity/entity'
import { ID } from '../entity/id'
import { WithID } from '../types'
import {
  BetweenQuery,
  ContainsQuery,
  GreaterQuery,
  InQuery,
  LowerOrEqualQuery,
  NotEqualQuery,
  NotInQuery,
  Query,
  QueryTypes,
} from './queries'
import { RepeatedResource, ResourceNotFoundError } from './repository-errors'

import { ValueObject } from '../entity/value-object'
import { cloneDeep } from 'lodash-es'
import { decodeCursor, encodeCursor } from './cursor'

export type QueryFilters<Props extends AnyRecord> = {
  limit?: number
  page?: number
  orderBy?: KeyOf<Props>
  order?: 'asc' | 'desc'
}

export type CursorQueryFilters<Props extends AnyRecord> = {
  limit?: number
  cursor?: string | null
  orderBy?: KeyOf<Props>
  order?: 'asc' | 'desc'
}

export type PaginationResponse<Data extends AnyRecord> = {
  items: Data[]
  totalItems: number
  page: number
}

export type CursorPaginationResponse<Data extends AnyRecord> = {
  items: Data[]
  hasMore: boolean
  nextCursor: string | null
}

export abstract class Repository<EntityClass extends Entity> {
  abstract create(props: EntityClass['props']): Promise<EntityClass>

  abstract update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass>

  abstract updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]>

  abstract get(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass>

  abstract findUnique(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null>

  abstract findFirst(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null>

  abstract findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]>

  abstract findManyWithPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<PaginationResponse<EntityClass>>

  abstract findManyWithCursorPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: CursorQueryFilters<EntityClass['props']>,
  ): Promise<CursorPaginationResponse<EntityClass>>

  abstract count(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<number>

  abstract delete(id: ID): Promise<EntityClass>

  abstract deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void>

  abstract clone<T = any>(clientRepository?: T): Repository<EntityClass>
}

export abstract class InMemoryRepository<
  EntityClass extends Entity,
> implements Repository<EntityClass> {
  protected items: EntityClass[] = []
  protected abstract entity: EntityWithStatic<EntityClass>

  private queryHandler: Record<
    QueryTypes,
    (query: Query, propValue: any) => boolean
  > = {
    [QueryTypes.CONTAINS]: (query, propValue) => {
      if (!(query instanceof ContainsQuery)) return false
      return (
        typeof propValue === 'string' &&
        propValue.toLowerCase().includes(query.params.input.toLowerCase())
      )
    },
    [QueryTypes.LOWER_OR_EQUAL]: (query, propValue) => {
      if (!(query instanceof LowerOrEqualQuery)) return false
      return (
        (typeof propValue === 'number' &&
          typeof query.params.input === 'number' &&
          propValue <= query.params.input) ||
        (propValue instanceof Date &&
          query.params.input instanceof Date &&
          propValue.getTime() <= query.params.input.getTime())
      )
    },
    [QueryTypes.GREATER]: (query, propValue) => {
      if (!(query instanceof GreaterQuery)) return false
      return (
        (typeof propValue === 'number' &&
          typeof query.params.input === 'number' &&
          propValue > query.params.input) ||
        (propValue instanceof Date &&
          query.params.input instanceof Date &&
          propValue.getTime() > query.params.input.getTime())
      )
    },
    [QueryTypes.BETWEEN]: (query, propValue) => {
      if (!(query instanceof BetweenQuery)) return false
      const { from, to } = query.params
      return (
        (typeof propValue === 'number' &&
          typeof from === 'number' &&
          typeof to === 'number' &&
          propValue >= from &&
          propValue <= to) ||
        (propValue instanceof Date &&
          from instanceof Date &&
          to instanceof Date &&
          propValue.getTime() >= from.getTime() &&
          propValue.getTime() <= to.getTime())
      )
    },
    [QueryTypes.IN]: (query, propValue) => {
      if (!(query instanceof InQuery)) return false
      return (
        Array.isArray(query.params.input) &&
        query.params.input.includes(propValue)
      )
    },
    [QueryTypes.NOT_IN]: (query, propValue) => {
      if (!(query instanceof NotInQuery)) return false
      return (
        Array.isArray(query.params.input) &&
        !query.params.input.includes(propValue)
      )
    },
    [QueryTypes.NOT_NULL]: (_query, propValue) => propValue !== null,
    [QueryTypes.NOT_EQUAL]: (query, propValue) => {
      if (!(query instanceof NotEqualQuery)) return false
      const { input } = query.params
      if (input instanceof ID) return propValue !== input.toValue()
      return propValue !== input
    },
  }

  async create(props: EntityClass['props']): Promise<EntityClass> {
    const newItem = this.entity.create(props)
    this.items.push(newItem)
    return cloneDeep(newItem)
  }

  async update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const item = await this.getInMemory({ id })
    item.props = { ...item.props, ...newProps }
    return cloneDeep(item)
  }

  async updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, props))
    items.forEach((item) => {
      item.props = { ...item.props, ...newProps }
    })
    return cloneDeep(items)
  }

  async get(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    if (itemsFound.length === 0) throw new ResourceNotFoundError()
    return cloneDeep(itemsFound[0])
  }

  async getInMemory(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    if (itemsFound.length === 0) throw new ResourceNotFoundError()
    return itemsFound[0]
  }

  async findUnique(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    if (itemsFound.length > 1) throw new RepeatedResource()
    return itemsFound.length === 1 ? cloneDeep(itemsFound[0]) : null
  }

  async findFirst(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const itemsFound = this.items.filter((item) => this.compare(item, props))
    return itemsFound.length >= 1 ? cloneDeep(itemsFound[0]) : null
  }

  async findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const items = this.items.filter((item) => this.compare(item, props))
    return this.applyQueryParams(items, params)
  }

  async findManyWithPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<PaginationResponse<EntityClass>> {
    const filtered = this.items.filter((item) => this.compare(item, props))
    const totalItems = filtered.length
    const currentPage = params?.page ?? 1
    const paginatedItems = await this.applyQueryParams(filtered, params)
    return { items: paginatedItems, totalItems, page: currentPage }
  }

  async findManyWithCursorPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: CursorQueryFilters<EntityClass['props']>,
  ): Promise<CursorPaginationResponse<EntityClass>> {
    const filtered = this.items.filter((item) => this.compare(item, props))
    const ordered = await this.applyQueryParams(filtered, {
      orderBy: params?.orderBy,
      order: params?.order,
    })

    const startIndex = this.resolveCursorStartIndex(ordered, params?.cursor)
    const limit = params?.limit ?? ordered.length
    const page = ordered.slice(startIndex, startIndex + limit + 1)

    const hasMore = page.length > limit
    const items = hasMore ? page.slice(0, limit) : page
    const lastItem = items[items.length - 1]

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? this.buildCursor(lastItem, params?.orderBy)
          : null,
    }
  }

  async count(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<number> {
    return this.items.filter((item) => this.compare(item, props)).length
  }

  async delete(id: ID): Promise<EntityClass> {
    const itemIndex = this.items.findIndex((item) => item.id.isEqual(id))
    if (itemIndex === -1) throw new ResourceNotFoundError()
    const [deleted] = this.items.splice(itemIndex, 1)
    return cloneDeep(deleted)
  }

  async deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void> {
    this.items = this.items.filter((item) => !this.compare(item, props))
  }

  clone(): Repository<EntityClass> {
    return Object.create(this) as InMemoryRepository<EntityClass>
  }

  protected async applyQueryParams(
    items: EntityClass[],
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    if (params?.orderBy) {
      items = items.slice().sort((a, b) => {
        const dir = params.order === 'asc' ? 1 : -1
        const va = a.getProp(params.orderBy as string)
        const vb = b.getProp(params.orderBy as string)
        if (va === vb) return 0
        if (typeof va === 'string' && typeof vb === 'string')
          return va.localeCompare(vb) * dir
        if (va instanceof Date && vb instanceof Date)
          return (va.getTime() - vb.getTime()) * dir
        if (typeof va === 'number' && typeof vb === 'number')
          return (va - vb) * dir
        if (va !== null && vb === null) return -1 * dir
        if (va === null && vb !== null) return 1 * dir
        return (va > vb ? 1 : -1) * dir
      })
    }
    const limit = params?.limit
    const start = (params?.page ?? 1) - 1
    return limit ? items.slice(start * limit, start * limit + limit) : items
  }

  private resolveCursorStartIndex(
    items: EntityClass[],
    cursor?: string | null,
  ): number {
    if (!cursor) return 0
    const { id } = decodeCursor(cursor)
    const index = items.findIndex((item) => item.id.toValue() === id)
    return index === -1 ? 0 : index + 1
  }

  private buildCursor(
    item: EntityClass,
    orderBy?: KeyOf<EntityClass['props']>,
  ): string {
    const orderByField = (orderBy as string) ?? 'id'
    return encodeCursor({
      orderBy: orderByField,
      value: this.serializeCursorValue(item.getProp(orderByField)),
      id: item.id.toValue(),
    })
  }

  private serializeCursorValue(value: unknown): string | number {
    if (value instanceof Date) return value.toISOString()
    if (value instanceof ID) return value.toValue()
    if (typeof value === 'number') return value
    return String(value)
  }

  protected compare(
    item: EntityClass,
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): boolean {
    return Object.entries(props)
      .filter(([, value]) => value !== undefined)
      .every(([fieldName, fieldValue]: [string, any]) => {
        const prop = item.getProp(fieldName)

        if (prop instanceof ID && fieldValue instanceof ID) {
          return prop.isEqual(fieldValue)
        }

        if (fieldValue instanceof Query) {
          const handler = this.queryHandler[fieldValue.queryType]
          return handler(
            fieldValue,
            prop instanceof ID || prop instanceof ValueObject
              ? prop.toValue()
              : prop,
          )
        }

        return prop === fieldValue
      })
  }
}
