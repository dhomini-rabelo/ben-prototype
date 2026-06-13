# Plan 01 — Scaffold the Expo project shell

**Plan 1 [Frontend] (sync)**: Scaffold the `project-mobile` Expo project foundation.

- Runs **first and alone**. Every other plan depends on the project existing, its config, the path alias, NativeWind, the providers tree, and the expo-router root layout. Nothing else can start until this finishes.

## Goal

Create the new `project-mobile/` Expo (managed workflow) project that mirrors the conventions of `project-web` but targets React Native. Set up the toolchain, the root navigation shell, the providers, env handling, and a bootable empty app. This plan does **not** port any feature — it only establishes the ground every later plan builds on.

## Scope / owned files

- `project-mobile/package.json` — Expo SDK, expo-router, nativewind, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, react-native-svg, lucide-react-native, axios, @tanstack/react-query, zustand, jotai, zod, react-hook-form, @hookform/resolvers, ai + @ai-sdk/react, firebase, @react-native-google-signin/google-signin, expo-av, expo-secure-store, @react-native-async-storage/async-storage, @react-native-community/netinfo, expo-constants, expo-font + @expo-google-fonts/hanken-grotesk + @expo-google-fonts/jetbrains-mono, expo-splash-screen, expo-status-bar, expo-haptics, expo-notifications, babel-plugin-module-resolver. Scripts: `lint:fix`, `lint`, `start`, `ios`, `android`.
- `project-mobile/app.config.ts` — app name, scheme, plugins (expo-router, expo-av mic permission, google-signin, expo-notifications, fonts), iOS `NSMicrophoneUsageDescription`, Android `RECORD_AUDIO`, env exposure via `extra`.
- `project-mobile/tsconfig.json` — extends `expo/tsconfig.base`, `@/*` → `./src/*` paths, strict.
- `project-mobile/babel.config.js` — `babel-preset-expo`, `nativewind/babel`, `react-native-reanimated/plugin` (last), `module-resolver` for `@`.
- `project-mobile/metro.config.js` — NativeWind metro wrapper.
- `project-mobile/nativewind-env.d.ts`, `global.css` placeholder import wiring (tokens themselves are owned by plan 03).
- `project-mobile/eslint.config.js` + `.prettierrc` — ESLint flat config + Prettier (Prettier is new for mobile per analysis).
- `project-mobile/.gitignore`.
- `project-mobile/src/core/env.ts` — typed reader over `expo-constants` `extra` (replaces `import.meta.env.VITE_*`): backend URL, firebase keys, google client ids.
- `project-mobile/src/core/query-client.ts` — the shared `QueryClient` instance (so both `_layout` and the API client import it from one place; avoids a later ownership conflict).
- `project-mobile/src/core/routes.ts` — `ROUTES` map adapted to expo-router paths (`/`, `/chat`, `/tasks/[taskId]`).
- `project-mobile/app/_layout.tsx` — root layout: `GestureHandlerRootView`, `SafeAreaProvider`, `QueryClientProvider` (from `src/core/query-client.ts`), font loading via `expo-font`, `expo-status-bar`, splash screen hide, a `Stack`/`Slot`. Bootable empty placeholder so `tsc` passes and the app runs.

## Verification

`npx tsc --noEmit` passes; project boots to an empty screen. No feature code yet.
