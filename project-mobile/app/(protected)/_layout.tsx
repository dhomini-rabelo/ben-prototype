import { Redirect, Stack } from 'expo-router'
import { useAuthBootstrap } from '@/core/auth-bootstrap'
import { ROUTES } from '@/core/routes'
import { useAuthStore } from '@/layout/stores/auth-store'
import { getCachedToken } from '@/storage/token-storage'

export default function ProtectedLayout() {
  const { isReady } = useAuthBootstrap()
  const user = useAuthStore((store) => store.user)

  if (!isReady) {
    return null
  }

  if (!getCachedToken() && !user) {
    return <Redirect href={ROUTES.login} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
