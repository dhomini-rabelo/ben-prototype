import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { basicClient } from '@/api/client'
import { API_ROUTES } from '@/api/routes'
import type { User } from '@/api/models/user'
import { env } from '@/core/env'
import { ROUTES } from '@/core/routes'
import { useAuthStore } from '@/layout/stores/auth-store'
import {
  setCachedProviderToken,
  setCachedToken,
  setStoredProviderToken,
  setStoredToken,
} from '@/storage/token-storage'

const EXTENDED_WAIT_DELAY_MS = 4000

GoogleSignin.configure({
  webClientId: env.googleWebClientId,
  iosClientId: env.googleIosClientId,
})

interface LoginOrRegisterResponse {
  process: 'login' | 'register'
  user: User | null
  accessToken: string
}

type GoogleAuthStatus = 'idle' | 'loading' | 'denied' | 'error'

interface GoogleAuthState {
  status: GoogleAuthStatus
  error: string
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    status: 'idle',
    error: '',
  })
  const [isExtendedWait, setIsExtendedWait] = useState(false)

  const isLoading = state.status === 'loading'

  useEffect(() => {
    if (!isLoading) {
      return
    }

    const timeout = setTimeout(() => {
      setIsExtendedWait(true)
    }, EXTENDED_WAIT_DELAY_MS)

    return () => {
      clearTimeout(timeout)
      setIsExtendedWait(false)
    }
  }, [isLoading])

  async function signIn() {
    setState({ status: 'loading', error: '' })

    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()

      if (!isSuccessResponse(response)) {
        setState({ status: 'denied', error: '' })
        return
      }

      const idToken = response.data.idToken
      if (!idToken) {
        setState({
          status: 'error',
          error: 'Authentication failed. Please try again.',
        })
        return
      }

      const loginResponse = await basicClient.post<LoginOrRegisterResponse>(
        API_ROUTES.auth.loginOrRegister,
        { token: idToken },
      )

      setCachedToken(loginResponse.data.accessToken)
      setCachedProviderToken(idToken)
      await setStoredToken(loginResponse.data.accessToken)
      await setStoredProviderToken(idToken)

      if (loginResponse.data.user) {
        useAuthStore.getState().setUser(loginResponse.data.user)
      }

      router.replace(ROUTES.chat)
    } catch (caughtError) {
      const wasCancelledByUser =
        isErrorWithCode(caughtError) &&
        caughtError.code === statusCodes.SIGN_IN_CANCELLED
      setState({
        status: wasCancelledByUser ? 'denied' : 'error',
        error: wasCancelledByUser
          ? ''
          : 'Authentication failed. Please try again.',
      })
    }
  }

  return {
    signIn,
    isLoading,
    isExtendedWait,
    isPermissionDenied: state.status === 'denied',
    error: state.error,
  }
}
