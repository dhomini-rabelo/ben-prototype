export type AnyRecord = Record<string, any>

export type KeyOf<T> = keyof T

export type Complement<T, G> = {
  [K in keyof T]: T[K] | G
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type Mandatory<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>

export type OverWrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type ValueOf<T> = T[keyof T]
