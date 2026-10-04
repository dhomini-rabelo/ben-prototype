import { Repository } from '@ben/domain-base'

import { User } from '@/domain/entities/user'

export abstract class UserRepository extends Repository<User> {}
