import { useEffect, useState } from 'react'
import { getMicPermissionStatus } from '@/services/audio-service'
import type { MicPermission } from '@/services/audio-service'

export function useMicrophonePermission() {
  const [permission, setPermission] = useState<MicPermission>('prompt')

  useEffect(() => {
    let active = true

    getMicPermissionStatus()
      .then((status) => {
        if (active) {
          setPermission(status)
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  return { permission, setPermission }
}
