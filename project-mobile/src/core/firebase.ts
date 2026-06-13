import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { env } from '@/core/env'

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
