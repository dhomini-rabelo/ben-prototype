import type { ExpoConfig } from 'expo/config'
import { CURRENT_APP_VERSION } from './src/core/app-versions.ts'
import { background, primary } from './src/layout/utils/colors.ts'

const config: ExpoConfig = {
  name: 'Ben',
  slug: 'ben',
  owner: 'dhomini07',
  scheme: 'ben',
  version: CURRENT_APP_VERSION,
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.benprototype.app',
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Ben needs your microphone to capture voice notes.',
    },
  },
  android: {
    package: 'com.benprototype.app',
    versionCode: 1,
    permissions: [
      'RECORD_AUDIO',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      backgroundColor: background,
      foregroundImage: './assets/adaptive-icon-foreground.png',
      monochromeImage: './assets/adaptive-icon-monochrome.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
        backgroundColor: background,
      },
    ],
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: primary,
        sounds: ['./assets/sounds/ben_alarm.wav'],
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission:
          'Ben needs your microphone to capture voice notes.',
      },
    ],
    '@react-native-google-signin/google-signin',
    './plugins/with-release-signing',
    'react-native-notify-kit',
    './plugins/with-alarm-activity',
    [
      'expo-font',
      {
        fonts: [
          // resolved from the @expo-google-fonts packages at build time;
          // actual asset wiring lives in _layout font loading (2.10)
        ],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'ba75dfd9-8220-4674-bb35-a7f9c812bb99',
    },
    backendUrl: process.env.BACKEND_URL,
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    devAccessToken: process.env.DEV_ACCESS_TOKEN,
  },
}

export default config
