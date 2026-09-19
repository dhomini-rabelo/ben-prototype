import { FileInput, FileOutput } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Typography } from '@/layout/components/ui/typography'
import { absoluteDateTime } from '@/layout/utils/format-time'
import { MessageActionsMenuItem } from '@/pages/chat/components/message-actions-menu/message-actions-menu-item'
import { useMessageTraceStore } from '@/pages/chat/stores/message-trace-store'

const MENU_WIDTH = 240
const MENU_GAP = 8
const SCREEN_PADDING = 16
const MENU_HEIGHT_ESTIMATE = 140
const ENTER_DURATION = 160
const EXIT_DURATION = 120

export function MessageActionsMenu() {
  const actionsTarget = useMessageTraceStore((store) => store.actionsTarget)
  const closeActions = useMessageTraceStore((store) => store.closeActions)
  const openTrace = useMessageTraceStore((store) => store.openTrace)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [isVisible, setIsVisible] = useState(false)
  const backdropOpacity = useSharedValue(0)
  const cardOpacity = useSharedValue(0)
  const cardScale = useSharedValue(0.92)

  const isOpen = actionsTarget != null

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      backdropOpacity.value = withTiming(1, { duration: ENTER_DURATION })
      cardOpacity.value = withTiming(1, { duration: ENTER_DURATION })
      cardScale.value = withTiming(1, { duration: ENTER_DURATION })
      return
    }

    backdropOpacity.value = withTiming(0, { duration: EXIT_DURATION })
    cardOpacity.value = withTiming(0, { duration: EXIT_DURATION })
    cardScale.value = withTiming(0.92, { duration: EXIT_DURATION })
    const timeout = setTimeout(() => setIsVisible(false), EXIT_DURATION)
    return () => clearTimeout(timeout)
  }, [isOpen, backdropOpacity, cardOpacity, cardScale])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }))

  const anchor = actionsTarget?.anchor
  const left = anchor
    ? Math.min(
        Math.max(anchor.x, SCREEN_PADDING),
        width - MENU_WIDTH - SCREEN_PADDING,
      )
    : SCREEN_PADDING
  const shouldFlip = anchor
    ? anchor.y + anchor.height + MENU_GAP + MENU_HEIGHT_ESTIMATE >
      height - insets.bottom - SCREEN_PADDING
    : false
  const positionStyle = shouldFlip
    ? {
        position: 'absolute' as const,
        left,
        width: MENU_WIDTH,
        bottom: height - (anchor?.y ?? 0) + MENU_GAP,
      }
    : {
        position: 'absolute' as const,
        left,
        width: MENU_WIDTH,
        top: (anchor?.y ?? 0) + (anchor?.height ?? 0) + MENU_GAP,
      }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={closeActions}
    >
      <Pressable className="absolute inset-0" onPress={closeActions}>
        {/*
          NativeWind's className transform does not apply to `Animated.View`
          (a member-expression component from react-native-reanimated) on
          web — verified in the browser: every utility class on this node
          was silently dropped, leaving a fully transparent backdrop/card.
          The animated value is kept on this outer node via `style` only
          (proven to work: opacity/scale/position already applied
          correctly); the actual visual surface lives on a plain nested
          `View`, whose className NativeWind does apply.
        */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <View className="flex-1 bg-inverse-surface/25" />
        </Animated.View>
      </Pressable>

      <Animated.View style={[cardStyle, positionStyle]}>
        <View className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-1 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {actionsTarget?.createdAt != null && (
            <Typography
              variant="label-caps"
              className="px-3 pt-2 pb-1 text-on-surface-variant"
            >
              {absoluteDateTime(actionsTarget.createdAt)}
            </Typography>
          )}
          <MessageActionsMenuItem
            label="Ver input"
            icon={FileInput}
            onPress={() => openTrace('input')}
          />
          <MessageActionsMenuItem
            label="Ver output"
            icon={FileOutput}
            onPress={() => openTrace('output')}
          />
        </View>
      </Animated.View>
    </Modal>
  )
}
