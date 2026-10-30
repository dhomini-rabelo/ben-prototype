import { Redirect, Stack } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { AlarmPopupOverlay } from '@/layout/components/alarm-popup/alarm-popup-overlay'
import { DailySummaryPopup } from '@/layout/components/daily-summary/daily-summary-popup'
import { useAlarmScheduler } from '@/layout/hooks/use-alarm-scheduler'
import { usePushDeviceRegistration } from '@/layout/hooks/use-push-device-registration'
import { useUserPreferencesSync } from '@/layout/hooks/use-user-preferences-sync'
import { useAuthStore } from '@/layout/stores/auth-store'
import { getCachedToken } from '@/storage/token-storage'

export default function ProtectedLayout() {
  const user = useAuthStore((store) => store.user)

  useUserPreferencesSync()
  useAlarmScheduler()
  usePushDeviceRegistration()

  if (!getCachedToken() && !user) {
    return <Redirect href={ROUTES.login} />
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="menu" options={{ presentation: 'modal' }} />
      </Stack>
      <DailySummaryPopup />
      <AlarmPopupOverlay />
    </>
  )
}
