# App Ben (mobile): stack

Expo SDK 54 · React Native 0.81 · React 19 · Expo Router (rotas por arquivo) · NativeWind v4 (Tailwind v3) · Zustand · Jotai · TanStack Query · axios · Firebase + `@react-native-google-signin/google-signin` (auth) · `expo-audio` (áudio) · `expo-secure-store` + AsyncStorage · `expo-notifications` (notificações locais e token de push do Expo) · `expo-constants` (lê o `projectId` do EAS) · `expo-dev-client` · `react-native-reanimated` + `react-native-gesture-handler` · `phosphor-react-native` (ícones, sobre `react-native-svg`) · `@expo-google-fonts/instrument-sans` e `@expo-google-fonts/jetbrains-mono` (fontes carregadas em `app/_layout.tsx`).

## Tema e tipografia

Paleta clara única, com âmbar como cor de marca (`primary` `#f9a12f`, `brand-deep`, `brand-light`, `brand-50`), fundo quente (`surface`/`background`) e tokens de balão (`bubble-user`, `bubble-ben`), de onda de voz (`wave`) e de orelha de card (`dog-ear`), todos em `tailwind.config.js` (`theme.extend.colors`). Não há variantes escuras (`darkMode: 'class'`).

Fontes: Instrument Sans (400, 500, 600, 700) e JetBrains Mono (400). No React Native cada peso é uma família própria e a fonte não combina `fontFamily` com `fontWeight`; por isso `tailwind.config.js` expõe `font-sans` (regular), `font-sans-medium`, `font-sans-semibold`, `font-sans-bold` e `font-mono`, e o texto escolhe o peso pela classe.

Ícones Phosphor não herdam `text-*` do NativeWind: a cor vai por prop com os hexes de `src/layout/utils/colors.ts`, que espelham os tokens do Tailwind.

## Comandos

| Comando (na raiz) | O que faz |
|---|---|
| `pnpm dev:mobile` | `expo start --web --port 8081` (gera os ícones antes) |
| `pnpm dev` | sobe a API e o app juntos |
| `pnpm --filter @ben/mobile-ben start` | `expo start` (Metro nativo) |
| `pnpm typecheck` | `tsc` do app junto com os demais packages |
| `pnpm --filter @ben/mobile-ben test:unit` | Vitest (ambiente node, `src/**/*.test.ts`, alias `@` para `src/`); `pnpm test` na raiz também o roda |

O app **não** estende `tsconfig.base.json` da raiz (Metro não usa a base do backend). O alias `@/` do app aponta para o próprio `src/`.

## Testes

O app tem Vitest (`vitest.config.ts`) só para lógica sem renderização. O único arquivo hoje é `src/services/__tests__/notifications-service.test.ts` (canais e permissão, agendamento, toques e cold start, `getExpoPushToken`), com `expo-notifications` e `react-native` simulados.

## Configuração Android

`app.config.ts` declara as permissões `RECORD_AUDIO` e `android.permission.USE_EXACT_ALARM`, `googleServicesFile` (`./google-services.json`) e o `projectId` do EAS em `extra.eas`.
