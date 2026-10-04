import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { Task, TodoItem } from '@ben/domain-task/enterprise/entities/task'
import { ensureTaskContentType } from '@ben/domain-task/application/validation/task'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

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
