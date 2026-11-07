import { Moon, BellRinging } from 'phosphor-react-native'
import { Pressable, View } from 'react-native'
import { Button } from '@/layout/components/ui/button'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { brandDeep, onSurface } from '@/layout/utils/colors'
import { NOW_CLOCK } from '@/prototipo/alarme-tela-cheia/data'
import { Glow, SnoozeChoiceList } from '@/prototipo/alarme-tela-cheia/parts'
import { AppBackdrop } from '@/prototipo/alarme-tela-cheia/shared'
import { alarmProtoStrings } from '@/prototipo/alarme-tela-cheia/strings'
import type {
  AlarmVariation,
  AlarmScreenProps,
  PermissionScreenProps,
  SnoozeScreenProps,
} from '@/prototipo/alarme-tela-cheia/variation-types'

function AlarmScreen({
  alarm,
  queueIndex,
  queueTotal,
  onStop,
  onSnooze,
  onComplete,
}: AlarmScreenProps) {
  const strings = useStrings(alarmProtoStrings)

  return (
    <View className="flex-1 overflow-hidden bg-tertiary px-6 pt-14 pb-10">
      <Glow top={180} />
      <View className="items-center gap-1">
        <Typography variant="body-md" className="text-white/80">
          {strings.dateLabel}
        </Typography>
        <Typography
          variant="wordmark"
          className="text-[112px] leading-[120px] tracking-tighter text-white"
        >
          {NOW_CLOCK}
        </Typography>
        {queueTotal > 1 ? (
          <Typography variant="label-caps" className="text-white/60">
            {strings.alarmLabel} · {strings.queueLabel(queueIndex, queueTotal)}
          </Typography>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center gap-6">
        <View className="items-center">
          <View className="max-w-[330px] rounded-[32px] bg-surface-container-lowest px-7 py-6 shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
            <Typography
              variant="headline-lg"
              className="text-center text-[28px] leading-[34px] text-on-surface"
            >
              {alarm.title}
            </Typography>
            <Typography
              variant="body-md"
              className="mt-2 text-center text-on-surface-variant"
            >
              {strings.eventAt(alarm.eventClock)}
            </Typography>
          </View>
          <View className="-mt-3 size-6 rotate-45 bg-surface-container-lowest" />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onSnooze}
          className="flex-row items-center gap-2 rounded-full bg-inverse-surface px-7 py-4 active:bg-on-surface"
        >
          <Moon size={20} weight="fill" color="#ffffff" />
          <Typography variant="button-text" className="text-lg text-white">
            {strings.snooze}
          </Typography>
        </Pressable>
      </View>

      <View className="gap-4">
        <Button onPress={onStop} className="h-16 rounded-full">
          <Typography variant="button-text" className="text-xl text-on-primary">
            {strings.stop}
          </Typography>
        </Button>
        <Pressable
          accessibilityRole="button"
          onPress={onComplete}
          className="min-h-11 items-center justify-center"
        >
          <Typography
            variant="button-text"
            className="text-base text-white/80 underline"
          >
            {strings.complete}
          </Typography>
        </Pressable>
      </View>
    </View>
  )
}

function SnoozeScreen({ alarm, choices, onPick, onBack }: SnoozeScreenProps) {
  const strings = useStrings(alarmProtoStrings)

  return (
    <View className="flex-1">
      <AlarmScreen
        alarm={alarm}
        queueIndex={1}
        queueTotal={1}
        onStop={onBack}
        onSnooze={onBack}
        onComplete={onBack}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        className="absolute inset-0 bg-black/55"
      />
      <View className="absolute inset-x-0 bottom-0">
        <MenuSheet>
          <View className="gap-4 px-5 pt-2 pb-4">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              {strings.snoozeTitle}
            </Typography>
            <SnoozeChoiceList choices={choices} onPick={onPick} />
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              className="min-h-11 items-center justify-center"
            >
              <Typography
                variant="button-text"
                className="text-on-surface-variant"
              >
                {strings.back}
              </Typography>
            </Pressable>
          </View>
        </MenuSheet>
      </View>
    </View>
  )
}

function PermissionScreen({ onAllow, onLater }: PermissionScreenProps) {
  const strings = useStrings(alarmProtoStrings)

  return (
    <View className="flex-1">
      <AppBackdrop />
      <View className="absolute inset-0 bg-inverse-surface/30" />
      <View className="absolute inset-x-0 bottom-0">
        <MenuSheet>
          <View className="items-center gap-4 px-5 pt-3 pb-4">
            <View className="size-14 items-center justify-center rounded-full bg-primary-container">
              <BellRinging size={28} weight="fill" color={brandDeep} />
            </View>
            <Typography
              variant="headline-lg"
              className="text-center text-on-surface"
            >
              {strings.permissionTitle}
            </Typography>
            <Typography
              variant="body-md"
              className="text-center text-on-surface-variant"
            >
              {strings.permissionBody}
            </Typography>
            <View className="w-full gap-1 pt-2">
              <Button onPress={onAllow}>{strings.permissionAllow}</Button>
              <Pressable
                accessibilityRole="button"
                onPress={onLater}
                className="min-h-11 items-center justify-center"
              >
                <Typography variant="button-text" style={{ color: onSurface }}>
                  {strings.permissionLater}
                </Typography>
              </Pressable>
            </View>
          </View>
        </MenuSheet>
      </View>
    </View>
  )
}

export const VARIATION_1: AlarmVariation = {
  settingsRowVariant: 'inline',
  AlarmScreen,
  SnoozeScreen,
  PermissionScreen,
}
