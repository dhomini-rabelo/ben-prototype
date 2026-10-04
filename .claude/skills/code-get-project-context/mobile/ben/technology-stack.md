# App Ben (mobile): stack

Expo SDK 54 · React Native 0.81 · React 19 · Expo Router (rotas por arquivo) · NativeWind v4 (Tailwind v3) · Zustand · Jotai · TanStack Query · axios · Firebase + `@react-native-google-signin/google-signin` (auth) · `expo-audio` (áudio) · `expo-secure-store` + AsyncStorage · `expo-notifications` · `react-native-reanimated` + `react-native-gesture-handler` · `lucide-react-native`.

## Comandos

| Comando (na raiz) | O que faz |
|---|---|
| `pnpm dev:mobile` | `expo start --web --port 8081` (gera os ícones antes) |
| `pnpm dev` | sobe a API e o app juntos |
| `pnpm --filter @ben/mobile-ben start` | `expo start` (Metro nativo) |
| `pnpm typecheck` | `tsc` do app junto com os demais packages |

O app **não** estende `tsconfig.base.json` da raiz (Metro não usa a base do backend). O alias `@/` do app aponta para o próprio `src/`.
