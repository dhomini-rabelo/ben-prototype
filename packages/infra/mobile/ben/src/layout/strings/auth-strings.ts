import type { Localized } from '@/core/languages'

const en = {
  authFailed: 'Authentication failed. Please try again.',
}

export const authStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    authFailed: 'A autenticação falhou. Tente de novo.',
  },
}
