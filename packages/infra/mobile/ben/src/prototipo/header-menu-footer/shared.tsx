import { useLocalSearchParams } from 'expo-router'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { BrandMark } from '@/layout/components/brand-mark'
import { useLanguageStore } from '@/layout/stores/language-store'
import { useLanguage } from '@/layout/hooks/use-strings'
import { CaptureCard } from '@/pages/chat/components/capture-card'
import { ActiveTaskPeek } from '@/pages/chat/components/active-task-peek'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import { formatShortDate } from '@/pages/chat/utils/format-short-date'

export type ProtoState = 'chat' | 'writing' | 'recording' | 'menu'

export const PROTO_DATE = new Date(2026, 10, 7)

export const MENU_COUNTS = { tasks: 3, notes: 12, reminders: 5 }

const WAVE_DURATION = 450
export const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
]
export const WAVE_STAGGER = 60
export const WAVE_PERIOD = WAVE_DURATION

export function useWaveClock() {
  const clock = useSharedValue(0)
  useEffect(() => {
    clock.value = withRepeat(
      withTiming(1, {
        duration: WAVE_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [clock])
  return clock
}

export function useProtoState(fallback: ProtoState) {
  const params = useLocalSearchParams<{ state?: string; lang?: string }>()
  const initial = (params.state as ProtoState | undefined) ?? fallback
  const [state, setState] = useState<ProtoState>(initial)
  const language = params.lang === 'pt-BR' ? 'pt-BR' : 'en'
  useEffect(() => {
    useLanguageStore.setState({ language })
  }, [language])
  return { state, setState }
}

export function ProtoTopBar() {
  const language = useLanguage()
  return (
    <View className="h-[52px] flex-row items-center justify-center">
      <BrandMark />
      <View className="ml-3 border-l border-outline-variant pl-3">
        <Text className="font-sans-medium text-[13px] text-on-surface-variant">
          {formatShortDate(PROTO_DATE, language)}
        </Text>
      </View>
    </View>
  )
}

function Ben({
  children,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <View className="mb-3 w-full flex-row items-start gap-2">
      <View className="mt-[3px]">
        <BenLogo variant="avatar" size={28} />
      </View>
      <View className="min-w-0 flex-1 flex-col items-start gap-1.5">
        <MessageBubble from="ben">{children}</MessageBubble>
        {footer}
      </View>
    </View>
  )
}

function ProtoMessages() {
  return (
    <>
      <MessageBubble
        from="user"
        createdAt="2026-11-07T09:12:00"
        className="mb-2"
      >
        Note to self: the landlord prefers rent on the 5th
      </MessageBubble>
      <Ben
        footer={
          <CaptureCard.Root kind="note" className="mt-0">
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Title>
                Landlord prefers rent on the 5th
              </CaptureCard.Title>
            </CaptureCard.Body>
          </CaptureCard.Root>
        }
      >
        Saved that as a note.
      </Ben>
      <MessageBubble
        from="user"
        createdAt="2026-11-07T09:14:00"
        className="mb-2"
      >
        Remind me tomorrow at 9am to call the dentist
      </MessageBubble>
      <Ben
        footer={
          <CaptureCard.Root kind="reminder" className="mt-0">
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Title>Call the dentist</CaptureCard.Title>
              <CaptureCard.Meta>Tomorrow, 9:00 AM</CaptureCard.Meta>
            </CaptureCard.Body>
          </CaptureCard.Root>
        }
      >
        Done, I will ping you tomorrow at 9.
      </Ben>
      <MessageBubble
        from="user"
        createdAt="2026-11-07T09:20:00"
        className="mb-2"
      >
        I need to plan the Lisbon trip
      </MessageBubble>
      <Ben
        footer={
          <CaptureCard.Root kind="task" className="mt-0">
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Title>Plan the Lisbon trip</CaptureCard.Title>
              <CaptureCard.Meta>active · just now</CaptureCard.Meta>
            </CaptureCard.Body>
            <CaptureCard.Action />
          </CaptureCard.Root>
        }
      >
        Created a task so we can work on it together.
      </Ben>
    </>
  )
}

type ProtoScreenProps = {
  footer: ReactNode
  sheet: ReactNode
  isSheetOpen: boolean
  onCloseSheet: () => void
  footerHeight?: number
}

export function ProtoScreen({
  footer,
  sheet,
  isSheetOpen,
  onCloseSheet,
  footerHeight = 84,
}: ProtoScreenProps) {
  return (
    <View className="flex-1 bg-background">
      <View className="z-10 bg-background">
        <ProtoTopBar />
        <ActiveTaskPeek
          variant="summary"
          className="mx-4 mt-0.5"
          count={MENU_COUNTS.tasks}
          title="Plan the Lisbon trip"
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: footerHeight + 16 }}
      >
        <ProtoMessages />
      </ScrollView>
      <View className="absolute inset-x-0 bottom-0 z-20 bg-background px-3 pb-3 pt-2">
        {footer}
      </View>
      {isSheetOpen && (
        <View className="absolute inset-0 z-30 justify-end">
          <Pressable
            className="absolute inset-0 bg-inverse-surface/30"
            onPress={onCloseSheet}
          />
          {sheet}
        </View>
      )}
    </View>
  )
}

// Cópia local do WaveBar real: no web o Animated.View não aplica className (largura 0, sem cor),
// então a barra usa estilo explícito para aparecer no print.
export function ProtoWaveBar({
  height,
  phase,
  clock,
  width = 4,
}: {
  height: number
  phase: number
  clock: SharedValue<number>
  width?: number
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const wave = Math.sin(((clock.value + phase) % 1) * Math.PI)
    return { transform: [{ scaleY: 0.4 + 0.6 * wave }] }
  })
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 999, backgroundColor: '#ab7b48' },
        animatedStyle,
      ]}
    />
  )
}
