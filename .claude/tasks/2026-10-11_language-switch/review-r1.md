CHANGES_REQUIRED

# Review r1 — language-switch (validate-language-switch-r1)

Escopo revisado: `git diff 3ec6712..HEAD -- packages/` (92 arquivos, escopos A + B1/B2/B3), app `packages/infra/mobile/ben`.

## O que está correto

- Infra conforme o contrato do escopo A: `src/core/languages.ts` (sem imports), `src/storage/language-storage.ts` (chave `@ben/language`, valida com `isLanguage`, try/catch), `src/layout/stores/language-store.ts` (zustand, `setLanguage` faz `set` + `void setStoredLanguage`), `useLanguage`/`useStrings` em `src/layout/hooks/use-strings.ts`, `getStrings` em `src/layout/utils/get-strings.ts`. Sem lib i18n, sem `t()`.
- Hidratação: `src/core/auth-bootstrap.ts:24` faz `await useLanguageStore.getState().hydrate()` antes de `setIsReady(true)`. `auth-store.clear` não foi tocado.
- Armadilha (1) OK: `src/core/app-versions.ts:1` usa só `import type { Localized }`; `languages.ts` não tem imports. `pnpm --filter @ben/mobile-ben exec expo config --type public` saiu com exit 0 e `version: '1.1.0'`.
- Formatadores: `format-time.ts`, `diff-summary.ts` e `app-versions.ts` recebem/usam `language`; `absoluteDateTime` usa `LANGUAGE_LOCALES`. Os caminhos em inglês de `relativeTime`/`firesAtRelative` geram o mesmo texto de antes (inclusive `1w ago`).
- Seletor: `language-section.tsx` usa o `SegmentedControl<Language>` existente com `LANGUAGES`/`LANGUAGE_LABELS`, renderizado entre `agentSection` e `versionsSection` em `settings-sheet.tsx:142`, passado por `settings-view.tsx:63`.
- Dicionários tipados `Localized<typeof en>` em todos os arquivos `strings/` (se faltar uma chave em pt-BR, a compilação quebra). Comparei os literais em inglês removidos com os valores `en`: batem, com exceção dos itens abaixo.
- Strings fora do React (`use-google-auth.ts`, `voice-store/recorder.ts`) usam `getStrings`, conforme a decisão.

## Mudanças necessárias

1. `packages/infra/mobile/ben/src/layout/components/ui/code-block.tsx:36` — `{isExpanded ? 'Show less' : 'Show more'}` continua hardcoded em inglês. Aparece no message-trace sheet (via `message-trace-input-step.tsx` / `message-trace-output-step.tsx`), o que viola o critério "todo texto visível vem dos dicionários". Correção: adicionar `showMore`/`showLess` a `src/layout/strings/ui-strings.ts` (pt-BR: `Mostrar mais` / `Mostrar menos`) e usar `useStrings(uiStrings)` no `CodeBlock`, como o `copy-button.tsx` já faz.
2. `packages/infra/mobile/ben/src/pages/chat/strings/message-trace-strings.ts:4-5` — `en.viewInput: 'Ver input'` e `en.viewOutput: 'Ver output'` (armadilha 2). Agora que existe um dicionário `en`, deixar português nele contradiz a feature: quem escolhe English vê português. Isso conta como "correção óbvia" permitida pelo critério de aceite. Correção: `en` = `'View input'` / `'View output'`. O pt-BR fica `'Ver input'` / `'Ver output'`.

## Ressalvas (registrar, não bloqueiam)

- `packages/infra/mobile/ben/src/pages/chat/components/task-picker/task-picker-list.tsx:67` — o `relativeTime` local foi trocado pelo compartilhado e o texto em inglês mudou: antes era `just now` (sem prefixo) e `Xd ago` também para 7 dias ou mais. Agora é `active · just now`, `active · yesterday`, `active · 1w ago`. A consolidação é razoável, mas a mudança de texto não foi pedida. Registre como mudança intencional ou restaure o texto anterior.
- `packages/infra/mobile/ben/src/services/notifications-service.ts:22` — o canal Android `name: 'Reminders'` continua em inglês (aparece nas configurações do sistema, não no app). Pode ficar assim, mas fica registrado.
- Copy pt-BR inconsistente para o mesmo texto em inglês entre chat e workspace: `chat-strings.ts` (`o microfone falhou`, `ative o microfone`, `não consegui entender`, `fica em pausa`) contra `workspace-strings.ts:44-49` (`o mic falhou`, `ligue o mic`, `não entendi`, `fica pausado`). Convém unificar.
- `workspace-strings.ts:32` — `loadError: 'não consegui carregar essa'` fica solto e foge do padrão `não deu para carregar …` usado no resto. Sugestão: `'não deu para carregar esta tarefa'`.
- `chat-strings.ts:51` — `typingLabel: 'o Ben está digitando'` (accessibilityLabel) está em minúscula, enquanto o en é `Ben is typing`. Sugestão: `'O Ben está digitando'`.
- `login-strings.ts:22` — `'Continuar com Google'`; o mais natural é `'Continuar com o Google'`.
- Duplicação: `send`/`voiceInput` existem em `chat-input-strings`, `chat-strings` e `workspace-strings`; `retry` em vários dicionários. Não é bug, só redundância.
- Mensagens de erro geradas via `getStrings` (auth, microfone) ficam congeladas no idioma do momento do erro. Isso é aceitável e coerente com a decisão de usar `getStrings` fora do React.
