import { View } from 'react-native'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import { PulseView } from '@/pages/chat/components/pulse-view'

function UserSkeletonBar({ widthClass }: { widthClass: string }) {
  return (
    <View className="w-full items-end">
      <PulseView
        className={`h-9 rounded-2xl rounded-tr-sm bg-outline-variant ${widthClass}`}
      />
    </View>
  )
}

export function ChatHistorySkeleton() {
  return (
    <View className="flex-1 flex-col justify-end gap-3 px-4 pt-2">
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-48" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-56" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-40" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-56" />
      <MessageBubble from="ben" state="skeleton" />
      <UserSkeletonBar widthClass="w-32" />
      <MessageBubble from="ben" state="skeleton" />
    </View>
  )
}
