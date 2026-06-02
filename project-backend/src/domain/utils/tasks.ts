import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ID } from '@/modules/domain/entity/id'

export async function loadOwnedTask(
  taskRepository: TaskRepository,
  taskId: string,
  userId: string,
): Promise<Task> {
  const task = await taskRepository.findUnique({ id: new ID(taskId) })

  if (!task || task.props.userId !== userId) {
    throw new DomainError({
      code: 'TASK_NOT_FOUND',
      errorType: DangerErrors.NOT_FOUND,
    })
  }

  return task
}
