export type AgentModelSlug = string

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
