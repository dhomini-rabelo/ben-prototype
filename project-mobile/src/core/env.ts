import Constants from 'expo-constants'

interface Env {
  backendUrl: string
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseProjectId: string
  googleWebClientId: string
  googleIosClientId: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Env>

function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required env value: ${key}`)
  }
  return value
}

export const env: Env = {
  backendUrl: required(extra.backendUrl, 'backendUrl'),
  firebaseApiKey: required(extra.firebaseApiKey, 'firebaseApiKey'),
  firebaseAuthDomain: required(extra.firebaseAuthDomain, 'firebaseAuthDomain'),
  firebaseProjectId: required(extra.firebaseProjectId, 'firebaseProjectId'),
  googleWebClientId: required(extra.googleWebClientId, 'googleWebClientId'),
  googleIosClientId: required(extra.googleIosClientId, 'googleIosClientId'),
}
