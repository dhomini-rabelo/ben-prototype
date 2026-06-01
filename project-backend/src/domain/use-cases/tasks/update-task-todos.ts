import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task, TodoItem } from '@/domain/entities/task'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { UseCase } from '@/modules/domain/use-case'
import { loadOwnedTask } from './load-owned-task'

interface Payload {
  userId: string
  taskId: string
  todoItems: TodoItem[]
}

export class UpdateTaskTodosUseCase implements UseCase<Task> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    if (task.props.contentType !== 'todo') {
      throw new DomainError({
        code: 'TASK_CONTENT_TYPE_MISMATCH',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }

    return this.taskRepository.update(task.id, {
      todoItems: payload.todoItems,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })
  }
}
