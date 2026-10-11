import { View } from 'react-native'
import { APP_VERSIONS, CURRENT_APP_VERSION } from '@/core/app-versions'
import { AppVersionItem } from '@/layout/components/menu-settings/app-version-item'
import { useStrings } from '@/layout/hooks/use-strings'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { Typography } from '@/layout/components/ui/typography'

export function AppVersionsSection() {
  const strings = useStrings(settingsStrings)

  return (
    <View className="gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5">
      <View className="flex-row justify-between">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.appVersions}
        </Typography>
        <Typography
          variant="label-caps"
          className="font-mono normal-case text-on-surface-variant"
        >
          v{CURRENT_APP_VERSION}
        </Typography>
      </View>
      <View>
        {APP_VERSIONS.map((appVersion, index) => (
          <AppVersionItem
            key={appVersion.version}
            version={appVersion}
            defaultOpen={index === 0}
          />
        ))}
      </View>
    </View>
  )
}
