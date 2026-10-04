import { Menu } from 'lucide-react-native'
import { memo } from 'react'
import { View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
import { IconButton } from '@/layout/components/ui/icon-button'
import { primary } from '@/layout/utils/colors'

type ChatTopBarProps = {
  onOpenMenu: () => void
}

function ChatTopBarComponent({ onOpenMenu }: ChatTopBarProps) {
  return (
    <View className="h-16 flex-row items-center justify-between px-6">
      <BrandMark logoWidth={28} logoHeight={22} />
      <IconButton label="Menu" onPress={onOpenMenu}>
        <Menu color={primary} size={24} />
      </IconButton>
    </View>
  )
}

export const ChatTopBar = memo(ChatTopBarComponent)
