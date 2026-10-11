import type { Localized } from '@/core/languages'

const en = {
  justNow: 'just now',
  yesterday: 'yesterday',
  noTimeSet: 'no time set',
  minutesAgo: (minutes: number) => `${minutes}m ago`,
  hoursAgo: (hours: number) => `${hours}h ago`,
  daysAgo: (days: number) => `${days}d ago`,
  weeksAgo: (weeks: number) => `${weeks}w ago`,
  inMinutes: (minutes: number) => `in ${minutes}m`,
  inHours: (hours: number) => `in ${hours}h`,
}

export const formatTimeStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    justNow: 'agora',
    yesterday: 'ontem',
    noTimeSet: 'sem horário',
    minutesAgo: (minutes) => `há ${minutes}min`,
    hoursAgo: (hours) => `há ${hours}h`,
    daysAgo: (days) => `há ${days}d`,
    weeksAgo: (weeks) => `há ${weeks}sem`,
    inMinutes: (minutes) => `em ${minutes}min`,
    inHours: (hours) => `em ${hours}h`,
  },
}
