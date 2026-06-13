import { Stack } from 'expo-router'
import { Chat } from '@/pages/chat/page'

export default function ChatScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Chat />
    </>
  )
}
