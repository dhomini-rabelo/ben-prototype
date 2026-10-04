import { Prisma, PrismaClient } from '@/generated/prisma/client'

import { Entity, EntityWithStatic } from '@/modules/domain/entity/entity'
import { ID, createID } from '@/modules/domain/entity/id'
import { ValueObject } from '@/modules/domain/entity/value-object'
import { WithID } from '@/modules/domain/types'
import { AnyRecord, Complement } from '@/modules/utils/types'
import { decodeCursor, encodeCursor } from '@/modules/domain/repository/cursor'
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
} from '@/modules/domain/repository/queries'
import {
  CursorPaginationResponse,
  CursorQueryFilters,
  PaginationResponse,
  QueryFilters,
  Repository,
} from '@/modules/domain/repository/repository'
import {
  RepeatedResource,
  ResourceNotFoundError,
} from '@/modules/domain/repository/repository-errors'

import { SqliteRow, TypeMap, TypeTag } from './sqlite-repository-types'

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

function assertIdentifier(name: string): string {
  if (!IDENTIFIER_PATTERN.test(name)) {
    throw new Error(`Invalid SQL identifier: "${name}"`)
  }
  return name
}

function jsonPath(field: string): string {
  return `$.${field}`
}

function encodeValue(value: unknown): string | number {
  if (value instanceof ID) return value.toValue()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'boolean') return value ? 1 : 0
  return value as string | number
}

