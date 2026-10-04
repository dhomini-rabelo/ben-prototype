import { beforeEach, describe, expect, it } from 'vitest'

import { expectError, some } from '@/modules/tests'
import { ValidationError } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@/domain/__tests__/repositories/user'
import { UserFactory } from '@/domain/__tests__/factories/user'
import { UpdateAgentPreferencesUseCase } from '@/domain/use-cases/agent-preferences/update-agent-preferences'

describe('UpdateAgentPreferencesUseCase', () => {
  let userRepository: InMemoryUserRepository
  let userFactory: UserFactory
  let sut: UpdateAgentPreferencesUseCase

  beforeEach(() => {
    userRepository = new InMemoryUserRepository()
    userFactory = new UserFactory(userRepository)
    sut = new UpdateAgentPreferencesUseCase(userRepository)
  })

  it('stores and returns a supported model and effort', async () => {
    const user = await userFactory.create({
      agentModelSlug: null,
      agentEffort: null,
    })

    const response = await sut.execute({
      userId: user.id.toValue(),
      modelSlug: 'deepseek/deepseek-v4.1-flash',
      effort: 'low',
    })

    const storedUser = await userRepository.get({ id: user.id })
    expect(response).toEqual({
      item: { modelSlug: 'deepseek/deepseek-v4.1-flash', effort: 'low' },
    })
    expect(storedUser.props.agentModelSlug).toBe('deepseek/deepseek-v4.1-flash')
    expect(storedUser.props.agentEffort).toBe('low')
  })

  it('rejects an unknown model slug', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'openai/gpt-5.6-luna',
      agentEffort: 'high',
    })

    const error = await expectError(async () => {
      await sut.execute({
        userId: user.id.toValue(),
        modelSlug: 'unknown/model',
        effort: 'low',
      })
    }, ValidationError)

    const storedUser = await userRepository.get({ id: user.id })
    expect(error.response.errorField).toBe('modelSlug')
    expect(error.response.code).toBe('UNKNOWN_AGENT_MODEL')
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-5.6-luna')
    expect(storedUser.props.agentEffort).toBe('high')
  })

  it('rejects an effort the model does not support', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'openai/gpt-5.6-luna',
      agentEffort: 'high',
    })

    const error = await expectError(async () => {
      await sut.execute({
        userId: user.id.toValue(),
        modelSlug: 'deepseek/deepseek-v4.1-flash',
        effort: 'none',
      })
    }, ValidationError)

    const storedUser = await userRepository.get({ id: user.id })
    expect(error.response.errorField).toBe('effort')
    expect(error.response.code).toBe('UNSUPPORTED_AGENT_EFFORT')
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-5.6-luna')
    expect(storedUser.props.agentEffort).toBe('high')
  })

  it('rejects an unknown user', async () => {
    await userFactory.create()

    await expectError(async () => {
      await sut.execute({
        userId: some.uuid(),
        modelSlug: 'unknown/model',
        effort: 'none',
      })
    }, ResourceNotFoundError)
  })
})
