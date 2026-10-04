import { useEffect, useState } from 'react'
import type {
  AgentEffort,
  AgentModelOption,
  AgentModelSlug,
} from '@/api/models/agent-preferences'
import { requestUpdateAgentPreferences } from '@/api/requests/agent-preferences'
import { useAgentPreferencesData } from '@/layout/hooks/api/use-agent-preferences-data'
import { useAPIMutation } from '@/layout/hooks/use-api-mutation'

type AgentSelection = {
  modelSlug: AgentModelSlug
  effort: AgentEffort
}

function resolveEffortForModel(
  models: AgentModelOption[],
  modelSlug: AgentModelSlug,
  currentEffort: AgentEffort,
): AgentEffort {
  const model = models.find((item) => item.slug === modelSlug)

  if (!model) {
    return currentEffort
  }

  return model.efforts.includes(currentEffort)
    ? currentEffort
    : model.defaultEffort
}

export function useAgentPreferences() {
  const { state: dataState, actions: dataActions } = useAgentPreferencesData()
  const { actions: mutationActions } = useAPIMutation({
    mutationFn: requestUpdateAgentPreferences,
  })

  const [confirmed, setConfirmed] = useState<AgentSelection | null>(null)
  const [draft, setDraft] = useState<AgentSelection | null>(null)
  const [lastAttempt, setLastAttempt] = useState<AgentSelection | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaveError, setHasSaveError] = useState(false)

  useEffect(() => {
    if (confirmed !== null || !dataState.data) {
      return
    }

    setConfirmed({
      modelSlug: dataState.data.item.modelSlug,
      effort: dataState.data.item.effort,
    })
  }, [confirmed, dataState.data])

  const models = dataState.data?.item.models ?? []
  const selection = draft ?? confirmed
  const status = dataState.isLoading
    ? 'loading'
    : dataState.isError || selection === null
      ? 'error'
      : 'ready'

  function save(pair: AgentSelection) {
    setIsSaving(true)

    mutationActions
      .mutate({ modelSlug: pair.modelSlug, effort: pair.effort })
      .then((updated) => {
        setConfirmed({ modelSlug: updated.modelSlug, effort: updated.effort })
        setDraft(null)
        setHasSaveError(false)
        dataActions.invalidate()
      })
      .catch(() => {
        setDraft(null)
        setHasSaveError(true)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  function selectModel(slug: AgentModelSlug) {
    if (!selection) {
      return
    }

    const pair: AgentSelection = {
      modelSlug: slug,
      effort: resolveEffortForModel(models, slug, selection.effort),
    }

    setDraft(pair)
    setLastAttempt(pair)
    save(pair)
  }

  function selectEffort(effort: AgentEffort) {
    if (!selection) {
      return
    }

    const pair: AgentSelection = { modelSlug: selection.modelSlug, effort }

    setDraft(pair)
    setLastAttempt(pair)
    save(pair)
  }

  function retry() {
    if (hasSaveError && lastAttempt !== null) {
      save(lastAttempt)
      return
    }

    dataActions.refetch()
  }

  return {
    state: {
      status,
      models,
      selection,
      isSaving,
      hasSaveError,
    },
    actions: {
      selectModel,
      selectEffort,
      retry,
    },
  }
}
