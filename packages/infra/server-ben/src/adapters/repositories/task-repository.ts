import { Repository } from '@ben/domain-base'

import { Task } from '@/domain/entities/task'

export abstract class TaskRepository extends Repository<Task> {}
