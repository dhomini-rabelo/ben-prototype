import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task, TodoItem } from '@/domain/entities/task'
import { ensureTaskContentType } from '@/domain/validation/tasks'
import { createID } from '@/modules/domain/entity/id'
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
    const task = await this.taskRepository.get({
      id: createID(payload.taskId),
      userId: createID(payload.userId),
    })

    ensureTaskContentType(task, 'todo')

    const item = await this.applyTodoItems(task, payload.todoItems)

    return { item }
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
