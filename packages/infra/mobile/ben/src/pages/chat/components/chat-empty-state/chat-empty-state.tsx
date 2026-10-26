import { useSetAtom } from 'jotai'
import { Bell, ChatCircle, NotePencil } from 'phosphor-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import {
  SuggestedAction,
  type SuggestedActionIcon,
} from '@/pages/chat/components/suggested-action'
import { draftAtom } from '@/pages/chat/states/chat-state'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type SuggestedActionId = 'remind' | 'note'

type SuggestedActionData = {
  id: SuggestedActionId
  icon: SuggestedActionIcon
  label: string
  prefill: string
}

export function ChatEmptyState() {
  const strings = useStrings(chatStrings)
  const suggestedActions: SuggestedActionData[] = [
    {
      id: 'remind',
      icon: Bell,
      label: strings.remindLabel,
      prefill: strings.remindPrefill,
    },
    {
      id: 'note',
      icon: NotePencil,
      label: strings.noteLabel,
      prefill: strings.notePrefill,
    },
  ]
  const setDraft = useSetAtom(draftAtom)
  const [hasSelectedAction, setHasSelectedAction] = useState(false)

  function handleSelectAction(action: SuggestedActionData) {
    setDraft(action.prefill)
    setHasSelectedAction(true)
  }

  return (
    <View className="flex-1">
      <View className="flex-1 flex-col items-center justify-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-surface-container-high">
          <ChatCircle size={28} color={onSurfaceVariant} />
        </View>
        <View className="max-w-[280px] flex-col items-center gap-2">
          <Typography variant="tagline" className="text-on-surface text-center">
            {strings.emptyTitle}
          </Typography>
          <Typography
            variant="body-md"
            className="text-on-surface-variant text-center"
          >
            {strings.emptyBody}
          </Typography>
        </View>
      </View>

      {!hasSelectedAction && (
        <View className="mt-8 flex-col gap-2 border-t border-surface-variant pt-4">
          <Typography
            variant="label-caps"
            className="ml-1 mb-1 text-on-surface-variant"
          >
            {strings.suggestedActionsTitle}
          </Typography>
          {suggestedActions.map((action) => (
            <SuggestedAction
              key={action.id}
              icon={action.icon}
              onPress={() => handleSelectAction(action)}
            >
              {action.label}
            </SuggestedAction>
          ))}
        </View>
      )}
    </View>
  )
}
