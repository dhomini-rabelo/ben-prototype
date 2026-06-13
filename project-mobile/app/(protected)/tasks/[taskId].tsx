import { Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { TaskWorkspace } from '@/pages/task-workspace/page'
import { useTaskStore } from '@/pages/task-workspace/stores/task-store'

export default function TaskWorkspaceScreen() {
  const { taskId = '' } = useLocalSearchParams<{ taskId: string }>()
  const setTaskId = useTaskStore((store) => store.setTaskId)

  useEffect(() => {
    setTaskId(taskId)
  }, [taskId, setTaskId])

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TaskWorkspace />
    </>
  )
}
