import {
  AgentModelOption,
  AgentModelSelection,
  AGENT_MODELS,
} from '@/domain/utils/agent-models'

export class AgentPreferencesPresenter {
  static toHttp(
    selection: AgentModelSelection,
  ): AgentModelSelection & { models: AgentModelOption[] } {
    return {
      modelSlug: selection.modelSlug,
      effort: selection.effort,
      models: AGENT_MODELS,
    }
  }
}
