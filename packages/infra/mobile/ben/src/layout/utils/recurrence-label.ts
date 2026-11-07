import type { GoalRecurrence, ReminderKind } from '@/api/models/reminder'
import type { Language } from '@/core/languages'
import { menuStrings } from '@/layout/strings/menu-strings'
import { recurrenceStrings } from '@/layout/strings/recurrence-strings'

export type ReminderSchedule = {
  kind: ReminderKind
  recurrence: GoalRecurrence | null
}

const WEEKDAYS_SET = [1, 2, 3, 4, 5]
const DAYS_IN_WEEK = 7

function mondayFirstOrder(day: number) {
  return (day + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK
}

export function getRecurrenceLabel(
  schedule: ReminderSchedule,
  language: Language,
): string | null {
  const strings = recurrenceStrings[language]
  const { kind, recurrence } = schedule
  if (kind === 'conditional') {
    return null
  }
  if (kind === 'alarm' || !recurrence || recurrence.type === 'none') {
    return strings.oneTime
  }
  if (recurrence.type === 'daily') {
    return strings.everyDay
  }
  const days = [...new Set(recurrence.weekdays)].sort(
    (first, second) => mondayFirstOrder(first) - mondayFirstOrder(second),
  )
  if (days.length === 0) {
    return strings.oneTime
  }
  if (days.length === DAYS_IN_WEEK) {
    return strings.everyDay
  }
  const isWeekdaysOnly =
    days.length === WEEKDAYS_SET.length &&
    WEEKDAYS_SET.every((day) => days.includes(day))
  if (isWeekdaysOnly) {
    return strings.weekdays
  }
  return days.map((day) => strings.weekdayAbbreviations[day]).join(', ')
}

export function getCaptureReminderLabel(
  schedule: ReminderSchedule,
  language: Language,
): string {
  if (schedule.kind === 'conditional') {
    return menuStrings[language].reminderKinds.conditional
  }
  return getRecurrenceLabel(schedule, language) ?? ''
}
