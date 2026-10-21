import {
  AGENT_MODEL_SLUGS,
  AgentEffort,
  AgentModelSelection,
  AgentModelSlug,
} from '@ben/adapters'

export type AgentModelOption = {
  slug: AgentModelSlug
  label: string
  efforts: AgentEffort[]
  defaultEffort: AgentEffort
}

const AGENT_MODEL_DETAILS: Record<
  AgentModelSlug,
  Omit<AgentModelOption, 'slug'>
> = {
  'openai/gpt-6-luna': {
    label: 'GPT-6 Luna',
    efforts: ['none', 'low', 'medium', 'high', 'xhigh', 'max'],
    defaultEffort: 'medium',
  },
  'openai/gpt-6.1-sol': {
    label: 'GPT-6.1 Sol',
    efforts: ['low', 'medium', 'high', 'xhigh', 'max'],
    defaultEffort: 'medium',
  },
  'deepseek/deepseek-v4.1-flash': {
    label: 'DeepSeek V4.1 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'high',
  },
  'z-ai/glm-5.3-flash': {
    label: 'GLM 5.3 Flash',
    efforts: ['low', 'high', 'max'],
    defaultEffort: 'max',
  },
}

export const AGENT_MODELS: AgentModelOption[] = AGENT_MODEL_SLUGS.map(
  (slug) => ({ slug, ...AGENT_MODEL_DETAILS[slug] }),
)

export const DEFAULT_AGENT_MODEL_SLUG: AgentModelSlug = 'openai/gpt-6-luna'
export const DEFAULT_AGENT_MODEL: AgentModelOption = {
  slug: DEFAULT_AGENT_MODEL_SLUG,
  ...AGENT_MODEL_DETAILS[DEFAULT_AGENT_MODEL_SLUG],
}

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
