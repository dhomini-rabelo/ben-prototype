# Revisão do plano — rodada 1 — lembrete-criado-abrir-tela

## Veredito
aprovado

## Convenções carregadas
- `code-write-code/SKILL.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/lint.md`, `coding-patterns/automated-testing.md`, `coding-patterns/frontend/frontend-code-preferences.md`; headings de `coding-patterns/backend/backend-code-preferences.md` (utils de domínio).
- `formats/plano.md` (critérios de fechamento 1 a 14) e o cartão `projeto.md` (campo `convenções que o plano tem que respeitar`).
- `code-get-project-context` e `code-get-coding-designs` não foram carregadas por ordem do briefing (economia de janela). No lugar delas julguei estrutura de pastas pela vizinhança real: `pages/chat/{hooks,utils}`, `layout/{utils,strings,stores}`, `application/utils/` do domínio (existem e o plano põe os arquivos novos nelas), mais `reconhecimento.md` `## Armadilhas`.
- Conferi contra o código cada caminho que os passos citam e cada ponto de que algum passo depende: `capture-view.ts`, `utils/reminders.ts`, `persist-captures.ts` (l.166, a view de task, a view de nota, o goal sem `recurrence`), `resolve-capture.ts`, os dois testes e o `update` do `InMemoryRepository` (base `repository.ts:186`), os presenters do server (repassam `capture` inteiro), o `message-builders.ts` do app (repassa `capture` inteiro), `api/models/{message,reminder}.ts`, `agent-reply.ts`, `format-time-strings.ts`, `format-time.ts`, `menu-strings.ts` (`reminderKinds.conditional`, imports só de tipo, então roda em node), `languages.ts` (`Localized`), `use-strings.ts` (`useLanguage`), `colors.ts` (`onSurfaceVariant`), `menu-reminders-list.tsx`, a cadeia `reminder-detail` → `item-detail-content` → `item-detail-reminder-meta`, `capture-card/{index,capture-card-meta,capture-card-root,capture-card-action-button}.tsx` e `types/index.ts` (`CaptureCardState`), `menu-store.ts`, `pages/menu/page.tsx:24` (`reset` ao desmontar), `menu-reminders-view.tsx`, `app/(protected)/_layout.tsx` (menu `presentation: 'modal'`), `chat-history-item.tsx`, `core/routes.ts`, `vitest.config.ts` (alias `@`, node, `src/**/*.test.ts`), o protótipo V2 (`variacao-2.tsx:83-89`, `parts.tsx` `TappableCard`/`KindPill`) e a ausência de índice de protótipos. Também conferi que nenhum `StrictMode` no app desfaz o `reset` ao montar.

## Bloqueios
nenhum

## Notas
- plano.md:75 (passo 4): o `resolveReminderView(id, itemId)` passa a não usar `itemId`, porque `toReminderCaptureView(reminder)` lê `reminder.id.toValue()`. Como é o último parâmetro, `@typescript-eslint/no-unused-vars` (`eslint.config.mjs:169`, sem `args: 'none'`) acusa, e o `lint:fix` não corrige sozinho. Conserto: dizer no passo 4 "remover o parâmetro `itemId` de `resolveReminderView` e da chamada em `resolveCaptureView`".
- plano.md:10 e plano.md:76: o plano fala em "28 comparações de formato exato". No código há bem menos `toEqual` de view: em `persist-captures.test.ts` l.56, 199, 229, 326 (mais a lista vazia da l.362) e em `resolve-capture.test.ts` l.47, 80, 103. A instrução "todo `toEqual` de formato exato" continua executável. Conserto: tirar o número.
- plano.md:21: o Resumo diz que "o card escurece", mas `active:opacity-60` deixa o card mais claro, como diz a S01 ("mais claro que os outros"). Conserto: trocar por "fica mais claro enquanto o dedo está nele".
- plano.md:106 (passo 12): as linhas citadas não batem. `capturedSupporting` está na l.49 e `doneSupporting` na l.75; l.41 e l.68 são onde começam os `MenuListRow`. `useLanguage()` já existe no componente (l.24). Os nomes bastam para achar os pontos. Conserto: corrigir as linhas.
- plano.md:107 (passo 13): o bloco da V2 tem `pt-0.5` na `View` (`variacao-2.tsx:82`), e o passo o omite. Conserto: incluir `pt-0.5`, ou dizer que a omissão é de propósito.
- plano.md:87 (passo 8): `import type ... from './reminder'`. A vizinhança importa por alias (`agent-reply.ts` usa `@/api/models/message`, e `general-code-preferences.md` prefere alias). Conserto: `@/api/models/reminder`.
- plano.md:140 (`## Contratos`): o domínio tipa `kind` como `MessageCaptureKind` (`capture-view.ts:1`), não `CaptureKind`. Conserto: corrigir o nome no contrato.
- plano.md:126 (passo 24): é `(infra)`, mas não é pré-requisito de passo nenhum (critério 2 de `formats/plano.md`). Como limpeza final exigida pela `Base:` do protótipo, a justificativa já está no texto. Conserto opcional: "(infra, limpeza final exigida pela Base do protótipo; não é pré-requisito de outro passo)".
- plano.md:120 (passo 21): um alarme com `meta` nula (remindAt inválido gravado como sem data, `persist-captures.test.ts:81`) fica sem pílula e sem rótulo. A spec não cobre esse caso e hoje ele também não tem pílula. Só registro.

## Spec em dúvida
nenhum

## Premissas
- Julguei as convenções de estrutura pela vizinhança e pelo `code-write-code`, sem carregar `code-get-project-context` nem `code-get-coding-designs`, como o briefing mandou. Se uma delas tiver regra de pasta que contradiga `pages/chat/hooks`, `pages/chat/utils`, `layout/utils/__tests__` ou `layout/stores/__tests__`, esta revisão não a viu. A vizinhança existente sustenta todas essas pastas.
- O S41 em lane `codigo` e o PR-009 como predicado puro (T15) são desvios aprovados pelo usuário. Aceitei os dois sem rejulgar.
- O passo 21 passa `'default'` fixo para `isCaptureOpenable`, porque o chat não passa `state` ao `Root` hoje. Aceitei, porque a spec (PR-009) diz que o estado de erro com card não se reproduz pelo fluxo real.
- O teste do `menu-store` (T14) roda em node com zustand 5 e react 19 instalados. Assumi que `create` importa sem ambiente DOM, como os stores globais já usados por `getState()` no `pages/chat/page.tsx`.
- Conferi as 63 linhas S/T do plano contra o `roteiro.md`: são idênticas fora a marca de rodada, e só o S41 muda, por desvio declarado. A cobertura bate 4/4 RT, 10/10 PR e 12/12 CB contra a spec.
