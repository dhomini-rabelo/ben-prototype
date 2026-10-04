import { RotateCw } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { textError } from '@/layout/utils/colors'

type AgentSettingsErrorProps = {
  onRetry: () => void
}

export function AgentSettingsError({ onRetry }: AgentSettingsErrorProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5">
      <Typography variant="body-md" className="text-text-error">
        couldn&apos;t load your model settings
      </Typography>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="flex-row items-center gap-1.5"
      >
        <RotateCw size={12} color={textError} />
        <Typography variant="label-caps" className="font-mono text-text-error">
          retry
        </Typography>
      </Pressable>
    </View>
  )
}
