import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Ben',
  slug: 'ben',
  scheme: 'ben',
  version: '0.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
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
    permissions: ['RECORD_AUDIO'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-notifications',
    [
      'expo-av',
      {
        microphonePermission:
          'Ben needs your microphone to capture voice notes.',
      },
    ],
    '@react-native-google-signin/google-signin',
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
    backendUrl: process.env.BACKEND_URL,
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  },
}

export default config
