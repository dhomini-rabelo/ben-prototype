import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task, TodoItem } from '@/domain/entities/task'
import { loadOwnedTask } from '@/domain/utils/tasks'
import { DangerErrors, DomainError } from '@/modules/domain/domain-errors'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  taskId: string
  todoItems: TodoItem[]
}

export class UpdateTaskTodosUseCase implements UseCase<ItemResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Task>> {
    const task = await loadOwnedTask(
      this.taskRepository,
      payload.taskId,
      payload.userId,
    )

    this.ensureTaskHoldsTodoItems(task)

    const item = await this.applyTodoItems(task, payload.todoItems)

    return { item }
  }

  private ensureTaskHoldsTodoItems(task: Task): void {
    if (task.props.contentType !== 'todo') {
      throw new DomainError({
        code: 'TASK_CONTENT_TYPE_MISMATCH',
        errorType: DangerErrors.DATA_INTEGRITY,
      })
    }
  }

  private async applyTodoItems(
    task: Task,
    todoItems: TodoItem[],
  ): Promise<Task> {
    return this.taskRepository.update(task.id, {
      todoItems,
      pendingDiff: null,
      status: 'active',
      lastActivityAt: new Date(),
    })
  }
}
