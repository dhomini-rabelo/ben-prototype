import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { ensureTaskContentType } from '@/domain/validation/tasks'
import { createID } from '@/modules/domain/entity/id'
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
