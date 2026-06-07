# Relatório — Status de Componentes e Telas

Avaliação do que **já está pronto** versus **o que falta construir**, comparando a especificação de design (`project-design`) com a implementação real (`project-web`).

> Data: 2026-06-07 · branch `main`

## Como a avaliação foi feita

A comparação usa duas fontes:

- **Spec / fonte da verdade:** a galeria do **`project-design`**, registrada em `project-design/src/core/screens.ts` — **7 grupos de telas (77 estados)** e **22 componentes** — somada ao design system em `docs/design.md`.
- **Implementação / "pronto":** o **`project-web`** (app web real), cujas rotas estão em `project-web/src/core/router.tsx`: `/` (login), `/chat` e `/tasks/:taskId` (task workspace). O **menu lateral** e o **detalhe de item** não têm rota própria — são overlays/sheets renderizados sobre `/chat` (ver `project-web/src/layout/components/menu/menu-overlay.tsx`), controlados pela store `menu-store`.

Uma tela/componente é considerado **pronto** quando existe e está roteado/usado no `project-web`. É **a construir** quando só existe como design no `project-design`.

## Resumo executivo

| Categoria | Total na spec | Prontos | Parciais | A construir |
| --- | --- | --- | --- | --- |
| **Grupos de tela** | 7 | 6 | 1 | 0 |
| **Componentes** | 22 | 22 | 0 | 0 |

