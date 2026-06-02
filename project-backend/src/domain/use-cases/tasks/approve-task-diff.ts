import { TaskRepository } from '@/adapters/repositories/task-repository'
import { PendingDiff, Task } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
}

export class ApproveTaskDiffUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    const pendingDiff = this.requirePendingDiff(task)
    const approvedContentProps = this.buildApprovedContentProps(pendingDiff)

    return this.taskRepository.update(task.id, {
      ...approvedContentProps,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })
  }

  private requirePendingDiff(task: Task): PendingDiff {
    const pendingDiff = task.props.pendingDiff

    if (!pendingDiff) {
      throw new DomainError({
        code: 'NO_PENDING_DIFF',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }

    return pendingDiff
  }

  private buildApprovedContentProps(pendingDiff: PendingDiff) {
    const changes = pendingDiff.changes

    if (changes.contentType === 'text') {
      return { textContent: changes.after }
    }

    return {
      todoItems: changes.items
        .filter((item) => item.diff !== 'removed')
        .map(({ id, title, done, order }) => ({
          id,
          title,
          done,
          order,
        })),
    }
  }
}
