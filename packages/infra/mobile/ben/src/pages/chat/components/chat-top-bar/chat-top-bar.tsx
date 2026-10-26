import { List } from 'phosphor-react-native'
import { memo } from 'react'
import { Text, View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { ink } from '@/layout/utils/colors'
import { chatStrings } from '@/pages/chat/strings/chat-strings'
import { formatShortDate } from '@/pages/chat/utils/format-short-date'

const MENU_ICON_SIZE = 22

type ChatTopBarProps = {
  onOpenMenu: () => void
}

function ChatTopBarComponent({ onOpenMenu }: ChatTopBarProps) {
  const strings = useStrings(chatStrings)
  const language = useLanguage()
  return (
    <View className="h-[52px] flex-row items-center justify-between pl-5 pr-4">
      <View className="flex-row items-center gap-1">
        <BrandMark />
        <View className="ml-1 border-l border-outline-variant pl-2.5">
          <Text className="font-sans-medium text-[13px] text-on-surface-variant">
            {formatShortDate(new Date(), language)}
          </Text>
        </View>
      </View>
      <IconButton
        label={strings.menu}
        onPress={onOpenMenu}
        className="size-11 bg-surface-container-lowest shadow-[0_3px_10px_rgba(29,24,20,0.05)] active:bg-surface-container-low"
      >
        <List color={ink} size={MENU_ICON_SIZE} />
      </IconButton>
    </View>
  )
}

export const ChatTopBar = memo(ChatTopBarComponent)
