# App Ben (mobile): estrutura do código

Base: `packages/infra/mobile/ben`.

- `app/`: rotas do Expo Router (`index` é o login; o grupo `(protected)/` tem `chat`, `tasks/[taskId]`, `menu` e o `_layout` que guarda a autenticação).
- `src/api/`: camada de API (`client.ts` com axios para token nativo e `FormData`, `routes.ts`, `requests/`, `models/`, `responses/`, `types.ts`).
- `src/pages/`: telas por feature (`login`, `chat`, `task-workspace`, `menu`), cada uma com `components/`, `hooks/`, `stores/`, e o `chat` também com `states/` e `utils/`.
- `src/layout/strings/`, `src/pages/<feature>/strings/`: dicionários `*-strings.ts` por área (`Localized<T>` em `en` e `pt-BR`); `src/layout/hooks/use-strings.ts` (`useStrings`, `useLanguage`), `src/layout/utils/get-strings.ts` (`getStrings`) e `src/layout/stores/language-store.ts` (idioma atual, `hydrate`, `setLanguage`).
- `src/layout/`: primitivas de UI (`components/ui/`), componentes compostos (`chat-input`, `chat-banner`, `menu-*`, `icons`...), hooks entre páginas, stores globais e utils (`colors`, `format-time`, `styles` com `cn()`).
- Preferências do servidor: `src/api/models/user-preferences.ts`, `src/api/requests/user-preferences.ts`, `src/layout/stores/user-preferences-store.ts`, `src/layout/hooks/{use-user-preferences,use-user-preferences-sync,api/use-user-preferences-data}.ts`; switch em `src/layout/components/ui/switch.tsx` e seção em `menu-settings/usd-cost-section.tsx`; rodapé de custo em `src/pages/chat/components/message-footers/cost-footer.tsx`.
- `src/storage/`: persistência nativa. `expo-secure-store` (token, com cache síncrono em memória) e AsyncStorage (usuário e idioma, `language-storage.ts`, chave `@ben/language`). Arquivos `*.web.ts` cobrem o web.
- `src/services/`: fronteira com SDKs nativos (`audio-service`, `clipboard-service`, `google-auth-service`, `notifications-service`, este o único importador de `expo-notifications`). Arquivos `*.web.ts` são a versão web.
- `src/core/`: ligação do app (`languages.ts` com `LANGUAGES`, `Language`, `DEFAULT_LANGUAGE`, `LANGUAGE_LOCALES`, `LANGUAGE_LABELS`, `Localized`; `env`, `query-client`, `routes`, `firebase`, `auth-bootstrap` (também hidrata o idioma), `logger`, `runtime`, `global.css`) e `app-versions.ts`: lista `APP_VERSIONS` (a primeira entrada é a atual) e `CURRENT_APP_VERSION`, lida pelo `app.config.ts` para o campo `version` do Expo e pela folha de configurações (`src/layout/components/menu-settings/app-versions-section.tsx`).
- Fora de `src/`: `app.config.ts` (importa `./src/core/app-versions.ts` com extensão explícita, o que exige `allowImportingTsExtensions` no `tsconfig.json`), `eas.json`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `scripts/` (ícones e ambiente Android), `plugins/`, `assets/`, `android/`, `credentials/`.

Os tokens de fonte (`wordmark`, `tagline`, `headline-lg`, `body-md`, `button`, `label-caps`) estão em `src/layout/components/ui/typography.tsx` e `tailwind.config.js`.
