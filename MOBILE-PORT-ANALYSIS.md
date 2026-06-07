# Análise: criação do project-mobile (React Native)

Análise do que precisamos definir para criar o `project-mobile` em React Native, com base na exploração concreta do `project-web`.

## Decisões de stack

| Tópico | Decisão |
|---|---|
| Runtime | **Expo** (managed workflow) |
| Navegação | **Expo Router** (file-based) |
| Estrutura | `project-mobile/` separado, copiando a camada compartilhável do web |
| Áudio | **expo-av / expo-audio** |

## Visão geral: o que dá pra reaproveitar

O `project-web` tem separação limpa entre **lógica/contratos** e **UI web**. O que muda de fato é a camada de apresentação e algumas APIs de plataforma.

| Camada | Reaproveita? | Observação |
|---|---|---|
| `src/api/` (client, routes, models, requests) | ✅ ~100% | `axios` e `FormData` funcionam em RN |
| Stores Zustand (auth, connectivity, voice, menu, messages, tasks) | ✅ Lógica intacta | Zustand é agnóstico de plataforma |
| Jotai (drafts de input) | ✅ | idem |
| React Query (hooks de fetch/paginação) | ✅ | funciona em RN |
| Voz/áudio (`voice-store/recorder.ts`) | 🟡 Lógica sim, API não | `MediaRecorder` → lib nativa |
| Auth Firebase (`firebase.ts`, `use-google-auth.ts`) | 🟡 Fluxo sim, SDK não | popup web → fluxo nativo |
| Persistência de token (`js-cookie`) | 🟡 | cookie → SecureStore/AsyncStorage |
| Roteamento (`router.tsx`) | ❌ | react-router → Expo Router |
| UI (`ui/button.tsx`, typography) | ❌ | HTML → primitivos RN |
| Tailwind v4 (`global.css`) | 🟡 Tokens sim | Tailwind CSS → NativeWind |
| Ícones (`lucide-react`) | 🟡 | → `lucide-react-native` |
| Env (`import.meta.env`) | ❌ | Vite → Expo |

## Mapa de libs: web → mobile

| Função | project-web | project-mobile |
|---|---|---|
| HTTP | `axios` | `axios` (igual) |
| Server state | `@tanstack/react-query` | igual |
| Global state | `zustand` | igual |
| Draft state | `jotai` | igual |
| Validação | `zod` + `react-hook-form` | igual |
| Streaming IA | `ai` + `@ai-sdk/react` | igual (suporta RN) |
| Roteamento | `react-router` 7 | **`expo-router`** |
| Auth Google | `firebase` (`signInWithPopup`) | **`@react-native-google-signin/google-signin`** + `firebase` JS SDK |
| Áudio | `MediaRecorder` (web nativo) | **`expo-av`** |
| Estilo | `tailwindcss` v4 + `@tailwindcss/vite` | **`nativewind`** v4 |
| Ícones | `lucide-react` | **`lucide-react-native`** |
| Storage de token | `js-cookie` | **`expo-secure-store`** (token) + **`@react-native-async-storage/async-storage`** (user) |
| Env | `import.meta.env.VITE_*` | **`app.config.ts` + `expo-constants`** |

## O que copiar quase intacto

Esses diretórios migram com ajustes mínimos:

- **`src/api/` inteiro** — `client.ts`, `routes.ts`, `models/`, `requests/`, `responses/`, `types.ts`. O contrato com o backend é idêntico; `FormData` para áudio funciona em RN.
- **Stores Zustand** — auth, connectivity, voice (só o `recorder.ts` muda), menu, messages, tasks. A máquina de estados de voz (timer, `transcriptionRunId`, `setTranscriptHandler`) é preservada.
- **Hooks React Query** — `use-api-request`, `use-api-paginated`, `use-api-cursor-paginated` e os especializados (`useTaskListData`, `useMessageListData`, etc.).

## Os 5 pontos que exigem reescrita real

1. **Interceptor de auth (`client.ts`)** — hoje lê cookie de forma **síncrona** e faz `window.location` no 401. SecureStore é **assíncrono** → o token precisa ser carregado em memória no boot do app (ou usar `getItemAsync` no interceptor com cache). O redirect 401 vira navegação via Expo Router em vez de `window.location`.

2. **Fluxo Google** — sem popup. `GoogleSignin.signIn()` retorna o `idToken` nativo → mesmo POST `/auth/login-or-register`. Exige configurar `webClientId`/`iosClientId` no Google Cloud Console (config nova, fora do código).

3. **Gravador de voz** — reescrever só `recorder.ts` sobre `expo-av`: `Audio.Recording`, permissão via `Audio.requestPermissionsAsync()`, exportar `.m4a`/`.caf` e mandar no `FormData`. Toda a UI de waveform/RecordingBar é reescrita com `Animated`/`Reanimated`.

4. **UI primitives** — `<Button>`, `<Typography>`, `<IconButton>` reescritos com `Pressable`/`Text`/`View`. NativeWind permite manter as mesmas classes Tailwind, mas os tokens do `global.css` (`@theme`) precisam migrar para `tailwind.config.js` (NativeWind v4 ainda não suporta `@theme` puro como o Vite plugin).

