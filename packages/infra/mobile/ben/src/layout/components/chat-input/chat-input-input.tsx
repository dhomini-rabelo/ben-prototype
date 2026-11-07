import { useState } from 'react'
import { TextInput } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { useChatInputContext } from './contexts/chat-input'

const TEXT_LINE_HEIGHT = 20
const TEXT_VERTICAL_PADDING = 12
const TEXT_MAX_LINES = 5
const TEXT_MIN_HEIGHT = 32
const TEXT_MAX_HEIGHT =
  TEXT_LINE_HEIGHT * TEXT_MAX_LINES + TEXT_VERTICAL_PADDING

type ChatInputInputProps = {
  placeholder?: string
}

export function ChatInputInput({ placeholder }: ChatInputInputProps) {
  const strings = useStrings(chatInputStrings)
  const { draft, onDraftChange, disabled } = useChatInputContext()
  const [measuredHeight, setMeasuredHeight] = useState(TEXT_MIN_HEIGHT)

  const inputHeight = draft.length === 0 ? TEXT_MIN_HEIGHT : measuredHeight

  return (
    <TextInput
      multiline
      placeholder={placeholder ?? strings.placeholder}
      placeholderTextColor={onSurfaceVariant}
      value={draft}
      onChangeText={onDraftChange}
      onContentSizeChange={(event) =>
        setMeasuredHeight(
          Math.min(
            Math.max(
              event.nativeEvent.contentSize.height + TEXT_VERTICAL_PADDING,
              TEXT_MIN_HEIGHT,
            ),
            TEXT_MAX_HEIGHT,
          ),
        )
      }
      scrollEnabled={inputHeight >= TEXT_MAX_HEIGHT}
      editable={!disabled}
      style={{ lineHeight: TEXT_LINE_HEIGHT, height: inputHeight }}
      className="min-w-0 flex-1 px-2 py-1.5 font-sans text-[15px] text-on-surface"
    />
  )
}