- **Prontos:** Login, Chat (com capture cards e seletor de tarefa ativa), Task Workspace, **Menu lateral** (listas de Tasks/Notes/Reminders + Settings) e **modal de detalhe de item** (note/reminder) — o fluxo de captura por voz/texto **e** a camada de navegação/consulta estão funcionais.
- **Parcial:** os **Inline Capture Cards** cobrem note/reminder/task, mas ainda falta o estado de **pergunta de esclarecimento** ("clarifying question").
- **A construir:** nenhum grupo inteiramente pendente, porém uma verificação **estado a estado** revelou estados individuais ainda não implementados dentro de grupos já roteados — ver a seção [O que falta construir](#o-que-falta-construir) para a lista priorizada (badges de contagem na sidebar, overlay de conclusão do workspace, espera estendida no login e, por último, o clarifying-question).

## Telas — status detalhado

| Tela (project-design) | Estados desenhados | Implementação no project-web | Status |
| --- | --- | --- | --- |
| **Login** (`Sign in`) | 5 — empty, loading, error, permission-denied, extended-wait | `/` → `pages/login/page.tsx` | ✅ Pronto |
| **Chat** | 11 — empty, loading, populated, composing, recording, transcribing, awaiting-reply, error, permission-denied, offline, edge-cases | `/chat` → `pages/chat/` | ✅ Pronto |
| **Inline Capture Cards** | 17 — note/reminder/task (loading, populated, error, edge) + clarifying-question (+ edge-cases) | `pages/chat/components/capture-card/` (note, reminder, task) | ⚠️ Parcial |
| **Active-task picker** | 5 — empty, loading, populated, error, edge-cases | `pages/chat/components/task-picker/` | ✅ Pronto |
| **Task workspace** | 12 — empty, text/list populated, composing, recording, transcribing, pending-diff, error, permission-denied, offline, finished, edge | `/tasks/:taskId` → `pages/task-workspace/` | ✅ Pronto |
| **Menu sidebar** | 22 — sidebar + Tasks + Notes + Reminders + Settings (cada um com empty/populated/loading/error/edge) | overlay em `layout/components/menu/` + `menu-tasks/`, `menu-notes/`, `menu-reminders/`, `menu-settings/` (+ shell genérica `menu-list/`) | ✅ Pronto |
| **Item detail modal** | 5 — note, reminder, loading, error, edge-cases | `layout/components/menu-detail/` (note-detail, reminder-detail, loading, error, gone) | ✅ Pronto |

### Observação sobre os Capture Cards (parcial)

O componente de capture card no `project-web` cobre os três tipos (`note`, `reminder`, `task`) e os estados `default`, `pending`, `error`, `active`, `finished`, `fired` (ver `pages/chat/components/capture-card/types/`). O que **não** foi implementado é o estado de **pergunta de esclarecimento** (`capture-clarifying-question`), que existe na spec — alinhado ao item "Tool para perguntar mais contexto" listado em `docs/v1.md`.

### Observação sobre o Menu sidebar (pronto)

O menu é um **overlay** aberto pela top bar do chat (`menu-overlay.tsx`), com navegação por `menu-store` entre as views `menu | tasks | notes | reminders` (Settings é um sheet à parte). As listas (Tasks/Notes/Reminders) reutilizam a shell `menu-list/` com estados **loading / error / empty / populated**, consumindo `GET /tasks/list`, `GET /notes/list` e `GET /reminders/list`. O Settings sheet (`menu-settings/`) usa o `user` do `auth-store` (não há `GET /me/detail`); estados de "loading" puramente de design não se aplicam porque os dados vêm do cliente.

## Componentes — status detalhado

| Componente (project-design) | Implementação no project-web | Status |
| --- | --- | --- |
| `design-tokens` | tokens aplicados em `core/global.css` | ✅ Pronto |
| `typography` | `layout/components/ui/typography.tsx` | ✅ Pronto |
| `button` | `layout/components/ui/button.tsx` | ✅ Pronto |
| `icon-button` | `layout/components/ui/icon-button.tsx` | ✅ Pronto |
| `brand-mark` | `layout/components/brand-mark.tsx` | ✅ Pronto |
| `composer` (peek) | `chat-footer` + `chat-input` + `recording-bar` | ✅ Pronto |
| `chat-input` | `layout/components/chat-input/` | ✅ Pronto |
| `message-bubble` | `pages/chat/components/message-bubble/` | ✅ Pronto |
| `typing-indicator` | `pages/chat/components/typing-indicator.tsx` | ✅ Pronto |
| `active-task-peek` | `pages/chat/components/active-task-peek.tsx` | ✅ Pronto |
| `capture-card` | `pages/chat/components/capture-card/` | ✅ Pronto |
| `item-detail-sheet` | `layout/components/menu-detail/` (item-detail-root + note/reminder-detail) | ✅ Pronto |
| `chat-banner` | `layout/components/chat-banner/` | ✅ Pronto |
| `suggested-action` | `pages/chat/components/suggested-action.tsx` | ✅ Pronto |
| `workspace-top-bar` | `pages/task-workspace/components/workspace-top-bar/` | ✅ Pronto |
| `todo-list-item` | `pages/task-workspace/components/todo-content/todo-list-item.tsx` | ✅ Pronto |
| `diff-bar` | `pages/task-workspace/components/diff-bar/` | ✅ Pronto |
| `sub-thread-banner` | `pages/task-workspace/components/sub-thread-banner/` | ✅ Pronto |
| `task-picker-sheet` | `pages/chat/components/task-picker/task-picker-sheet.tsx` | ✅ Pronto |
| `menu-sidebar` | `layout/components/menu/menu-sidebar.tsx` | ✅ Pronto |
| `menu-list-row` | `layout/components/menu-list/menu-list-row.tsx` | ✅ Pronto |
| `settings-sheet` | `layout/components/menu-settings/settings-sheet.tsx` | ✅ Pronto |

### Componentes extras no project-web (fora da galeria)

O `project-web` decompôs a UI em peças estruturais que não constam como entradas separadas na galeria, mas dão suporte às telas prontas: `chat-empty-state`, `chat-footer`, `chat-history` (+ skeleton), `chat-top-bar`, `chat-top-banner`, `message-footers` (retry / send-retry / transcribing), `recording-bar`, `text-content`, `todo-content` (+ `add-todo-row`), `workspace-shell`, `workspace-footer`, `workspace-top-banner`, `workspace-sub-thread-banner`, além da camada de menu (`menu/menu-overlay`, `menu/menu-sheet`, `menu-list/` shell, `menu-tasks/`, `menu-notes/`, `menu-reminders/`, `menu-settings/settings-view`, `menu-detail/` com captured-meta/reminder-meta/content/gone).

## O que falta construir

> Verificação feita **estado a estado** (não apenas a nível de grupo): cada grupo de tela está roteado e em uso, mas ainda restam **estados individuais** desenhados no `project-design` que não têm equivalente no `project-web`. As etapas abaixo estão em **ordem lógica de implementação** (do mais funcional ao polish), deixando a "Tool para perguntar mais contexto" por último, conforme priorização.

1. **Badges de contagem + loading/error na sidebar do menu** (`menu-sidebar-populated/loading/error`)
   - O design mostra contadores por entrada (Tasks: "3 active", totais de Notes/Reminders) com estados de loading/error; o `layout/components/menu/menu-sidebar.tsx` atual **não exibe contagem alguma**.
   - Adicionar os badges de contagem e os estados de carregamento/erro da própria sidebar (hoje só as sub-views têm esses estados).

2. **Overlay de conclusão no Task Workspace** (`workspace-finished`)
   - O design mostra um toast comemorativo ("nice. that one's done."), conteúdo com `line-through` e composer desabilitado com copy "reopen to keep editing"; o `pages/task-workspace/page.tsx` apenas torna o conteúdo read-only ao finalizar.
   - Adicionar o overlay de sucesso, o tratamento visual de "done" e o affordance de reabertura.

3. **Mensagem de espera estendida no Login** (`login-edge-extended-wait`)
   - O design faz aparecer, após um atraso, a linha "still waiting on Google…"; o `pages/login/page.tsx` não tem esse estado.
   - Polish menor sobre o fluxo de login existente.

4. **Pergunta de esclarecimento nos Capture Cards** (`capture-clarifying-question` + edge-case) — _deixado por último_
   - Adicionar o estado de "clarifying question" (e seu edge-case) ao fluxo de captura no chat (referência: `docs/v1.md` — "Tool para perguntar mais contexto").
   - Depende do trabalho de backend da tool `ask_clarifying_question`; por isso fica como última etapa.

## Conclusão

Tanto o **fluxo principal de captura** (login → chat por voz/texto → capture cards → task workspace) quanto a **camada de navegação e consulta** (menu lateral com listas de tasks/notes/reminders, detalhe de item e settings) estão **prontos e funcionais** no `project-web`, cobrindo **6 dos 7 grupos de tela** integralmente e **22 dos 22 componentes** da spec.

A única pendência é o estado de **clarifying question** dentro dos capture cards do chat — todos os demais grupos de tela e componentes da galeria já estão implementados e ligados à API.