5. **Telas** — 3 rotas (`login`, `chat`, `tasks/[taskId]`) viram telas Expo Router. O **menu overlay** (hoje state-driven sobre a página) e os **detail modals** (notes/reminders) podem virar modais nativos do Expo Router, o que melhora a UX mobile.

## Libs/ferramentas adicionais a definir (revisão)

Itens que não estavam no mapa inicial e precisam ser decididos antes de codar.

| Necessidade | Lib/ferramenta | Motivo |
|---|---|---|
| Animações (`fadeInUp`, waveform, `animate-bounce`, `animate-pulse`) | **`react-native-reanimated`** | CSS keyframes não existem em RN |
| Gesto "slide up to cancel" na gravação | **`react-native-gesture-handler`** | gesto da `RecordingBar` |
| Ícones (dependência do `lucide-react-native`) | **`react-native-svg`** | obrigatório para renderizar SVG |
| Fontes Hanken Grotesk + JetBrains Mono | **`expo-font`** + **`@expo-google-fonts/hanken-grotesk`** + **`@expo-google-fonts/jetbrains-mono`** | no web nem são carregadas (caem no fallback) |
| Splash / status bar / ícone do app | **`expo-splash-screen`** + **`expo-status-bar`** | shell do app |
| Permissão de microfone | config no `app.json` (`NSMicrophoneUsageDescription`, Android `RECORD_AUDIO`) | exigido por iOS/Android |
| Feedback tátil (opcional) | **`expo-haptics`** | melhora UX de voz/ações |
| Formatação/lint | **Prettier** + ESLint flat config + plugin RN | o web não usa Prettier; definir padrão no mobile |
| Path alias `@/` | `tsconfig paths` + **`babel-plugin-module-resolver`** | Metro não resolve o alias sozinho |

### Decisão de produto pendente: notificações de reminders

No web, reminders são **somente display** (`firesAt`, status `upcoming`/`fired`) — nada é disparado. Em mobile, fazer um reminder **realmente notificar** é **feature nova**, não port. Opções:

1. **Apenas display (igual ao web)** — sem lib extra; reminders continuam só listados.
2. **Notificação local** — **`expo-notifications`** agendando no device a partir de `firesAt`. Sem mudança no backend, mas não dispara com app fechado por muito tempo / multi-device.
3. **Push notification** — `expo-notifications` + serviço de push (Expo Push / FCM/APNs) + **mudança no backend** para agendar e enviar. Mais robusto.

> **Decisão registrada: notificação local (opção 2).** Encapsular a lógica num **service em `project-mobile/src/services/`** (ex.: `notifications-service.ts`) responsável por: pedir permissão de notificação, agendar a partir do `firesAt`, cancelar/reagendar quando o reminder muda e limpar agendamentos órfãos. As telas/stores chamam esse service — nunca o `expo-notifications` direto. Push fica como evolução futura.

### Não precisam de lib (confirmado na revisão)

- **Datas**: `format-time.ts` usa JS puro + `Intl` → copia direto, **sem date-fns/dayjs**.
- **Markdown**: chat, task content e notes são texto puro → **sem react-markdown**.

### Reescritas que não portam direto

- **Scroll infinito do chat**: `use-infinite-scroll-top.ts` (`IntersectionObserver` + `ResizeObserver` + `window.scrollBy`) → reescrever com **`FlatList` invertida** + `onEndReached`.
- **`ResizeObserver` do footer** (`chat/page.tsx`) → usar prop `onLayout`.
- **Conectividade** (`navigator.onLine` + eventos do browser) → **`@react-native-community/netinfo`**.
- **Permissão de microfone** (`navigator.permissions`) → tratada pelo `expo-av`.

## Diferenças conceituais web → mobile

- **Teclado**: precisa de `KeyboardAvoidingView` no footer de chat/task (não existe no web).
- **Safe areas**: notch/home indicator → `react-native-safe-area-context`.
- **Conectividade**: o `connectivity-store` hoje usa eventos do browser; em mobile usar `@react-native-community/netinfo`.
- **Scroll/listas**: `ChatHistory` e listas paginadas devem usar `FlatList` (virtualização) em vez de scroll DOM — relevante para a paginação por cursor.
- **Streaming do agente**: confirmar que o transporte do `ai` SDK funciona com o fetch do RN (geralmente sim, mas vale validar SSE/streaming).
- **Build/distribuição**: EAS Build para gerar binários iOS/Android.

## Próximo passo sugerido

Montar um **plano de implementação faseado**:

1. **Fase 1** — scaffold Expo + camada API + auth + `src/services/`.
2. **Fase 2** — chat.
3. **Fase 3** — voz.
4. **Fase 4** — task workspace + menu.
5. **Fase 5** — reminders + `notifications-service` (notificação local).

### Nova convenção de estrutura: `src/services/`

O `project-web` **não tem** uma pasta `services/`. No `project-mobile` ela passa a existir para encapsular integrações de plataforma (notificações, e futuramente push/áudio), mantendo telas e stores agnósticas da API nativa.

- `src/services/notifications-service.ts` — agenda/cancela/reagenda notificações locais a partir do `firesAt` dos reminders; pede permissão; limpa agendamentos órfãos. Único ponto que importa `expo-notifications`.
