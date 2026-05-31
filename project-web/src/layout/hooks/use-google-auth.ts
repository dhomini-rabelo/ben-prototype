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

interface GoogleAuthState {
  isLoading: boolean
  error: string
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: '',
  })
  const navigate = useNavigate()

  async function signIn() {
    setState({ isLoading: true, error: '' })

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
          isLoading: false,
          error: data.message || 'Authentication failed. Please try again.',
        })
        return
      }

      const data = await response.json()

      Cookies.set(JWT_COOKIE, data.accessToken, { expires: COOKIE_MAX_AGE_DAYS })
      Cookies.set(PROVIDER_COOKIE, idToken, { expires: COOKIE_MAX_AGE_DAYS })

      navigate(ROUTES.home)
    } catch {
      setState({
        isLoading: false,
        error: 'Authentication failed. Please try again.',
      })
    }
  }

  return { signIn, isLoading: state.isLoading, error: state.error }
}
