import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'

export function ItemDetailGone({ message }: { message?: string }) {
  return (
    <View className="px-5 pb-6">
      <Typography variant="body-md" className="text-on-surface-variant">
        {message ?? "this one's gone — must've been cleared elsewhere."}
      </Typography>
    </View>
  )
}
