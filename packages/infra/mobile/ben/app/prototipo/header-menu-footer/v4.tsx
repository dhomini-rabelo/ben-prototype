import type { Icon as PhosphorIcon } from 'phosphor-react-native'
import {
  ArrowUp,
  Bell,
  GearSix,
  List,
  ListChecks,
  Microphone,
  NotePencil,
  X,
} from 'phosphor-react-native'
import { useLocalSearchParams } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { recordingStrings } from '@/layout/strings/recording-strings'
import { ink, onSurface, onSurfaceVariant } from '@/layout/utils/colors'
import { chatStrings } from '@/pages/chat/strings/chat-strings'
import {
  MENU_COUNTS,
  ProtoScreen,
  ProtoWaveBar,
  WAVE_PERIOD,
  WAVE_STAGGER,
  WAVEFORM_BARS,
  useProtoState,
  useWaveClock,
} from '@/prototipo/header-menu-footer/shared'

// V4 — V1 com campo menor, ícones menores e campo que cresce com o texto até um teto.
const FIELD_MIN_HEIGHT = 44
const ICON_SIZE = 16
const TEXT_LINE_HEIGHT = 20
const TEXT_MAX_LINES = 5
const FOOTER_CHROME = 20
const TEXT_VERTICAL_PADDING = 12
const TEXT_MIN_HEIGHT = TEXT_LINE_HEIGHT + TEXT_VERTICAL_PADDING
const TEXT_MAX_HEIGHT =
  TEXT_LINE_HEIGHT * TEXT_MAX_LINES + TEXT_VERTICAL_PADDING

const GROWING_DRAFT =
  'Remind me to send the signed lease to the landlord, and also ask whether the parking spot on level two is still free next month.'
const OVERFLOW_DRAFT = `${GROWING_DRAFT} Finally, check if the movers can come on the second Saturday, confirm the elevator booking with the front desk, and ask the neighbours about the shared storage room.`
const ENTRIES: {
  id: 'tasks' | 'notes' | 'reminders' | 'settings'
  icon: PhosphorIcon
}[] = [
  { id: 'tasks', icon: ListChecks },
  { id: 'notes', icon: NotePencil },
  { id: 'reminders', icon: Bell },
  { id: 'settings', icon: GearSix },
]

type TextareaNode = {
  style: { height: string }
  scrollHeight: number
}

export default function PrototypeV4() {
  const { state, setState } = useProtoState('chat')
  const { draft } = useLocalSearchParams<{ draft?: string }>()
  const [footerFieldHeight, setFooterFieldHeight] = useState(FIELD_MIN_HEIGHT)
  const inputRef = useRef<TextInput>(null)
  const [textHeight, setTextHeight] = useState(TEXT_MIN_HEIGHT)
  const fitHeight = (target: unknown) => {
    const node = target as TextareaNode
    const previousHeight = node.style.height
    node.style.height = '0px'
    const contentHeight = node.scrollHeight
    node.style.height = previousHeight
    setTextHeight(
      Math.min(TEXT_MAX_HEIGHT, Math.max(TEXT_MIN_HEIGHT, contentHeight)),
    )
  }
  const draftText = draft === 'overflow' ? OVERFLOW_DRAFT : GROWING_DRAFT
  const input = useStrings(chatInputStrings)
  const chat = useStrings(chatStrings)
  const rec = useStrings(recordingStrings)
  const menu = useStrings(menuStrings)
  const clock = useWaveClock()

  const footer =
    state === 'recording' ? (
      <View className="h-[44px] flex-row items-center gap-2 rounded-full border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 shadow-[0_3px_10px_rgba(29,24,20,0.05)]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rec.cancelRecording}
          onPress={() => setState('chat')}
          className="size-8 items-center justify-center rounded-full bg-surface-container-low"
        >
          <X size={ICON_SIZE} color={onSurface} />
        </Pressable>
        <View className="size-2 rounded-full bg-text-error" />
        <Typography
          variant="label-caps"
          className="font-mono normal-case text-on-surface-variant"
        >
          0:07
        </Typography>
        <View className="h-7 flex-1 flex-row items-center justify-center gap-1">
          {WAVEFORM_BARS.map((height, index) => (
            <ProtoWaveBar
              key={index}
              height={height}
              phase={(index * WAVE_STAGGER) / WAVE_PERIOD}
              clock={clock}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={rec.stopRecording}
          onPress={() => setState('chat')}
          className="size-8 items-center justify-center rounded-full bg-primary"
        >
          <ArrowUp size={ICON_SIZE} color={ink} />
        </Pressable>
      </View>
    ) : (
      <View
        onLayout={(event) =>
          setFooterFieldHeight(event.nativeEvent.layout.height)
        }
        className="min-h-[44px] flex-row items-end gap-1 rounded-[22px] border-[1.5px] border-field-border bg-surface-container-lowest px-1.5 pb-[3px] pt-[3px] shadow-[0_3px_10px_rgba(29,24,20,0.05)]"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={chat.menu}
          onPress={() => setState('menu')}
          className="size-8 items-center justify-center rounded-full bg-surface-container-low active:bg-surface-container-high"
        >
          <List size={ICON_SIZE} color={ink} />
        </Pressable>
        <TextInput
          placeholder={input.placeholder}
          placeholderTextColor={onSurfaceVariant}
          defaultValue={state === 'writing' ? draftText : ''}
          multiline
          ref={inputRef}
          numberOfLines={1}
          onLayout={() => fitHeight(inputRef.current)}
          onChange={(event) => fitHeight(event.nativeEvent.target)}
          style={{ lineHeight: TEXT_LINE_HEIGHT, height: textHeight }}
          className="min-w-0 flex-1 px-2 py-1.5 font-sans text-[15px] text-on-surface"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={state === 'writing' ? chat.send : chat.voiceInput}
          onPress={() => state !== 'writing' && setState('recording')}
          className="size-8 items-center justify-center rounded-full bg-primary"
        >
          {state === 'writing' ? (
            <ArrowUp size={ICON_SIZE} color={ink} />
          ) : (
            <Microphone size={ICON_SIZE} weight="fill" color={ink} />
          )}
        </Pressable>
      </View>
    )

  const sheet = (
    <MenuSheet>
      <View className="px-2 pb-2 pt-1">
        {ENTRIES.map(({ id, icon: Icon }) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            onPress={() => setState('chat')}
            className="flex-row items-center gap-3 rounded-xl px-3 py-3.5 active:bg-surface-container-low"
          >
            <View className="size-9 items-center justify-center rounded-lg bg-surface-container-high">
              <Icon size={16} color={onSurfaceVariant} />
            </View>
            <Typography
              variant="body-md"
              className="flex-1 font-sans-semibold text-on-surface"
            >
              {menu[id]}
            </Typography>
            {id !== 'settings' && (
              <Typography
                variant="label-caps"
                className="normal-case text-on-surface-variant"
              >
                {id === 'tasks'
                  ? menu.activeCount(MENU_COUNTS.tasks)
                  : `${MENU_COUNTS[id]}`}
              </Typography>
            )}
          </Pressable>
        ))}
      </View>
    </MenuSheet>
  )

  return (
    <ProtoScreen
      footer={footer}
      sheet={sheet}
      isSheetOpen={state === 'menu'}
      onCloseSheet={() => setState('chat')}
      footerHeight={footerFieldHeight + FOOTER_CHROME}
    />
  )
}
