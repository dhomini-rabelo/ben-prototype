import { describe, expect, it } from 'vitest'
import {
  getCaptureReminderLabel,
  getRecurrenceLabel,
} from '@/layout/utils/recurrence-label'

describe('getRecurrenceLabel', () => {
  it('labels alarm, goal none and goal without recurrence as one-time', () => {
    const schedules = [
      { kind: 'alarm' as const, recurrence: null },
      { kind: 'goal' as const, recurrence: { type: 'none' as const } },
      { kind: 'goal' as const, recurrence: null },
    ]
    for (const schedule of schedules) {
      expect(getRecurrenceLabel(schedule, 'en')).toBe('One-time')
      expect(getRecurrenceLabel(schedule, 'pt-BR')).toBe('Único')
    }
  })

  it('labels daily as every day', () => {
    const schedule = {
      kind: 'goal' as const,
      recurrence: { type: 'daily' as const },
    }
    expect(getRecurrenceLabel(schedule, 'en')).toBe('Every day')
    expect(getRecurrenceLabel(schedule, 'pt-BR')).toBe('Todo dia')
  })

  it('labels monday to friday as weekdays', () => {
    const schedule = {
      kind: 'goal' as const,
      recurrence: { type: 'weekdays' as const, weekdays: [1, 2, 3, 4, 5] },
    }
    expect(getRecurrenceLabel(schedule, 'en')).toBe('Weekdays')
    expect(getRecurrenceLabel(schedule, 'pt-BR')).toBe('Dias úteis')
  })

  it('labels all seven days as every day', () => {
    const schedule = {
      kind: 'goal' as const,
      recurrence: {
        type: 'weekdays' as const,
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      },
    }
    expect(getRecurrenceLabel(schedule, 'en')).toBe('Every day')
    expect(getRecurrenceLabel(schedule, 'pt-BR')).toBe('Todo dia')
  })

  it('lists loose days ordered monday to sunday', () => {
    const schedule = {
      kind: 'goal' as const,
      recurrence: { type: 'weekdays' as const, weekdays: [3, 1] },
    }
    expect(getRecurrenceLabel(schedule, 'en')).toBe('Mon, Wed')
    expect(getRecurrenceLabel(schedule, 'pt-BR')).toBe('Seg, Qua')
  })

  it('has no label for conditional', () => {
    expect(
      getRecurrenceLabel({ kind: 'conditional', recurrence: null }, 'en'),
    ).toBeNull()
  })
})

describe('getCaptureReminderLabel', () => {
  it('labels conditional with the kind', () => {
    const schedule = { kind: 'conditional' as const, recurrence: null }
    expect(getCaptureReminderLabel(schedule, 'en')).toBe('When it happens')
    expect(getCaptureReminderLabel(schedule, 'pt-BR')).toBe('Quando acontecer')
  })
})
