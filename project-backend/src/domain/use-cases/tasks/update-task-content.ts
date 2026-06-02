import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
  textContent: string
}

export class UpdateTaskContentUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    this.ensureTaskHoldsTextContent(task)

    return this.applyTextContent(task, payload.textContent)
  }

  private ensureTaskHoldsTextContent(task: Task): void {
    if (task.props.contentType !== 'text') {
      throw new DomainError({
        code: 'TASK_CONTENT_TYPE_MISMATCH',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }
  }

  private async applyTextContent(
    task: Task,
    textContent: string,
  ): Promise<Task> {
    return this.taskRepository.update(task.id, {
      textContent,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })
  }
}
