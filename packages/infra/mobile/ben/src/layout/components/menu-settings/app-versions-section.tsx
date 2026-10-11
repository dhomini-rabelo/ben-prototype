import { View } from 'react-native'
import { APP_VERSIONS, CURRENT_APP_VERSION } from '@/core/app-versions'
import { AppVersionItem } from '@/layout/components/menu-settings/app-version-item'
import { Typography } from '@/layout/components/ui/typography'

export function AppVersionsSection() {
  return (
    <View className="gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5">
      <View className="flex-row justify-between">
        <Typography variant="label-caps" className="text-on-surface-variant">
          App versions
        </Typography>
        <Typography
          variant="label-caps"
          className="font-mono normal-case text-on-surface-variant"
        >
          v{CURRENT_APP_VERSION}
        </Typography>
      </View>
      <View>
        {APP_VERSIONS.map((v, i) => (
          <AppVersionItem key={v.version} version={v} defaultOpen={i === 0} />
        ))}
      </View>
    </View>
  )
}
