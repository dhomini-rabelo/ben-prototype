# Relatório — Status de Componentes e Telas

Avaliação do que **já está pronto** versus **o que falta construir**, comparando a especificação de design (`project-design`) com a implementação real (`project-web`).

> Data: 2026-06-04

## Como a avaliação foi feita

A comparação usa duas fontes:

- **Spec / fonte da verdade:** a galeria do **`project-design`**, registrada em `project-design/src/core/screens.ts` — **7 grupos de telas (77 estados)** e **22 componentes** — somada ao design system em `docs/design.md`.
- **Implementação / "pronto":** o **`project-web`** (app web real), cujas rotas estão em `project-web/src/core/router.tsx`: `/` (login), `/chat` e `/tasks/:taskId` (task workspace).

Uma tela/componente é considerado **pronto** quando existe e está roteado/usado no `project-web`. É **a construir** quando só existe como design no `project-design`.

## Resumo executivo

| Categoria | Total na spec | Prontos | A construir |
| --- | --- | --- | --- |
| **Grupos de tela** | 7 | 5 | 2 |
| **Componentes** | 22 | 18 | 4 |

- **Prontos:** Login, Chat (com capture cards e seletor de tarefa ativa) e Task Workspace — o fluxo central de captura por voz/texto está funcional ponta a ponta.
- **A construir:** o **Menu lateral** (listas de Tasks/Notes/Reminders + Settings) e o **modal de detalhe de item**, além do estado de **pergunta de esclarecimento** ("clarifying question") dentro dos capture cards.

## Telas — status detalhado

| Tela (project-design) | Estados desenhados | Implementação no project-web | Status |
| --- | --- | --- | --- |
| **Login** (`Sign in`) | 5 — empty, loading, error, permission-denied, extended-wait | `/` → `pages/login/page.tsx` | ✅ Pronto |
| **Chat** | 11 — empty, loading, populated, composing, recording, transcribing, awaiting-reply, error, permission-denied, offline, edge-cases | `/chat` → `pages/chat/` | ✅ Pronto |
| **Inline Capture Cards** | 16 — note/reminder/task (loading, populated, error, edge) + clarifying-question | `pages/chat/components/capture-card/` (note, reminder, task) | ⚠️ Parcial |
| **Active-task picker** | 5 — empty, loading, populated, error, edge-cases | `pages/chat/components/task-picker/` | ✅ Pronto |
| **Task workspace** | 12 — empty, text/list populated, composing, recording, transcribing, pending-diff, error, permission-denied, offline, finished, edge | `/tasks/:taskId` → `pages/task-workspace/` | ✅ Pronto |
| **Menu sidebar** | 23 — sidebar + Tasks + Notes + Reminders + Settings (cada um com empty/populated/loading/error/edge) | — | ❌ A construir |
| **Item detail modal** | 5 — note, reminder, loading, error, edge-cases | — | ❌ A construir |

### Observação sobre os Capture Cards (parcial)

O componente de capture card no `project-web` cobre os três tipos (`note`, `reminder`, `task`) e os estados `default`, `pending`, `error`, `active`, `finished`, `fired` (ver `pages/chat/components/capture-card/types/index.ts`). O que **não** foi implementado é o estado de **pergunta de esclarecimento** (`capture-clarifying-question`), que existe na spec — alinhado ao item "Tool para perguntar mais contexto" listado em `docs/v1.md`.

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
| `chat-banner` | `layout/components/chat-banner/` | ✅ Pronto |
| `suggested-action` | `pages/chat/components/suggested-action.tsx` | ✅ Pronto |
| `workspace-top-bar` | `pages/task-workspace/components/workspace-top-bar/` | ✅ Pronto |
| `todo-list-item` | `pages/task-workspace/components/todo-content/todo-list-item.tsx` | ✅ Pronto |
| `diff-bar` | `pages/task-workspace/components/diff-bar/` | ✅ Pronto |
| `sub-thread-banner` | `pages/task-workspace/components/sub-thread-banner/` | ✅ Pronto |
| `task-picker-sheet` | `pages/chat/components/task-picker/task-picker-sheet.tsx` | ✅ Pronto |
| `item-detail-sheet` | — | ❌ A construir |
| `menu-sidebar` | — | ❌ A construir |
| `menu-list-row` | — | ❌ A construir |
| `settings-sheet` | — | ❌ A construir |

### Componentes extras no project-web (fora da galeria)

O `project-web` decompôs a UI em peças estruturais que não constam como entradas separadas na galeria, mas dão suporte às telas prontas: `chat-empty-state`, `chat-footer`, `chat-history` (+ skeleton), `chat-top-bar`, `chat-top-banner`, `message-footers` (retry / transcribing), `recording-bar`, `text-content`, `todo-content` (+ `add-todo-row`), `workspace-footer`, `workspace-top-banner` e `workspace-sub-thread-banner`.

## O que falta construir

Em ordem sugerida de prioridade:

1. **Menu lateral + listas de itens** (`menu-sidebar`)
   - Telas: `Tasks`, `Notes`, `Reminders` e `Settings`, cada uma com os estados empty / populated / loading / error / edge-cases.
   - Componentes de suporte: `menu-sidebar`, `menu-list-row`, `settings-sheet`.
   - O backend **já suporta** os dados necessários — há entidades `note`, `reminder` e `task` em `project-backend/src/domain/entities/` e use cases em `captures/` e `tasks/`. O gargalo é apenas de frontend.
2. **Modal de detalhe de item** (`item-detail`)
   - Telas: detalhe de `note`, detalhe de `reminder`, loading, error, edge-cases.
   - Componente de suporte: `item-detail-sheet`.
3. **Pergunta de esclarecimento nos Capture Cards** (`capture-clarifying-question`)
   - Adicionar o estado de "clarifying question" ao fluxo de captura no chat (referência: `docs/v1.md` — "Tool para perguntar mais contexto").

## Conclusão

O **fluxo principal de captura** (login → chat por voz/texto → capture cards → task workspace) está **pronto e funcional** no `project-web`, cobrindo **5 dos 7 grupos de tela** e **18 dos 22 componentes** da spec.

A lacuna concentra-se na **camada de navegação e consulta**: o usuário ainda não consegue **navegar/listar** suas notas, lembretes e tarefas (menu lateral), **abrir o detalhe** de um item, nem **ajustar configurações** — apesar de o backend já modelar esses dados. Esse é o próximo bloco de trabalho de frontend a ser construído.
