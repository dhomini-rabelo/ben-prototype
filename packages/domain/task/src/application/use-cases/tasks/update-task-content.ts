import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { Task } from '@ben/domain-task/enterprise/entities/task'
import { ensureTaskContentType } from '@ben/domain-task/application/validation/task'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  taskId: string
  textContent: string
}

export class UpdateTaskContentUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    ensureTaskContentType(task, 'text')

    const item = await this.applyTextContent(task, payload.textContent)

    return { item }
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
