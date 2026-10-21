import { useState } from 'react'
import { View } from 'react-native'
import type { CheckFrequency } from '@/api/models/reminder'
import {
  requestAcknowledgeReminder,
  requestUpdateReminder,
} from '@/api/requests/reminders'
import { AlarmPopupAlarm } from '@/layout/components/alarm-popup/alarm-popup-alarm'
import { AlarmPopupConditional } from '@/layout/components/alarm-popup/alarm-popup-conditional'
import { AlarmPopupGoal } from '@/layout/components/alarm-popup/alarm-popup-goal'
import { AlarmPopupSnooze } from '@/layout/components/alarm-popup/alarm-popup-snooze'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { SettingsSheetOverlay } from '@/layout/components/menu-settings/settings-sheet-overlay'
import { Typography } from '@/layout/components/ui/typography'
import { useActiveRemindersData } from '@/layout/hooks/api/use-active-reminders-data'
import { useDailySummaryStore } from '@/layout/hooks/use-daily-summary'
import { useStrings } from '@/layout/hooks/use-strings'
import { useAlarmStore, type FiredAlarm } from '@/layout/stores/alarm-store'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type PopupMode = 'main' | 'snooze'

type AlarmPopupContentProps = {
  alarm: FiredAlarm
}

function AlarmPopupContent({ alarm }: AlarmPopupContentProps) {
  const strings = useStrings(alarmStrings)
  const { reminder, firedAt } = alarm
  const { actions } = useActiveRemindersData({ enabled: false })
  const [mode, setMode] = useState<PopupMode>('main')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function run(task: () => Promise<unknown>) {
    setBusy(true)
    setFailed(false)
    try {
      await task()
      useAlarmStore.getState().dismissCurrent()
      await actions.invalidate()
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const acknowledge = (snoozeUntil?: string) =>
    run(() => requestAcknowledgeReminder(reminder.id, { firedAt, snoozeUntil }))
  const markDone = () =>
    run(() => requestUpdateReminder(reminder.id, { status: 'done' }))

  async function finishGoal() {
    await run(async () => {
      await requestAcknowledgeReminder(reminder.id, { firedAt })
      if (reminder.recurrence?.type === 'none') {
        await requestUpdateReminder(reminder.id, { status: 'done' })
      }
    })
  }

  async function notYet(frequency: CheckFrequency | null) {
    await run(async () => {
      if (frequency) {
        await requestUpdateReminder(reminder.id, { checkFrequency: frequency })
      }
      await requestAcknowledgeReminder(reminder.id, { firedAt })
    })
  }

  const showSnooze = mode === 'snooze' && reminder.kind !== 'conditional'

  return (
    <>
      {showSnooze ? (
        <AlarmPopupSnooze
          reminderId={reminder.id}
          busy={busy}
          onPick={(snoozeUntil) => void acknowledge(snoozeUntil)}
          onBack={() => setMode('main')}
        />
      ) : null}
      {!showSnooze && reminder.kind === 'alarm' ? (
        <AlarmPopupAlarm
          reminder={reminder}
          busy={busy}
          onAcknowledge={() => void acknowledge()}
          onSnooze={() => setMode('snooze')}
          onComplete={() => void markDone()}
        />
      ) : null}
      {!showSnooze && reminder.kind === 'goal' ? (
        <AlarmPopupGoal
          reminder={reminder}
          firedAt={firedAt}
          busy={busy}
          onDone={() => void finishGoal()}
          onSnooze={() => setMode('snooze')}
        />
      ) : null}
      {!showSnooze && reminder.kind === 'conditional' ? (
        <AlarmPopupConditional
          reminder={reminder}
          busy={busy}
          onYes={() => void markDone()}
          onNotYet={(frequency) => void notYet(frequency)}
        />
      ) : null}
      {failed ? (
        <View className="px-5 pb-2">
          <Typography variant="body-md" className="text-error">
            {strings.actionFailed}
          </Typography>
        </View>
      ) : null}
    </>
  )
}

export function AlarmPopupOverlay() {
  const current = useAlarmStore((store) => store.current)
  const isSummaryOpen = useDailySummaryStore((store) => store.summary !== null)

  return (
    <SettingsSheetOverlay
      isOpen={current !== null && !isSummaryOpen}
      onClose={() => useAlarmStore.getState().dismissCurrent()}
    >
      {current ? (
        <MenuSheet>
          <AlarmPopupContent
            key={`${current.reminder.id}:${current.firedAt}`}
            alarm={current}
          />
        </MenuSheet>
      ) : null}
    </SettingsSheetOverlay>
  )
}
