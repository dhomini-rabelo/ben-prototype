# General Code Preferences

Cross-cutting preferences captured from review corrections that apply to **both** projects. They complement the focused patterns and designs; when a rule here overlaps a dedicated pattern, the dedicated pattern still applies for its own topic. See also the [front-end](./frontend-code-preferences.md) and [back-end](./backend-code-preferences.md) preferences.

## Apply a change across every matching file and layer

When a field, model, pattern, or shared interface changes, propagate it to **all** affected files and layers — not just the one in focus. Enumerate the siblings first, then cover them all.

```typescript
// Wrong way — rename only where the bug was spotted
interface UserProps {
  avatarUrl: string
  createdAt: Date
}
// ...adapter still builds the old shape, web client still reads the old field

// Correct way — propagate to entity + every adapter/mapper + the web client
// entity, in-memory repo, db mapper, presenter, and consuming web types all updated together
```

## Sync the web client when a backend contract changes

A backend response/contract change is not done until the consuming `project-web` client is updated to match, in the same task.

## Web-search the correct approach instead of guessing

When a fix does not work and the cause is unclear, search the web for the idiomatic/correct approach before trying another guess. Reinforces the project's `NO GUESSING` rule.

## Augment existing structure when asked to "add X"

When asked to add something to an existing file or doc, preserve its current structure and only add the requested element. Never silently rewrite it into a new format.

## Use path-alias imports, not deep relative paths

```typescript
// Wrong way
import { createID } from '../../../modules/domain/id'

// Correct way
import { createID } from '@/modules/domain/id'
```

## Delete the original file after splitting it

After splitting a component (or module) into smaller units, remove the original monolithic file and place the new units in their conventional folder — never leave dead duplicates alongside the new files.
