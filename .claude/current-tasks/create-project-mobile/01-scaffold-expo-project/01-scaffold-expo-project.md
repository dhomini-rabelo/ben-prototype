# Deep Plan 01 — Scaffold the Expo `project-mobile` shell

> **DO NOT IMPLEMENT YET.** This is a code-level implementation plan.
> Runs **first and alone**; every later plan depends on the files this plan owns. This plan ports **no feature** — it only stands up the bootable Expo shell, the toolchain, the providers tree, env handling, the shared `QueryClient`, the route map, and the expo-router root layout.

---

## 1. Context

`project-mobile/` does not exist yet (`ls` confirmed). It must be created as a **managed-workflow Expo** project that mirrors `project-web` conventions but targets React Native, per `MOBILE-PORT-ANALYSIS.md` and the simple plan.

Conventions inherited from `project-web` that this plan must preserve:

- **Path alias** `@/*` → `./src/*` (`project-web/tsconfig.app.json` lines 10-13, `vite.config.ts` lines 10-14). On mobile the alias needs **both** `tsconfig` paths (for the type checker) **and** `babel-plugin-module-resolver` (Metro does not read tsconfig paths).
- **Strict TS**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `strict` (extends `expo/tsconfig.base`).
- **Shared `QueryClient`** lives next to the API layer in web (`src/api/client.ts` line 50 exports `queryClient`). The brief mandates moving it to its own module `src/core/query-client.ts` so `_layout.tsx` (this plan) and the future API client (another plan) import it from **one** place — avoiding a cross-plan ownership conflict over `client.ts`.
- **Env**: web reads `import.meta.env.VITE_*` (`client.ts:6`, `firebase.ts:5-7`). Mobile replaces this with a typed reader over `expo-constants` `extra`, populated from `app.config.ts`. Keys needed today: `VITE_BACKEND_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` (`.env.development`), **plus** Google sign-in client ids that mobile introduces (`webClientId`, `iosClientId` — see analysis §2).
- **Routes**: web `ROUTES` map (`src/core/routes.ts`) — `login: "/"`, `chat: "/chat"`, `taskWorkspace(taskId=":taskId") => "/tasks/${taskId}"`. Mobile adapts the param token to expo-router's `[taskId]` form.
- **File naming**: kebab-case (frontend prefs). Top-level wrappers prefer `*-root`. Use path-alias imports, never deep relative.

Reference stack (web `package.json`): React 19.2, `@tanstack/react-query` 5.100, `zustand` 5, `jotai` 2.20, `zod` 4.4, `react-hook-form` 7.76, `@hookform/resolvers` 5.4, `ai` 6, `@ai-sdk/react` 3, `axios` 1.16, `firebase` 12.13, `lucide-react` 1.16 → `lucide-react-native`.

### Decisions resolved (no user prompt — full-auto)

| Topic | Decision | Justification |
|---|---|---|
| Expo SDK | **SDK 54** (RN 0.81, React 19) | Latest stable that ships React 19 to match web's React 19; lets `@ai-sdk/react` 3 reuse the same React. If `create-expo-app` pins a different current SDK at run time, accept it as long as React major is 19. |
| New Architecture | **enabled** (Expo 54 default) | Required by current Reanimated 3.x; no reason to opt out. |
| NativeWind | **v4** | Analysis §"Mapa de libs" explicitly says NativeWind v4. |
| Tokens / `@theme` | **NOT in this plan** | Brief: tokens owned by plan 03. This plan only wires `global.css` placeholder + `nativewind-env.d.ts` + `tailwind.config.js` content globs (empty token body, owned-handoff comment). |
| Prettier | **added** (new for mobile) | Analysis §71 table + simple plan step 1. Web has no Prettier. |
| `queryClient` location | `src/core/query-client.ts` | Brief explicit, prevents cross-plan conflict. |
| Env reader | `src/core/env.ts` over `expo-constants` | Brief + analysis §49. |
| Reminder notifications | dependency declared only (`expo-notifications`); **no `services/` code here** | `notifications-service.ts` is owned by a later plan (analysis §128-132). This plan only adds the dependency + plugin so later plans can build on it. |
| Root layout body | bootable **empty placeholder** screen | Brief §line 24: "Bootable empty placeholder so `tsc` passes and the app runs." No feature code. |
| Lint command | `lint` / `lint:fix` via `eslint .` | Match web scripts; satisfies repo CLAUDE.md `npm run lint:fix`. (We will NOT run lint:fix in verification per task instruction.) |

