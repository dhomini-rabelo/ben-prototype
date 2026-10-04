export type TypeTag = 'id' | 'date'

export type TypeMap = Record<string, TypeTag>

export type SqliteRow = {
  id: string
  props: string
  types: string
}
