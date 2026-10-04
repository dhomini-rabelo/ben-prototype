import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp } from 'firebase/app'
// @ts-expect-error getReactNativePersistence ships in Firebase's React Native build but is omitted from the published TS types
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'
import { env } from '@/core/env'

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
}

const app = initializeApp(firebaseConfig)

// Persist auth state across sessions with AsyncStorage. Without this, RN Auth
// defaults to in-memory persistence and the user is logged out on every restart.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})
