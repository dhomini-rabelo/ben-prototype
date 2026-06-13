import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

export function TaskPickerEmpty() {
  return (
    <View className="flex-col items-center gap-2 px-5 pt-4 pb-6">
      <Typography variant="body-md" className="text-center text-on-surface">
        nothing active — you&apos;re all clear
      </Typography>
      <Typography
        variant="label-caps"
        className="normal-case text-center text-on-surface-variant"
      >
        tap outside to head back to chat
      </Typography>
    </View>
  )
}
