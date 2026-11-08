import { useState } from 'react'
import { Modal } from 'react-native'
import { AlarmScreen } from '@/layout/components/alarm-screen/alarm-screen'
import { AlarmScreenSnooze } from '@/layout/components/alarm-screen/alarm-screen-snooze'
import { useDailySummaryStore } from '@/layout/hooks/use-daily-summary'
import {
  selectVisiblePopup,
  useAlarmStore,
  type FiredAlarm,
} from '@/layout/stores/alarm-store'
import { completeAlarm, snoozeAlarm, stopAlarm } from '@/services/alarm-actions'

type AlarmScreenContentProps = {
  alarm: FiredAlarm
  queueTotal: number
}

function AlarmScreenContent({ alarm, queueTotal }: AlarmScreenContentProps) {
  const [isSnoozing, setIsSnoozing] = useState(false)

  if (isSnoozing) {
    return (
      <AlarmScreenSnooze
        reminderId={alarm.reminderId}
        onPick={(until) => void snoozeAlarm(alarm, until)}
        onBack={() => setIsSnoozing(false)}
      />
    )
  }

  return (
    <AlarmScreen
      alarm={alarm}
      queueIndex={1}
      queueTotal={queueTotal}
      onStop={() => void stopAlarm(alarm)}
      onSnooze={() => setIsSnoozing(true)}
      onComplete={() => void completeAlarm(alarm)}
    />
  )
}

export function AlarmScreenOverlay() {
  const current = useAlarmStore((store) => store.current)
  const queueTotal = useAlarmStore((store) => store.queue.length)
  const isSummaryOpen = useDailySummaryStore((store) => store.summary !== null)
  const isVisible = selectVisiblePopup(current, isSummaryOpen) === 'alarm'

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => undefined}
    >
      {current && isVisible ? (
        <AlarmScreenContent
          key={`${current.reminderId}:${current.firedAt}`}
          alarm={current}
          queueTotal={queueTotal}
        />
      ) : null}
    </Modal>
  )
}
