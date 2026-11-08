import { Moon } from 'phosphor-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Glow } from '@/layout/components/alarm-screen/alarm-screen-parts'
import { formatClock } from '@/layout/components/alarm-popup/format-clock'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import {
  getRemainingSoundMs,
  type FiredAlarm,
} from '@/layout/stores/alarm-store'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { LANGUAGE_LOCALES } from '@/core/languages'
import { startAlarmSound } from '@/services/alarm-service'

const CLOCK_TICK_MS = 1000

type AlarmScreenProps = {
  alarm: FiredAlarm
  queueIndex: number
  queueTotal: number
  onStop: () => void
  onSnooze: () => void
  onComplete: () => void
}

export function AlarmScreen({
  alarm,
  queueIndex,
  queueTotal,
  onStop,
  onSnooze,
  onComplete,
}: AlarmScreenProps) {
  const strings = useStrings(alarmStrings)
  const language = useLanguage()
  const [now, setNow] = useState(() => new Date())
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS)
    return () => clearInterval(timer)
  }, [])

  async function tryStartSound() {
    const result = await startAlarmSound(
      getRemainingSoundMs(alarm.firedAt, Date.now()),
    )
    setIsBlocked(result === 'blocked')
  }

  useEffect(() => {
    if (alarm.sound === 'on') {
      void tryStartSound()
    }
    // starts once per fired alarm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarm.reminderId, alarm.firedAt, alarm.sound])

  const dateLabel = now.toLocaleDateString(LANGUAGE_LOCALES[language], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <View className="flex-1 overflow-hidden bg-tertiary px-6 pt-14 pb-10">
      <Glow top={180} />
      <View className="items-center gap-1">
        <Typography variant="body-md" className="text-white/80">
          {dateLabel}
        </Typography>
        <Typography
          variant="wordmark"
          className="text-[112px] leading-[120px] tracking-tighter text-white"
        >
          {formatClock(now.toISOString(), language)}
        </Typography>
        {queueTotal > 1 ? (
          <Typography variant="label-caps" className="text-white/60">
            {strings.alarmLabel} · {strings.queueLabel(queueIndex, queueTotal)}
          </Typography>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center gap-8">
        <View className="max-w-[330px] rounded-[32px] bg-surface-container-lowest px-7 py-6 shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
          <Typography
            variant="headline-lg"
            className="text-center text-[28px] leading-[34px] text-on-surface"
          >
            {alarm.title}
          </Typography>
        </View>
        {isBlocked ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void tryStartSound()}
            className="min-h-11 items-center justify-center rounded-full bg-white/15 px-6 py-3"
          >
            <Typography variant="button-text" className="text-white">
              {strings.tapToHear}
            </Typography>
          </Pressable>
        ) : null}
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
