import type { Localized } from '@/core/languages'

const en = {
  recording: 'Recording',
  cancelRecording: 'Cancel recording',
  stopRecording: 'Stop recording',
  slideUpToCancel: 'Slide up to cancel',
  micError: 'Could not access the microphone.',
}

export const recordingStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    recording: 'Gravando',
    cancelRecording: 'Cancelar gravação',
    stopRecording: 'Parar gravação',
    slideUpToCancel: 'Deslize para cima para cancelar',
    micError: 'Não foi possível acessar o microfone.',
  },
}
