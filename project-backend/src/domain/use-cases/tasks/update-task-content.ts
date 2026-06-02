import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
  textContent: string
}

export class UpdateTaskContentUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    this.ensureTaskHoldsTextContent(task)

    const item = await this.applyTextContent(task, payload.textContent)

    return { item }
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
