import { beforeEach, describe, expect, it } from 'vitest'

import { expectError, some } from '@ben/modules-tests'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@ben/domain-user/application/__tests__/repositories/user'
import { UserFactory } from '@ben/domain-user/application/__tests__/factories/user'
import { GetUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/get-user-preferences'
import { UserProps } from '@ben/domain-user/enterprise/entities/user'

describe('GetUserPreferencesUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let sut: GetUserPreferencesUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    sut = new GetUserPreferencesUseCase(userRepository)
  })

  it('returns the stored preferences', async () => {
    const user = await userFactory.create({
      language: 'pt-BR',
      showUsdCost: true,
    })

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({
      item: { language: 'pt-BR', showUsdCost: true },
    })
  })

  it('returns null language and hidden cost for a user without the fields', async () => {
    const user = await userFactory.create()
    const legacyProps: Partial<UserProps> = { ...user.props }
    delete legacyProps.language
    delete legacyProps.showUsdCost
    user.props = legacyProps as UserProps

    const response = await sut.execute({ userId: user.id.toValue() })

    expect(response).toEqual({ item: { language: null, showUsdCost: false } })
  })

  it('rejects an unknown user', async () => {
    await userFactory.create()

    await expectError(async () => {
      await sut.execute({ userId: some.uuid() })
    }, ResourceNotFoundError)
  })
})
