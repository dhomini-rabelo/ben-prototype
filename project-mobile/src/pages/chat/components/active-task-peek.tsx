import { ChevronUp, Hammer } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'

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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      className={cn(
        'w-full flex-row items-center justify-between gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5',
        'active:bg-surface-container-low',
        className,
      )}
    >
      {variant === 'skeleton' ? (
        <View className="h-4 w-40 rounded bg-outline-variant" />
      ) : variant === 'empty' ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          nothing in progress — Ben&apos;s listening
        </Typography>
      ) : (
        <View className="min-w-0 flex-row items-center gap-2.5">
          <View className="size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
            <Hammer
              className="text-on-surface-variant"
              size={16}
              strokeWidth={1.75}
            />
          </View>
          <View className="min-w-0 flex-row items-center gap-2">
            <Typography
              variant="label-caps"
              className="shrink-0 text-on-surface-variant"
            >
              {count != null ? `${count} active` : 'active'}
            </Typography>
            {title && (
              <Typography
                variant="body-md"
                numberOfLines={1}
                className="text-on-surface"
              >
                · {title}
              </Typography>
            )}
          </View>
        </View>
      )}
      <View className="size-6 shrink-0 items-center justify-center rounded-full">
        <ChevronUp
          className="text-on-surface-variant"
          size={16}
          strokeWidth={1.75}
        />
      </View>
    </Pressable>
  )
}
