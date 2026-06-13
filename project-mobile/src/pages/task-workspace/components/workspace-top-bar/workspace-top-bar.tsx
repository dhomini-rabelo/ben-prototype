import {
  CheckCircle2,
  ChevronLeft,
  List,
  MoreHorizontal,
  RotateCcw,
  Type,
} from 'lucide-react-native'
import { memo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { ROUTES } from '@/core/routes'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { useWorkspaceTask } from '@/pages/task-workspace/hooks/use-workspace-task'
import { useTaskLifecycleStore } from '@/pages/task-workspace/stores/task-lifecycle-store'
import { onSurface, onSurfaceVariant } from '@/layout/utils/colors'

function WorkspaceTopBarComponent() {
  const task = useWorkspaceTask()
  const finish = useTaskLifecycleStore((store) => store.finish)
  const reopen = useTaskLifecycleStore((store) => store.reopen)
  const isMutating = useTaskLifecycleStore((store) => store.isMutating)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!task) {
    return null
  }

  const TypeIcon = task.contentType === 'todo' ? List : Type
  const isFinished = task.status === 'finished'

  async function handleFinish() {
    setIsMenuOpen(false)
    if (await finish()) {
      router.replace(ROUTES.chat)
    }
  }

  function handleReopen() {
    setIsMenuOpen(false)
    void reopen()
  }

  return (
    <View className="relative h-14 flex-row items-center justify-between gap-2 px-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to chat"
        onPress={() => router.replace(ROUTES.chat)}
        className="size-10 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
      >
        <ChevronLeft size={20} strokeWidth={2} color={onSurfaceVariant} />
      </Pressable>

      <View className="min-w-0 flex-1 flex-row items-center justify-center gap-2">
        <View className="size-6 shrink-0 items-center justify-center rounded-md bg-surface-container-high">
          <TypeIcon size={14} strokeWidth={1.75} color={onSurfaceVariant} />
        </View>
        <Typography
          variant="body-md"
          numberOfLines={1}
          className="shrink font-semibold text-on-surface"
        >
          {task.title}
        </Typography>
        {isFinished && (
          <Text className="shrink-0 rounded-full bg-surface-container-high px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            finished
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More"
        onPress={() => setIsMenuOpen((open) => !open)}
        className="size-10 shrink-0 items-center justify-center rounded-full active:bg-surface-container-low"
      >
        <MoreHorizontal size={20} strokeWidth={2} color={onSurfaceVariant} />
      </Pressable>

      {isMenuOpen && (
        <View className="absolute right-2 top-12 z-10 w-44 flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          {isFinished ? (
            <Pressable
              onPress={handleReopen}
              disabled={isMutating}
              className={cn(
                'flex-row items-center gap-2 rounded-lg px-3 py-2',
                isMutating && 'opacity-60',
              )}
            >
              <RotateCcw size={16} strokeWidth={2} color={onSurface} />
              <Text className="text-body-md text-on-surface">Reopen task</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFinish}
              disabled={isMutating}
              className={cn(
                'flex-row items-center gap-2 rounded-lg px-3 py-2',
                isMutating && 'opacity-60',
              )}
            >
              <CheckCircle2 size={16} strokeWidth={2} color={onSurface} />
              <Text className="text-body-md text-on-surface">Finish task</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

export const WorkspaceTopBar = memo(WorkspaceTopBarComponent)
