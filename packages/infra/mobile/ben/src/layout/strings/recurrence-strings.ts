import type { Localized } from '@/core/languages'

const en = {
  oneTime: 'One-time',
  everyDay: 'Every day',
  weekdays: 'Weekdays',
  weekdayAbbreviations: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export const recurrenceStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    oneTime: 'Único',
    everyDay: 'Todo dia',
    weekdays: 'Dias úteis',
    weekdayAbbreviations: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  },
}