---

## 2. Files to Create (all under `project-mobile/`, all owned by this plan)

> Scaffold step note: generate with `npx create-expo-app@latest project-mobile --template blank-typescript`, then **overwrite/add** the files below. Delete the template's `App.tsx` and any template `index.ts`/`app/` sample so only the files listed here remain. (The agent that implements this will run the generator, not the planner.)

### 2.1 `package.json`

```jsonc
{
  "name": "project-mobile",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "expo-router": "~6.0.0",
    "expo-constants": "~18.0.0",
    "expo-font": "~14.0.0",
    "expo-splash-screen": "~31.0.0",
    "expo-status-bar": "~3.0.0",
    "expo-haptics": "~15.0.0",
    "expo-notifications": "~0.32.0",
    "expo-av": "~16.0.0",
    "expo-secure-store": "~15.0.0",
    "expo-crypto": "~15.0.0",

    "react": "19.1.0",
    "react-native": "0.81.0",

    "react-native-reanimated": "~4.1.0",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",

    "nativewind": "^4.2.1",
    "tailwindcss": "^3.4.17",
    "tailwind-merge": "^3.6.0",

    "lucide-react-native": "^0.544.0",

    "axios": "^1.16.1",
    "@tanstack/react-query": "^5.100.14",
    "zustand": "^5.0.14",
    "jotai": "^2.20.0",
    "zod": "^4.4.3",
    "react-hook-form": "^7.76.1",
    "@hookform/resolvers": "^5.4.0",
    "ai": "^6.0.193",
    "@ai-sdk/react": "^3.0.195",

    "firebase": "^12.13.0",
    "@react-native-google-signin/google-signin": "^16.0.0",

    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/netinfo": "11.4.1",

    "@expo-google-fonts/hanken-grotesk": "^0.4.2",
    "@expo-google-fonts/jetbrains-mono": "^0.4.2"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2",
    "babel-plugin-module-resolver": "^5.0.2",

    "eslint": "^9.0.0",
    "eslint-config-expo": "~10.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "prettier": "^3.3.0"
  }
}
```

