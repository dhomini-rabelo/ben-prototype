// expo-audio's recording APIs are native-only — voice capture is not part of the
// web experience. We report the microphone as denied so recording affordances
// stay disabled, and make every recording operation a no-op. Metro picks this
// `.web.ts` variant for the web bundle; native uses `audio-service.ts`.
export type MicPermission = 'granted' | 'denied' | 'prompt'

export interface RecordingResult {
  uri: string | null
  durationMillis: number
}

export async function getMicPermissionStatus(): Promise<MicPermission> {
  return 'denied'
}

export async function requestMicPermission(): Promise<boolean> {
  return false
}

export async function beginRecording(): Promise<void> {}

export async function endRecording(): Promise<RecordingResult> {
  return { uri: null, durationMillis: 0 }
}

export async function discardRecording(): Promise<void> {}
