import { Check } from 'lucide-react-native'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

export function WorkspaceDoneOverlay() {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 bottom-0 items-center justify-end pb-44"
    >
      <View className="flex-row items-center gap-2 rounded-full bg-primary/95 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <Check size={16} strokeWidth={2.25} className="text-on-primary" />
        <Typography variant="body-md" className="text-on-primary">
          nice. that one&apos;s done.
        </Typography>
      </View>
    </View>
  )
}