> **Version caveat (NO GUESSING guard):** exact patch ranges above are the canonical SDK-54 pins. The implementer must run `npx expo install` for every Expo/RN-native package (`expo-*`, `react-native-*`, `@react-native-*`, `react`, `react-native`) so Expo resolves the SDK-correct versions, instead of hand-pinning. Pure JS libs (`axios`, `zustand`, `jotai`, `zod`, `react-hook-form`, `@hookform/resolvers`, `ai`, `@ai-sdk/react`, `firebase`, `tailwind-merge`, `lucide-react-native`) are pinned to **match web** where shared. `typescript`/`@types/react` follow the Expo template (not web's TS 6 / RN toolchain not ready for it).
> **Stage 5 cross-plan dependency note:** `expo-crypto` was added because plan 10 (`message-builders.ts`) and plan 20 (`task-todos-store.ts`) replace web's `crypto.randomUUID()` with `randomUUID()` from `expo-crypto`. `tailwind-merge` is required by plan 03's `cn`. Install both via `npx expo install expo-crypto` and `npm install tailwind-merge`.

> **Reason `lint`/`lint:fix` mirror web** (`eslint .` / `eslint . --fix`) so the repo CLAUDE.md `npm run lint:fix` rule works unchanged.

### 2.2 `app.config.ts`

Typed config (`ExpoConfig`) that reads process env (loaded from `.env`) and **exposes it via `extra`** so `expo-constants` can read it at runtime. Declares scheme, plugins, and native permissions.

```ts
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
      { microphonePermission: 'Ben needs your microphone to capture voice notes.' },
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
```

> Env var names drop the web `VITE_` prefix (Vite-only convention). `BACKEND_URL`, `FIREBASE_*` map 1:1 to web's `.env.development`. `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_IOS_CLIENT_ID` are **new** for mobile (analysis §2: configured in Google Cloud Console, consumed by a later auth plan). The `expo-font` plugin `fonts` array is left as a documented placeholder; the bootable shell loads fonts via the runtime `useFonts` hook (2.10) which is sufficient for SDK 54 and keeps font asset choice in code, not config.

### 2.3 `.env.example`

```bash
BACKEND_URL=http://localhost:3333
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
```

> Mirrors web `.env.development` keys (sans `VITE_`) plus the two Google ids. Real `.env` is gitignored (2.9). Committing `.env.example` keeps the contract discoverable without leaking secrets.

### 2.4 `tsconfig.json`

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

> Mirrors web strict flags (`tsconfig.app.json` lines 24-27) and the `@/*` alias (lines 10-13). `expo/tsconfig.base` already supplies `strict`, `jsx: react-jsx`, `moduleResolution`, `target`, RN libs — so we only add the project-specific extras. Includes `.expo/types` (expo-router typed routes) and the two generated `.d.ts` files.

### 2.5 `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          alias: { '@': './src' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
```

> **Ordering is load-bearing:** `react-native-reanimated/plugin` MUST be **last** in `plugins` (brief §line 16, Reanimated requirement). `module-resolver` resolves `@` for Metro (tsconfig paths alone don't work in RN). `nativewind/babel` + `jsxImportSource: 'nativewind'` enables `className` on RN components (NativeWind v4).

### 2.6 `metro.config.js`

```js
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withNativeWind(config, { input: './src/core/global.css' })
```

> NativeWind metro wrapper (brief §line 17). `input` points at the global stylesheet entry (2.8). The CSS **content** (tokens) is owned by plan 03; this plan only wires the path.

### 2.7 `nativewind-env.d.ts`

```ts
/// <reference types="nativewind/types" />
```

> Makes `className` valid on RN core components for the type checker (brief §line 18).

### 2.8 `src/core/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Design tokens (@theme / :root custom properties) are owned by plan 03. */
```

> Placeholder entry only (brief §line 18: "tokens themselves are owned by plan 03"). NativeWind v4 uses Tailwind 3 directives, not web's v4 `@import "tailwindcss"`. Living in `src/core/` keeps it beside the other core wiring and matches the metro `input` path (2.6).

### 2.9 `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    // Token theme (colors, fontFamily) is owned by plan 03.
    extend: {},
  },
  plugins: [],
}
```

> NativeWind v4 requires a Tailwind config with `nativewind/preset` and `content` globs covering `app/` + `src/`. Analysis §67 notes web's `@theme` tokens must migrate here — that migration is **plan 03's** job; this plan ships the empty-theme skeleton so the toolchain compiles.

### 2.10 `app/_layout.tsx` (root layout — bootable shell)

```tsx
import { useEffect } from 'react'
import { Slot, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  useFonts as useHankenGrotesk,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import { queryClient } from '@/core/query-client'
import '@/core/global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useHankenGrotesk({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

> Mirrors web `main.tsx` provider order (`QueryClientProvider` wrapping the router) and adds RN-only roots (`GestureHandlerRootView` outermost — RNGH requirement; `SafeAreaProvider`). Imports `queryClient` from `@/core/query-client` (2.12), not from the api client — the deliberate split. `import '@/core/global.css'` activates NativeWind. Font families match web's `--font-sans` (Hanken Grotesk) + `--font-mono` (JetBrains Mono) from `global.css:4-5`. `<Slot />` renders the index placeholder (2.11). Returning `null` until fonts load keeps the splash up.
>
> Provider order rationale: `GestureHandlerRootView` must wrap everything (RNGH). `SafeAreaProvider` next. `QueryClientProvider` inside (matches web). `StatusBar` is a sibling render, not a provider.

### 2.11 `app/index.tsx` (empty bootable placeholder)

```tsx
import { View, Text } from 'react-native'

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Ben</Text>
    </View>
  )
}
```

> The "boots to a blank screen, no feature code" placeholder (brief §line 24, simple plan step 5). Uses `className` to prove NativeWind compiles end-to-end. Later plans replace/route past this (the login screen at `/` is owned by a later plan).

### 2.12 `src/core/query-client.ts`

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

> The single shared `QueryClient` instance (brief §line 22). Web declares it inside `api/client.ts:50`; on mobile it is hoisted here so `_layout.tsx` (this plan) and the future `api/client.ts` (another plan) both import the **same** instance without either plan owning the other's file.

### 2.13 `src/core/env.ts`

```ts
import Constants from 'expo-constants'

interface Env {
  backendUrl: string
  firebaseApiKey: string
  firebaseAuthDomain: string
  firebaseProjectId: string
  googleWebClientId: string
  googleIosClientId: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Env>

function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required env value: ${key}`)
  }
  return value
}

