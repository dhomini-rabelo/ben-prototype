import * as SecureStore from 'expo-secure-store'

// Native (iOS/Android) backend for token-storage: persists to the device's
// secure keystore. The web build uses the AsyncStorage-backed `.web.ts` variant.
export async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key)
}

export async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value)
}

export async function deleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key)
}
