import { router } from 'expo-router'
import { Pressable } from 'react-native'
import type { MessageCapture } from '@/api/models/message'
import { ROUTES } from '@/core/routes'
import { useLanguage } from '@/layout/hooks/use-strings'
import { getCaptureReminderLabel } from '@/layout/utils/recurrence-label'
import { CaptureCard } from '@/pages/chat/components/capture-card'
import { useOpenReminderFromChat } from '@/pages/chat/hooks/use-open-reminder-from-chat'
import { isCaptureOpenable } from '@/pages/chat/utils/capture-openable'

type ChatCaptureCardProps = { capture: MessageCapture }

export function ChatCaptureCard({ capture }: ChatCaptureCardProps) {
  const language = useLanguage()
  const openReminderFromChat = useOpenReminderFromChat()
  const label = capture.reminderKind
    ? getCaptureReminderLabel(
        { kind: capture.reminderKind, recurrence: capture.recurrence ?? null },
        language,
      )
    : undefined

  const card = (
    <CaptureCard.Root kind={capture.kind} className="mt-0">
      <CaptureCard.Icon />
      <CaptureCard.Body>
        <CaptureCard.Title>{capture.title}</CaptureCard.Title>
        {capture.meta ? (
          <CaptureCard.Meta label={label}>{capture.meta}</CaptureCard.Meta>
        ) : (
          capture.reminderKind === 'conditional' &&
          label && <CaptureCard.KindPill>{label}</CaptureCard.KindPill>
        )}
      </CaptureCard.Body>
      <CaptureCard.Action
        onAction={() => router.push(ROUTES.taskWorkspace(capture.itemId))}
      />
    </CaptureCard.Root>
  )

  if (!isCaptureOpenable(capture, 'default')) return card

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openReminderFromChat(capture.itemId)}
      className="self-start active:opacity-60"
    >
      {card}
    </Pressable>
  )
}
