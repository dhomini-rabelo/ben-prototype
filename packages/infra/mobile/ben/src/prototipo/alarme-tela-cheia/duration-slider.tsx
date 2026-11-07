import { useRef, useState } from 'react'
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { PanResponder, View } from 'react-native'

export const SNOOZE_MIN_MINUTES = 5
export const SNOOZE_MAX_MINUTES = 120
export const SNOOZE_STEP_MINUTES = 5

const THUMB_SIZE = 32

type DurationSliderProps = {
  value: number
  label: string
  onChange: (minutes: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function snapToStep(minutes: number) {
  const snapped =
    Math.round(minutes / SNOOZE_STEP_MINUTES) * SNOOZE_STEP_MINUTES
  return clamp(snapped, SNOOZE_MIN_MINUTES, SNOOZE_MAX_MINUTES)
}

export function DurationSlider({
  value,
  label,
  onChange,
}: DurationSliderProps) {
  const trackRef = useRef<View>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const geometry = useRef({ left: 0, width: 0 })
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const travel = Math.max(trackWidth - THUMB_SIZE, 0)
  const ratio =
    (value - SNOOZE_MIN_MINUTES) / (SNOOZE_MAX_MINUTES - SNOOZE_MIN_MINUTES)

  function pickFromPageX(pageX: number) {
    const { left, width } = geometry.current
    const usable = Math.max(width - THUMB_SIZE, 1)
    const position = clamp(pageX - left - THUMB_SIZE / 2, 0, usable)
    const minutes =
      SNOOZE_MIN_MINUTES +
      (position / usable) * (SNOOZE_MAX_MINUTES - SNOOZE_MIN_MINUTES)
    onChangeRef.current(snapToStep(minutes))
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { pageX } = event.nativeEvent
        trackRef.current?.measureInWindow((left, _top, width) => {
          geometry.current = { left, width }
          pickFromPageX(pageX)
        })
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        pickFromPageX(event.nativeEvent.pageX)
      },
    }),
  ).current

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width)
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{
        min: SNOOZE_MIN_MINUTES,
        max: SNOOZE_MAX_MINUTES,
        now: value,
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        const direction = event.nativeEvent.actionName === 'increment' ? 1 : -1
        onChange(snapToStep(value + direction * SNOOZE_STEP_MINUTES))
      }}
      className="h-11 justify-center"
      {...panResponder.panHandlers}
    >
      <View
        ref={trackRef}
        onLayout={handleLayout}
        className="h-2 rounded-full bg-surface-container-high"
      >
        <View
          className="h-2 rounded-full bg-primary"
          style={{ width: THUMB_SIZE / 2 + ratio * travel }}
        />
        <View
          pointerEvents="none"
          className="absolute items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            top: -(THUMB_SIZE - 8) / 2,
            left: ratio * travel,
          }}
        />
      </View>
    </View>
  )
}
