import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuDetailStrings } from '@/layout/strings/menu-detail-strings'

type ItemDetailCapturedMetaProps = {
  absolute?: string
  relative?: string
}

export function ItemDetailCapturedMeta({
  absolute,
  relative,
}: ItemDetailCapturedMetaProps) {
  const strings = useStrings(menuDetailStrings)

  return (
    <View className="mt-1 gap-0.5 border-t border-outline-variant/40 pt-3">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.captured}
      </Typography>
      {absolute && (
        <Typography variant="body-md" className="text-on-surface-variant">
          {absolute}
        </Typography>
      )}
      {relative && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant/70"
        >
          {relative}
        </Typography>
      )}
    </View>
  )
}
