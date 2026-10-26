import { QueryClientProvider } from '@tanstack/react-query'
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts as useInstrumentSans,
} from '@expo-google-fonts/instrument-sans'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { Slot, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthBootstrap } from '@/core/auth-bootstrap'
import { queryClient } from '@/core/query-client'
import '@/core/global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useInstrumentSans({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    JetBrainsMono_400Regular,
  })
  const { isReady } = useAuthBootstrap()

  const isAppReady = fontsLoaded && isReady

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
