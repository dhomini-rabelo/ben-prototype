import { useState } from 'react'
import { View } from 'react-native'
import { queryClient } from '@/core/query-client'
import type {
  CheckFrequency,
  GoalRecurrence,
  Reminder,
  ReminderAlert,
} from '@/api/models/reminder'
import {
  requestUpdateReminder,
  type UpdateReminderBody,
} from '@/api/requests/reminders'
import { API_ROUTES } from '@/api/routes'
import { Button } from '@/layout/components/ui/button'
import { SegmentedControl } from '@/layout/components/ui/segmented-control'
import { Switch } from '@/layout/components/ui/switch'
import {
  TimeStepper,
  type TimeValue,
} from '@/layout/components/ui/time-stepper'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { menuDetailStrings } from '@/layout/strings/menu-detail-strings'
import { textError } from '@/layout/utils/colors'

type ReminderEditorProps = {
  reminder: Reminder
}

type DayChoice = 'today' | 'tomorrow' | 'current'
type RecurrenceChoice = 'none' | 'daily' | 'weekdays'
type FrequencyChoice = 'daily' | 'every-2' | 'every-3' | 'weekly'
type MinutesChoice = '15' | '30' | '60'

const WEEKDAYS = [1, 2, 3, 4, 5]
const MINUTES_OPTIONS: MinutesChoice[] = ['15', '30', '60']

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayOffset(date: Date): number {
  const diff = startOfDay(date).getTime() - startOfDay(new Date()).getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

// ISO 8601 with the device's UTC offset (not "Z").
function toOffsetISO(date: Date): string {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

function dateAt(base: Date, offsetDays: number, time: TimeValue): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + offsetDays,
    time.hour,
    time.minute,
  )
}

function timeOf(iso: string | null): TimeValue {
  const date = iso ? new Date(iso) : new Date()
  return { hour: date.getHours(), minute: date.getMinutes() }
}

function frequencyToChoice(frequency: CheckFrequency | null): FrequencyChoice {
  if (frequency?.type === 'weekly') return 'weekly'
  if (frequency?.type === 'every-n-days') {
    return frequency.days >= 3 ? 'every-3' : 'every-2'
  }
  return 'daily'
}

function choiceToFrequency(choice: FrequencyChoice): CheckFrequency {
  if (choice === 'weekly') return { type: 'weekly' }
  if (choice === 'every-2') return { type: 'every-n-days', days: 2 }
  if (choice === 'every-3') return { type: 'every-n-days', days: 3 }
  return { type: 'daily' }
}

function buildAlerts(
  atEvent: boolean,
  dayBefore: boolean,
  morning: boolean,
  minutes: number | null,
): ReminderAlert[] {
  const alerts: ReminderAlert[] = []
  if (atEvent) alerts.push({ kind: 'at-event' })
  if (dayBefore) alerts.push({ kind: 'day-before' })
  if (morning) alerts.push({ kind: 'morning-of' })
  if (minutes !== null) alerts.push({ kind: 'minutes-before', minutes })
  return alerts
}

function recurrenceToChoice(
  recurrence: GoalRecurrence | null,
): RecurrenceChoice {
  return recurrence?.type ?? 'none'
}

function choiceToRecurrence(choice: RecurrenceChoice): GoalRecurrence {
  if (choice === 'weekdays') return { type: 'weekdays', weekdays: WEEKDAYS }
  return { type: choice }
}

type ToggleRowProps = {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="button-text" className="text-on-surface">
        {label}
      </Typography>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
      />
    </View>
  )
}

