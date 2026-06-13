import { Audio } from 'expo-av'
import type { PermissionResponse } from 'expo-modules-core'
import { useEffect, useState } from 'react'

export type MicPermission = 'granted' | 'denied' | 'prompt'

function toMicPermission(response: PermissionResponse): MicPermission {
  if (response.granted) {
    return 'granted'
  }
  if (response.status === 'denied' && !response.canAskAgain) {
    return 'denied'
  }
  return 'prompt'
}

export function useMicrophonePermission() {
  const [permission, setPermission] = useState<MicPermission>('prompt')

  useEffect(() => {
    let active = true

    Audio.getPermissionsAsync()
      .then((response) => {
        if (active) {
          setPermission(toMicPermission(response))
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  return { permission, setPermission }
}
