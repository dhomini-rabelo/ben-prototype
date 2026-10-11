import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuDetailStrings } from '@/layout/strings/menu-detail-strings'

export function ItemDetailGone({ message }: { message?: string }) {
  const strings = useStrings(menuDetailStrings)

  return (
    <View className="px-5 pb-6">
      <Typography variant="body-md" className="text-on-surface-variant">
        {message ?? strings.gone}
      </Typography>
    </View>
  )
}
