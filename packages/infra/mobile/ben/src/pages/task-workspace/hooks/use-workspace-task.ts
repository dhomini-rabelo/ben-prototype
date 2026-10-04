import { useLocalSearchParams } from 'expo-router'
import type { Task } from '@/api/models/task'
import { useTaskDetailData } from '@/layout/hooks/api/use-task-detail-data'

export function useWorkspaceTask(): Task | null {
  const { taskId = '' } = useLocalSearchParams<{ taskId: string }>()
  const { state } = useTaskDetailData(taskId)
  return state.data?.item ?? null
}
