import type { Localized } from '@/core/languages'

const en = {
  customTitle: 'custom time',
  ringsAt: (time: string) => `rings again at ${time}`,
  confirm: (duration: string) => `Snooze for ${duration}`,
  orPick: 'or pick one',
  minLabel: '5 min',
  maxLabel: '2 h',
  sliderLabel: 'Snooze time',
}

export const alarmV4Strings: Localized<typeof en> = {
  en,
  'pt-BR': {
    customTitle: 'tempo próprio',
    ringsAt: (time) => `toca de novo às ${time}`,
    confirm: (duration) => `Adiar ${duration}`,
    orPick: 'ou escolha uma',
    minLabel: '5 min',
    maxLabel: '2 h',
    sliderLabel: 'Tempo da soneca',
  },
}
