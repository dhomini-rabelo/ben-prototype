import AsyncStorage from '@react-native-async-storage/async-storage'

const DAILY_SUMMARY_KEY_PREFIX = '@ben/daily-summary/'

export async function wasDailySummaryShown(date: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DAILY_SUMMARY_KEY_PREFIX + date)) === '1'
  } catch {
    return false
  }
}

export async function markDailySummaryShown(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_SUMMARY_KEY_PREFIX + date, '1')
  } catch {
    // may show again after a restart
  }
}
