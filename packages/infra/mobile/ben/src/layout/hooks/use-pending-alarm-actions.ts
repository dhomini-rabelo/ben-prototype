import { useEffect } from 'react'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import {
  flushPendingAlarmActions,
  restorePendingAlarmKeys,
} from '@/services/alarm-actions'

export function usePendingAlarmActions() {
  const isOffline = useConnectivityStore((store) => store.isOffline)

  useEffect(() => {
    void restorePendingAlarmKeys().then(flushPendingAlarmActions)
  }, [])

  useEffect(() => {
    if (!isOffline) {
      void flushPendingAlarmActions()
    }
  }, [isOffline])
}
