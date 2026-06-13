import { Bell, MessageCircle, NotebookPen } from 'lucide-react-native'
import { View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { SuggestedAction } from '@/pages/chat/components/suggested-action'

export function ChatEmptyState() {
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

      <View className="-mb-10 mt-8 flex-col gap-2 border-t border-surface-variant pt-4">
        <Typography
          variant="label-caps"
          className="ml-1 mb-1 text-on-surface-variant"
        >
          Suggested Actions
        </Typography>
        <SuggestedAction icon={Bell}>Remind me to...</SuggestedAction>
        <SuggestedAction icon={NotebookPen}>
          Create a note about...
        </SuggestedAction>
      </View>
    </View>
  )
}
