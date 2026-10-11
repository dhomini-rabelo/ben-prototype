APPROVED_WITH_RESALVAS

# Review r2 — language-switch (validate-language-switch-r2)

Escopo: fix round `git diff HEAD~1 -- packages/` (55f638b, 7 arquivos) + varredura nova de inglês hardcoded em `packages/infra/mobile/ben/src` e `app/`. Type-check e lint já rodaram com exit 0 (não reexecutados).

## Findings da r1: situação

1. **Bloqueante 1 resolvido.** `src/layout/components/ui/code-block.tsx:13,39` usa `useStrings(uiStrings)` com `strings.showMore`/`strings.showLess`. `src/layout/strings/ui-strings.ts` tem en `Show more`/`Show less` (idêntico ao texto anterior) e pt-BR `Mostrar mais`/`Mostrar menos`. Segue o molde do `copy-button.tsx`.
2. **Bloqueante 2 resolvido.** `src/pages/chat/strings/message-trace-strings.ts:4-5` agora tem en `View input`/`View output`; pt-BR continua `Ver input`/`Ver output`.
3. **Task picker restaurado.** `task-picker-list.tsx:32-50` (`activityLabel`) reproduz byte a byte a saída em inglês da versão em 3ec6712: `just now` sem prefixo, `active · Xm ago`, `active · Xh ago`, `active · Xd ago` (também para 7 dias ou mais, sem `yesterday`/`w ago`). Em pt-BR: `agora`, `ativa · há Xmin`, `ativa · há Xh` e `ativa · há Xd`. Sem regressão. Os outros consumidores de `relativeTime` (menu-tasks, menu-detail, menu-reminders) não foram tocados.
4. **Copy pt-BR unificado.** As mensagens de microfone e de voz em `workspace-strings.ts:47-50` agora coincidem com `chat-strings.ts`. `typingLabel` virou `Ben está digitando`, `continueWithGoogle` virou `Continuar com o Google` e `loadError` virou `não deu para carregar essa`.
5. Ficam fora de escopo por decisão do orquestrador: o canal Android `Reminders` e as chaves duplicadas entre dicionários.

## Varredura nova (inglês hardcoded fora dos dicionários)

Busquei literais em props (`accessibilityLabel`/`placeholder`/`title`/`label`/`name`), texto JSX inline, `{'…'}`, template literals com palavras, palavras comuns de UI (Settings/Back/Close/Retry/Today…), `toLocale*` e `Intl`. Resultado:
- Fora dos dicionários sobraram só: o nome da marca `Ben` (`login/page.tsx:35`, `brand-mark.tsx:40`, `chat-history.tsx:126`), mensagens `throw new Error` para o desenvolvedor (contextos e `env.ts`), um comentário em `collapsible-section.tsx:37-39` e o canal Android, que está fora de escopo.
- `src/core/app-versions.ts` tem literais en/pt-BR, mas eles já estão em formato `Localized`, conforme a decisão.
- A única chamada a `toLocaleString` (`format-time.ts:34`) usa `LANGUAGE_LOCALES[language]`.

Não encontrei mais nenhum texto visível hardcoded.

## Ressalvas (registrar, não bloqueiam)

- `src/pages/task-workspace/strings/workspace-strings.ts:46` diz `O envio fica pausado…`, enquanto `src/pages/chat/strings/chat-strings.ts:43` diz `O envio fica em pausa…` para o mesmo en `Sending is paused…`. Essa divergência foi citada na r1 e não foi unificada. É um ajuste de uma palavra.
- `src/pages/chat/components/task-picker/task-picker-list.tsx:9-10`: os imports novos (`@/core/languages`, `@/layout/strings/format-time-strings`) quebram a ordem alfabética por caminho que o resto do arquivo segue. O lint não reclamou. É só estética.
- `task-picker-list.tsx:32-50`: `activityLabel` duplica parte da lógica de `relativeTime`. Isso é intencional para preservar o texto antigo do picker, e vale registrar como tal.
