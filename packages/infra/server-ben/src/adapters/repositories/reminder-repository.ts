import { Repository } from '@/modules/domain/repository/repository'

import { Reminder } from '@/domain/entities/reminder'

export abstract class ReminderRepository extends Repository<Reminder> {}
