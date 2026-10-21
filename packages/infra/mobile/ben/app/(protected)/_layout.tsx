import { Redirect, Stack } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { useAlarmScheduler } from '@/layout/hooks/use-alarm-scheduler'
import { useUserPreferencesSync } from '@/layout/hooks/use-user-preferences-sync'
import { useAuthStore } from '@/layout/stores/auth-store'
import { getCachedToken } from '@/storage/token-storage'

export default function ProtectedLayout() {
  const user = useAuthStore((store) => store.user)

  useUserPreferencesSync()
  useAlarmScheduler()

  if (!getCachedToken() && !user) {
    return <Redirect href={ROUTES.login} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
