import type { Localized } from '@/core/languages'
import { useLanguageStore } from '@/layout/stores/language-store'

export function getStrings<Strings>(strings: Localized<Strings>): Strings {
  return strings[useLanguageStore.getState().language]
}
