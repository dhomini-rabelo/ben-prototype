# Refatorar `project-web/src/layout/components/menu/` para os padrões do projeto

## Context

O componente `menu/` (acionado pelo `MenuOverlay` na página de chat) funciona, mas suas
*views* divergem do padrão de composição usado no resto do `project-web`. A referência
canônica é o `task-picker/` (`src/pages/chat/components/task-picker/`), que quebra cada
estado (loading / error / empty / list) em **arquivos-irmãos dedicados** compostos por um
orquestrador fino (`active-task-picker.tsx`).

O `menu/` em vez disso:

1. **Inlina** loading/error/empty/list em ternários grandes dentro de cada *view*
   (`menu-tasks-view.tsx`, `menu-notes-view.tsx`, `menu-reminders-view.tsx`).
2. **Cross-importa** `MenuListLoading` de um arquivo-irmão de *view*
   ([menu-notes-view.tsx:8](project-web/src/layout/components/menu/menu-notes-view.tsx#L8),
   [menu-reminders-view.tsx:8](project-web/src/layout/components/menu/menu-reminders-view.tsx#L8)) —
   o skeleton mora *dentro* de `menu-tasks-view.tsx` ([linha 95](project-web/src/layout/components/menu/menu-tasks-view.tsx#L95)).
   Isso é o anti-padrão mais claro (o correto é um arquivo `*-skeleton`/`*-loading` próprio,
   como `task-picker-skeleton.tsx`).
3. **Duplica** a marcação de empty-state e error-banner nas três views.
4. **Duplica** o "chrome" do bottom-sheet (container + drag handle + sombra) entre
   [item-detail-sheet.tsx:55-63](project-web/src/layout/components/menu/item-detail-sheet.tsx#L55-L63) e
   [settings-sheet.tsx:27-35](project-web/src/layout/components/menu/settings-sheet.tsx#L27-L35) —
   chrome idêntico ao `TaskPickerSheet`.

**Resultado esperado:** mesma aparência e comportamento, porém com a estrutura de
arquivos/composição alinhada ao padrão do `task-picker`. Escopo confirmado com o usuário:
**views + sheets**; a lógica imperativa de sign-out em `settings-view.tsx` fica **como está**.

> Nota: imports relativos entre irmãos (`./x`) e arquivos "flat" na raiz da pasta **já são
> o padrão** do projeto (`capture-card/`, `task-picker/`, `chat-input/`) — **não** mudar isso.

## Padrão de referência (não criar nada novo — copiar este)

`task-picker/` →
[active-task-picker.tsx](project-web/src/pages/chat/components/task-picker/active-task-picker.tsx)
compõe estados assim:

```tsx
{state.isLoading ? <TaskPickerSkeleton />
 : state.isError ? <TaskPickerError onRetry={() => actions.refetch()} />
 : tasks.length === 0 ? <TaskPickerEmpty />
 : <TaskPickerList tasks={tasks} onSelect={...} />}
```

- Skeleton em arquivo próprio com const nomeada (`SKELETON_ROWS`), não `[0,1,2,3,4]` inline —
  ver [task-picker-skeleton.tsx](project-web/src/pages/chat/components/task-picker/task-picker-skeleton.tsx).
- Sheet chrome compartilhado num wrapper (`TaskPickerSheet`).

## Mudanças

Tudo dentro de `project-web/src/layout/components/menu/`. Imports entre irmãos: relativos
(`./x`); imports externos: alias `@/`.

### 1. Estado compartilhado das listas (novos arquivos)

- **`menu-list-loading.tsx`** — mover a função `MenuListLoading` que hoje está em
  `menu-tasks-view.tsx:95-110` para cá. Usar uma const nomeada `SKELETON_ROWS = [0,1,2,3,4]`
  (estilo `task-picker-skeleton.tsx`). Resolve o cross-import.
- **`menu-list-empty.tsx`** — extrai o empty-state repetido. Props: `title: string` e
  `description: ReactNode` (reminders passa um `description` com `<span font-mono>`).
  Reusar o layout de [menu-tasks-view.tsx:37-44](project-web/src/layout/components/menu/menu-tasks-view.tsx#L37-L44).
- **`menu-list-error.tsx`** — extrai o `ChatBanner.Root tone="error"` repetido nas 3 views.
  Props: `message: string`, `onRetry: () => void`. Reusar
  [menu-tasks-view.tsx:29-35](project-web/src/layout/components/menu/menu-tasks-view.tsx#L29-L35).

### 2. Corpos de lista por view (novos arquivos)

Extrair o JSX que renderiza os itens (apenas o ramo "populated") para arquivos dedicados,
recebendo os dados já buscados via props (espelha `task-picker-list.tsx`):

- **`menu-tasks-list.tsx`** — seções Active/Finished (de `menu-tasks-view.tsx:46-89`), inclui o helper `taskKind`.
- **`menu-notes-list.tsx`** — lista plana de notes (de `menu-notes-view.tsx:41-52`).
- **`menu-reminders-list.tsx`** — seções Upcoming/Fired (de `menu-reminders-view.tsx:50-99`).

### 3. Views viram orquestradores finos (refatorar)

`menu-tasks-view.tsx`, `menu-notes-view.tsx`, `menu-reminders-view.tsx`: cada uma faz o fetch
(`useTaskListData`/`useNoteListData`/`useReminderListData`), envolve em `MenuListShell` e
compõe o ternário loading→error→empty→list usando os componentes dos passos 1 e 2 —
exatamente o formato de `active-task-picker.tsx`. Assinaturas de props (`onBack`, `onSelect`)
e textos permanecem idênticos.

### 4. Dedup do bottom-sheet (novo + refatorar)

- **`menu-sheet.tsx`** (novo) — wrapper com o chrome comum: container
  `flex w-full flex-col rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]`
  + a barra de arraste (`h-1 w-10 rounded-full bg-outline-variant/60`) **centralizada**
  (`justify-center`). Props: `children: ReactNode`, `className?: string`. Modelo:
  [task-picker-sheet.tsx](project-web/src/pages/chat/components/task-picker/task-picker-sheet.tsx)
  (mantido onde está; não tocar no task-picker).
- **`item-detail-sheet.tsx`** — passar a renderizar `<MenuSheet>` em volta do conteúdo;
  remover o `div` container e a linha do drag handle próprios
  ([linhas 55-63](project-web/src/layout/components/menu/item-detail-sheet.tsx#L55-L63)).
  O header (ícone + label + botão X) continua dentro, como children.
- **`settings-sheet.tsx`** — idem: usar `<MenuSheet>`, remover container + drag handle
  ([linhas 27-35](project-web/src/layout/components/menu/settings-sheet.tsx#L27-L35)).

> Efeito colateral intencional (alinhamento de padrão): o drag handle do `item-detail-sheet`
> hoje usa `justify-between` (fica à esquerda); com `MenuSheet` passa a ficar centralizado,
> igual aos demais sheets.

### Inalterados

`index.ts`, `menu-overlay.tsx`, `menu-sidebar.tsx`, `menu-list-shell.tsx`,
`menu-list-row.tsx`, `settings-view.tsx` (sign-out mantido), `note-detail.tsx`,
`reminder-detail.tsx`.

## Verificação

1. **Build/types/lint** (no `project-web`):
   ```bash
   cd /home/fael/so/repos/ben-prototype/project-web && npm run lint:fix && npx tsc --noEmit
   ```
2. **Manual** — rodar o app, abrir o chat e o `MenuOverlay`:
   - Navegar Tasks / Notes / Reminders → conferir estados loading, error (forçar falha de
     rede), empty e populated em cada uma.
   - Abrir o detail sheet de uma note e de um reminder (estados loading/error/gone/populated);
     conferir que o drag handle fica centralizado.
   - Abrir Settings → conferir avatar/nome/email e o botão Sign out (comportamento idêntico).
3. **Grep de regressão** — garantir que não sobrou import de `MenuListLoading` vindo de
   `./menu-tasks-view`:
   ```bash
   grep -rn "menu-tasks-view" project-web/src
   ```
