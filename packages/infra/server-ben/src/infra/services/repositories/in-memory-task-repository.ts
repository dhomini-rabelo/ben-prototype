import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Task } from '@/domain/entities/task'
import { TaskRepository } from '@/adapters/repositories/task-repository'

export class InMemoryTaskRepository
  extends InMemoryRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
}
