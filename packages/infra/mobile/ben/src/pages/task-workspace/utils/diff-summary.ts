import type { Task } from '@/api/models/task'
import type { Language } from '@/core/languages'
import { todoStrings } from '@/pages/task-workspace/strings/todo-strings'

export function diffSummary(task: Task | null, language: Language): string {
  const changes = task?.pendingDiff?.changes
  if (!changes) {
    return ''
  }
  const strings = todoStrings[language]
  if (changes.contentType === 'todo') {
    const count = changes.items.filter(
      (item) => item.diff !== 'unchanged',
    ).length
    return strings.suggestedChanges(count)
  }
  return strings.revisedDraft
}
