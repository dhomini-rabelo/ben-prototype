import { createID } from '@ben/domain-base'
import { Factory, some } from '@/modules/tests'

import { Task, TaskProps } from '@/domain/entities/task'
import { TaskRepository } from '@/adapters/repositories/task-repository'

export function createTaskData(data: Partial<TaskProps> = {}): TaskProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    messageId: data.messageId !== undefined ? data.messageId : null,
    title: data.title !== undefined ? data.title : some.text(),
    contentType: data.contentType !== undefined ? data.contentType : 'text',
    textContent:
      data.textContent !== undefined ? data.textContent : some.text(),
    todoItems: data.todoItems !== undefined ? data.todoItems : null,
    pendingDiff: data.pendingDiff !== undefined ? data.pendingDiff : null,
    summary: data.summary !== undefined ? data.summary : some.text(),
    status: data.status !== undefined ? data.status : 'created',
    lastActivityAt:
      data.lastActivityAt !== undefined ? data.lastActivityAt : new Date(),
    finishedAt: data.finishedAt !== undefined ? data.finishedAt : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class TaskFactory implements Factory<Task, TaskProps> {
  constructor(private taskRepository: TaskRepository) {}

  async create(data: Partial<TaskProps> = {}) {
    return this.taskRepository.create(createTaskData(data))
  }

  async createMany(
    commonData: Partial<TaskProps> = {},
    specificData: Partial<TaskProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
