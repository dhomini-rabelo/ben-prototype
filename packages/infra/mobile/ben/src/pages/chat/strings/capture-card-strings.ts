import type { Localized } from '@/core/languages'

const en = {
  errorMessage: {
    note: "couldn't save this note — retry",
    reminder: "couldn't save this reminder — retry",
    task: "couldn't set this up — retry",
  },
  actionLabel: {
    default: 'Start',
    pending: 'Start',
    active: 'Continue',
    finished: 'View',
    error: 'Start',
    fired: 'Start',
  },
}

export const captureCardStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    errorMessage: {
      note: 'não deu para salvar esta nota — tentar de novo',
      reminder: 'não deu para salvar este lembrete — tentar de novo',
      task: 'não deu para configurar isso — tentar de novo',
    },
    actionLabel: {
      default: 'Começar',
      pending: 'Começar',
      active: 'Continuar',
      finished: 'Ver',
      error: 'Começar',
      fired: 'Começar',
    },
  },
}
