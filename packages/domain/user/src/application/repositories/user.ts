import { Repository } from '@ben/domain-base'

import { User } from '@ben/domain-user/enterprise/entities/user'

export abstract class UserRepository extends Repository<User> {}
