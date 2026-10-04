import type { Task } from '@/api/models/task'

export function diffSummary(task: Task | null): string {
  const changes = task?.pendingDiff?.changes
  if (!changes) {
    return ''
  }
  if (changes.contentType === 'todo') {
    const count = changes.items.filter(
      (item) => item.diff !== 'unchanged',
    ).length
    return `Ben suggested ${count} change${count === 1 ? '' : 's'}`
  }
  return 'Ben revised the draft'
}
