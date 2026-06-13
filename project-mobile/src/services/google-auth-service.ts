import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { env } from '@/core/env'
import { auth } from '@/core/firebase'
import { devWarn } from '@/core/logger'
import { isExpoGo } from '@/core/runtime'

type GoogleSigninModule =
  typeof import('@react-native-google-signin/google-signin')

export type GoogleSignInResult =
  | { status: 'success'; idToken: string }
  | { status: 'cancelled' }
  | { status: 'error' }

export const isGoogleAuthAvailable = !isExpoGo

let configuredModule: GoogleSigninModule | null = null

function loadGoogleSignin(): GoogleSigninModule {
  if (configuredModule) {
    return configuredModule
  }
  const module: GoogleSigninModule =
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy native require so Expo Go never evaluates the unavailable RNGoogleSignin module
    require('@react-native-google-signin/google-signin')
  module.GoogleSignin.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId,
  })
  configuredModule = module
  return module
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!isGoogleAuthAvailable) {
    return { status: 'error' }
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } =
    loadGoogleSignin()

  try {
    await GoogleSignin.hasPlayServices()
    const response = await GoogleSignin.signIn()

    if (!isSuccessResponse(response)) {
      return { status: 'cancelled' }
    }

    const googleIdToken = response.data.idToken
    if (!googleIdToken) {
      return { status: 'error' }
    }

    const credential = GoogleAuthProvider.credential(googleIdToken)
    const userCredential = await signInWithCredential(auth, credential)
    const firebaseIdToken = await userCredential.user.getIdToken()

    return { status: 'success', idToken: firebaseIdToken }
  } catch (caughtError) {
    const wasCancelledByUser =
      isErrorWithCode(caughtError) &&
      caughtError.code === statusCodes.SIGN_IN_CANCELLED
    if (!wasCancelledByUser) {
      devWarn('[google-auth] sign-in failed', {
        code: isErrorWithCode(caughtError) ? caughtError.code : undefined,
        message:
          caughtError instanceof Error ? caughtError.message : caughtError,
      })
    }
    return { status: wasCancelledByUser ? 'cancelled' : 'error' }
  }
}