export function ReminderEditor({ reminder }: ReminderEditorProps) {
  const strings = useStrings(menuDetailStrings)
  const alarmText = useStrings(alarmStrings)
  const eventDate = reminder.firesAt ? new Date(reminder.firesAt) : null
  const eventOffset = eventDate ? dayOffset(eventDate) : 0
  const hasCurrentDay = eventDate !== null && ![0, 1].includes(eventOffset)

  const [time, setTime] = useState<TimeValue>(timeOf(reminder.firesAt))
  const [day, setDay] = useState<DayChoice>(
    hasCurrentDay ? 'current' : eventOffset === 1 ? 'tomorrow' : 'today',
  )
  const [atEvent, setAtEvent] = useState(
    reminder.alerts.some((alert) => alert.kind === 'at-event'),
  )
  const [dayBefore, setDayBefore] = useState(
    reminder.alerts.some((alert) => alert.kind === 'day-before'),
  )
  const [morning, setMorning] = useState(
    reminder.alerts.some((alert) => alert.kind === 'morning-of'),
  )
  const initialMinutes = reminder.alerts.find(
    (alert) => alert.kind === 'minutes-before',
  )
  const [minutesBefore, setMinutesBefore] = useState<number | null>(
    initialMinutes?.kind === 'minutes-before' ? initialMinutes.minutes : null,
  )
  const [recurrence, setRecurrence] = useState<RecurrenceChoice>(
    recurrenceToChoice(reminder.recurrence),
  )
  const [frequency, setFrequency] = useState<FrequencyChoice>(
    frequencyToChoice(reminder.checkFrequency),
  )
  const [state, setState] = useState<'idle' | 'saving' | 'failed'>('idle')

  function buildBody(): UpdateReminderBody {
    if (reminder.kind === 'conditional') {
      return { checkFrequency: choiceToFrequency(frequency) }
    }

    const now = new Date()
    if (reminder.kind === 'goal') {
      const today = dateAt(now, 0, time)
      const remindAt =
        today.getTime() > now.getTime() ? today : dateAt(now, 1, time)
      return {
        remindAt: toOffsetISO(remindAt),
        recurrence: choiceToRecurrence(recurrence),
      }
    }

    const base = day === 'current' && eventDate ? eventDate : now
    const offset = day === 'tomorrow' ? 1 : 0
    return {
      remindAt: toOffsetISO(dateAt(base, offset, time)),
      alerts: buildAlerts(atEvent, dayBefore, morning, minutesBefore),
    }
  }

  async function save(body: UpdateReminderBody) {
    setState('saving')
    try {
      await requestUpdateReminder(reminder.id, body)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [API_ROUTES.reminders.detail(reminder.id)],
        }),
        queryClient.invalidateQueries({
          queryKey: [API_ROUTES.reminders.list],
        }),
        queryClient.invalidateQueries({
          queryKey: [API_ROUTES.captures.counts],
        }),
      ])
      setState('idle')
    } catch {
      setState('failed')
    }
  }

  const dayOptions: { value: DayChoice; label: string }[] = [
    { value: 'today', label: strings.dayToday },
    { value: 'tomorrow', label: strings.dayTomorrow },
    ...(hasCurrentDay && eventDate
      ? [
          {
            value: 'current' as const,
            label: `${pad(eventDate.getDate())}/${pad(eventDate.getMonth() + 1)}`,
          },
        ]
      : []),
  ]

  return (
    <View className="gap-4 rounded-xl border border-outline-variant/40 px-3.5 py-4">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.editTitle}
      </Typography>

      {reminder.kind === 'alarm' ? (
        <>
          <View className="gap-2">
            <Typography variant="button-text" className="text-on-surface">
              {strings.eventTime}
            </Typography>
            <TimeStepper value={time} onChange={setTime} />
          </View>
          <View className="gap-2">
            <Typography variant="button-text" className="text-on-surface">
              {strings.day}
            </Typography>
            <SegmentedControl
              value={day}
              options={dayOptions}
              onChange={setDay}
            />
          </View>
          <View className="gap-3">
            <Typography variant="button-text" className="text-on-surface">
              {strings.alertsTitle}
            </Typography>
            <ToggleRow
              label={strings.alertAtEvent}
              value={atEvent}
              onChange={setAtEvent}
            />
            <ToggleRow
              label={strings.alertDayBefore}
              value={dayBefore}
              onChange={setDayBefore}
            />
            <ToggleRow
              label={strings.alertMorning}
              value={morning}
              onChange={setMorning}
            />
            <ToggleRow
              label={strings.alertMinutesBefore}
              value={minutesBefore !== null}
              onChange={(value) => setMinutesBefore(value ? 30 : null)}
            />
            {minutesBefore !== null ? (
              <SegmentedControl<MinutesChoice>
                value={String(minutesBefore) as MinutesChoice}
                options={MINUTES_OPTIONS.map((minutes) => ({
                  value: minutes,
                  label: `${minutes} min`,
                }))}
                onChange={(value) => setMinutesBefore(Number(value))}
              />
            ) : null}
          </View>
        </>
      ) : null}

      {reminder.kind === 'goal' ? (
        <>
          <View className="gap-2">
            <Typography variant="button-text" className="text-on-surface">
              {strings.goalTime}
            </Typography>
            <TimeStepper value={time} onChange={setTime} />
          </View>
          <View className="gap-2">
            <Typography variant="button-text" className="text-on-surface">
              {strings.recurrence}
            </Typography>
            <SegmentedControl<RecurrenceChoice>
              value={recurrence}
              options={[
                { value: 'none', label: strings.recurrenceNone },
                { value: 'daily', label: strings.recurrenceDaily },
                { value: 'weekdays', label: strings.recurrenceWeekdays },
              ]}
              onChange={setRecurrence}
            />
          </View>
          {reminder.messages.length > 0 ? (
            <View className="gap-1">
              <Typography
                variant="label-caps"
                className="text-on-surface-variant"
              >
                {alarmText.goalMessages}
              </Typography>
              {reminder.messages.map((message, index) => (
                <Typography
                  key={index}
                  variant="body-md"
                  className="text-on-surface"
                >
                  {message}
                </Typography>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {reminder.kind === 'conditional' ? (
        <View className="gap-2">
          <Typography variant="button-text" className="text-on-surface">
            {strings.checkFrequency}
          </Typography>
          <SegmentedControl<FrequencyChoice>
            value={frequency}
            options={[
              { value: 'daily', label: alarmText.freqDaily },
              { value: 'every-2', label: alarmText.freqEvery2 },
              { value: 'every-3', label: alarmText.freqEvery3 },
              { value: 'weekly', label: alarmText.freqWeekly },
            ]}
            onChange={setFrequency}
          />
        </View>
      ) : null}

      {state === 'failed' ? (
        <Typography variant="button-text" style={{ color: textError }}>
          {strings.actionFailed}
        </Typography>
      ) : null}

      <Button
        disabled={state === 'saving'}
        onPress={() => save(buildBody())}
        accessibilityRole="button"
      >
        {state === 'saving' ? strings.saving : strings.save}
      </Button>
      <Button
        disabled={state === 'saving'}
        onPress={() => save({ status: 'done' })}
        accessibilityRole="button"
        className="bg-surface-container active:bg-surface-container-high"
      >
        <Typography variant="button-text" className="text-on-surface">
          {strings.complete}
        </Typography>
      </Button>
    </View>
  )
}
