import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
}

export class GetTaskDetailUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const item = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    return { item }
  }
}
