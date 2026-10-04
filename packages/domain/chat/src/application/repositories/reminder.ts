import { Repository } from '@ben/domain-base'

import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'

export abstract class ReminderRepository extends Repository<Reminder> {}