export const env: Env = {
  backendUrl: required(extra.backendUrl, 'backendUrl'),
  firebaseApiKey: required(extra.firebaseApiKey, 'firebaseApiKey'),
  firebaseAuthDomain: required(extra.firebaseAuthDomain, 'firebaseAuthDomain'),
  firebaseProjectId: required(extra.firebaseProjectId, 'firebaseProjectId'),
  googleWebClientId: required(extra.googleWebClientId, 'googleWebClientId'),
  googleIosClientId: required(extra.googleIosClientId, 'googleIosClientId'),
}
```

> Typed replacement for `import.meta.env.VITE_*` (analysis §49, brief §line 21). Reads `Constants.expoConfig.extra` populated by `app.config.ts` (2.2). Future consumers: api client (`env.backendUrl` ← web `client.ts:6`), firebase (`env.firebaseApiKey/...` ← web `firebase.ts:5-7`), google sign-in (`env.googleWebClientId/IosClientId`). Fails fast with a named error if a value is missing.
>
> **Contract note for downstream plans:** this is the ONLY module that imports `expo-constants` for env. Other plans must import `{ env }` from `@/core/env`, never read `Constants` directly.

### 2.14 `src/core/routes.ts`

```ts
export const ROUTES = {
  login: '/',
  chat: '/chat',
  taskWorkspace: (taskId = '[taskId]') => `/tasks/${taskId}`,
} as const
```

> Mirrors web `src/core/routes.ts` exactly, with the **one** mobile adaptation: the default param token changes from react-router's `:taskId` to expo-router's `[taskId]` (analysis §69, brief §line 23). Keeps the established `routes.ts` builder pattern (frontend prefs: "Declare routes via the `routes.ts` pattern; no ad-hoc path builders"). Concrete navigation calls pass a real id: `ROUTES.taskWorkspace('abc')` → `/tasks/abc`. The corresponding file route `app/tasks/[taskId].tsx` is owned by a later plan.

### 2.15 `eslint.config.js`

```js
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended')

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
])
```

> Flat config (matches web's flat-config style, `eslint.config.js` line 8 `defineConfig([...])`). Uses `eslint-config-expo/flat` (the RN/Expo recommended set — replaces web's manual react-hooks/react-refresh stack which is web-specific) plus `eslint-plugin-prettier/recommended` so Prettier runs as a lint rule (Prettier is new for mobile per analysis §84). `lint:fix` (= `eslint . --fix`) then also auto-formats, keeping the single `npm run lint:fix` workflow from the repo CLAUDE.md.

### 2.16 `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
```

> New for mobile (analysis §84). Style chosen to match what's already in the web source: no semicolons + single quotes are visible in `vite.config.ts` / `eslint.config.js` / `firebase.ts`. (Note: some web files like `routes.ts` use semicolons + double quotes — web has no enforced formatter, so mobile sets one explicitly; the no-semi/single-quote variant matches the config files, which are the closest analog to mobile's config-heavy scaffold.)

### 2.17 `.gitignore`

```gitignore
node_modules/
.expo/
dist/
web-build/

*.log
npm-debug.*
yarn-error.*

.env
.env.*.local
*.local

ios/
android/

