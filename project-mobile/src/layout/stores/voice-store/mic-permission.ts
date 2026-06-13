import { getMicPermissionStatus } from '@/services/audio-service'
import type { MicPermission } from '@/services/audio-service'

export function subscribeMicPermission(
  onChange: (permission: MicPermission) => void,
): () => void {
  let active = true

  getMicPermissionStatus()
    .then((permission) => {
      if (active) {
        onChange(permission)
      }
    })
    .catch(() => undefined)

  return () => {
    active = false
  }
}
