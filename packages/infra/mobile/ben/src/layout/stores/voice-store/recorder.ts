import {
  beginRecording,
  discardRecording,
  endRecording,
  requestMicPermission,
} from '@/services/audio-service'
import type { MicPermission } from '@/services/audio-service'

const MIN_RECORDING_MILLIS = 500
const CAPTURE_ERROR_MESSAGE = 'Could not access the microphone.'

interface RecorderCallbacks {
  onPermission: (permission: MicPermission) => void
  onError: (message: string) => void
  onStop: (audioUri: string) => void
}

let activeCallbacks: RecorderCallbacks | null = null
let isCancelled = false

export async function releaseRecorder() {
  activeCallbacks = null
  await discardRecording()
}

export async function startRecorder(
  callbacks: RecorderCallbacks,
): Promise<boolean> {
  const granted = await requestMicPermission()
  if (!granted) {
    callbacks.onPermission('denied')
    return false
  }
  callbacks.onPermission('granted')

  try {
    await beginRecording()
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
  const callbacks = activeCallbacks
  if (!callbacks) {
    return
  }
  activeCallbacks = null

  try {
    const { uri, durationMillis } = await endRecording()

    if (isCancelled) {
      return
    }

    if (!uri || durationMillis < MIN_RECORDING_MILLIS) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE)
      return
    }

    callbacks.onStop(uri)
  } catch {
    if (!isCancelled) {
      callbacks.onError(CAPTURE_ERROR_MESSAGE)
    }
  }
}

export function cancelRecorder() {
  isCancelled = true
  void releaseRecorder()
}
