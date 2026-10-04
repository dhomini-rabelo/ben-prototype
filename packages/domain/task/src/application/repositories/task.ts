import { Repository } from '@ben/domain-base'

import { Task } from '@ben/domain-task/enterprise/entities/task'

export abstract class TaskRepository extends Repository<Task> {}
