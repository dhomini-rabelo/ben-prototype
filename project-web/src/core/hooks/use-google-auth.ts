import { auth } from '../firebase'
import Cookies from 'js-cookie'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '../routes'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string
const JWT_COOKIE = '@ben/jwttoken'
const PROVIDER_COOKIE = '@ben/authprovidertoken'
const COOKIE_MAX_AGE_DAYS = 5

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function signIn() {
    setIsLoading(true)
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response = await fetch(`${BACKEND_URL}/auth/login-or-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Authentication failed. Please try again.')
        return
      }

      const data = await response.json()

      Cookies.set(JWT_COOKIE, data.accessToken, { expires: COOKIE_MAX_AGE_DAYS })
      Cookies.set(PROVIDER_COOKIE, idToken, { expires: COOKIE_MAX_AGE_DAYS })

      navigate(ROUTES.home)
    } catch {
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return { signIn, isLoading, error }
}
