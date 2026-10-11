import type { Language, Localized } from '@/core/languages'
import { useLanguageStore } from '@/layout/stores/language-store'

export function useLanguage(): Language {
  return useLanguageStore((store) => store.language)
}

export function useStrings<Strings>(strings: Localized<Strings>): Strings {
  return strings[useLanguage()]
}
