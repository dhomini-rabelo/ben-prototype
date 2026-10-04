import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  taskId: string
}

export class ReopenTaskUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    const item = await this.taskRepository.update(task.id, {
      status: 'active',
      finishedAt: null,
      lastActivityAt: new Date(),
    })

    return { item }
  }
}
