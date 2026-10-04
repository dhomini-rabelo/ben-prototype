import AsyncStorage from '@react-native-async-storage/async-storage'

// Web has no secure keystore (expo-secure-store is native-only — its methods are
// not implemented in the browser), so token-storage falls back to AsyncStorage,
// which is backed by localStorage on web. Metro picks this `.web.ts` variant for
// the web bundle; native uses the SecureStore-backed `secure-store.ts`.
export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key)
}

export async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value)
}

export async function deleteItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}
