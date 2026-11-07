import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type DraggableSheetOverlayProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const SLIDE_OFFSET = 600
const ANIMATION_DURATION = 220
const SNAP_BACK_DURATION = 160
const CLOSE_THRESHOLD = 80
const INTERACTION_DELAY = 300

export function DraggableSheetOverlay({
  isOpen,
  onClose,
  children,
}: DraggableSheetOverlayProps) {
  const translateY = useSharedValue(SLIDE_OFFSET)
  const backdropOpacity = useSharedValue(0)
  const [isInteractive, setIsInteractive] = useState(false)

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION })
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION })
    } else {
      translateY.value = SLIDE_OFFSET
      backdropOpacity.value = 0
    }
  }, [isOpen, translateY, backdropOpacity])

  useEffect(() => {
    if (!isOpen) {
      setIsInteractive(false)
      return
    }
    const timer = setTimeout(() => setIsInteractive(true), INTERACTION_DELAY)
    return () => clearTimeout(timer)
  }, [isOpen])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY)
    })
    .onEnd((event) => {
      if (event.translationY > CLOSE_THRESHOLD) {
        runOnJS(onClose)()
      } else {
        translateY.value = withTiming(0, { duration: SNAP_BACK_DURATION })
      }
    })

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          className="flex-1 justify-end"
          pointerEvents={isInteractive ? 'auto' : 'none'}
        >
          <Pressable className="absolute inset-0" onPress={onClose}>
            <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
              <View className="flex-1 bg-inverse-surface/30" />
            </Animated.View>
          </Pressable>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={sheetStyle}>{children}</Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
