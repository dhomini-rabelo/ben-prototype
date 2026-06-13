import { Audio } from 'expo-av'
import type { PermissionResponse } from 'expo-modules-core'
import type { MicPermission } from './types'

function toMicPermission(response: PermissionResponse): MicPermission {
  if (response.granted) {
    return 'granted'
  }
  if (response.status === 'denied' && !response.canAskAgain) {
    return 'denied'
  }
  return 'prompt'
}

export function subscribeMicPermission(
  onChange: (permission: MicPermission) => void,
): () => void {
  let active = true

  Audio.getPermissionsAsync()
    .then((response) => {
      if (active) {
        onChange(toMicPermission(response))
      }
    })
    .catch(() => undefined)

  return () => {
    active = false
  }
}
