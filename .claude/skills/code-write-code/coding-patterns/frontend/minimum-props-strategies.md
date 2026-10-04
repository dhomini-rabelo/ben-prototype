# Minimum Props Strategies

Strategies used in this project to keep component interfaces lean, avoid prop drilling, and improve local component ownership.

## 1 Zustand stores with selectors

Components read only the state slices and actions they need directly from Zustand stores.
This avoids passing domain data and callbacks through intermediary components.

```tsx
const deleteSubtask = useTasksState((store) => store.actions.deleteSubtask);
const saveEditingSubtask = useTasksState((store) => store.actions.saveEditingSubtask);

const user = useAuthStore((s) => s.state.user);
const { login, logout } = useAuthStore((s) => s.actions);
```

Typical stores:
- `stores/tasks/index.ts`
- `stores/workflows/index.ts`
- `stores/auth/index.ts`

## 2 Jotai atoms for shared UI state

Use Jotai for ephemeral, feature-scoped, cross-component UI state (editing, expanded item, active dialog, selected sector).
This removes the need to lift transient UI state into parents.

```tsx
export const indexTasksPageStateAtom = atom<IndexTasksPageState>({
  editingTaskId: null,
  inExecutionTaskId: null,
  nonActiveExpandedTaskId: null,
});

export const activeSectorAtom = atom<{
  sectorId: string | null;
  categories: SelectMultipleCheckOptionData[];
}>({
  sectorId: null,
  categories: [],
});
```

Use colocated atom files (for example, feature-level state.ts or shared-state.ts) to signal feature scope instead of global state.

## 3 Dialog state hooks

Encapsulate modal lifecycle in hooks so parents pass only intent (a dialog key), not multiple open/close flags and handlers.

```tsx
export const sectorFormDialogAtom = atom<SectorFormDialogs | null>(null); // state.ts file

const { disableDialog } = useDialogs<SectorFormDialogs>(sectorFormDialogAtom);
```

## 4 Form context instead of form props

Wrap forms with FormProvider and let children consume form APIs via useFormContext.
This eliminates passing control, formState, setValue, watch, and related props through layers.

```tsx
export function TaskForm({ initialFormData, onSubmit }: TaskFormProps) {
  const form = useForm<TaskSchemaType>({ /* ... */ });

  return (
    <FormProvider {...form}>
      <form>
        <SectorSelect />
        <PrioritySelect />
        <SectorCategoryMultipleSelect />
      </form>
    </FormProvider>
  );
}

export function PrioritySelect() {
  const { control, formState } = useFormContext<TaskSchemaType>();
  // ...
}
```

## 5 Custom hooks for derived state and local logic

Encapsulate filtering, derivation, and local orchestration in hooks so parents do not compute and pass derived lists.

```tsx
export function useListingTasks({ inExecutionTaskId }) {
  const tasks = useTasksState((props) => props.state.tasks);
  const selectedWorkflowId = useWorkflowsState((props) => props.state.selectedWorkflowId);
  // ...derive listingTasks, activeTasks, completedTasks
  return { tasks, listingTasks, activeTasks, completedTasks };
}
```

Similarly, hooks like useMultipleSelect and useSelect package state/actions into a coherent local API.

## 6 Granular component decomposition

Split large components into focused sub-components that pull their own data from hooks/context/atoms.
Parents should pass only minimal identity or rendering props.

Examples:
- IndexAddInput: listingMode, taskId
- IndexTaskItem: task, isActive, dragHandleProps
- IndexTaskAccordionSubtaskItem: taskId, subtask, className
- IndexErrorMessage: no props (reads atom internally)

## 7 Composition with children

Prefer composition over configuration-heavy props when defining layout/content structures.
A configuration-heavy component (one `tone`, `icon`, `action`, `dismissible`, `onDismiss`, `children` API) becomes a set of focused parts the caller composes, passing only what each part needs:

```tsx
<ChatBanner.Root tone="error">
  <ChatBanner.Icon icon={AlertCircle} />
  <ChatBanner.Text>mic glitched — try again or type it</ChatBanner.Text>
  <ChatBanner.Action label="Retry" onClick={retryVoice} />
  <ChatBanner.Dismiss onClick={dismissError} />
</ChatBanner.Root>
```

### File organization

Give each compound component its own folder, one file per part, and expose the namespace from `index.tsx`. Callers keep importing the folder (`.../chat-banner`), so `index.tsx` resolves automatically.

```
chat-banner/
  index.tsx              # builds and exports the ChatBanner namespace object
  chat-banner-root.tsx   # ChatBannerRoot — container, owns shared state
  chat-banner-icon.tsx   # ChatBannerIcon
  chat-banner-text.tsx   # ChatBannerText
  chat-banner-action.tsx # ChatBannerAction
  chat-banner-dismiss.tsx# ChatBannerDismiss
  contexts/
    tone.ts              # shared state context + hook consumed by the parts
```

Rules:
- One part per file. The file is named after the part in kebab-case (`chat-banner-action.tsx`), and exports a single named function component (`ChatBannerAction`).
- State shared across parts (here the `tone`) lives in a `contexts/` file as a React context plus a `use…` hook. `Root` provides it; the other parts consume it instead of receiving it as a prop.
- `index.tsx` only imports the parts and assembles the namespace — it declares no components:

```tsx
import { ChatBannerAction } from "./chat-banner-action";
import { ChatBannerDismiss } from "./chat-banner-dismiss";
import { ChatBannerIcon } from "./chat-banner-icon";
import { ChatBannerRoot } from "./chat-banner-root";
import { ChatBannerText } from "./chat-banner-text";

export const ChatBanner = {
  Root: ChatBannerRoot,
  Icon: ChatBannerIcon,
  Text: ChatBannerText,
  Action: ChatBannerAction,
  Dismiss: ChatBannerDismiss,
};
```

Keeping the namespace object alone in `index.tsx` (no component declarations beside it) also satisfies `react-refresh/only-export-components` without a disable directive.

For a small compound component that does not need shared state, a single file that declares the parts and exports the namespace object is acceptable — split into a folder once it grows or needs a shared context.

## Quick mapping: pattern to props eliminated

| Pattern | Props avoided |
|---|---|
| Zustand selectors | action callbacks, domain data threading |
| Jotai atoms | ephemeral UI flags and sibling coordination props |
| Dialog hooks | open/close booleans and handler chains |
| FormProvider + useFormContext | form API props (control, setValue, formState, etc.) |
| Custom hooks | derived lists and orchestration props |
| Granular components | intermediary forwarding props |
| Composition with children | configuration-style content props |

## Practical rule of thumb

Before adding a new prop, check this order:
1. Is this global/domain state? Use a store selector.
2. Is this feature-local shared UI state? Use a colocated atom.
3. Is this form state? Use FormProvider + useFormContext.
4. Is this derivation/logic? Move it to a custom hook.
5. Is this layout/content customization? Use children composition.
6. If none apply, pass the prop directly and keep it minimal.
