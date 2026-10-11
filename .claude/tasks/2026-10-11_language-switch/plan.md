# Plano — language-switch (branch feat/add-version-in-settings, base 3ec6712)

Trocar o idioma da UI do app `packages/infra/mobile/ben` entre inglês (default) e português do Brasil, com seletor nas Configurações e persistência local.

## Premissas assumidas

O usuário pediu "não me faça nenhuma pergunta". Tudo abaixo foi decidido pelo planner e é **vinculante** para implementer, reviewer e tester.

1. **Idiomas:** `en` (default) e `pt-BR`. Sem idioma salvo, o app abre em inglês. **Não** detecta o idioma do aparelho (nada de `expo-localization`).
2. **Sem lib de i18n.** Dicionários próprios e tipados, sem dependência nova. A checagem de chaves fica com o compilador (ver "Melhorias estruturais").
3. **Persistência local por aparelho:** AsyncStorage, chave `@ben/language`. Backend, Prisma e domínio ficam intactos. O idioma **sobrevive ao sign out** (preferência do aparelho, não do usuário).
4. **Hidratação antes do primeiro render:** `useAuthBootstrap` aguarda a hidratação do idioma antes de `isReady`, então a tela nunca pisca em inglês.
5. **Troca instantânea, sem reload:** o seletor atualiza a store e toda tela que lê `useStrings`/`useLanguage` re-renderiza. Nada é remontado; o sheet de Configurações continua aberto.
6. **Seletor:** nova seção "Language"/"Idioma" nas Configurações, entre "Ben's model" e "App versions". Usa o `SegmentedControl` existente (`src/layout/components/ui/segmented-control.tsx`) com duas opções. Os rótulos são endônimos e não se traduzem: `English` e `Português`.
7. **Sandbox de design fora do escopo:** `packages/infra/mobile/design` continua só em inglês, e o seletor não é desenhado lá antes. A seção reaproveita um componente que já existe, então não há design visual novo.
8. **O que se traduz:** todo texto visível escrito no mobile: JSX, `placeholder`, `accessibilityLabel`, títulos, estados vazios, de erro e de carregamento, toasts e mensagens de erro geradas no app (ex.: `recorder.ts`), tempos relativos (`format-time.ts`) e as release notes de `app-versions.ts`.
9. **O que NÃO se traduz:** dados vindos do backend (nomes de modelo, títulos de tarefa, conteúdo de mensagens, mensagens de erro do servidor), as respostas do agente de IA, a marca "Ben" e os identificadores técnicos exibidos em mono (ids, slugs, números de versão, datas ISO como `version.date`).
10. **Datas:** `absoluteDateTime` passa a usar o locale do idioma escolhido (`en` → `en-US`, `pt-BR` → `pt-BR`) em vez do locale do aparelho (`undefined`).
11. **Voz da copy pt-BR:** segue a do inglês. Onde o inglês é minúsculo, o pt-BR também é (`signing out…` → `saindo…`). Tom informal, trata o usuário por "você", frases curtas.
12. **Glossário (mesmo termo em todos os escopos):**

    | Inglês | pt-BR |
    | --- | --- |
    | task | tarefa |
    | note | nota |
    | reminder | lembrete |
    | settings | configurações |
    | sign in / sign out | entrar / sair |
    | retry / try again | tentar de novo |
    | language | idioma |
    | app versions | versões do app |
    | Ben's model | modelo do Ben |
    | effort | esforço |
    | workspace | workspace (fica igual) |
    | to-do | to-do (fica igual) |
    | chat | chat |
    | just now | agora |
    | yesterday | ontem |
    | `Xm ago` / `Xh ago` / `Xd ago` / `Xw ago` | `há Xmin` / `há Xh` / `há Xd` / `há Xsem` |
    | `in Xm` / `in Xh` | `em Xmin` / `em Xh` |
    | no time set | sem horário |

