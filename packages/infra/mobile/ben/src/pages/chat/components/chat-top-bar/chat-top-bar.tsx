import { memo } from 'react'
import { Text, View } from 'react-native'
import { BrandMark } from '@/layout/components/brand-mark'
import { useLanguage } from '@/layout/hooks/use-strings'
import { formatShortDate } from '@/pages/chat/utils/format-short-date'

function ChatTopBarComponent() {
  const language = useLanguage()
  return (
    <View className="h-[52px] flex-row items-center justify-center">
      <View className="flex-row items-center gap-1">
        <BrandMark />
        <View className="ml-1 border-l border-outline-variant pl-2.5">
          <Text className="font-sans-medium text-[13px] text-on-surface-variant">
            {formatShortDate(new Date(), language)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export const ChatTopBar = memo(ChatTopBarComponent)
