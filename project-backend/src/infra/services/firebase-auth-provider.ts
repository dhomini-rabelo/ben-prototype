import {
  AuthProviderService,
  GetUserFromTokenPayload,
  GetUserFromTokenResponse,
} from '@/adapters/auth-provider'
import { env } from '@/infra/services/env'

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getFirebaseAuth() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({ projectId: env.FIREBASE_PROJECT_ID }),
    })
  }
  return getAuth()
}

export class FirebaseAuthProviderService implements AuthProviderService {
  async getUserFromToken(
    payload: GetUserFromTokenPayload,
  ): Promise<GetUserFromTokenResponse | null> {
    try {
      const auth = getFirebaseAuth()
      const user = await auth.verifyIdToken(payload.token)
      return {
        id: user.uid,
        name: user.name || '',
        email: user.email || '',
        photoURL: user.picture || '',
      }
    } catch {
      return null
    }
  }
}
