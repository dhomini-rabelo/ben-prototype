import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/core/firebase'
import { devWarn } from '@/core/logger'

export type GoogleSignInResult =
  | { status: 'success'; idToken: string }
  | { status: 'cancelled' }
  | { status: 'error' }

// On web there is no native Google Sign-In module — the @react-native-google-signin
// flow used on iOS/Android is not implemented for the browser. We sign in through
// Firebase's popup flow instead (mirroring project-web). Metro picks this `.web.ts`
// variant for the web bundle, so the native module is never required there.
export const isGoogleAuthAvailable = true

const USER_CANCEL_ERROR_CODES = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/popup-blocked',
  'auth/user-cancelled',
]

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const firebaseIdToken = await result.user.getIdToken()

    return { status: 'success', idToken: firebaseIdToken }
  } catch (caughtError) {
    const errorCode = (caughtError as { code?: string }).code ?? ''
    const wasCancelledByUser = USER_CANCEL_ERROR_CODES.includes(errorCode)
    if (!wasCancelledByUser) {
      devWarn('[google-auth] sign-in failed', {
        code: errorCode || undefined,
        message:
          caughtError instanceof Error ? caughtError.message : caughtError,
      })
    }
    return { status: wasCancelledByUser ? 'cancelled' : 'error' }
  }
}
