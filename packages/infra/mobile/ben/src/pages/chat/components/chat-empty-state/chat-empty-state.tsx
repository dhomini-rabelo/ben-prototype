import { useSetAtom } from 'jotai'
import { Bell, MessageCircle, NotebookPen } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import {
  SuggestedAction,
  type SuggestedActionIcon,
} from '@/pages/chat/components/suggested-action'
import { draftAtom } from '@/pages/chat/states/chat-state'

type SuggestedActionId = 'remind' | 'note'

type SuggestedActionData = {
  id: SuggestedActionId
  icon: SuggestedActionIcon
  label: string
  prefill: string
}

const SUGGESTED_ACTIONS: SuggestedActionData[] = [
  {
    id: 'remind',
    icon: Bell,
    label: 'Remind me to...',
    prefill: 'Remind me to ',
  },
  {
    id: 'note',
    icon: NotebookPen,
    label: 'Create a note about...',
    prefill: 'Create a note about ',
  },
]

export function ChatEmptyState() {
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
          <MessageCircle
            className="size-7 text-on-surface-variant"
            strokeWidth={1.5}
          />
        </View>
        <View className="max-w-[280px] flex-col items-center gap-2">
          <Typography variant="tagline" className="text-on-surface text-center">
            No recent messages.
          </Typography>
          <Typography
            variant="body-md"
            className="text-on-surface-variant text-center"
          >
            Let&apos;s get started — tap the mic or type to tell Ben anything.
          </Typography>
        </View>
      </View>

      {!hasSelectedAction && (
        <View className="mt-8 flex-col gap-2 border-t border-surface-variant pt-4">
          <Typography
            variant="label-caps"
            className="ml-1 mb-1 text-on-surface-variant"
          >
            Suggested Actions
          </Typography>
          {SUGGESTED_ACTIONS.map((action) => (
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
