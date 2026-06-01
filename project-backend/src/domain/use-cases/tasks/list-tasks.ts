import { TaskRepository } from '@/adapters/repositories/task-repository'
import { Task } from '@/domain/entities/task'
import { NotEqualQuery } from '@/modules/domain/repository/queries'
import { UseCase } from '@/modules/domain/use-case'

export type ListTasksFilter = 'active' | 'finished'

interface Payload {
  userId: string
  status: ListTasksFilter
}

export class ListTasksUseCase implements UseCase<Task[]> {
  constructor(private taskRepository: TaskRepository) {}

  async execute(payload: Payload): Promise<Task[]> {
    return this.taskRepository.findMany(
      {
        userId: payload.userId,
        status:
          payload.status === 'finished'
            ? 'finished'
            : new NotEqualQuery({ input: 'finished' }),
      },
      { orderBy: 'lastActivityAt', order: 'desc' },
    )
  }
}
