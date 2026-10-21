import type { SnoozeOption } from '@ben/adapters'
import type { ReminderProps } from '@ben/domain-chat/enterprise/entities/reminder'

const MINUTE_MS = 60_000

export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number

  weekday: number
}

type ScheduleProps = Pick<
  ReminderProps,
  | 'kind'
  | 'status'
  | 'remindAt'
  | 'timeZone'
  | 'alerts'
  | 'recurrence'
  | 'checkFrequency'
  | 'acknowledgedUntil'
  | 'snoozedUntil'
  | 'createdAt'
>

export function toZonedParts(instant: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(instant)
  const pick = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value)
  const year = pick('year')
  const month = pick('month')
  const day = pick('day')
  return {
    year,
    month,
    day,
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
  }
}

export function fromZonedParts(
  parts: Omit<ZonedParts, 'weekday'> & { weekday?: number },
  timeZone: string,
): Date {
  const wallClock = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
  let guess = wallClock
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const zoned = toZonedParts(new Date(guess), timeZone)
    const zonedWallClock = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second,
    )
    const next = guess - (zonedWallClock - wallClock)
    if (next === guess) break
    guess = next
  }
  return new Date(guess)
}

function formatLocalDate(parts: Pick<ZonedParts, 'year' | 'month' | 'day'>) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function shiftLocalDate(
  parts: Pick<ZonedParts, 'year' | 'month' | 'day'>,
  days: number,
): Pick<ZonedParts, 'year' | 'month' | 'day'> {
  const shifted = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + days),
  )
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number)
  return { hour: hour || 0, minute: minute || 0 }
}

function atLocalTime(
  date: Pick<ZonedParts, 'year' | 'month' | 'day'>,
  time: { hour: number; minute: number },
  timeZone: string,
): Date {
  return fromZonedParts({ ...date, ...time, second: 0 }, timeZone)
}

function goalMatchesDate(
  recurrence: ScheduleProps['recurrence'],
  startDate: string,
  date: Pick<ZonedParts, 'year' | 'month' | 'day'>,
): boolean {
  const dateKey = formatLocalDate(date)
  if (dateKey < startDate) return false
  const type = recurrence?.type ?? 'none'
  if (type === 'none') return dateKey === startDate
  if (type === 'daily') return true
  const weekday = new Date(
    Date.UTC(date.year, date.month - 1, date.day),
  ).getUTCDay()
  return recurrence?.type === 'weekdays'
    ? recurrence.weekdays.includes(weekday)
    : false
}

export function listGoalOccurrences(
  input: {
    remindAt: string
    recurrence: ScheduleProps['recurrence']
    timeZone: string
  },
  from: Date,
  days = 8,
): Date[] {
  const { remindAt, recurrence, timeZone } = input
  const start = toZonedParts(new Date(remindAt), timeZone)
  const startDate = formatLocalDate(start)
  const time = { hour: start.hour, minute: start.minute }
  const first = toZonedParts(from, timeZone)
  const occurrences: Date[] = []

  for (let offset = 0; offset <= days; offset += 1) {
    const date = shiftLocalDate(first, offset)
    if (!goalMatchesDate(recurrence, startDate, date)) continue
    const instant = atLocalTime(date, time, timeZone)
    if (instant.getTime() >= from.getTime()) occurrences.push(instant)
  }

  return occurrences
}

export function listAlertInstants(input: {
  eventAt: Date
  alerts: ScheduleProps['alerts']
  timeZone: string
  morningTime: string
  createdAt: Date
}): Date[] {
  const { eventAt, alerts, timeZone, morningTime, createdAt } = input
  const event = toZonedParts(eventAt, timeZone)
  const instants: Date[] = []

  for (const alert of alerts) {
    if (alert.kind === 'at-event') {
      instants.push(eventAt)
    } else if (alert.kind === 'day-before') {
      instants.push(
        atLocalTime(
          shiftLocalDate(event, -1),
          { hour: event.hour, minute: event.minute },
          timeZone,
        ),
      )
    } else if (alert.kind === 'morning-of') {
      const morning = atLocalTime(event, parseTime(morningTime), timeZone)
      if (morning.getTime() < eventAt.getTime()) instants.push(morning)
    } else {
      instants.push(new Date(eventAt.getTime() - alert.minutes * MINUTE_MS))
    }
  }

  return instants
    .filter((instant) => instant.getTime() >= createdAt.getTime())
    .sort((first, second) => first.getTime() - second.getTime())
}

