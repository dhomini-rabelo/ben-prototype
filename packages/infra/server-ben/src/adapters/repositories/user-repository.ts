import { Repository } from '@/modules/domain/repository/repository'

import { User } from '@/domain/entities/user'

export abstract class UserRepository extends Repository<User> {}
