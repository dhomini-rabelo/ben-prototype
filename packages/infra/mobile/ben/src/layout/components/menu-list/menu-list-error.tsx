import { WarningCircle } from 'phosphor-react-native'
import { View } from 'react-native'
import { ChatBanner } from '@/layout/components/chat-banner'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'

type MenuListErrorProps = {
  message: string
  onRetry: () => void
}

export function MenuListError({ message, onRetry }: MenuListErrorProps) {
  const strings = useStrings(menuStrings)

  return (
    <View className="pt-4">
      <ChatBanner.Root tone="error">
        <ChatBanner.Icon icon={WarningCircle} />
        <ChatBanner.Text>{message}</ChatBanner.Text>
        <ChatBanner.Action label={strings.retry} onPress={onRetry} />
      </ChatBanner.Root>
    </View>
  )
}
