import { TaskRepository } from '@ben/domain-task/application/repositories/task'
import { Task } from '@ben/domain-task/enterprise/entities/task'
import { createID } from '@ben/domain-base'
import { NotEqualQuery } from '@ben/domain-base'
import { ListingResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

export type ListTasksFilter = 'active' | 'finished'

interface Payload {
  userId: string
  status: ListTasksFilter
}

export class ListTasksUseCase implements UseCase<ListingResponse<Task>> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<ListingResponse<Task>> {
    const items = await this.taskRepository.findMany(
      {
        userId: createID(payload.userId),
        status: this.buildStatusQuery(payload.status),
      },
      { orderBy: 'lastActivityAt', order: 'desc' },
    )

    return { items }
  }

  private buildStatusQuery(filter: ListTasksFilter) {
    return filter === 'finished'
      ? 'finished'
      : new NotEqualQuery({ input: 'finished' })
  }
}
