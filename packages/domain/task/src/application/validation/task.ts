import {
  Task,
  TaskContentType,
} from '@ben/domain-task/enterprise/entities/task'
import { DangerErrors, DomainError } from '@ben/domain-base'

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
