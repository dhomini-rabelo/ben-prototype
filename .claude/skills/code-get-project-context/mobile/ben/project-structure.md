# App Ben (mobile): estrutura do código

Base: `packages/infra/mobile/ben`.

- `app/`: rotas do Expo Router (`index` é o login; o grupo `(protected)/` tem `chat`, `tasks/[taskId]`, `menu` e o `_layout` que guarda a autenticação).
- `src/api/`: camada de API (`client.ts` com axios para token nativo e `FormData`, `routes.ts`, `requests/`, `models/`, `responses/`, `types.ts`).
- `src/pages/`: telas por feature (`login`, `chat`, `task-workspace`, `menu`), cada uma com `components/`, `hooks/`, `stores/`, e o `chat` também com `states/` e `utils/`.
- `src/layout/`: primitivas de UI (`components/ui/`), componentes compostos (`chat-input`, `chat-banner`, `menu-*`, `icons`...), hooks entre páginas, stores globais e utils (`colors`, `format-time`, `styles` com `cn()`).
- `src/storage/`: persistência nativa. `expo-secure-store` (token, com cache síncrono em memória) e AsyncStorage (usuário). Arquivos `*.web.ts` cobrem o web.
- `src/services/`: fronteira com SDKs nativos (`audio-service`, `clipboard-service`, `google-auth-service`, `notifications-service`, este o único importador de `expo-notifications`). Arquivos `*.web.ts` são a versão web.
- `src/core/`: ligação do app (`env`, `query-client`, `routes`, `firebase`, `auth-bootstrap`, `logger`, `runtime`, `global.css`) e `app-versions.ts`: lista `APP_VERSIONS` (a primeira entrada é a atual) e `CURRENT_APP_VERSION`, lida pelo `app.config.ts` para o campo `version` do Expo e pela folha de configurações (`src/layout/components/menu-settings/app-versions-section.tsx`).
- Fora de `src/`: `app.config.ts` (importa `./src/core/app-versions.ts` com extensão explícita, o que exige `allowImportingTsExtensions` no `tsconfig.json`), `eas.json`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `scripts/` (ícones e ambiente Android), `plugins/`, `assets/`, `android/`, `credentials/`.

Os tokens de fonte (`wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`) estão em `src/layout/components/ui/typography.tsx` e `tailwind.config.js`.
