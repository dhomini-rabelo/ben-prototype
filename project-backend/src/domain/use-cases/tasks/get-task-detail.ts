import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { UseCase } from '@/modules/domain/use-case'
import { loadOwnedTask } from './load-owned-task'

interface Payload {
  userId: string
  taskId: string
}

export class GetTaskDetailUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    return loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)
  }
}
