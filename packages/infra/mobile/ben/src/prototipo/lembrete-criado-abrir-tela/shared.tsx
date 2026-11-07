import { CaretLeft, List, Microphone } from 'phosphor-react-native'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import type { ReminderKind, ReminderStatus } from '@/api/models/reminder'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { ItemDetailCapturedMeta } from '@/layout/components/menu-detail/item-detail-captured-meta'
import { ItemDetailRoot } from '@/layout/components/menu-detail/item-detail-root'
import { IconButton } from '@/layout/components/ui/icon-button'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { useLanguageStore } from '@/layout/stores/language-store'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { ink, onSurfaceVariant } from '@/layout/utils/colors'
import { absoluteDateTime, relativeTime } from '@/layout/utils/format-time'
import { ActiveTaskPeek } from '@/pages/chat/components/active-task-peek'
import { ChatTopBar } from '@/pages/chat/components/chat-top-bar/chat-top-bar'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'

export type DemoReminder = {
  id: string
  title: string
  kind: ReminderKind
  status: ReminderStatus
  iso: string | null
  repeat: string | null
  capturedAt: string
}

function at(dayOffset: number, hour: number, minute: number) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

export const REMINDERS: Record<string, DemoReminder> = {
  remedio: {
    id: 'remedio',
    title: 'Tomar o remédio',
    kind: 'goal',
    status: 'active',
    iso: at(1, 8, 0),
    repeat: 'Todo dia',
    capturedAt: minutesAgo(10),
  },
  dentista: {
    id: 'dentista',
    title: 'Ligar pro dentista',
    kind: 'alarm',
    status: 'active',
    iso: at(1, 9, 0),
    repeat: 'Único',
    capturedAt: minutesAgo(40),
  },
  academia: {
    id: 'academia',
    title: 'Academia',
    kind: 'goal',
    status: 'active',
    iso: at(2, 7, 0),
    repeat: 'Dias úteis',
    capturedAt: minutesAgo(180),
  },
  plantas: {
    id: 'plantas',
    title: 'Regar as plantas',
    kind: 'goal',
    status: 'active',
    iso: at(3, 18, 0),
    repeat: 'Seg, Qui',
    capturedAt: minutesAgo(1500),
  },
  encomenda: {
    id: 'encomenda',
    title: 'Ver se a encomenda chegou',
    kind: 'conditional',
    status: 'active',
    iso: null,
    repeat: null,
    capturedAt: minutesAgo(60),
  },
  aluguel: {
    id: 'aluguel',
    title: 'Pagar o aluguel',
    kind: 'alarm',
    status: 'done',
    iso: at(-1, 10, 0),
    repeat: 'Único',
    capturedAt: minutesAgo(3000),
  },
}

export const CHAT_REMINDERS = [
  REMINDERS.remedio,
  REMINDERS.dentista,
  REMINDERS.plantas,
  REMINDERS.encomenda,
]

export const ACTIVE_REMINDERS = [
  REMINDERS.remedio,
  REMINDERS.dentista,
  REMINDERS.academia,
  REMINDERS.plantas,
  REMINDERS.encomenda,
]

export const DONE_REMINDERS = [REMINDERS.aluguel]

export const DETAIL_REMINDER = REMINDERS.remedio

const BEN_REPLIES: Record<string, string> = {
  remedio: 'Pronto, todo dia às 8h eu te aviso.',
  dentista: 'Combinado, amanhã às 9h.',
  plantas: 'Anotado, vou lembrar nesses dias.',
  encomenda: 'Fico de olho e te aviso quando acontecer.',
}

const USER_MESSAGES: Record<string, string> = {
  remedio: 'Me lembra todo dia de manhã de tomar o remédio',
}

export function useProtoLanguage() {
  useEffect(() => {
    useLanguageStore.setState({ language: 'pt-BR' })
  }, [])
}

type ChatScreenProps = {
  renderCard: (reminder: DemoReminder, index: number) => ReactNode
}

function ChatComposer() {
  const input = useStrings(chatInputStrings)

  return (
    <View className="bg-background px-3 pb-3 pt-2">
      <View className="min-h-[44px] flex-row items-center gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 py-[3px] shadow-[0_3px_10px_rgba(29,24,20,0.05)]">
        <View className="size-8 items-center justify-center rounded-full bg-surface-container-low">
          <List size={16} color={ink} />
        </View>
        <Text className="min-w-0 flex-1 px-2 font-sans text-[15px] text-on-surface-variant">
          {input.placeholder}
        </Text>
        <View className="size-8 items-center justify-center rounded-full bg-primary">
          <Microphone size={16} weight="fill" color={ink} />
        </View>
      </View>
    </View>
  )
}

