import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { API_ROUTES } from '../../core/api-routes'
import { auth } from '../../core/firebase'
import { ROUTES } from '../../core/routes'

export const JWT_COOKIE = '@ben/jwttoken'
export const PROVIDER_COOKIE = '@ben/authprovidertoken'
const COOKIE_MAX_AGE_DAYS = 5

const USER_CANCEL_ERROR_CODES = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/popup-blocked',
  'auth/user-cancelled',
]

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
  const navigate = useNavigate()

  async function signIn() {
    setState({ status: 'loading', error: '' })

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response = await fetch(API_ROUTES.auth.loginOrRegister, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        setState({
          status: 'error',
          error: data.message || 'Authentication failed. Please try again.',
        })
        return
      }

      const data = await response.json()

      Cookies.set(JWT_COOKIE, data.accessToken, { expires: COOKIE_MAX_AGE_DAYS })
      Cookies.set(PROVIDER_COOKIE, idToken, { expires: COOKIE_MAX_AGE_DAYS })

      navigate(ROUTES.home)
    } catch (caughtError) {
      const errorCode = (caughtError as { code?: string }).code ?? ''
      const wasCancelledByUser = USER_CANCEL_ERROR_CODES.includes(errorCode)
      setState({
        status: wasCancelledByUser ? 'denied' : 'error',
        error: wasCancelledByUser ? '' : 'Authentication failed. Please try again.',
      })
    }
  }

  return {
    signIn,
    isLoading: state.status === 'loading',
    isPermissionDenied: state.status === 'denied',
    error: state.error,
  }
}
