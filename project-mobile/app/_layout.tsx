import { QueryClientProvider } from '@tanstack/react-query'
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts as useHankenGrotesk,
} from '@expo-google-fonts/hanken-grotesk'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { Slot, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthBootstrap } from '@/core/auth-bootstrap'
import { queryClient } from '@/core/query-client'
import { hideAndroidNavigationBar } from '@/services/system-ui-service'
import '@/core/global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useHankenGrotesk({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
  })
  const { isReady } = useAuthBootstrap()

  const isAppReady = fontsLoaded && isReady

  useEffect(() => {
    void hideAndroidNavigationBar()
  }, [])

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync()
    }
  }, [isAppReady])

  if (!isAppReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