13. **Onde ficam os dicionários:** os compartilhados em `src/layout/strings/{assunto}-strings.ts`, os de uma página só em `src/pages/{page}/strings/{assunto}-strings.ts`. Espelha a divisão layout/pages de `hooks/` e `stores/`. Os coding designs não cobrem i18n, então esta é uma decisão do planner.
14. **Nome da função:** não existe `t()`, porque o lint `id-length` exige pelo menos 2 caracteres. O padrão é `const strings = useStrings(settingsStrings)` e, no JSX, `strings.signOut`.
15. **Partição:** o escopo A (infra) vem primeiro e sozinho. Depois os escopos B1, B2 e B3 rodam **em paralelo**, cada um com o seu footprint, todos partindo do commit de A.

## Convenções aplicáveis

- `.claude/skills/code-get-coding-designs/designs/mobile-app-structure.md` (`core/` com arquivos planos, layout em subpastas, kebab-case)
- `.claude/skills/code-get-coding-designs/designs/page-structure.md`
- `.claude/skills/code-get-coding-designs/designs/mobile-token-persistence-structure.md` (camada `storage/`)
- `.claude/skills/code-write-code/general-coding-practices.md`
- `.claude/skills/code-write-code/coding-patterns/lint.md` (sem comentários, sem abreviações, `id-length`)
- `.claude/skills/code-write-code/coding-patterns/frontend/frontend-code-preferences.md`
- `.claude/skills/code-write-code/coding-patterns/frontend/react-components.md`
- `.claude/skills/code-write-code/coding-patterns/general-code-preferences.md`

## Arquitetura (escopo A)

| Arquivo | Conteúdo |
| --- | --- |
| `src/core/languages.ts` (novo) | `LANGUAGES = ['en', 'pt-BR'] as const`, `type Language`, `DEFAULT_LANGUAGE: Language = 'en'`, `isLanguage(value: unknown): value is Language`, `LANGUAGE_LOCALES: Record<Language, string>` (`en-US`, `pt-BR`), `LANGUAGE_LABELS: Record<Language, string>` (`English`, `Português`), `type Localized<Value> = Record<Language, Value>`. Arquivo puro, sem imports. |
| `src/storage/language-storage.ts` (novo) | Molde `src/storage/user-storage.ts:1-32`. `LANGUAGE_KEY = '@ben/language'`, `getStoredLanguage(): Promise<Language \| null>` (valida com `isLanguage`), `setStoredLanguage(language): Promise<void>` com try/catch silencioso. |
| `src/layout/stores/language-store.ts` (novo) | Zustand, molde `src/layout/stores/auth-store.ts:37-55`. `{ language, hydrate(), setLanguage(language) }`. `hydrate` lê o storage e cai em `DEFAULT_LANGUAGE`. `setLanguage` faz `set` e `void setStoredLanguage`. |
| `src/layout/hooks/use-strings.ts` (novo) | `useLanguage(): Language` (selector da store) e `useStrings<Strings>(strings: Localized<Strings>): Strings`. |
| `src/layout/utils/get-strings.ts` (novo) | `getStrings<Strings>(strings: Localized<Strings>): Strings` via `useLanguageStore.getState()`, para código fora do React (ex.: `recorder.ts`). |
| `src/core/auth-bootstrap.ts:20-25` | `await useLanguageStore.getState().hydrate()` antes de `setIsReady(true)`. |
| `src/layout/utils/format-time.ts` | `relativeTime`, `absoluteDateTime` e `firesAtRelative` recebem `language: Language` como último parâmetro. As frases vêm de `src/layout/strings/format-time-strings.ts`; o locale, de `LANGUAGE_LOCALES`. Os chamadores atuais passam `useLanguage()`. |
| `src/core/app-versions.ts` | `title` e `description` viram `Localized<string>` via `import type { Localized } from '@/core/languages'`. Tem que ser **type-only**, porque `app.config.ts` importa este arquivo fora do Metro. |
| `src/layout/components/menu-settings/language-section.tsx` (novo) | Molde `app-versions-section.tsx`. Título label-caps e `SegmentedControl<Language>`. |
| `settings-sheet.tsx` / `settings-view.tsx` | Nova prop `languageSection?: ReactNode`, renderizada entre `agentSection` e `versionsSection`. Todas as strings de `menu-settings/*` migram para `src/layout/strings/settings-strings.ts`. |