export function ChatScreen({ renderCard }: ChatScreenProps) {
  return (
    <View className="flex-1 bg-background">
      <ChatTopBar />
      <ActiveTaskPeek
        variant="summary"
        className="mx-4 mt-0.5"
        count={3}
        title="Plan the Lisbon trip"
      />
      <View className="flex-1 justify-end overflow-hidden px-4 pt-4">
        {CHAT_REMINDERS.map((reminder, index) => (
          <View key={reminder.id}>
            {USER_MESSAGES[reminder.id] && (
              <MessageBubble from="user" className="mb-2">
                {USER_MESSAGES[reminder.id]}
              </MessageBubble>
            )}
            <View className="mb-3 w-full flex-row items-start gap-2">
              <View className="mt-[3px]">
                <BenLogo variant="avatar" size={28} />
              </View>
              <View className="min-w-0 flex-1 flex-col items-start gap-1.5">
                <MessageBubble from="ben">
                  {BEN_REPLIES[reminder.id]}
                </MessageBubble>
                {renderCard(reminder, index)}
              </View>
            </View>
          </View>
        ))}
      </View>
      <ChatComposer />
    </View>
  )
}

type ListScreenProps = {
  renderRow: (reminder: DemoReminder) => ReactNode
  sheet?: ReactNode
}

export function ListScreen({ renderRow, sheet }: ListScreenProps) {
  const strings = useStrings(menuStrings)

  return (
    <View className="flex-1 bg-surface">
      <View className="h-16 flex-row items-center gap-2 px-3">
        <IconButton label={strings.backToMenu}>
          <CaretLeft size={20} color={onSurfaceVariant} />
        </IconButton>
        <Typography
          variant="body-md"
          className="font-sans-semibold text-on-surface"
        >
          {strings.reminders}
        </Typography>
      </View>
      <View className="px-3">
        <Typography
          variant="label-caps"
          className="px-3 pt-1 text-on-surface-variant"
        >
          {strings.activeRemindersHeading}
        </Typography>
        {ACTIVE_REMINDERS.map((reminder) => renderRow(reminder))}
        <Typography
          variant="label-caps"
          className="mt-3 px-3 text-on-surface-variant"
        >
          {strings.doneRemindersHeading}
        </Typography>
        {DONE_REMINDERS.map((reminder) => renderRow(reminder))}
      </View>
      {sheet && (
        <View className="absolute inset-0 justify-end">
          <View className="absolute inset-0 bg-inverse-surface/30" />
          {sheet}
        </View>
      )}
    </View>
  )
}

type DetailSheetProps = {
  renderMeta: (reminder: DemoReminder) => ReactNode
}

function DetailSheet({ renderMeta }: DetailSheetProps) {
  const language = useLanguage()
  const reminder = DETAIL_REMINDER

  return (
    <ItemDetailRoot kind="reminder">
      <View className="gap-3 px-5 pb-5">
        <Typography variant="headline-lg" className="text-on-surface">
          {reminder.title}
        </Typography>
        {renderMeta(reminder)}
        <ItemDetailCapturedMeta
          absolute={absoluteDateTime(reminder.capturedAt, language)}
          relative={relativeTime(reminder.capturedAt, language)}
        />
      </View>
    </ItemDetailRoot>
  )
}

export function DetailScreen({
  renderRow,
  renderMeta,
}: ListScreenProps & DetailSheetProps) {
  return (
    <ListScreen
      renderRow={renderRow}
      sheet={<DetailSheet renderMeta={renderMeta} />}
    />
  )
}

export type Variation = {
  renderCard: (reminder: DemoReminder, index: number) => ReactNode
  renderRow: (reminder: DemoReminder) => ReactNode
  renderMeta: (reminder: DemoReminder) => ReactNode
}

export function ChatPage({ variation }: { variation: Variation }) {
  useProtoLanguage()
  return <ChatScreen renderCard={variation.renderCard} />
}

export function ListPage({ variation }: { variation: Variation }) {
  useProtoLanguage()
  return <ListScreen renderRow={variation.renderRow} />
}

export function DetailPage({ variation }: { variation: Variation }) {
  useProtoLanguage()
  return (
    <DetailScreen
      renderRow={variation.renderRow}
      renderMeta={variation.renderMeta}
    />
  )
}
