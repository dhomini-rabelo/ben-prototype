import * as Haptics from 'expo-haptics'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { Pressable, View } from 'react-native'
import type { MessageAnchor } from '@/pages/chat/stores/message-trace-store'
import { useMessageTraceStore } from '@/pages/chat/stores/message-trace-store'

type MessageTracePressableProps = {
  messageId: string
  createdAt: string | null
  children: ReactNode
}

export function MessageTracePressable({
  messageId,
  createdAt,
  children,
}: MessageTracePressableProps) {
  const viewRef = useRef<View>(null)

  function openMenu(anchor: MessageAnchor) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    useMessageTraceStore
      .getState()
      .openActions({ messageId, createdAt, anchor })
  }

  function handleLongPress(event?: GestureResponderEvent) {
    const fallback: MessageAnchor = {
      x: event?.nativeEvent.pageX ?? 0,
      y: event?.nativeEvent.pageY ?? 0,
      width: 0,
      height: 0,
    }

    if (!viewRef.current) {
      openMenu(fallback)
      return
    }

    viewRef.current.measureInWindow((x, y, width, height) => {
      const isValid = width > 0 && height > 0 && y >= 0
      openMenu(isValid ? { x, y, width, height } : fallback)
    })
  }

  return (
    <Pressable
      ref={viewRef}
      className="w-full"
      onLongPress={handleLongPress}
      accessibilityHint="Long press to inspect the model call"
      accessibilityActions={[
        { name: 'longpress', label: 'Inspect model call' },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'longpress') handleLongPress()
      }}
    >
      {children}
    </Pressable>
  )
}
