import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { PendingDiff, Task } from '@ben/domain-task/enterprise/entities/task'
import { DangerErrors, DomainError } from '@ben/domain-base'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  taskId: string
}

export class ApproveTaskDiffUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    const pendingDiff = this.requirePendingDiff(task)
    const approvedContentProps = this.buildApprovedContentProps(pendingDiff)

    const item = await this.taskRepository.update(task.id, {
      ...approvedContentProps,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })

    return { item }
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
