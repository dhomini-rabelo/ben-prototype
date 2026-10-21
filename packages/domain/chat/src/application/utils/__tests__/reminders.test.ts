import { describe, expect, it } from 'vitest'

import {
  computeNextFireAt,
  fromZonedParts,
  listAlertInstants,
  listGoalOccurrences,
  listSnoozeOptions,
  occursOnLocalDate,
  toZonedParts,
} from '@ben/domain-chat/application/utils/reminders'
import { createReminderData } from '@ben/domain-chat/application/__tests__/factories/reminder'

const SP = 'America/Sao_Paulo'
const MORNING = '08:00'

function iso(date: Date | null) {
  return date ? date.toISOString() : null
}

describe('reminders utils', () => {
  describe('zoned parts', () => {
    it('converts an instant to local parts and back', () => {
      const instant = new Date('2026-10-22T20:00:00Z')
      const parts = toZonedParts(instant, SP)

      expect(parts).toMatchObject({ day: 22, hour: 17, minute: 0 })
      expect(fromZonedParts(parts, SP).toISOString()).toBe(
        instant.toISOString(),
      )
    })

    it('keeps the local hour across the DST change in America/New_York', () => {
      const before = fromZonedParts(
        { year: 2026, month: 3, day: 7, hour: 11, minute: 0, second: 0 },
        'America/New_York',
      )
      const after = fromZonedParts(
        { year: 2026, month: 3, day: 9, hour: 11, minute: 0, second: 0 },
        'America/New_York',
      )

      expect(before.toISOString()).toBe('2026-03-07T16:00:00.000Z')
      expect(after.toISOString()).toBe('2026-03-09T15:00:00.000Z')
    })
  })

  describe('dentist tomorrow 17h with day-before and morning-of', () => {
    const createdAt = new Date('2026-10-21T13:00:00Z')
    const props = createReminderData({
      kind: 'alarm',
      timeZone: SP,
      remindAt: '2026-10-22T20:00:00Z',
      alerts: [
        { kind: 'day-before' },
        { kind: 'morning-of' },
        { kind: 'at-event' },
      ],
      createdAt,
    })

    it('lists three alert instants', () => {
      const instants = listAlertInstants({
        eventAt: new Date('2026-10-22T20:00:00Z'),
        alerts: props.alerts,
        timeZone: SP,
        morningTime: MORNING,
        createdAt,
      })

      expect(instants.map(iso)).toEqual([
        '2026-10-21T20:00:00.000Z',
        '2026-10-22T11:00:00.000Z',
        '2026-10-22T20:00:00.000Z',
      ])
    })

    it('fires next today at 17:00, then tomorrow at 08:00 after the ack', () => {
      expect(iso(computeNextFireAt(props, MORNING))).toBe(
        '2026-10-21T20:00:00.000Z',
      )

      const acknowledged = {
        ...props,
        acknowledgedUntil: new Date('2026-10-21T20:00:00Z'),
      }
      expect(iso(computeNextFireAt(acknowledged, MORNING))).toBe(
        '2026-10-22T11:00:00.000Z',
      )
    })

    it('discards the morning alert when the event is at 07:00', () => {
      const instants = listAlertInstants({
        eventAt: new Date('2026-10-22T10:00:00Z'),
        alerts: [{ kind: 'morning-of' }, { kind: 'at-event' }],
        timeZone: SP,
        morningTime: MORNING,
        createdAt,
      })

      expect(instants.map(iso)).toEqual(['2026-10-22T10:00:00.000Z'])
    })

    it('supports minutes-before and drops instants before creation', () => {
      const instants = listAlertInstants({
        eventAt: new Date('2026-10-21T13:20:00Z'),
        alerts: [
          { kind: 'minutes-before', minutes: 30 },
          { kind: 'minutes-before', minutes: 10 },
        ],
        timeZone: SP,
        morningTime: MORNING,
        createdAt,
      })

      expect(instants.map(iso)).toEqual(['2026-10-21T13:10:00.000Z'])
    })

    it('returns null when done', () => {
      expect(
        computeNextFireAt({ ...props, status: 'done' }, MORNING),
      ).toBeNull()
    })
  })

  describe('goals', () => {
    it('skips the weekend for a weekdays goal at 11h', () => {
      const occurrences = listGoalOccurrences(
        {
          remindAt: '2026-10-21T14:00:00Z',
          recurrence: { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
          timeZone: SP,
        },
        new Date('2026-10-23T00:00:00Z'),
        5,
      )

      expect(occurrences.map(iso)).toEqual([
        '2026-10-23T14:00:00.000Z',
        '2026-10-26T14:00:00.000Z',
        '2026-10-27T14:00:00.000Z',
      ])
    })

    it('computes the next fire after an acknowledgement', () => {
      const props = createReminderData({
        kind: 'goal',
        timeZone: SP,
        remindAt: '2026-10-21T14:00:00Z',
        recurrence: { type: 'daily' },
        alerts: [{ kind: 'at-event' }],
        createdAt: new Date('2026-10-21T12:00:00Z'),
        acknowledgedUntil: new Date('2026-10-21T14:00:00Z'),
      })

      expect(iso(computeNextFireAt(props, MORNING))).toBe(
        '2026-10-22T14:00:00.000Z',
      )
    })

    it('occurs on matching local dates only', () => {
      const props = {
        kind: 'goal' as const,
        remindAt: '2026-10-21T14:00:00Z',
        recurrence: { type: 'weekdays' as const, weekdays: [1] },
      }

      expect(occursOnLocalDate(props, '2026-10-26', SP)).toBe(true)
      expect(occursOnLocalDate(props, '2026-10-27', SP)).toBe(false)
      expect(occursOnLocalDate(props, '2026-10-19', SP)).toBe(false)
    })
  })

  describe('conditional', () => {
    const createdAt = new Date('2026-10-21T13:00:00Z')
    const base = createReminderData({
      kind: 'conditional',
      timeZone: SP,
      remindAt: null,
      alerts: [],
      createdAt,
    })

    it.each([
      [{ type: 'daily' as const }, '2026-10-22T11:00:00.000Z'],
      [{ type: 'every-n-days' as const, days: 3 }, '2026-10-24T11:00:00.000Z'],
      [{ type: 'weekly' as const }, '2026-10-28T11:00:00.000Z'],
    ])(
      'asks at the morning time after the frequency %j',
      (checkFrequency, expected) => {
        expect(
          iso(computeNextFireAt({ ...base, checkFrequency }, MORNING)),
        ).toBe(expected)
      },
    )

    it('uses the snooze when it comes before the next check', () => {
      const snoozedUntil = new Date('2026-10-21T15:00:00Z')

      expect(
        iso(
          computeNextFireAt(
            { ...base, checkFrequency: { type: 'daily' }, snoozedUntil },
            MORNING,
          ),
        ),
      ).toBe('2026-10-21T15:00:00.000Z')
    })
  })

  describe('snooze options', () => {
    const alarm = {
      kind: 'alarm' as const,
      remindAt: '2026-10-21T20:00:00Z',
      timeZone: SP,
    }
    const names = (list: { option: string }[]) =>
      list.map((entry) => entry.option)

    it('offers only options that fit before the event', () => {
      const options = listSnoozeOptions({
        reminderProps: alarm,
        now: new Date('2026-10-21T19:40:00Z'),
        morningTime: MORNING,
      })

      expect(names(options)).toEqual(['10-minutes'])
    })

    it('offers 10 and 30 minutes after the event', () => {
      const options = listSnoozeOptions({
        reminderProps: alarm,
        now: new Date('2026-10-21T20:05:00Z'),
        morningTime: MORNING,
      })

      expect(names(options)).toEqual(['10-minutes', '30-minutes'])
    })

    it('offers every option for goals, with tomorrow morning in local time', () => {
      const options = listSnoozeOptions({
        reminderProps: { ...alarm, kind: 'goal' },
        now: new Date('2026-10-21T20:05:00Z'),
        morningTime: MORNING,
      })

      expect(names(options)).toEqual([
        '10-minutes',
        '30-minutes',
        '1-hour',
        '2-hours',
        'tomorrow-morning',
      ])
      expect(iso(options[4].at)).toBe('2026-10-22T11:00:00.000Z')
    })
  })
})
