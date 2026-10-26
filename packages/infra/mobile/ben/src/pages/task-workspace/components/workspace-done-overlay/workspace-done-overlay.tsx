import { Check } from 'phosphor-react-native'
import { View } from 'react-native'
import { onPrimary } from '@/layout/utils/colors'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { workspaceStrings } from '@/pages/task-workspace/strings/workspace-strings'

export function WorkspaceDoneOverlay() {
  const strings = useStrings(workspaceStrings)
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-0 items-center justify-end pb-44"
    >
      <View className="flex-row items-center gap-2 rounded-full bg-primary/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <Check size={16} color={onPrimary} />
        <Typography variant="body-md" className="text-on-primary">
          {strings.done}
        </Typography>
      </View>
    </View>
  )
}
