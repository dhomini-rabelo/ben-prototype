# Relatório — Status de Componentes e Telas

Avaliação do que **já está pronto** versus **o que falta construir**, comparando a especificação de design (`project-design`) com a implementação real (`project-web`).

> Data: 2026-06-06 · branch `main`

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
- **A construir:** nenhum grupo inteiramente pendente. A única lacuna é o estado de clarifying-question dentro dos capture cards.

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

1. **Pergunta de esclarecimento nos Capture Cards** (`capture-clarifying-question`)
   - Adicionar o estado de "clarifying question" (e seu edge-case) ao fluxo de captura no chat (referência: `docs/v1.md` — "Tool para perguntar mais contexto").
   - É a única lacuna funcional remanescente em relação à spec de telas.

## Conclusão

Tanto o **fluxo principal de captura** (login → chat por voz/texto → capture cards → task workspace) quanto a **camada de navegação e consulta** (menu lateral com listas de tasks/notes/reminders, detalhe de item e settings) estão **prontos e funcionais** no `project-web`, cobrindo **6 dos 7 grupos de tela** integralmente e **22 dos 22 componentes** da spec.

A única pendência é o estado de **clarifying question** dentro dos capture cards do chat — todos os demais grupos de tela e componentes da galeria já estão implementados e ligados à API.
