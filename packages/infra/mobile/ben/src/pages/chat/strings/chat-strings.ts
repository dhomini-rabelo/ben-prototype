import type { Localized } from '@/core/languages'

const en = {
  emptyTitle: 'No recent messages.',
  emptyBody: "Let's get started — tap the mic or type to tell Ben anything.",
  suggestedActionsTitle: 'Suggested Actions',
  remindLabel: 'Remind me to...',
  remindPrefill: 'Remind me to ',
  noteLabel: 'Create a note about...',
  notePrefill: 'Create a note about ',
  offlineBanner: "You're offline. Sending is paused until you're back online.",
  voiceErrorBanner: 'mic glitched — try again or type it',
  retry: 'Retry',
  micDeniedBanner: "Ben can't hear you yet — turn on mic in device settings.",
  menu: 'Menu',
  send: 'Send',
  voiceInput: 'Voice input',
  typingLabel: 'Ben is typing',
  peekEmpty: "nothing in progress — Ben's listening",
  peekActive: 'active',
  peekActiveCount: (count: number) => `${count} active`,
  tapToRetry: 'Tap to retry',
  sendRetry: "Ben didn't reply — tap to retry",
  hearingYou: 'Hearing you',
  cancelTranscription: 'Cancel transcription',
  voiceErrorBubble: "couldn't catch that — tap to retry or type it instead",
  traceHint: 'Long press to inspect the model call',
  traceAction: 'Inspect model call',
}

export const chatStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    emptyTitle: 'Nenhuma mensagem recente.',
    emptyBody:
      'Vamos começar — toque no microfone ou digite para contar qualquer coisa ao Ben.',
    suggestedActionsTitle: 'Ações sugeridas',
    remindLabel: 'Me lembre de...',
    remindPrefill: 'Me lembre de ',
    noteLabel: 'Criar uma nota sobre...',
    notePrefill: 'Criar uma nota sobre ',
    offlineBanner:
      'Você está offline. O envio fica em pausa até você voltar a ficar online.',
    voiceErrorBanner: 'o microfone falhou — tente de novo ou digite',
    retry: 'Tentar de novo',
    micDeniedBanner:
      'O Ben ainda não consegue ouvir você — ative o microfone nas configurações do aparelho.',
    menu: 'Menu',
    send: 'Enviar',
    voiceInput: 'Entrada de voz',
    typingLabel: 'Ben está digitando',
    peekEmpty: 'nada em andamento — o Ben está ouvindo',
    peekActive: 'ativa',
    peekActiveCount: (count) => `${count} ${count === 1 ? 'ativa' : 'ativas'}`,
    tapToRetry: 'Toque para tentar de novo',
    sendRetry: 'o Ben não respondeu — toque para tentar de novo',
    hearingYou: 'Ouvindo você',
    cancelTranscription: 'Cancelar transcrição',
    voiceErrorBubble:
      'não consegui entender — toque para tentar de novo ou digite',
    traceHint: 'Pressione e segure para inspecionar a chamada do modelo',
    traceAction: 'Inspecionar chamada do modelo',
  },
}
