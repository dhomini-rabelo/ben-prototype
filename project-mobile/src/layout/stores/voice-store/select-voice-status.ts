import type { VoiceStatus, VoiceStore } from './types'

export function selectVoiceStatus(state: VoiceStore): VoiceStatus {
  if (state.isRecording) {
    return 'recording'
  }
  if (state.transcription === 'pending') {
    return 'transcribing'
  }
  if (state.transcription === 'error' || state.recorderError) {
    return 'error'
  }
  return 'idle'
}
