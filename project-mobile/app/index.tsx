import { Redirect } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { Login } from '@/pages/login/page'
import { getCachedToken } from '@/storage/token-storage'

export default function Index() {
  if (getCachedToken()) {
    return <Redirect href={ROUTES.chat} />
  }

  return <Login />
}
