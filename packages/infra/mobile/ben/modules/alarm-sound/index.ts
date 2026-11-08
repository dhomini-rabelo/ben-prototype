import { requireOptionalNativeModule } from 'expo'

export interface AlarmSoundModule {
  start(maxDurationMs: number): Promise<void>
  stop(): void
  leaveLockScreen(): void
}

// `null` where the native module does not exist (iOS, web, Expo Go).
export const AlarmSound =
  requireOptionalNativeModule<AlarmSoundModule>('AlarmSound')
