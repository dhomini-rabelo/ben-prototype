import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Task } from '@/domain/entities/task'
import { TaskRepository } from '@/adapters/repositories/task-repository'

export class InMemoryTaskRepository
  extends InMemoryRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
}
