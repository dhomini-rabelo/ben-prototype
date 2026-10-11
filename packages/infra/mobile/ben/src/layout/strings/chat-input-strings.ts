import type { Localized } from '@/core/languages'

const en = {
  send: 'Send',
  voiceInput: 'Voice input',
  attach: 'Attach',
  placeholder: 'Message Ben...',
}

export const chatInputStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    send: 'Enviar',
    voiceInput: 'Entrada de voz',
    attach: 'Anexar',
    placeholder: 'Mensagem para o Ben...',
  },
}
