import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Modal, Pressable, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type SettingsSheetOverlayProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const SLIDE_OFFSET = 600
const ANIMATION_DURATION = 220

export function SettingsSheetOverlay({
  isOpen,
  onClose,
  children,
}: SettingsSheetOverlayProps) {
  const translateY = useSharedValue(SLIDE_OFFSET)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION })
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION })
    } else {
      translateY.value = SLIDE_OFFSET
      backdropOpacity.value = 0
    }
  }, [isOpen, translateY, backdropOpacity])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose}>
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-inverse-surface/30"
          />
        </Pressable>

        <Animated.View style={sheetStyle} className="w-full">
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}
