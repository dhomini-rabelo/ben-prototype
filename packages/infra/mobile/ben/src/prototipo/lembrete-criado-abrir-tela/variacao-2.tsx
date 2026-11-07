import { Repeat } from 'phosphor-react-native'
import { View } from 'react-native'
import { MenuListRow } from '@/layout/components/menu-list/menu-list-row'
import { ReminderKindBadge } from '@/layout/components/menu-reminders/reminder-kind-badge'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { firesAtRelative, relativeTime } from '@/layout/utils/format-time'
import { CaptureCard } from '@/pages/chat/components/capture-card'
import {
  CardTimePill,
  DetailMeta,
  KindPill,
  TappableCard,
  useConditionalLabel,
} from './parts'
import type { DemoReminder, Variation } from './shared'

function CardV2({
  reminder,
  index,
}: {
  reminder: DemoReminder
  index: number
}) {
  const conditionalLabel = useConditionalLabel()

  return (
    <TappableCard pressed={index === 1}>
      <CaptureCard.Root
        kind="reminder"
        className={index === 1 ? 'mt-0 bg-surface-container-low' : 'mt-0'}
      >
        <CaptureCard.Icon />
        <CaptureCard.Body>
          <CaptureCard.Title>{reminder.title}</CaptureCard.Title>
          {reminder.iso ? (
            <CardTimePill
              iso={reminder.iso}
              suffix={reminder.repeat ?? undefined}
            />
          ) : (
            <KindPill label={conditionalLabel} />
          )}
        </CaptureCard.Body>
      </CaptureCard.Root>
    </TappableCard>
  )
}

function RowV2({ reminder }: { reminder: DemoReminder }) {
  const strings = useStrings(menuStrings)
  const isDone = reminder.status === 'done'
  const captured = strings.capturedSupporting(
    relativeTime(reminder.capturedAt, 'pt-BR'),
  )
  const status = isDone ? strings.doneSupporting : captured
  const supporting = reminder.repeat ? `${reminder.repeat} · ${status}` : status

  return (
    <MenuListRow
      kind="reminder"
      title={reminder.title}
      badge={<ReminderKindBadge kind={reminder.kind} />}
      trailing={firesAtRelative(reminder.iso, 'pt-BR')}
      emphasizeTrailing={!isDone}
      muted={isDone}
      supporting={supporting}
    />
  )
}

export const VARIATION_2: Variation = {
  renderCard: (reminder, index) => <CardV2 reminder={reminder} index={index} />,
  renderRow: (reminder) => <RowV2 reminder={reminder} />,
  renderMeta: (reminder) => (
    <DetailMeta
      reminder={reminder}
      below={
        reminder.repeat ? (
          <View className="flex-row items-center gap-1.5 pt-0.5">
            <Repeat size={14} color={onSurfaceVariant} />
            <Typography
              variant="body-md"
              className="font-sans-semibold text-on-surface"
            >
              {reminder.repeat}
            </Typography>
          </View>
        ) : null
      }
    />
  ),
}
