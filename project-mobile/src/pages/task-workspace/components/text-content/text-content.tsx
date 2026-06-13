import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { cn } from '@/layout/utils/styles'
import { useWorkspaceTask } from '@/pages/task-workspace/hooks/use-workspace-task'
import { useTaskContentStore } from '@/pages/task-workspace/stores/task-content-store'

const ON_SURFACE_VARIANT_60 = 'rgba(68, 71, 72, 0.6)'

type TextContentProps = {
  readOnly?: boolean
}

export function TextContent({ readOnly }: TextContentProps) {
  const task = useWorkspaceTask()
  const editText = useTaskContentStore((s) => s.editText)

  const content = task?.textContent ?? ''

  // Controlled TextInput seeded from the server content. Re-sync during render
  // (React's "adjust state when a prop changes" pattern) whenever the task or
  // its persisted content changes, instead of remounting via `key` or effects.
  const syncKey = `${task?.id ?? ''}:${content}`
  const [value, setValue] = useState(content)
  const [syncedKey, setSyncedKey] = useState(syncKey)
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey)
    setValue(content)
  }

  if (!task) {
    return null
  }

  const isFinished = task.status === 'finished'

  const diff =
    task.pendingDiff?.changes.contentType === 'text'
      ? task.pendingDiff.changes
      : null

  if (diff) {
    return (
      <View className="flex-1 gap-3 pt-2">
        {diff.before.length > 0 && (
          <Typography
            variant="body-md"
            className="rounded-lg bg-diff-removed/60 px-3 py-2 text-diff-removed-fg line-through"
          >
            {diff.before}
          </Typography>
        )}
        <Typography
          variant="body-md"
          className="rounded-lg bg-diff-added px-3 py-2 text-diff-added-fg border border-diff-added-outline/60"
        >
          {diff.after}
        </Typography>
      </View>
    )
  }

  function handleSave() {
    if (value !== content) {
      void editText(value)
    }
  }

  return (
    <View className={cn('flex-1 pt-2', isFinished && 'opacity-60')}>
      <TextInput
        value={value}
        editable={!readOnly}
        multiline
        textAlignVertical="top"
        placeholder="tell Ben what to put here…"
        placeholderTextColor={ON_SURFACE_VARIANT_60}
        onChangeText={setValue}
        onBlur={handleSave}
        onEndEditing={handleSave}
        className={cn(
          'min-h-60 flex-1 bg-transparent text-body-md text-on-surface',
          isFinished && 'text-on-surface-variant line-through',
        )}
      />
    </View>
  )
}
