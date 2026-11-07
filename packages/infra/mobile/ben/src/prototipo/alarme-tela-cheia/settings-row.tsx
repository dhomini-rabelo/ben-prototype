import { BellRinging } from 'phosphor-react-native'
import { Pressable, View } from 'react-native'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { brandDeep, onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { alarmProtoStrings } from '@/prototipo/alarme-tela-cheia/strings'
import type { SettingsRowVariant } from '@/prototipo/alarme-tela-cheia/variation-types'

type SettingsRowProps = {
  variant: SettingsRowVariant
}

const containerClasses: Record<SettingsRowVariant, string> = {
  inline: 'flex-row items-center justify-between gap-3',
  card: 'gap-3 rounded-2xl border border-outline-variant bg-surface p-4',
  banner: 'gap-3 rounded-2xl bg-primary-container p-4',
}

export function SettingsRow({ variant }: SettingsRowProps) {
  const strings = useStrings(alarmProtoStrings)

  return (
    <View className={cn(containerClasses[variant])}>
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <BellRinging
          size={22}
          weight="fill"
          color={variant === 'banner' ? brandDeep : onSurfaceVariant}
        />
        <View className="min-w-0 flex-1 gap-0.5">
          <Typography variant="button-text" className="text-on-surface">
            {strings.settingsRowTitle}
          </Typography>
          <Typography
            variant="body-md"
            className={cn(
              'text-sm leading-5',
              variant === 'banner'
                ? 'text-on-primary-container'
                : 'text-on-surface-variant',
            )}
          >
            {strings.settingsStatusOff}
          </Typography>
        </View>
      </View>
      {variant === 'inline' ? (
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-primary px-4 py-2 active:bg-inverse-surface"
        >
          <Typography variant="button-text" className="text-on-primary">
            {strings.settingsAllow}
          </Typography>
        </Pressable>
      ) : (
        <Button>{strings.settingsAllow}</Button>
      )}
    </View>
  )
}
