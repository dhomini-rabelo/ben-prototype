import type { Localized } from '@/core/languages'

const en = {
  loadError: "couldn't load this one — tap to retry",
  gone: "this one's gone — must've been cleared elsewhere.",
  retry: 'retry',
  captured: 'Captured',
  note: 'Note',
  reminder: 'Reminder',
  close: 'Close',
  statusUpcoming: 'upcoming',
  statusFired: 'fired',
}

export const menuDetailStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    loadError: 'não deu para carregar — toque para tentar de novo',
    gone: 'este item sumiu — deve ter sido apagado em outro lugar.',
    retry: 'tentar de novo',
    captured: 'Capturado',
    note: 'Nota',
    reminder: 'Lembrete',
    close: 'Fechar',
    statusUpcoming: 'próximo',
    statusFired: 'disparado',
  },
}