function escapeLikePattern(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

function joinPath(base: string, segment: string): string {
  return base ? `${base}.${segment}` : segment
}

export abstract class SqliteRepository<
  EntityClass extends Entity,
> implements Repository<EntityClass> {
  protected abstract entity: EntityWithStatic<EntityClass>
  protected abstract tableName: string

  constructor(protected client: PrismaClient) {}

  async create(props: EntityClass['props']): Promise<EntityClass> {
    const item = this.entity.create(props)
    const serialized = this.toInfra(item.props)
    await this.client.$executeRaw(
      Prisma.sql`INSERT INTO ${this.table} ("id", "props", "types") VALUES (${item.id.toValue()}, ${serialized.props}, ${serialized.types})`,
    )
    return item
  }

  async update(
    id: ID,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass> {
    const rows = await this.client.$queryRaw<SqliteRow[]>(
      Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE "id" = ${id.toValue()} LIMIT 1`,
    )
    if (rows.length === 0) throw new ResourceNotFoundError()

    const current = this.toDomain(rows[0])
    const mergedProps = { ...current.props, ...newProps }
    const serialized = this.toInfra(mergedProps)
    await this.client.$executeRaw(
      Prisma.sql`UPDATE ${this.table} SET "props" = ${serialized.props}, "types" = ${serialized.types} WHERE "id" = ${id.toValue()}`,
    )
    return this.entity.reference(id, mergedProps)
  }

  async updateMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    newProps: Partial<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const where = this.buildWhere(props)
    return this.client.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<SqliteRow[]>(
        Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE ${where}`,
      )
      const updated: EntityClass[] = []
      for (const row of rows) {
        const current = this.toDomain(row)
        const mergedProps = { ...current.props, ...newProps }
        const serialized = this.toInfra(mergedProps)
        await tx.$executeRaw(
          Prisma.sql`UPDATE ${this.table} SET "props" = ${serialized.props}, "types" = ${serialized.types} WHERE "id" = ${row.id}`,
        )
        updated.push(this.entity.reference(createID(row.id), mergedProps))
      }
      return updated
    })
  }

  async get(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass> {
    const rows = await this.selectMatching(props, { limit: 2 })
    if (rows.length > 1) throw new RepeatedResource()
    if (rows.length === 0) throw new ResourceNotFoundError()
    return this.toDomain(rows[0])
  }

  async findUnique(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const rows = await this.selectMatching(props, { limit: 2 })
    if (rows.length > 1) throw new RepeatedResource()
    return rows.length === 1 ? this.toDomain(rows[0]) : null
  }

  async findFirst(
    props: Partial<WithID<EntityClass['props']>>,
  ): Promise<EntityClass | null> {
    const rows = await this.selectMatching(props, { limit: 1 })
    return rows.length >= 1 ? this.toDomain(rows[0]) : null
  }

  async findMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<EntityClass[]> {
    const rows = await this.selectPage(props, params)
    return rows.map((row) => this.toDomain(row))
  }

  async findManyWithPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: QueryFilters<EntityClass['props']>,
  ): Promise<PaginationResponse<EntityClass>> {
    const where = this.buildWhere(props)
    const totalItems = await this.countWhere(where)
    const rows = await this.selectPage(props, params)
    return {
      items: rows.map((row) => this.toDomain(row)),
      totalItems,
      page: params?.page ?? 1,
    }
  }

  async findManyWithCursorPagination(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
    params?: CursorQueryFilters<EntityClass['props']>,
  ): Promise<CursorPaginationResponse<EntityClass>> {
    const where = this.buildWhere(props)
    const orderByField = params?.orderBy as string | undefined
    const orderSql = this.buildOrderBy(orderByField, params?.order, true)
    const startIndex = await this.resolveCursorStartIndex(
      where,
      orderSql,
      params?.cursor,
    )
    const limit = params?.limit

    const limitOffsetSql = limit
      ? Prisma.sql`LIMIT ${limit + 1} OFFSET ${startIndex}`
      : Prisma.sql`LIMIT -1 OFFSET ${startIndex}`

    const rows = await this.client.$queryRaw<SqliteRow[]>(
      Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE ${where} ${orderSql} ${limitOffsetSql}`,
    )

    if (!limit) {
      return {
        items: rows.map((row) => this.toDomain(row)),
        hasMore: false,
        nextCursor: null,
      }
    }

    const hasMore = rows.length > limit
    const items = (hasMore ? rows.slice(0, limit) : rows).map((row) =>
      this.toDomain(row),
    )
    const lastItem = items[items.length - 1]

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem ? this.buildCursor(lastItem, orderByField) : null,
    }
  }

  async count(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<number> {
    return this.countWhere(this.buildWhere(props))
  }

  async delete(id: ID): Promise<EntityClass> {
    const rows = await this.client.$queryRaw<SqliteRow[]>(
      Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE "id" = ${id.toValue()} LIMIT 1`,
    )
    if (rows.length === 0) throw new ResourceNotFoundError()
    await this.client.$executeRaw(
      Prisma.sql`DELETE FROM ${this.table} WHERE "id" = ${id.toValue()}`,
    )
    return this.toDomain(rows[0])
  }

  async deleteMany(
    props: Partial<Complement<WithID<EntityClass['props']>, Query>>,
  ): Promise<void> {
    const where = this.buildWhere(props)
    await this.client.$executeRaw(
      Prisma.sql`DELETE FROM ${this.table} WHERE ${where}`,
    )
  }

  clone(): Repository<EntityClass> {
    return Object.create(this) as SqliteRepository<EntityClass>
  }

  protected toInfra(props: AnyRecord): { props: string; types: string } {
    const types: TypeMap = {}
    const plain = this.serializeValue(props, '', types)
    return { props: JSON.stringify(plain), types: JSON.stringify(types) }
  }

  protected toDomain(row: SqliteRow): EntityClass {
    const plain = JSON.parse(row.props)
    const types: TypeMap = JSON.parse(row.types)
    for (const [path, tag] of Object.entries(types)) {
      this.hydratePath(plain, path.split('.'), tag)
    }
    return this.entity.reference(createID(row.id), plain)
  }

  protected buildCursor(item: EntityClass, orderBy?: string): string {
    const orderByField = orderBy ?? 'id'
    return encodeCursor({
      orderBy: orderByField,
      value: this.serializeCursorValue(item.getProp(orderByField)),
      id: item.id.toValue(),
    })
  }

  protected serializeCursorValue(value: unknown): string | number {
    if (value instanceof Date) return value.toISOString()
    if (value instanceof ID) return value.toValue()
    if (typeof value === 'number') return value
    return String(value)
  }

  private serializeValue(
    value: unknown,
    path: string,
    types: TypeMap,
  ): unknown {
    if (value === undefined) return undefined
    if (value === null) return null
    if (value instanceof ID) {
      types[path] = 'id'
      return value.toValue()
    }
    if (value instanceof Date) {
      types[path] = 'date'
      return value.toISOString()
    }
    if (value instanceof ValueObject) {
      throw new Error(
        `Cannot serialize ValueObject at path "${path}": rehydration requires knowing the concrete class.`,
      )
    }
    if (Array.isArray(value)) {
      return value.map((item, index) =>
        this.serializeValue(item, joinPath(path, String(index)), types),
      )
    }
    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as AnyRecord).map(([key, val]) => [
          key,
          this.serializeValue(val, joinPath(path, key), types),
        ]),
      )
    }
    return value
  }

  private hydratePath(
    target: AnyRecord,
    segments: string[],
    tag: TypeTag,
  ): void {
    const [head, ...rest] = segments
    const key: string | number = /^\d+$/.test(head) ? Number(head) : head

    if (rest.length === 0) {
      const value = target[key]
      if (value === null || value === undefined) return
      target[key] = tag === 'id' ? createID(value) : new Date(value)
      return
    }

    const next = target[key]
    if (next === null || next === undefined) return
    this.hydratePath(next, rest, tag)
  }

  private async selectMatching(
    props: AnyRecord,
    options: { orderBy?: string; order?: 'asc' | 'desc'; limit?: number } = {},
  ): Promise<SqliteRow[]> {
    const where = this.buildWhere(props)
    const orderSql = this.buildOrderBy(options.orderBy, options.order, false)
    const limitSql = options.limit
      ? Prisma.sql`LIMIT ${options.limit}`
      : Prisma.empty
    return this.client.$queryRaw<SqliteRow[]>(
      Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE ${where} ${orderSql} ${limitSql}`,
    )
  }

  private async selectPage(
    props: AnyRecord,
    params?: QueryFilters<AnyRecord>,
  ): Promise<SqliteRow[]> {
    const where = this.buildWhere(props)
    const orderSql = this.buildOrderBy(
      params?.orderBy as string | undefined,
      params?.order,
      false,
    )
    const limitOffsetSql = this.buildLimitOffset(params?.limit, params?.page)
    return this.client.$queryRaw<SqliteRow[]>(
      Prisma.sql`SELECT "id", "props", "types" FROM ${this.table} WHERE ${where} ${orderSql} ${limitOffsetSql}`,
    )
  }

  private async countWhere(where: Prisma.Sql): Promise<number> {
    const rows = await this.client.$queryRaw<{ count: number }[]>(
      Prisma.sql`SELECT COUNT(*) AS count FROM ${this.table} WHERE ${where}`,
    )
    return Number(rows[0]?.count ?? 0)
  }

  private async resolveCursorStartIndex(
    where: Prisma.Sql,
    orderSql: Prisma.Sql,
    cursor?: string | null,
  ): Promise<number> {
    if (!cursor) return 0
    const { id } = decodeCursor(cursor)
    const rows = await this.client.$queryRaw<{ rn: number }[]>(
      Prisma.sql`SELECT rn FROM (SELECT "id", ROW_NUMBER() OVER (${orderSql}) AS rn FROM ${this.table} WHERE ${where}) WHERE "id" = ${id}`,
    )
    return rows.length > 0 ? Number(rows[0].rn) : 0
  }

  private buildWhere(props: AnyRecord): Prisma.Sql {
    const entries = Object.entries(props).filter(
      ([, value]) => value !== undefined,
    )
    if (entries.length === 0) return Prisma.sql`1 = 1`
    return Prisma.join(
      entries.map(([field, value]) => this.buildCondition(field, value)),
      ' AND ',
    )
  }

  private buildCondition(field: string, value: unknown): Prisma.Sql {
    const column = this.columnExpression(field)

    if (value instanceof Query) {
      return this.buildQueryCondition(field, column, value)
    }

    if (value === null) return Prisma.sql`${column} IS NULL`
    return Prisma.sql`${column} = ${encodeValue(value)}`
  }

  private buildQueryCondition(
    field: string,
    column: Prisma.Sql,
    query: Query,
  ): Prisma.Sql {
    switch (query.queryType) {
      case QueryTypes.CONTAINS: {
        const input = (query as ContainsQuery).params.input
        const pattern = `%${escapeLikePattern(input.toLowerCase())}%`
        return Prisma.sql`LOWER(${column}) LIKE ${pattern} ESCAPE '\\'`
      }
      case QueryTypes.LOWER_OR_EQUAL:
        return this.buildComparable(
          field,
          column,
          (query as LowerOrEqualQuery).params.input,
          '<=',
        )
      case QueryTypes.GREATER:
        return this.buildComparable(
          field,
          column,
          (query as GreaterQuery).params.input,
          '>',
        )
      case QueryTypes.BETWEEN: {
        const { from, to } = (query as BetweenQuery).params
        return this.buildBetween(field, column, from, to)
      }
      case QueryTypes.IN: {
        const input = (query as InQuery).params.input
        if (input.length === 0) return Prisma.sql`1 = 0`
        return Prisma.sql`${column} IN (${Prisma.join(input.map(encodeValue))})`
      }
      case QueryTypes.NOT_IN: {
        const input = (query as NotInQuery).params.input
        if (input.length === 0) return Prisma.sql`1 = 1`
        return Prisma.sql`(${column} IS NULL OR ${column} NOT IN (${Prisma.join(input.map(encodeValue))}))`
      }
      case QueryTypes.NOT_NULL:
        return Prisma.sql`${column} IS NOT NULL`
      case QueryTypes.NOT_EQUAL: {
        const input = (query as NotEqualQuery).params.input
        if (input === null) return Prisma.sql`${column} IS NOT NULL`
        return Prisma.sql`(${column} IS NULL OR ${column} != ${encodeValue(input)})`
      }
      default:
        throw new Error(`Unsupported query type: ${query.queryType}`)
    }
  }

  private buildComparable(
    field: string,
    column: Prisma.Sql,
    input: number | Date,
    operator: '<=' | '>',
  ): Prisma.Sql {
    const operatorSql = Prisma.raw(operator)
    if (typeof input === 'number') {
      return Prisma.sql`(json_type(props, ${jsonPath(field)}) IN ('integer', 'real') AND ${column} ${operatorSql} ${input})`
    }
    return Prisma.sql`(json_extract(types, ${jsonPath(field)}) = 'date' AND ${column} ${operatorSql} ${input.toISOString()})`
  }

  private buildBetween(
    field: string,
    column: Prisma.Sql,
    from: number | Date,
    to: number | Date,
  ): Prisma.Sql {
    if (typeof from === 'number' && typeof to === 'number') {
      return Prisma.sql`(json_type(props, ${jsonPath(field)}) IN ('integer', 'real') AND ${column} >= ${from} AND ${column} <= ${to})`
    }
    if (from instanceof Date && to instanceof Date) {
      return Prisma.sql`(json_extract(types, ${jsonPath(field)}) = 'date' AND ${column} >= ${from.toISOString()} AND ${column} <= ${to.toISOString()})`
    }
    return Prisma.sql`1 = 0`
  }

  private buildOrderBy(
    orderBy: string | undefined,
    order: 'asc' | 'desc' | undefined,
    forceDefault: boolean,
  ): Prisma.Sql {
    if (!orderBy) {
      return forceDefault ? Prisma.sql`ORDER BY rowid ASC` : Prisma.empty
    }
    const direction =
      order === 'asc'
        ? Prisma.raw('ASC NULLS LAST')
        : Prisma.raw('DESC NULLS FIRST')
    return Prisma.sql`ORDER BY ${this.columnExpression(orderBy)} ${direction}, rowid ASC`
  }

  private buildLimitOffset(limit?: number, page?: number): Prisma.Sql {
    if (!limit) return Prisma.empty
    const offset = ((page ?? 1) - 1) * limit
    return Prisma.sql`LIMIT ${limit} OFFSET ${offset}`
  }

  private columnExpression(field: string): Prisma.Sql {
    if (field === 'id') return Prisma.raw(`"${assertIdentifier(field)}"`)
    return Prisma.sql`json_extract(props, ${jsonPath(field)})`
  }

  private get table(): Prisma.Sql {
    return Prisma.raw(`"${assertIdentifier(this.tableName)}"`)
  }
}
