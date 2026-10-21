import { View } from 'react-native'
import { Switch } from '@/layout/components/ui/switch'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { textError } from '@/layout/utils/colors'

type UsdCostSectionProps = {
  hasError: boolean
  onChange: (value: boolean) => void
}

export function UsdCostSection({ hasError, onChange }: UsdCostSectionProps) {
  const strings = useStrings(settingsStrings)
  const showUsdCost = useUserPreferencesStore((store) => store.showUsdCost)

  return (
    <View className="gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.costTitle}
      </Typography>
      <View className="flex-row items-center justify-between">
        <Typography variant="button-text" className="text-on-surface">
          {strings.showUsdCost}
        </Typography>
        <Switch
          value={showUsdCost}
          onValueChange={onChange}
          accessibilityLabel={strings.showUsdCost}
        />
      </View>
      {hasError ? (
        <Typography variant="button-text" style={{ color: textError }}>
          {strings.preferenceSaveFailed}
        </Typography>
      ) : null}
    </View>
  )
}
