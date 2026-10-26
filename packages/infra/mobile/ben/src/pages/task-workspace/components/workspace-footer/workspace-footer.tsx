import { memo } from 'react'
import { ArrowUp, Microphone } from 'phosphor-react-native'
import { View } from 'react-native'
import { ChatInput } from '@/layout/components/chat-input'
import { RecordingBar } from '@/layout/components/recording-bar'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { onPrimary } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useWorkspaceInput } from '@/pages/task-workspace/hooks/use-workspace-input'
import { useWorkspaceTask } from '@/pages/task-workspace/hooks/use-workspace-task'
import { useStrings } from '@/layout/hooks/use-strings'
import { workspaceStrings } from '@/pages/task-workspace/strings/workspace-strings'

type WorkspaceFooterProps = {
  onStartRecording?: () => void
}

function WorkspaceFooterComponent({ onStartRecording }: WorkspaceFooterProps) {
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput()
  const task = useWorkspaceTask()
  const strings = useStrings(workspaceStrings)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const canRecord = useCanRecord()

  const isFinished = task?.status === 'finished'
  const hasText = draft.trim().length > 0

  if (voiceStatus === 'recording') {
    return <RecordingBar />
  }

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isFinished}
    >
      <ChatInput.AttachButton />
      <ChatInput.Input
        placeholder={
          isFinished
            ? strings.footerPlaceholderFinished
            : strings.footerPlaceholder
        }
      />
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label={strings.send}
            onPress={isFinished ? undefined : handleSend}
            className={cn('ml-2 bg-primary', isFinished && 'opacity-60')}
          >
            <ArrowUp size={20} color={onPrimary} />
          </IconButton>
        ) : (
          <IconButton
            label={strings.voiceInput}
            onPress={isFinished || !canRecord ? undefined : onStartRecording}
            className={cn(
              'ml-2 bg-primary',
              (isFinished || !canRecord) && 'opacity-60',
            )}
          >
            <Microphone size={20} color={onPrimary} />
          </IconButton>
        )}
      </View>
    </ChatInput.Root>
  )
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent)
