import { AnyRecord } from './types'

export function showObject(object: any) {
  return JSON.stringify(object, null, 2)
}

export function isFieldInProps(field: string, props: AnyRecord): boolean {
  return field in props && props[field] !== undefined
}
