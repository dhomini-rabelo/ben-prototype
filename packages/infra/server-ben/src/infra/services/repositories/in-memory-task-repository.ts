import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Task } from '@ben/domain-task/enterprise/entities/task'
import { TaskRepository } from '@ben/domain-task/application/repositories/task'

export class InMemoryTaskRepository
  extends InMemoryRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
}
