import AsyncStorage from '@react-native-async-storage/async-storage'

export const USER_KEY = '@ben/user'

export interface StoredUser {
  id: string
  name: string
  username: string
  email: string
  avatarUrl: string | null
  providerId: string
}

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY)
}
