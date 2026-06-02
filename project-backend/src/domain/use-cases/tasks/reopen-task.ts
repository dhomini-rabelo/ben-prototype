import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
}

export class ReopenTaskUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    return this.taskRepository.update(task.id, {
      status: 'active',
      finishedAt: null,
      lastActivityAt: new Date(),
    })
  }
}