Forma de todo dicionário (vale para todos os escopos):

```ts
const en = { title: 'Settings', minutesAgo: (minutes: number) => `${minutes}m ago` }
export const settingsStrings: Localized<typeof en> = { en, 'pt-BR': { ... } }
```

## Melhorias estruturais

- `Localized<typeof en>` faz da falta (ou do excesso) de chave em `pt-BR` um erro de tipo. Um idioma novo em `LANGUAGES` quebra todo dicionário até ser traduzido.
- `AppVersion.title`/`description` como `Localized<string>`: uma versão nova sem pt-BR não compila.
- `format-time` com `language` obrigatório: o compilador aponta todo chamador. Não sobra formatação presa ao inglês.

## Melhorias estruturais sugeridas (fora do escopo)

- Uma regra de lint (ex.: `react-native/no-raw-text` ou `i18next/no-literal-string` em modo custom) que proíba texto literal em JSX no mobile, para strings novas não escaparem do dicionário.
- O sandbox `packages/infra/mobile/design` replica as strings em inglês. Se ele precisar mostrar pt-BR um dia, vai precisar da mesma camada.
- Idioma das respostas do agente: exige um campo no backend (preferências do usuário), fora deste v1.

## Escopos e ordem

| Ordem | Escopo | Prompt | Footprint (dono) |
| --- | --- | --- | --- |
| 1 (sozinho) | A — infra i18n, seletor, persistência, settings, format-time, app-versions | `prompts/a-i18n-infra-and-settings.md` | `src/core/{languages,auth-bootstrap,app-versions}.ts`, `src/storage/language-storage.ts`, `src/layout/stores/language-store.ts`, `src/layout/hooks/use-strings.ts`, `src/layout/utils/{get-strings,format-time}.ts`, `src/layout/strings/{settings,format-time}-strings.ts`, `src/layout/components/menu-settings/**`, as linhas de chamada de format-time nos 5 chamadores |
| 2 (paralelo) | B1 — strings do layout, app, login e menu | `prompts/b1-strings-layout.md` | `app/**`, `src/layout/**` (exceto os arquivos de A), `src/pages/{login,menu}/**`, `src/api/**`, `src/services/**` |
| 2 (paralelo) | B2 — strings do chat | `prompts/b2-strings-chat.md` | `src/pages/chat/**` |
| 2 (paralelo) | B3 — strings do task-workspace | `prompts/b3-strings-task-workspace.md` | `src/pages/task-workspace/**` |

B1, B2 e B3 dependem de A (eles importam `useStrings`, `Localized`, `getStrings` e `useLanguage`). Os footprints de B1, B2 e B3 são disjuntos.

## Critérios de aceite (globais)

1. Configurações mostram a seção Language com `English | Português`. Ao tocar `Português`, o texto de toda tela muda na hora, e o sheet continua aberto.
2. Depois de recarregar (web :8081) o app abre em pt-BR, sem piscar em inglês. Depois de sair e entrar de novo, o idioma continua o mesmo.
3. Sem nada salvo, o app abre em inglês e fica igual ao de hoje.
4. Em pt-BR, nenhum texto da UI escrito no mobile aparece em inglês, com as exceções da premissa 9.
5. `pnpm lint:fix` e `pnpm typecheck` passam na raiz. `pnpm test` não muda (o domínio não é tocado).
6. `app.config.ts` continua lendo `CURRENT_APP_VERSION`: `pnpm --filter @ben/mobile-ben exec expo config --type public` mostra `version: '1.1.0'`.

## Fora do escopo

Backend, Prisma, domínio, idioma do agente, sandbox de design, detecção do idioma do aparelho e lib de i18n.

## Modo de system test

UI pelo `browser-mobile-tester` em :8081: abrir Configurações, trocar para Português, conferir Configurações, menu (tarefas, notas, lembretes), chat e workspace, recarregar para checar a persistência, sair e entrar, e voltar para English.
