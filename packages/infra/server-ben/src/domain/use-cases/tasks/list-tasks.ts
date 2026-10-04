import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { createID } from '@/modules/domain/entity/id'
import { NotEqualQuery } from '@/modules/domain/repository/queries'
import { ListingResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

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
