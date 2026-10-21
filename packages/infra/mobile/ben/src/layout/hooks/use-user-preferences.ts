import { useRef, useState } from 'react'
import type { Language } from '@/core/languages'
import { requestUpdateUserPreferences } from '@/api/requests/user-preferences'
import { useUserPreferencesData } from '@/layout/hooks/api/use-user-preferences-data'
import { useAPIMutation } from '@/layout/hooks/use-api-mutation'
import { useLanguageStore } from '@/layout/stores/language-store'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'

type UserPreferencesStoreState = ReturnType<
  typeof useUserPreferencesStore.getState
>
type ReminderPreferenceKey =
  'morningTime' | 'dailySummaryEnabled' | 'dailySummaryTime'

const REMINDER_SAVE_DEBOUNCE_MS = 600

type PendingReminderSave = {
  timer: ReturnType<typeof setTimeout>
  previous: unknown
}

export function useUserPreferences() {
  const { actions: dataActions } = useUserPreferencesData()
  const { actions: mutationActions } = useAPIMutation({
    mutationFn: requestUpdateUserPreferences,
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [hasLanguageError, setHasLanguageError] = useState(false)
  const [hasUsdCostError, setHasUsdCostError] = useState(false)
  const [hasReminderError, setHasReminderError] = useState(false)
  const pendingReminderSaves = useRef(
    new Map<ReminderPreferenceKey, PendingReminderSave>(),
  )

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

  function saveReminderPreference<Key extends ReminderPreferenceKey>(
    key: Key,
    value: UserPreferencesStoreState[Key],
  ) {
    const preferencesStore = useUserPreferencesStore.getState()
    const pending = pendingReminderSaves.current.get(key)
    const previous = pending ? pending.previous : preferencesStore[key]

    if (value === preferencesStore[key]) {
      return
    }

    if (pending) {
      clearTimeout(pending.timer)
    } else {
      setPendingCount((count) => count + 1)
    }

    useUserPreferencesStore.setState({ [key]: value })
    setHasReminderError(false)

    const timer = setTimeout(() => {
      pendingReminderSaves.current.delete(key)
      mutationActions
        .mutate({ [key]: value })
        .catch(() => {
          if (pendingReminderSaves.current.has(key)) {
            return
          }
          useUserPreferencesStore.setState({ [key]: previous })
          setHasReminderError(true)
        })
        .finally(() => setPendingCount((count) => count - 1))
    }, REMINDER_SAVE_DEBOUNCE_MS)

    pendingReminderSaves.current.set(key, { timer, previous })
  }

  function setMorningTime(value: string) {
    saveReminderPreference('morningTime', value)
  }

  function setDailySummaryEnabled(value: boolean) {
    saveReminderPreference('dailySummaryEnabled', value)
  }

  function setDailySummaryTime(value: string) {
    saveReminderPreference('dailySummaryTime', value)
  }

  return {
    state: {
      hasReminderError,
      isSaving: pendingCount > 0,
      hasLanguageError,
      hasUsdCostError,
    },
    actions: {
      selectLanguage,
      setShowUsdCost,
      setMorningTime,
      setDailySummaryEnabled,
      setDailySummaryTime,
    },
  }
}
