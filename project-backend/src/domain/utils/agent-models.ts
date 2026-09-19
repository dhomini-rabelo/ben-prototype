import { AgentEffort, AgentModelSlug } from '@/domain/entities/user'

export type AgentModelOption = {
  slug: AgentModelSlug
  label: string
  efforts: AgentEffort[]
  defaultEffort: AgentEffort
}

export type AgentModelSelection = {
  modelSlug: AgentModelSlug
  effort: AgentEffort
}

export const AGENT_MODELS: AgentModelOption[] = [
  {
    slug: 'openai/gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
    efforts: ['none', 'low', 'medium', 'high', 'xhigh', 'max'],
    defaultEffort: 'medium',
  },
  {
    slug: 'deepseek/deepseek-v4.1-flash',
    label: 'DeepSeek V4.1 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'high',
  },
  {
    slug: 'z-ai/glm-5.3-flash',
    label: 'GLM 5.3 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'max',
  },
]

export const DEFAULT_AGENT_MODEL: AgentModelOption = AGENT_MODELS[0]
export const DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = DEFAULT_AGENT_MODEL.slug

export function findAgentModel(slug: string): AgentModelOption | null {
  return AGENT_MODELS.find((model) => model.slug === slug) ?? null
}

export function resolveAgentSelection(props: {
  agentModelSlug?: AgentModelSlug | null
  agentEffort?: AgentEffort | null
}): AgentModelSelection {
  const model =
    findAgentModel(props.agentModelSlug ?? DEFAULT_AGENT_MODEL_SLUG) ??
    DEFAULT_AGENT_MODEL
  const effort = props.agentEffort ?? null

  return {
    modelSlug: model.slug,
    effort:
      effort && model.efforts.includes(effort) ? effort : model.defaultEffort,
  }
}
