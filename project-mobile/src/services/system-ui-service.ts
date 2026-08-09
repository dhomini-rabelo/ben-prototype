import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'

// Sole importer of `expo-navigation-bar` (the native Android system-UI SDK).
// Hides the bottom Android navigation bar (back / home / recents) for an
// immersive experience. Edge-to-edge is enabled on Expo SDK 54, so
// `setVisibilityAsync('hidden')` is the only ungated control that still hides
// the bar; the OS then provides swipe-to-reveal immersive behavior by default.
// The behavior / color / position APIs are intentionally not used because they
// are no-ops under edge-to-edge. iOS is a no-op (it has no such bar); web uses
// the no-op `system-ui-service.web.ts` variant, which Metro picks for the web
// bundle.
export async function hideAndroidNavigationBar(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await NavigationBar.setVisibilityAsync('hidden')
}
