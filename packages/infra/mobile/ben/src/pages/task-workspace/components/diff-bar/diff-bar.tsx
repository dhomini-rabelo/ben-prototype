import { Check, X } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { useWorkspaceTask } from '@/pages/task-workspace/hooks/use-workspace-task'
import { useTaskDiffStore } from '@/pages/task-workspace/stores/task-diff-store'
import { diffSummary } from '@/pages/task-workspace/utils/diff-summary'
import { onPrimary, onSurface } from '@/layout/utils/colors'

function DiffBarComponent() {
  const task = useWorkspaceTask()
  const isMutating = useTaskDiffStore((store) => store.isMutating)
  const approveDiff = useTaskDiffStore((store) => store.approveDiff)
  const rejectDiff = useTaskDiffStore((store) => store.rejectDiff)

  if (!task?.pendingDiff) {
    return null
  }

  const summary = diffSummary(task)

  return (
    <View className="gap-2 rounded-2xl border border-diff-added-outline/70 bg-diff-added px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <Typography variant="body-md" className="text-diff-added-fg">
        {summary}
      </Typography>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reject"
          onPress={rejectDiff}
          disabled={isMutating}
          className={cn(
            'flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 px-3 py-2',
            isMutating && 'opacity-60',
          )}
        >
          <X size={16} strokeWidth={2} color={onSurface} />
          <Text className="text-button font-semibold text-on-surface">
            Reject
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Approve"
          onPress={approveDiff}
          disabled={isMutating}
          className={cn(
            'flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2',
            isMutating && 'opacity-60',
          )}
        >
          <Check size={16} strokeWidth={2} color={onPrimary} />
          <Text className="text-button font-semibold text-on-primary">
            Approve
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export const DiffBar = memo(DiffBarComponent)