function conditionalIntervalDays(
  frequency: ScheduleProps['checkFrequency'],
): number {
  if (frequency?.type === 'every-n-days') return Math.max(1, frequency.days)
  if (frequency?.type === 'weekly') return 7
  return 1
}

export function computeNextFireAt(
  props: ScheduleProps,
  morningTime: string,
): Date | null {
  if (props.status === 'done') return null

  const anchor = props.acknowledgedUntil ?? props.createdAt
  const candidates: Date[] = []

  if (props.kind === 'alarm' && props.remindAt) {
    candidates.push(
      ...listAlertInstants({
        eventAt: new Date(props.remindAt),
        alerts: props.alerts,
        timeZone: props.timeZone,
        morningTime,
        createdAt: props.createdAt,
      }),
    )
  } else if (props.kind === 'goal' && props.remindAt) {
    const firstOccurrence = new Date(props.remindAt)
    candidates.push(
      ...listGoalOccurrences(
        {
          remindAt: props.remindAt,
          recurrence: props.recurrence,
          timeZone: props.timeZone,
        },
        firstOccurrence.getTime() > anchor.getTime() ? firstOccurrence : anchor,
      ),
    )
  } else if (props.kind === 'conditional') {
    const anchorDate = toZonedParts(anchor, props.timeZone)
    candidates.push(
      atLocalTime(
        shiftLocalDate(
          anchorDate,
          conditionalIntervalDays(props.checkFrequency),
        ),
        parseTime(morningTime),
        props.timeZone,
      ),
    )
  }

  if (props.snoozedUntil) candidates.push(props.snoozedUntil)

  const upcoming = candidates
    .filter((instant) => instant.getTime() > anchor.getTime())
    .sort((first, second) => first.getTime() - second.getTime())
  return upcoming[0] ?? null
}

const SNOOZE_OFFSETS: { option: SnoozeOption; minutes: number }[] = [
  { option: '10-minutes', minutes: 10 },
  { option: '30-minutes', minutes: 30 },
  { option: '1-hour', minutes: 60 },
  { option: '2-hours', minutes: 120 },
]

export function listSnoozeOptions(input: {
  reminderProps: Pick<ReminderProps, 'kind' | 'remindAt' | 'timeZone'>
  now: Date
  morningTime: string
}): { option: SnoozeOption; at: Date }[] {
  const { reminderProps, now, morningTime } = input
  const options = SNOOZE_OFFSETS.map(({ option, minutes }) => ({
    option,
    at: new Date(now.getTime() + minutes * MINUTE_MS),
  }))
  const tomorrow = shiftLocalDate(toZonedParts(now, reminderProps.timeZone), 1)
  options.push({
    option: 'tomorrow-morning',
    at: atLocalTime(tomorrow, parseTime(morningTime), reminderProps.timeZone),
  })

  if (reminderProps.kind !== 'alarm' || !reminderProps.remindAt) return options

  const eventAt = new Date(reminderProps.remindAt)
  if (now.getTime() >= eventAt.getTime()) {
    return options.filter(
      ({ option }) => option === '10-minutes' || option === '30-minutes',
    )
  }
  return options.filter(({ at }) => at.getTime() <= eventAt.getTime())
}

export function occursOnLocalDate(
  props: Pick<ReminderProps, 'kind' | 'remindAt' | 'recurrence'>,
  date: string,
  timeZone: string,
): boolean {
  if (!props.remindAt) return false
  const start = toZonedParts(new Date(props.remindAt), timeZone)
  const startDate = formatLocalDate(start)
  if (props.kind === 'alarm') return startDate === date
  if (props.kind !== 'goal') return false
  const [year, month, day] = date.split('-').map(Number)
  return goalMatchesDate(props.recurrence, startDate, { year, month, day })
}
