import { create } from 'zustand'
import { DEFAULT_LANGUAGE, type Language } from '@/core/languages'
import {
  getStoredLanguage,
  setStoredLanguage,
} from '@/storage/language-storage'

interface LanguageStore {
  language: Language
  hydrate: () => Promise<void>
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: DEFAULT_LANGUAGE,
  hydrate: async () => {
    const stored = await getStoredLanguage()
    if (stored) {
      set({ language: stored })
    }
  },
  setLanguage: (language) => {
    set({ language })
    void setStoredLanguage(language)
  },
}))