.DS_Store
*.orig.*
.idea/
.vscode/*
!.vscode/extensions.json

expo-env.d.ts
```

> Standard Expo ignore set + carries over web's editor/log ignores (`project-web/.gitignore`). Ignores `.env` (real secrets — `.env.example` is committed instead, 2.3) and the native `ios/`/`android/` dirs (managed workflow regenerates them). `expo-env.d.ts` is generated.

### 2.18 `app.json` — NOT created

> Config lives entirely in `app.config.ts` (2.2). A static `app.json` is intentionally omitted to keep a single source of truth and allow `process.env` access. (If `create-expo-app` emits a template `app.json`, the implementer must delete it.)

---

## 3. Existing Code Reused / Mirrored (not copied — referenced)

| New mobile file | Web source mirrored | What carries over |
|---|---|---|
| `app/_layout.tsx` | `src/core/main.tsx` | `QueryClientProvider` wrapping the router; `StrictMode` analog dropped (RN provides it via Fast Refresh, expo-router has no `StrictMode` wrap point) |
| `src/core/query-client.ts` | `src/api/client.ts:50` | `new QueryClient()` instance, hoisted out for cross-plan sharing |
| `src/core/env.ts` | `src/api/client.ts:6`, `src/core/firebase.ts:5-7`, `.env.development` | the 4 web env keys + 2 new google ids |
| `src/core/routes.ts` | `src/core/routes.ts` | the full `ROUTES` map; only the param token changes (`:taskId` → `[taskId]`) |
| `tsconfig.json` | `tsconfig.app.json:10-13,24-27` | `@/*` alias + strict lint flags |
| `babel.config.js` module-resolver | `vite.config.ts:10-14` | the `@` → `src` alias |
| `.prettierrc` style | web config files' no-semi/single-quote style | formatting baseline |

No file from `project-web` is imported or moved. Nothing from a parallel plan is touched: this plan owns only the files in §2, and exposes three stable contracts (`@/core/query-client`, `@/core/env`, `@/core/routes`) for later plans to import.

---

## 4. Contracts exposed to later plans

| Import | Provides | Consumed by (later plans) |
|---|---|---|
| `import { queryClient } from '@/core/query-client'` | shared `QueryClient` | api client plan, any provider |
| `import { env } from '@/core/env'` | typed runtime config (`backendUrl`, firebase keys, google ids) | api `client.ts`, `firebase.ts`, google auth |
| `import { ROUTES } from '@/core/routes'` | route path map | every screen + 401 redirect in api client |
| `@/*` alias | resolves to `src/*` (babel + tsc) | every plan |
| `className` on RN components | NativeWind v4 active via `global.css` import | every UI plan |
| `src/core/global.css` (metro `input`) | stylesheet entry; **tokens added by plan 03** | plan 03 (tokens), all styling |

**Cross-plan boundary rules this plan sets:** (1) only `@/core/env` may import `expo-constants` for config; (2) only `@/core/query-client` may construct the `QueryClient`; (3) `app/tasks/[taskId].tsx`, `app/chat.tsx`, the real login screen at `/`, `src/api/`, `src/services/`, and the token/secure-store interceptor are **NOT** owned here and are left for later plans.

---

## 5. Verification

Run from `project-mobile/`:

1. **Install** — `npx expo install` (for expo/native pkgs) then `npm install` resolves the JS deps. No peer-dep errors.
2. **Type check (primary gate)** — `npx tsc --noEmit` passes with zero errors (brief §line 28). This exercises the `@/*` alias, strict flags, NativeWind `className` types, and the three core contract modules.
3. **Lint** — `npm run lint` passes (no `lint:fix` run in this plan per task instruction).
4. **Boot** — `npm start` then open iOS/Android: app launches past splash to the empty `app/index.tsx` ("Ben" centered), no red screen. Confirms providers tree, font loading, splash hide, NativeWind compile, expo-router root layout all work.
5. **No feature code** — repo tree under `project-mobile/` contains only §2 files (+ generated `.expo/`, `node_modules/`, `expo-env.d.ts`). No `src/api/`, no `src/services/`, no `src/pages/`.

> Expo SDK / native package patch versions must be resolved via `npx expo install`, NOT hand-typed, to avoid a guessed-version mismatch (NO GUESSING). If `tsc` flags a NativeWind type issue, ensure `nativewind-env.d.ts` is in `tsconfig.json` `include` (2.4/2.7).

---

## 6. Out of scope (explicit — owned by later plans)

- Design tokens / `@theme` migration into `tailwind.config.js` + `global.css` (plan 03).
- `src/api/` (client, routes, models, requests, responses, types), the async SecureStore token interceptor, 401-via-router redirect.
- UI primitives (`Button`, `Typography`, `IconButton`), screens (`login`, `chat`, `tasks/[taskId]`), menu/detail modals.
- Zustand/Jotai stores, React Query data hooks, voice recorder, `firebase.ts`, google sign-in flow.
- `src/services/notifications-service.ts` (local notifications) — only the `expo-notifications` dependency + plugin are declared here.
