export type AgentModelSlug =
  | 'openai/gpt-5.6-luna'
  | 'deepseek/deepseek-v4.1-flash'
  | 'z-ai/glm-5.3-flash'

export type AgentEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface AgentModelOption {
  slug: AgentModelSlug
  label: string
  efforts: AgentEffort[]
  defaultEffort: AgentEffort
}

export interface AgentPreferences {
  modelSlug: AgentModelSlug
  effort: AgentEffort
  models: AgentModelOption[]
}
