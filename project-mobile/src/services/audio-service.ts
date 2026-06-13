import {
  AudioModule,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio'
import type { AudioRecorder } from 'expo-audio'
import type { PermissionResponse } from 'expo-modules-core'

// Sole importer of `expo-audio` (the native audio SDK). Screens and stores call
// these intent-named functions instead of touching the SDK directly, so audio
// stays behind one swappable boundary. The web build uses the no-op
// `audio-service.web.ts` variant, which Metro picks for the web bundle.
export type MicPermission = 'granted' | 'denied' | 'prompt'

export interface RecordingResult {
  uri: string | null
  durationMillis: number
}

let activeRecorder: AudioRecorder | null = null

function toMicPermission(response: PermissionResponse): MicPermission {
  if (response.granted) {
    return 'granted'
  }
  if (response.status === 'denied' && !response.canAskAgain) {
    return 'denied'
  }
  return 'prompt'
}

async function resetAudioMode(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  })
}

export async function getMicPermissionStatus(): Promise<MicPermission> {
  return toMicPermission(await getRecordingPermissionsAsync())
}

export async function requestMicPermission(): Promise<boolean> {
  const response = await requestRecordingPermissionsAsync()
  return response.granted
}

export async function beginRecording(): Promise<void> {
  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  })

  // eslint-disable-next-line import/namespace -- AudioRecorder is a runtime property of the default-exported AudioModule instance; the import/namespace rule can't resolve it statically (this is how expo-audio's own useAudioRecorder constructs it)
  const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY)
  await recorder.prepareToRecordAsync()
  recorder.record()
  activeRecorder = recorder
}

export async function endRecording(): Promise<RecordingResult> {
  const current = activeRecorder
  if (!current) {
    return { uri: null, durationMillis: 0 }
  }
  activeRecorder = null

  try {
    // Read duration while still recording — after stop() the status no longer
    // reports it. The uri is only finalized once stop() resolves.
    const durationMillis = current.getStatus().durationMillis ?? 0
    await current.stop()
    return { uri: current.uri ?? null, durationMillis }
  } finally {
    current.release()
    await resetAudioMode()
  }
}

export async function discardRecording(): Promise<void> {
  const current = activeRecorder
  activeRecorder = null
  if (current) {
    try {
      await current.stop()
    } catch {
      // already stopped
    }
    current.release()
  }
  await resetAudioMode()
}
