import { CaretUpDown, Kanban } from 'phosphor-react-native'
import { Pressable, Text, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { brandDeep, onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

const TILE_ICON_SIZE = 20
const CARET_ICON_SIZE = 16

type ActiveTaskPeekProps = {
  variant?: 'empty' | 'summary' | 'skeleton'
  count?: number
  title?: string
  className?: string
  onOpen?: () => void
}

export function ActiveTaskPeek({
  variant = 'empty',
  count,
  title,
  className,
  onOpen,
}: ActiveTaskPeekProps) {
  const strings = useStrings(chatStrings)
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      className={cn(
        'h-[54px] flex-row items-center gap-3 rounded-[14px] bg-surface-container-lowest pl-2.5 pr-3.5 shadow-[0_3px_10px_rgba(29,24,20,0.05)]',
        'active:bg-surface-container-low',
        className,
      )}
    >
      {variant === 'skeleton' ? (
        <View className="h-4 w-40 rounded bg-outline-variant" />
      ) : variant === 'empty' ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          {strings.peekEmpty}
        </Typography>
      ) : (
        <>
          <View className="size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-container-low">
            <Kanban color={brandDeep} size={TILE_ICON_SIZE} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-medium text-xs text-on-surface-variant">
              {strings.peekLatestTask}
            </Text>
            {title && (
              <Text
                numberOfLines={1}
                className="font-sans-semibold text-[15px] text-on-surface"
              >
                {title}
              </Text>
            )}
          </View>
          <View className="shrink-0 flex-row items-center gap-1.5">
            <View className="rounded-full bg-background px-[9px] py-[3px]">
              <Text className="font-sans-semibold text-[13px] text-ink">
                {count != null
                  ? strings.peekActiveCount(count)
                  : strings.peekActive}
              </Text>
            </View>
            <CaretUpDown color={onSurfaceVariant} size={CARET_ICON_SIZE} />
          </View>
        </>
      )}
    </Pressable>
  )
}
