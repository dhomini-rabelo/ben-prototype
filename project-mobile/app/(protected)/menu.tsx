import { Stack } from 'expo-router'
import { Menu } from '@/pages/menu/page'

export default function MenuScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Menu />
    </>
  )
}
