import AsyncStorage from '@react-native-async-storage/async-storage'
import { isLanguage, type Language } from '@/core/languages'

export const LANGUAGE_KEY = '@ben/language'

export async function getStoredLanguage(): Promise<Language | null> {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY)
    return isLanguage(raw) ? raw : null
  } catch {
    return null
  }
}

export async function setStoredLanguage(language: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language)
  } catch {
    // preference stays in memory for this session
  }
}
