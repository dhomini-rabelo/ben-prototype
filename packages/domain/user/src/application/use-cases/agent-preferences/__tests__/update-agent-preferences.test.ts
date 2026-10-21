import { beforeEach, describe, expect, it } from 'vitest'

import { expectError, some } from '@ben/modules-tests'
import { ValidationError } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'

import { InMemoryUserRepository } from '@ben/domain-user/application/__tests__/repositories/user'
import { UserFactory } from '@ben/domain-user/application/__tests__/factories/user'
import { UpdateAgentPreferencesUseCase } from '@ben/domain-user/application/use-cases/agent-preferences/update-agent-preferences'

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
      agentModelSlug: 'openai/gpt-6-luna',
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
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-6-luna')
    expect(storedUser.props.agentEffort).toBe('high')
  })

  it('rejects an effort the model does not support', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'openai/gpt-6-luna',
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
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-6-luna')
    expect(storedUser.props.agentEffort).toBe('high')
  })

  it('stores the GPT-6.1 Sol model with the xhigh effort', async () => {
    const user = await userFactory.create({
      agentModelSlug: null,
      agentEffort: null,
    })

    const response = await sut.execute({
      userId: user.id.toValue(),
      modelSlug: 'openai/gpt-6.1-sol',
      effort: 'xhigh',
    })

    const storedUser = await userRepository.get({ id: user.id })
    expect(response).toEqual({
      item: { modelSlug: 'openai/gpt-6.1-sol', effort: 'xhigh' },
    })
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-6.1-sol')
    expect(storedUser.props.agentEffort).toBe('xhigh')
  })

  it('rejects the none effort for GPT-6.1 Sol', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'openai/gpt-6-luna',
      agentEffort: 'high',
    })

    const error = await expectError(async () => {
      await sut.execute({
        userId: user.id.toValue(),
        modelSlug: 'openai/gpt-6.1-sol',
        effort: 'none',
      })
    }, ValidationError)

    const storedUser = await userRepository.get({ id: user.id })
    expect(error.response.errorField).toBe('effort')
    expect(error.response.code).toBe('UNSUPPORTED_AGENT_EFFORT')
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-6-luna')
    expect(storedUser.props.agentEffort).toBe('high')
  })

  it('rejects the legacy GPT-5.6 Luna model slug', async () => {
    const user = await userFactory.create({
      agentModelSlug: 'openai/gpt-6-luna',
      agentEffort: 'high',
    })

    const error = await expectError(async () => {
      await sut.execute({
        userId: user.id.toValue(),
        modelSlug: 'openai/gpt-5.6-luna',
        effort: 'high',
      })
    }, ValidationError)

    const storedUser = await userRepository.get({ id: user.id })
    expect(error.response.errorField).toBe('modelSlug')
    expect(error.response.code).toBe('UNKNOWN_AGENT_MODEL')
    expect(storedUser.props.agentModelSlug).toBe('openai/gpt-6-luna')
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
