import { RotateCw } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { textError } from '@/layout/utils/colors'

type ItemDetailErrorProps = {
  message?: string
  onRetry?: () => void
}

export function ItemDetailError({ message, onRetry }: ItemDetailErrorProps) {
  return (
    <View className="mx-5 mb-5 flex-row items-start gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <View className="flex-1 gap-1">
        <Typography variant="body-md" className="text-text-error">
          {message ?? "couldn't load this one — tap to retry"}
        </Typography>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-1 flex-row items-center gap-1.5 self-start"
        >
          <RotateCw size={14} color={textError} />
          <Typography
            variant="label-caps"
            className="font-mono text-text-error"
          >
            retry
          </Typography>
        </Pressable>
      </View>
    </View>
  )
}
