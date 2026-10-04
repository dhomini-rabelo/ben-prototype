import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { Task } from '@ben/domain-task/enterprise/entities/task'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  taskId: string
}

export class RejectTaskDiffUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    const item = await this.taskRepository.update(task.id, {
      pendingDiff: null,
      lastActivityAt: new Date(),
    })

    return { item }
  }
}
