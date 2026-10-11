import type { Localized } from '@/core/languages'

const en = {
  copy: 'Copy',
  copied: 'Copied',
  showMore: 'Show more',
  showLess: 'Show less',
}

export const uiStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    copy: 'Copiar',
    copied: 'Copiado',
    showMore: 'Mostrar mais',
    showLess: 'Mostrar menos',
  },
}
