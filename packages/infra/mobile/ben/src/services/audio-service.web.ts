export type MicPermission = 'granted' | 'denied' | 'prompt'

export interface RecordingResult {
  uri: string | null
  durationMillis: number
}

interface ActiveRecording {
  recorder: MediaRecorder
  stream: MediaStream
  chunks: Blob[]
  startedAt: number
}

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
]

let activeRecording: ActiveRecording | null = null

function canCaptureAudio(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  )
}

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

function pickMimeType(): string | undefined {
  return PREFERRED_MIME_TYPES.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  )
}

export async function getMicPermissionStatus(): Promise<MicPermission> {
  if (!canCaptureAudio()) {
    return 'denied'
  }
  try {
    const status = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    })
    return status.state
  } catch {
    return 'prompt'
  }
}

export async function requestMicPermission(): Promise<boolean> {
  if (!canCaptureAudio()) {
    return false
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stopStream(stream)
    return true
  } catch {
    return false
  }
}

export async function beginRecording(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  try {
    const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() })
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }
    recorder.start()
    activeRecording = { recorder, stream, chunks, startedAt: Date.now() }
  } catch (error) {
    stopStream(stream)
    throw error
  }
}

function stopRecorder(recording: ActiveRecording): Promise<Blob> {
  const { recorder, stream, chunks } = recording
  return new Promise((resolve) => {
    function finish() {
      stopStream(stream)
      resolve(new Blob(chunks, { type: recorder.mimeType }))
    }
    if (recorder.state === 'inactive') {
      finish()
      return
    }
    recorder.onstop = finish
    recorder.stop()
  })
}

export async function endRecording(): Promise<RecordingResult> {
  const current = activeRecording
  if (!current) {
    return { uri: null, durationMillis: 0 }
  }
  activeRecording = null

  const durationMillis = Date.now() - current.startedAt
  const blob = await stopRecorder(current)
  if (blob.size === 0) {
    return { uri: null, durationMillis }
  }
  return { uri: URL.createObjectURL(blob), durationMillis }
}

export async function discardRecording(): Promise<void> {
  const current = activeRecording
  activeRecording = null
  if (current) {
    await stopRecorder(current)
  }
}
