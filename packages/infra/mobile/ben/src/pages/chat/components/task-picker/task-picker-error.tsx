import { RotateCw } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

type TaskPickerErrorProps = {
  onRetry?: () => void
}

export function TaskPickerError({ onRetry }: TaskPickerErrorProps) {
  return (
    <View className="mx-5 mb-5 flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <Typography variant="body-md" className="text-text-error">
        couldn&apos;t load your tasks
      </Typography>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="flex-row items-center gap-1.5 rounded-full bg-text-error px-3 py-1.5"
      >
        <RotateCw className="text-on-primary" size={12} />
        <Typography variant="label-caps" className="text-on-primary">
          retry
        </Typography>
      </Pressable>
    </View>
  )
}
