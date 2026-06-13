import { Check } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { onPrimary } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import type { TodoItemDiff } from '@/api/models/task'

type TodoListItemProps = {
  title: string
  done?: boolean
  diff?: TodoItemDiff
  finished?: boolean
  onToggle?: () => void
}

function TodoListItemComponent({
  title,
  done,
  diff,
  finished,
  onToggle,
}: TodoListItemProps) {
  const isAdded = diff === 'added'
  const isRemoved = diff === 'removed'
  const isDiff = isAdded || isRemoved
  const isMuted = done || finished

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-lg px-2 py-2.5',
        isAdded && 'bg-diff-added border border-diff-added-outline/60',
        isRemoved && 'bg-diff-removed/60',
      )}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={done ? 'Mark not done' : 'Mark done'}
        accessibilityState={{ checked: !!done, disabled: isDiff }}
        onPress={onToggle}
        disabled={isDiff}
        className={cn(
          'size-5 shrink-0 items-center justify-center rounded-md border',
          done
            ? 'border-on-surface-variant bg-on-surface-variant'
            : 'border-outline-variant bg-surface-container-lowest',
        )}
      >
        {done && <Check size={14} strokeWidth={3} color={onPrimary} />}
      </Pressable>
      <Typography
        variant="body-md"
        className={cn(
          'flex-1',
          isMuted && 'text-on-surface-variant line-through',
          isRemoved && 'text-diff-removed-fg line-through',
          isAdded && 'text-diff-added-fg',
          !done && !isRemoved && !isAdded && 'text-on-surface',
        )}
      >
        {title}
      </Typography>
    </View>
  )
}

export const TodoListItem = memo(TodoListItemComponent)
