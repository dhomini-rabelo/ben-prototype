import { TextInput } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { useChatInputContext } from './contexts/chat-input'

type ChatInputInputProps = {
  placeholder?: string
}

export function ChatInputInput({ placeholder }: ChatInputInputProps) {
  const strings = useStrings(chatInputStrings)
  const { draft, onDraftChange, onSend, disabled } = useChatInputContext()

  function handleSubmit() {
    if (!disabled) {
      onSend()
    }
  }

  return (
    <TextInput
      placeholder={placeholder ?? strings.placeholder}
      placeholderTextColor={onSurfaceVariant}
      value={draft}
      onChangeText={onDraftChange}
      onSubmitEditing={handleSubmit}
      editable={!disabled}
      returnKeyType="send"
      blurOnSubmit={false}
      className="h-[52px] min-w-0 flex-1 rounded-[26px] border-[1.5px] border-field-border bg-surface-container-lowest px-[18px] font-sans text-[16px] text-on-surface shadow-[0_3px_10px_rgba(29,24,20,0.05)]"
    />
  )
}
