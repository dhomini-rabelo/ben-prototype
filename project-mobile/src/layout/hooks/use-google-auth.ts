import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { basicClient } from '@/api/client'
import { API_ROUTES } from '@/api/routes'
import type { User } from '@/api/models/user'
import { devWarn } from '@/core/logger'
import { ROUTES } from '@/core/routes'
import { useAuthStore } from '@/layout/stores/auth-store'
import {
  isGoogleAuthAvailable,
  signInWithGoogle,
} from '@/services/google-auth-service'
import {
  persistAccessToken,
  persistProviderToken,
} from '@/storage/token-storage'

const EXTENDED_WAIT_DELAY_MS = 4000

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

    const result = await signInWithGoogle()

    if (result.status === 'cancelled') {
      setState({ status: 'denied', error: '' })
      return
    }

    if (result.status === 'error') {
      setState({
        status: 'error',
        error: 'Authentication failed. Please try again.',
      })
      return
    }

    try {
      const loginResponse = await basicClient.post<LoginOrRegisterResponse>(
        API_ROUTES.auth.loginOrRegister,
        { token: result.idToken },
      )

      await persistAccessToken(loginResponse.data.accessToken)
      await persistProviderToken(result.idToken)

      if (loginResponse.data.user) {
        useAuthStore.getState().setUser(loginResponse.data.user)
      }

      router.replace(ROUTES.chat)
    } catch (caughtError) {
      devWarn('[google-auth] backend login failed', {
        message:
          caughtError instanceof Error ? caughtError.message : caughtError,
      })
      setState({
        status: 'error',
        error: 'Authentication failed. Please try again.',
      })
    }
  }

  return {
    signIn,
    isAvailable: isGoogleAuthAvailable,
    isLoading,
    isExtendedWait,
    isPermissionDenied: state.status === 'denied',
    error: state.error,
  }
}
