import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'
import { loadOwnedTask } from './load-owned-task'

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

    const pendingDiff = task.props.pendingDiff

    if (!pendingDiff) {
      throw new DomainError({
        code: 'NO_PENDING_DIFF',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }

    const changes = pendingDiff.changes

    const newProps =
      changes.contentType === 'text'
        ? { textContent: changes.after }
        : {
            todoItems: changes.items
              .filter((item) => item.diff !== 'removed')
              .map(({ id, title, done, order }) => ({
                id,
                title,
                done,
                order,
              })),
          }

    return this.taskRepository.update(task.id, {
      ...newProps,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })
  }
}
