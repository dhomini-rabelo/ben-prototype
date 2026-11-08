import type { ConfigPlugin } from 'expo/config-plugins'

export interface AlarmManifest {
  manifest: {
    application?: {
      activity?: { $: Record<string, string> }[]
    }[]
  }
}

export function applyAlarmActivityAttributes<T extends AlarmManifest>(
  manifest: T,
): T

declare const withAlarmActivity: ConfigPlugin
export default withAlarmActivity
