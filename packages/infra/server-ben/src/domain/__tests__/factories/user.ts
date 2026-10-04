import { Factory, some } from '@/modules/tests'

import { User, UserProps } from '@/domain/entities/user'
import { UserRepository } from '@/adapters/repositories/user-repository'

export function createUserData(data: Partial<UserProps> = {}): UserProps {
  return {
    name: data.name !== undefined ? data.name : some.text(),
    username: data.username !== undefined ? data.username : some.text(),
    email: data.email !== undefined ? data.email : some.email(),
    avatarUrl:
      data.avatarUrl !== undefined
        ? data.avatarUrl
        : `https://example.com/${some.uuid()}.png`,
    providerId: data.providerId !== undefined ? data.providerId : some.uuid(),
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
    agentModelSlug:
      data.agentModelSlug !== undefined ? data.agentModelSlug : null,
    agentEffort: data.agentEffort !== undefined ? data.agentEffort : null,
  }
}

export class UserFactory implements Factory<User, UserProps> {
  constructor(private userRepository: UserRepository) {}

  async create(data: Partial<UserProps> = {}) {
    return this.userRepository.create(createUserData(data))
  }

  async createMany(
    commonData: Partial<UserProps> = {},
    specificData: Partial<UserProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
