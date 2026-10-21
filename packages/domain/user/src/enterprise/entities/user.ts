import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'
import { AgentEffort, AgentModelSlug } from '@ben/adapters'

export const USER_LANGUAGES = ['en', 'pt-BR'] as const

export type UserLanguage = (typeof USER_LANGUAGES)[number]

export interface UserProps {
  name: string
  username: string
  email: string
  avatarUrl: string
  providerId: string
  createdAt: Date
  agentModelSlug: AgentModelSlug | null
  agentEffort: AgentEffort | null
  language: UserLanguage | null
  showUsdCost: boolean
  morningTime: string | null
  dailySummaryEnabled: boolean | null
  dailySummaryTime: string | null
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: ID, props: UserProps) {
    return new User(props, id)
  }
}
