import { useState } from 'react'
import type { Language } from '@/core/languages'
import { requestUpdateUserPreferences } from '@/api/requests/user-preferences'
import { useUserPreferencesData } from '@/layout/hooks/api/use-user-preferences-data'
import { useAPIMutation } from '@/layout/hooks/use-api-mutation'
import { useLanguageStore } from '@/layout/stores/language-store'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'

export function useUserPreferences() {
  const { actions: dataActions } = useUserPreferencesData()
  const { actions: mutationActions } = useAPIMutation({
    mutationFn: requestUpdateUserPreferences,
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [hasLanguageError, setHasLanguageError] = useState(false)
  const [hasUsdCostError, setHasUsdCostError] = useState(false)

  function selectLanguage(language: Language) {
    const languageStore = useLanguageStore.getState()
    const previous = languageStore.language

    if (language === previous) {
      return
    }

    languageStore.setLanguage(language)
    setHasLanguageError(false)
    setPendingCount((count) => count + 1)

    mutationActions
      .mutate({ language })
      .then(() => dataActions.invalidate())
      .catch(() => {
        useLanguageStore.getState().setLanguage(previous)
        setHasLanguageError(true)
      })
      .finally(() => setPendingCount((count) => count - 1))
  }

  function setShowUsdCost(value: boolean) {
    const preferencesStore = useUserPreferencesStore.getState()
    const previous = preferencesStore.showUsdCost

    preferencesStore.setShowUsdCost(value)
    setHasUsdCostError(false)
    setPendingCount((count) => count + 1)

    mutationActions
      .mutate({ showUsdCost: value })
      .then(() => dataActions.invalidate())
      .catch(() => {
        useUserPreferencesStore.getState().setShowUsdCost(previous)
        setHasUsdCostError(true)
      })
      .finally(() => setPendingCount((count) => count - 1))
  }

  return {
    state: {
      isSaving: pendingCount > 0,
      hasLanguageError,
      hasUsdCostError,
    },
    actions: {
      selectLanguage,
      setShowUsdCost,
    },
  }
}
