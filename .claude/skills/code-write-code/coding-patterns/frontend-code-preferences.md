# Front-end Code Preferences

Preferences for `project-web`, captured from review corrections. They complement the focused front-end patterns; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [general](./general-code-preferences.md) and [back-end](./backend-code-preferences.md) preferences.

## File names are kebab-case

```
// Wrong way
useChatMessages.ts
MenuSidebar.tsx

// Correct way
use-chat-messages.ts
menu-sidebar.tsx
```

## Prefer `*-root` over `*-shell` for top-level wrappers

```tsx
// Wrong way
export function TaskWorkspaceShell() { ... }

// Correct way
export function TaskWorkspaceRoot() { ... }
```

## Shared components live in `layout/components`

When two or more pages share the same component (backed by shared stores/hooks), move it to `src/layout/components` instead of duplicating a per-page `{component}-design` variant in each page.

## API-call function names signal the network call

Files that only wrap API-route calls live in the api-client location, and their functions carry a marker that makes the network call explicit instead of a generic verb.

```typescript
// Wrong way — reads like a plain in-memory helper
listActiveTasks()

// Correct way — name signals an API request
fetchActiveTasksRequest()
```

## `api/models` holds only models; DTOs go to `api/responses`

Keep model files limited to the model definition; move response/payload shapes to a dedicated `api/responses` folder.

## Declare routes via the `routes.ts` pattern

Do not introduce ad-hoc path builders (`buildTaskWorkspacePath`); declare routes following the established `api/routes.ts` pattern.

## Do not over-split a small store

When a store folder would hold only two files, keep it in a single file; do not create separate `index.ts` + `types.ts` until size justifies the split. Avoid duplicated exports.

## Lazy-load list data on interaction

Do not eagerly load list data (notes, reminders, tasks) at a container root; defer loading to the inner component that actually needs it, triggered by user interaction.

## Use `useAtom` when reading and writing the same atom

```tsx
// Wrong way
const draft = useAtomValue(draftAtom)
const setDraft = useSetAtom(draftAtom)

// Correct way
const [draft, setDraft] = useAtom(draftAtom)
```

## Collapse multiple boolean props into one state param

```tsx
// Wrong way
<Card isLoading isSelected isDisabled />

// Correct way
<Card state={cardState} />
```
