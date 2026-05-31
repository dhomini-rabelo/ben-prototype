import {
  AuthProviderService,
  GetUserFromTokenPayload,
  GetUserFromTokenResponse,
} from '@/adapters/auth-provider'

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { env } from './env'

function getFirebaseAuth() {
  const app =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            projectId: env.FIREBASE_PROJECT_ID,
          }),
        })
      : getApp()
  return getAuth(app)
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
        avatarUrl: user.picture || '',
      }
    } catch {
      return null
    }
  }
}
