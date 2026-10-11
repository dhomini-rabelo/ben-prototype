# Escopo A: infra de i18n, seletor de idioma e Configurações

App: `packages/infra/mobile/ben` (abaixo, os caminhos são relativos a ele). Git: branch `feat/add-version-in-settings`, base `3ec6712`. Você roda **sozinho**. Os escopos B1, B2 e B3 só começam depois do seu commit.

## Decisões vinculantes

- Idiomas `en` (default) e `pt-BR`. Sem lib de i18n e sem dependência nova. Não detecta o idioma do aparelho.
- Persistência local em AsyncStorage, chave `@ben/language`. O idioma não é limpo no sign out (não toque em `auth-store.clear`).
- A hidratação acontece antes de `isReady`, para nunca piscar em inglês. A troca é instantânea, sem remontar a árvore.
- O lint proíbe identificadores de 1 letra (`id-length`), então não existe `t()`. Use `const strings = useStrings(xStrings)`.
- Não traduza dados do backend (nomes de modelo, slugs de effort se vierem da API, erros do servidor), a marca "Ben", números de versão nem `version.date`.
- A copy pt-BR acompanha a voz do inglês (minúsculas onde o inglês é minúsculo, "você"). Glossário: settings=configurações, sign out=sair, retry=tentar de novo, language=idioma, app versions=versões do app, Ben's model=modelo do Ben, effort=esforço, just now=agora, yesterday=ontem, `Xm ago`=`há Xmin`, `Xh ago`=`há Xh`, `Xd ago`=`há Xd`, `Xw ago`=`há Xsem`, `in Xm`=`em Xmin`, `in Xh`=`em Xh`, no time set=sem horário.

## O que construir

1. `src/core/languages.ts` (novo, sem imports): `LANGUAGES = ['en', 'pt-BR'] as const`, `type Language`, `DEFAULT_LANGUAGE`, `isLanguage(value: unknown): value is Language`, `LANGUAGE_LOCALES: Record<Language, string>` (`en-US`, `pt-BR`), `LANGUAGE_LABELS: Record<Language, string>` (`English`, `Português`), `type Localized<Value> = Record<Language, Value>`.
2. `src/storage/language-storage.ts` (novo), molde `src/storage/user-storage.ts:1-32`: `LANGUAGE_KEY`, `getStoredLanguage(): Promise<Language | null>` (valida com `isLanguage`, devolve null em erro), `setStoredLanguage(language)` (try/catch silencioso).
3. `src/layout/stores/language-store.ts` (novo), molde zustand `src/layout/stores/auth-store.ts:37-55`: `{ language: Language; hydrate(): Promise<void>; setLanguage(language): void }`. `setLanguage` faz `set` e `void setStoredLanguage(language)`.
4. `src/layout/hooks/use-strings.ts` (novo): `useLanguage()` (selector) e `useStrings<Strings>(strings: Localized<Strings>): Strings`.
5. `src/layout/utils/get-strings.ts` (novo): `getStrings(strings)` via `useLanguageStore.getState().language`, para código fora do React.
6. `src/core/auth-bootstrap.ts:20-25`: `await useLanguageStore.getState().hydrate()` antes de `setIsReady(true)`.
7. `src/layout/utils/format-time.ts:1-52`: as 3 funções ganham `language: Language` como último parâmetro. As frases vêm de `src/layout/strings/format-time-strings.ts` (dicionário com funções para os números); `absoluteDateTime` usa `LANGUAGE_LOCALES[language]`. Atualize **só a linha de chamada** nos chamadores, passando `useLanguage()`: `src/layout/components/menu-tasks/menu-tasks-list.tsx:36,58`, `src/layout/components/menu-detail/note-detail.tsx:36-37`, `src/layout/components/menu-detail/reminder-detail.tsx` (usos de `relativeTime`/`absoluteDateTime`/`firesAtRelative`), `src/pages/chat/components/message-trace-sheet/message-trace-output-step.tsx:20-21`, `src/pages/chat/components/message-trace-sheet/message-trace-sheet.tsx:92`, `src/pages/chat/components/message-actions-menu/message-actions-menu.tsx:121`. As outras strings desses arquivos ficam para os escopos B.
8. `src/core/app-versions.ts:1-23`: `title` e `description` viram `Localized<string>`. Importe com `import type { Localized } from '@/core/languages'` (**type-only**, porque `app.config.ts:2` importa este arquivo fora do Metro). Traduza as 2 entradas. `app-version-item.tsx` exibe `version.title[language]` e `version.description[language]`.
9. Seletor: `src/layout/components/menu-settings/language-section.tsx` (novo), molde `app-versions-section.tsx:1-31`. Título label-caps ("Language"/"Idioma") e `SegmentedControl<Language>` (`src/layout/components/ui/segmented-control.tsx`) com opções vindas de `LANGUAGES` e `LANGUAGE_LABELS`, `value={language}` e `onChange={setLanguage}`. Em `settings-sheet.tsx`, adicione a prop `languageSection?: ReactNode` e renderize entre o bloco do `agentSection` (122-132) e `{versionsSection}` (134). `settings-view.tsx:123-136` passa `languageSection={<LanguageSection />}`.
10. Migre **todas** as strings visíveis de `src/layout/components/menu-settings/*` (settings-sheet: Settings, couldn't load full profile, Ben's model, signing out…, Sign out, didn't sign you out — try again?, retry; agent-settings-*, agent-effort-chips, agent-model-option, app-version-item, app-versions-section, settings-sheet-overlay, accessibilityLabels incluídos) para `src/layout/strings/settings-strings.ts`.

Forma de todo dicionário:

```ts
const en = { title: 'Settings', minutesAgo: (minutes: number) => `${minutes}m ago` }
export const settingsStrings: Localized<typeof en> = { en, 'pt-BR': { ... } }
```

## Convenções (leia)

`.claude/skills/code-get-coding-designs/designs/mobile-app-structure.md`, `.claude/skills/code-get-coding-designs/designs/mobile-token-persistence-structure.md`, `.claude/skills/code-write-code/general-coding-practices.md`, `.claude/skills/code-write-code/coding-patterns/lint.md`, `.claude/skills/code-write-code/coding-patterns/frontend/frontend-code-preferences.md`, `.claude/skills/code-write-code/coding-patterns/frontend/react-components.md`.

## Não quebrar

- `app.config.ts` lendo `CURRENT_APP_VERSION` (`APP_VERSIONS[0].version` e `as const satisfies readonly [AppVersion, ...AppVersion[]]` continuam).
- O gate `isReady` em `app/_layout.tsx` e o fluxo de token e usuário em `auth-bootstrap.ts`.
- O comportamento em inglês tem que ficar idêntico ao de hoje, exceto `absoluteDateTime`, que passa a usar o locale `en-US`.

## Aceite

- Configurações mostram Language com English | Português. A troca muda o texto das Configurações e dos tempos relativos na hora, e o idioma persiste depois do reload.
- Na raiz: `pnpm lint:fix` e `pnpm typecheck` verdes. `pnpm --filter @ben/mobile-ben exec expo config --type public` mostra `version: '1.1.0'`.
- Commit único com os arquivos acima (git add com caminhos explícitos). Sem push.

## Arquivos que você é dono

Os 6 novos (`languages.ts`, `language-storage.ts`, `language-store.ts`, `use-strings.ts`, `get-strings.ts`, `language-section.tsx`), `src/layout/strings/{settings,format-time}-strings.ts`, `auth-bootstrap.ts`, `app-versions.ts`, `format-time.ts` e `menu-settings/**`. Nos 6 chamadores do item 7, só as linhas de chamada.
