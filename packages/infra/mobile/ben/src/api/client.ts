import { create, type AxiosError } from 'axios'

import { env } from '@/core/env'
import {
  clearStoredToken,
  getCachedProviderToken,
  getCachedToken,
  setCachedToken,
  setStoredToken,
} from '@/storage/token-storage'

export const BASE_URL = env.backendUrl

const defaultHeaders = { 'ngrok-skip-browser-warning': 'true' }

export const basicClient = create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
})

export const authClient = create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
})

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler = () => {}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

authClient.interceptors.request.use((config) => {
  config.headers.set('jwtauthenticationtoken', getCachedToken() ?? '')
  config.headers.set(
    'providerauthenticationtoken',
    getCachedProviderToken() ?? '',
  )
  return config
})

authClient.interceptors.response.use(
  function onFulfilled(response) {
    const updatedToken = response.headers['updatedjwtauthenticationtoken']
    if (updatedToken) {
      setCachedToken(updatedToken)
      void setStoredToken(updatedToken)
    }
    return response
  },
  function onRejected(error: AxiosError) {
    if (error.response?.status === 401) {
      setCachedToken(null)
      void clearStoredToken()
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)
