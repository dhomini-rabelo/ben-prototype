import type { Localized } from '@/core/languages'

const en = {
  cancelRecording: 'Cancel recording',
  stopRecording: 'Stop recording',
  micError: 'Could not access the microphone.',
}

export const recordingStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    cancelRecording: 'Cancelar gravação',
    stopRecording: 'Parar gravação',
    micError: 'Não foi possível acessar o microfone.',
  },
}
