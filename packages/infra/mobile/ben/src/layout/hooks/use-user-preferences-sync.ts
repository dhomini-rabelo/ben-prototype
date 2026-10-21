import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { requestUpdateUserPreferences } from '@/api/requests/user-preferences'
import { API_ROUTES } from '@/api/routes'
import { useUserPreferencesData } from '@/layout/hooks/api/use-user-preferences-data'
import { useAuthStore } from '@/layout/stores/auth-store'
import { useLanguageStore } from '@/layout/stores/language-store'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'

export function useUserPreferencesSync() {
  const userId = useAuthStore((store) => store.user?.id)
  const queryClient = useQueryClient()
  const { state, actions } = useUserPreferencesData({ enabled: !!userId })
  const hasSentLocalLanguage = useRef(false)
  const refetch = actions.refetch

  useEffect(() => {
    hasSentLocalLanguage.current = false

    if (userId) {
      void refetch()
    }
  }, [userId, refetch])

  useEffect(() => {
    return () => {
      queryClient.removeQueries({
        queryKey: [API_ROUTES.userPreferences.detail],
      })
    }
  }, [queryClient])

  const item = state.data?.item

  useEffect(() => {
    if (!item) {
      return
    }

    useUserPreferencesStore.getState().setShowUsdCost(item.showUsdCost)

    const languageStore = useLanguageStore.getState()

    if (item.language === null) {
      if (!hasSentLocalLanguage.current) {
        hasSentLocalLanguage.current = true
        void requestUpdateUserPreferences({
          language: languageStore.language,
        }).catch(() => {
          hasSentLocalLanguage.current = false
        })
      }
      return
    }

    if (item.language !== languageStore.language) {
      languageStore.setLanguage(item.language)
    }
  }, [item])
}
