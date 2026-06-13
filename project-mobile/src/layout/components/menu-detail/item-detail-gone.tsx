import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

export function ItemDetailGone() {
  return (
    <View className="px-5 pb-6">
      <Typography variant="body-md" className="text-on-surface-variant">
        this one&apos;s gone — must&apos;ve been cleared elsewhere.
      </Typography>
    </View>
  )
}
