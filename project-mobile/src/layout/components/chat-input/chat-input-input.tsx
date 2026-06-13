import { TextInput } from 'react-native'
import { useChatInputContext } from './contexts/chat-input'

const ON_SURFACE_VARIANT_60 = 'rgba(68, 71, 72, 0.6)'

type ChatInputInputProps = {
  placeholder?: string
}

export function ChatInputInput({
  placeholder = 'Message Ben...',
}: ChatInputInputProps) {
  const { draft, onDraftChange, onSend, disabled } = useChatInputContext()

  function handleSubmit() {
    if (!disabled) {
      onSend()
    }
  }

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={ON_SURFACE_VARIANT_60}
      value={draft}
      onChangeText={onDraftChange}
      onSubmitEditing={handleSubmit}
      editable={!disabled}
      returnKeyType="send"
      blurOnSubmit={false}
      className="min-w-0 flex-1 bg-transparent px-2 text-body-md text-on-surface"
    />
  )
}
