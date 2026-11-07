import type { SnoozeOption } from '@/api/models/reminder'

export type DemoAlarm = {
  id: string
  title: string
  eventClock: string
}

export type SnoozeChoice = {
  option: SnoozeOption
  clock: string
  isTomorrow: boolean
}

export const NOW_CLOCK = '15:00'

export const PICK_UP_LEO: DemoAlarm = {
  id: 'leo',
  title: 'Buscar o Leo na escola',
  eventClock: '15:00',
}

export const LONG_TITLE: DemoAlarm = {
  id: 'leo-long',
  title:
    'Buscar o Leo na escola e passar na farmácia antes de voltar para casa',
  eventClock: '15:00',
}

export const DENTIST: DemoAlarm = {
  id: 'dentista',
  title: 'Ligar pro dentista',
  eventClock: '15:00',
}

export const QUEUE: DemoAlarm[] = [PICK_UP_LEO, DENTIST]

export const SNOOZE_CHOICES: SnoozeChoice[] = [
  { option: '10-minutes', clock: '15:10', isTomorrow: false },
  { option: '30-minutes', clock: '15:30', isTomorrow: false },
  { option: '1-hour', clock: '16:00', isTomorrow: false },
  { option: '2-hours', clock: '17:00', isTomorrow: false },
  { option: 'tomorrow-morning', clock: '08:00', isTomorrow: true },
]
