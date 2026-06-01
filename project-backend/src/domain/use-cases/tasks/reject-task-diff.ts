import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { UseCase } from '@/modules/domain/use-case'
import { loadOwnedTask } from './load-owned-task'

interface Payload {
  userId: string
  taskId: string
}

export class RejectTaskDiffUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    return this.taskRepository.update(task.id, {
      pendingDiff: null,
      lastActivityAt: new Date(),
    })
  }
}
