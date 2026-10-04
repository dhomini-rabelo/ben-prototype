import { Repository } from '@/modules/domain/repository/repository'

import { Task } from '@/domain/entities/task'

export abstract class TaskRepository extends Repository<Task> {}
