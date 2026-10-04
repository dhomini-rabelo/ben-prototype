import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export type AgentModelSlug =
  | 'openai/gpt-5.6-luna'
  | 'deepseek/deepseek-v4.1-flash'
  | 'z-ai/glm-5.3-flash'

export type AgentEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface UserProps {
  name: string
  username: string
  email: string
  avatarUrl: string
  providerId: string
  createdAt: Date
  agentModelSlug: AgentModelSlug | null
  agentEffort: AgentEffort | null
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: ID, props: UserProps) {
    return new User(props, id)
  }
}
