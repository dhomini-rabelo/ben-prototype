import { Repository } from '@ben/domain-base'

import { Reminder } from '@/domain/entities/reminder'

export abstract class ReminderRepository extends Repository<Reminder> {}
