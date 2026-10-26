import type { ReactNode } from 'react'
import { useEffect } from 'react'
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { taskPickerStrings } from '@/pages/chat/strings/task-picker-strings'

type TaskPickerSheetProps = {
  isOpen: boolean
  count?: number
  onClose: () => void
  children: ReactNode
}

const CLOSE_THRESHOLD = 80

export function TaskPickerSheet({
  isOpen,
  count,
  onClose,
  children,
}: TaskPickerSheetProps) {
  const strings = useStrings(taskPickerStrings)
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(0)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 220 })
      backdropOpacity.value = withTiming(1, { duration: 220 })
    }
  }, [isOpen, translateY, backdropOpacity])

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
        translateY.value = withTiming(0, { duration: 160 })
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
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0" onPress={onClose}>
            <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
              <View className="flex-1 bg-inverse-surface/30" />
            </Animated.View>
          </Pressable>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={sheetStyle}>
              <View
                style={{ paddingBottom: insets.bottom + 24 }}
                className="w-full rounded-t-3xl bg-surface-container-lowest"
              >
                <View className="items-center justify-center px-5 pt-3 pb-2">
                  <View className="h-1 w-10 rounded-full bg-outline-variant/60" />
                </View>
                <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
                  <Typography
                    variant="label-caps"
                    className="text-on-surface-variant"
                  >
                    {strings.title}
                  </Typography>
                  {count != null && count > 0 && (
                    <Typography
                      variant="label-caps"
                      className="normal-case text-on-surface-variant/70"
                    >
                      {strings.countSummary(count)}
                    </Typography>
                  )}
                </View>

                {children}
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
