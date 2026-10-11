import { Menu } from 'lucide-react-native'
import { memo } from 'react'
import { View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useStrings } from '@/layout/hooks/use-strings'
import { primary } from '@/layout/utils/colors'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type ChatTopBarProps = {
  onOpenMenu: () => void
}

function ChatTopBarComponent({ onOpenMenu }: ChatTopBarProps) {
  const strings = useStrings(chatStrings)
  return (
    <View className="h-16 flex-row items-center justify-between px-6">
      <BrandMark logoWidth={28} logoHeight={22} />
      <IconButton label={strings.menu} onPress={onOpenMenu}>
        <Menu color={primary} size={24} />
      </IconButton>
    </View>
  )
}

export const ChatTopBar = memo(ChatTopBarComponent)
