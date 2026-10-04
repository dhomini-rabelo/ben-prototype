import { AlertCircle } from 'lucide-react-native'
import { View } from 'react-native'
import { ChatBanner } from '@/layout/components/chat-banner'

type MenuListErrorProps = {
  message: string
  onRetry: () => void
}

export function MenuListError({ message, onRetry }: MenuListErrorProps) {
  return (
    <View className="pt-4">
      <ChatBanner.Root tone="error">
        <ChatBanner.Icon icon={AlertCircle} />
        <ChatBanner.Text>{message}</ChatBanner.Text>
        <ChatBanner.Action label="retry" onPress={onRetry} />
      </ChatBanner.Root>
    </View>
  )
}
