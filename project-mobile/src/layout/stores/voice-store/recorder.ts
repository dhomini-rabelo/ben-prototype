import { Audio } from 'expo-av'
import type { MicPermission } from './types'

const MIN_RECORDING_MILLIS = 500
const CAPTURE_ERROR_MESSAGE = 'Could not access the microphone.'

interface RecorderCallbacks {
  onPermission: (permission: MicPermission) => void
  onError: (message: string) => void
  onStop: (audioUri: string) => void
}

let recording: Audio.Recording | null = null
let activeCallbacks: RecorderCallbacks | null = null
let isCancelled = false

async function resetAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  })
}

export async function releaseRecorder() {
  const current = recording
  recording = null
  activeCallbacks = null
  if (current) {
    try {
      await current.stopAndUnloadAsync()
    } catch {
      // already unloaded
    }
  }
  await resetAudioMode()
}

export async function startRecorder(
  callbacks: RecorderCallbacks,
): Promise<boolean> {
  const permission = await Audio.requestPermissionsAsync()
  if (!permission.granted) {
    callbacks.onPermission('denied')
    return false
  }
  callbacks.onPermission('granted')

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })

    const { recording: created } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    )

    recording = created
    activeCallbacks = callbacks
    isCancelled = false
    return true
  } catch {
    callbacks.onError(CAPTURE_ERROR_MESSAGE)
    await releaseRecorder()
    return false
  }
}

export async function stopRecorder() {
  const current = recording
  const callbacks = activeCallbacks
  if (!current || !callbacks) {
    return
  }

  recording = null
  activeCallbacks = null

  try {
    const status = await current.stopAndUnloadAsync()
    const uri = current.getURI()

    if (isCancelled) {
      return
    }

    const durationMillis = status.durationMillis ?? 0
    if (!uri || durationMillis < MIN_RECORDING_MILLIS) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE)
      return
    }

    callbacks.onStop(uri)
  } catch {
    if (!isCancelled) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE)
    }
  } finally {
    await resetAudioMode()
  }
}

export function cancelRecorder() {
  isCancelled = true
  void releaseRecorder()
}
