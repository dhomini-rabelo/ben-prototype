import { RotateCw } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { BouncingDots } from '@/pages/chat/components/bouncing-dots'
import { textError } from '@/layout/utils/colors'

type SubThreadBannerProps = {
  variant?: 'ben-reply' | 'user-pending' | 'ben-typing' | 'error'
  text?: string
  onRetry?: () => void
}

function SubThreadBannerComponent({
  variant = 'ben-reply',
  text,
  onRetry,
}: SubThreadBannerProps) {
  const isError = variant === 'error'

  return (
    <View
      className={cn(
        'w-full flex-row items-center gap-2.5 rounded-2xl border px-3 py-2',
        isError
          ? 'border-text-error/30 bg-surface-error'
          : 'border-outline-variant/40 bg-surface-container-lowest',
      )}
    >
      <Text
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
          isError
            ? 'bg-text-error/10 text-text-error'
            : 'bg-surface-container-high text-on-surface-variant',
        )}
      >
        {variant === 'user-pending' ? 'You' : 'Ben'}
      </Text>
      <View className="flex-1">
        {variant === 'ben-typing' ? (
          <BouncingDots size={6} />
        ) : variant === 'user-pending' ? (
          <View className="flex-row items-center gap-1.5">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              Hearing you
            </Typography>
            <BouncingDots size={6} />
          </View>
        ) : (
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              'text-[14px]',
              isError ? 'text-text-error' : 'text-on-surface',
            )}
          >
            {text}
          </Typography>
        )}
      </View>
      {isError && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="shrink-0 flex-row items-center gap-1"
        >
          <RotateCw size={12} color={textError} />
          <Text className="text-label-caps font-mono uppercase text-text-error">
            retry
          </Text>
        </Pressable>
      )}
    </View>
  )
}

export const SubThreadBanner = memo(SubThreadBannerComponent)
