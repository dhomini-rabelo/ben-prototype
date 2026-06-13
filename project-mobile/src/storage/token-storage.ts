import * as SecureStore from 'expo-secure-store'

export const JWT_TOKEN_KEY = '@ben/jwttoken'
export const PROVIDER_TOKEN_KEY = '@ben/authprovidertoken'

const SECURE_KEYS = {
  [JWT_TOKEN_KEY]: 'ben.jwttoken',
  [PROVIDER_TOKEN_KEY]: 'ben.authprovidertoken',
} as const

type TokenKey = keyof typeof SECURE_KEYS

let cachedJwtToken: string | null = null
let cachedProviderToken: string | null = null

async function readSecure(key: TokenKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS[key])
  } catch {
    return null
  }
}

async function writeSecure(key: TokenKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS[key], value)
}

async function deleteSecure(key: TokenKey): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEYS[key])
}

export async function getStoredToken(): Promise<string | null> {
  return readSecure(JWT_TOKEN_KEY)
}

export async function getStoredProviderToken(): Promise<string | null> {
  return readSecure(PROVIDER_TOKEN_KEY)
}

export async function setStoredToken(token: string): Promise<void> {
  cachedJwtToken = token
  await writeSecure(JWT_TOKEN_KEY, token)
}

export async function setStoredProviderToken(token: string): Promise<void> {
  cachedProviderToken = token
  await writeSecure(PROVIDER_TOKEN_KEY, token)
}

export async function clearStoredToken(): Promise<void> {
  cachedJwtToken = null
  cachedProviderToken = null
  await Promise.all([
    deleteSecure(JWT_TOKEN_KEY),
    deleteSecure(PROVIDER_TOKEN_KEY),
  ])
}

export async function loadTokenIntoMemory(): Promise<void> {
  const [jwt, provider] = await Promise.all([
    getStoredToken(),
    getStoredProviderToken(),
  ])
  cachedJwtToken = jwt
  cachedProviderToken = provider
}

export function getCachedToken(): string | null {
  return cachedJwtToken
}

export function getCachedProviderToken(): string | null {
  return cachedProviderToken
}

export function setCachedToken(token: string | null): void {
  cachedJwtToken = token
}

export function setCachedProviderToken(token: string | null): void {
  cachedProviderToken = token
}
