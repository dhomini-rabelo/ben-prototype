import { memo } from 'react'
import { Mic, Send } from 'lucide-react-native'
import { View } from 'react-native'
import { ChatInput } from '@/layout/components/chat-input'
import { RecordingBar } from '@/layout/components/recording-bar'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { cn } from '@/layout/utils/styles'
import { useWorkspaceInput } from '@/pages/task-workspace/hooks/use-workspace-input'
import { useWorkspaceTask } from '@/pages/task-workspace/hooks/use-workspace-task'

type WorkspaceFooterProps = {
  onStartRecording?: () => void
}

function WorkspaceFooterComponent({ onStartRecording }: WorkspaceFooterProps) {
  const { draft, handleDraftChange, handleSend } = useWorkspaceInput()
  const task = useWorkspaceTask()
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
        placeholder={isFinished ? 'reopen to keep editing' : 'Ask Ben to edit…'}
      />
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label="Send"
            onPress={isFinished ? undefined : handleSend}
            className={cn('ml-2 bg-primary', isFinished && 'opacity-60')}
          >
            <Send size={20} className="text-on-primary" />
          </IconButton>
        ) : (
          <IconButton
            label="Voice input"
            onPress={isFinished || !canRecord ? undefined : onStartRecording}
            className={cn(
              'ml-2 bg-primary',
              (isFinished || !canRecord) && 'opacity-60',
            )}
          >
            <Mic size={20} className="text-on-primary" />
          </IconButton>
        )}
      </View>
    </ChatInput.Root>
  )
}

export const WorkspaceFooter = memo(WorkspaceFooterComponent)
