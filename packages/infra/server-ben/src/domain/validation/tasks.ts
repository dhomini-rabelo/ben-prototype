import { Task, TaskContentType } from '@/domain/entities/task'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'

export function ensureTaskContentType(
  task: Task,
  contentType: TaskContentType,
): void {
  if (task.props.contentType !== contentType) {
    throw new DomainError({
      code: 'TASK_CONTENT_TYPE_MISMATCH',
      errorType: DangerErrors.DATA_INTEGRITY,
    })
  }
}
