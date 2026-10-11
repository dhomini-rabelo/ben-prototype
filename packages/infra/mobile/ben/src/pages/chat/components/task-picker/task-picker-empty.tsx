import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { taskPickerStrings } from '@/pages/chat/strings/task-picker-strings'

export function TaskPickerEmpty() {
  const strings = useStrings(taskPickerStrings)
  return (
    <View className="flex-col items-center gap-2 px-5 pt-4 pb-6">
      <Typography variant="body-md" className="text-center text-on-surface">
        {strings.emptyTitle}
      </Typography>
      <Typography
        variant="label-caps"
        className="normal-case text-center text-on-surface-variant"
      >
        {strings.emptyHint}
      </Typography>
    </View>
  )
}
