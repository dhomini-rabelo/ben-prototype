import AsyncStorage from '@react-native-async-storage/async-storage'

const FULL_SCREEN_NOTICE_KEY = '@ben/full-screen-notice-seen'

export async function wasFullScreenNoticeSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(FULL_SCREEN_NOTICE_KEY)) === '1'
  } catch {
    return true
  }
}

export async function markFullScreenNoticeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(FULL_SCREEN_NOTICE_KEY, '1')
  } catch {
    // may show again after a restart
  }
}
