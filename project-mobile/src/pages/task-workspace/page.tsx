import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type LayoutChangeEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useTaskDetailData } from '@/layout/hooks/api/use-task-detail-data'
import { useConnectivity } from '@/layout/hooks/use-connectivity'
import { useVoiceStore } from '@/layout/stores/voice-store'
import { DiffBar } from '@/pages/task-workspace/components/diff-bar/diff-bar'
import { TextContent } from '@/pages/task-workspace/components/text-content/text-content'
import { TodoContent } from '@/pages/task-workspace/components/todo-content/todo-content'
import { WorkspaceDoneOverlay } from '@/pages/task-workspace/components/workspace-done-overlay/workspace-done-overlay'
import { WorkspaceFooter } from '@/pages/task-workspace/components/workspace-footer/workspace-footer'
import { WorkspaceSubThreadBanner } from '@/pages/task-workspace/components/workspace-sub-thread-banner'
import { WorkspaceTopBanner } from '@/pages/task-workspace/components/workspace-top-banner'
import { WorkspaceTopBar } from '@/pages/task-workspace/components/workspace-top-bar/workspace-top-bar'
import { useTaskChatStore } from '@/pages/task-workspace/stores/task-chat-store'
import { useTaskStore } from '@/pages/task-workspace/stores/task-store'

const FOOTER_GAP = 16

export function TaskWorkspace() {
  const router = useRouter()
  const taskId = useTaskStore((store) => store.taskId)
  const setTaskId = useTaskStore((store) => store.setTaskId)
  const { state, actions } = useTaskDetailData(taskId)
  const task = state.data?.item ?? null

  const [footerHeight, setFooterHeight] = useState(0)

  useConnectivity()

  useFocusEffect(
    useCallback(() => {
      useVoiceStore.getState().setTranscriptHandler((text) => {
        void useTaskChatStore.getState().sendText(text)
      })
    }, []),
  )

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])

  useEffect(() => {
    setTaskId(taskId)
    return () => useTaskStore.getState().reset()
  }, [taskId, setTaskId])

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height)
  }

  if (state.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface px-6">
        <Typography variant="body-md" className="text-on-surface-variant">
          loading your workspace…
        </Typography>
      </SafeAreaView>
    )
  }

  if (state.isError || !task) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-surface px-6">
        <Typography variant="body-md" className="text-on-surface-variant">
          couldn&apos;t load this one
        </Typography>
        <View className="flex-row gap-2">
          <Button onPress={() => void actions.refetch()}>Retry</Button>
          <Button
            className="bg-surface-container-high"
            onPress={() => router.replace(ROUTES.chat)}
          >
            Back to chat
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  const isFinished = task.status === 'finished'
  const hasPendingDiff = task.pendingDiff !== null

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-1">
        <View className="absolute inset-x-0 top-0 z-50 bg-surface">
          <WorkspaceTopBar />
          <WorkspaceTopBanner />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 64,
            paddingBottom: footerHeight + FOOTER_GAP,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {task.contentType === 'todo' ? (
            <TodoContent readOnly={isFinished} />
          ) : (
            <TextContent readOnly={isFinished || hasPendingDiff} />
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pb-2 pt-2"
          >
            <WorkspaceSubThreadBanner />
            <DiffBar />
            <WorkspaceFooter
              onStartRecording={() => useVoiceStore.getState().startRecording()}
            />
          </View>
        </KeyboardAvoidingView>

        {isFinished && <WorkspaceDoneOverlay />}
      </View>
    </SafeAreaView>
  )
}
