# Code Patterns

- Use descriptive names for variables, functions, and classes.

```typescript
// Wrong way
const list1 = []
list1.push({
  name: 'John Doe',
  testScore: 10,
})

// Correct way
const students = []
students.push({
  name: 'John Doe',
  testScore: 10,
})

// Wrong way
const invalidDays = [0, 6]

// Correct way
const weekendDays = [0, 6]

// Wrong way
function filterBody(body) {
  return Object.entries(body).reduce((acc, [key, value]) => {
    return value === undefined ? acc : { ...acc, [key]: value }
  })
}

// Correct way
function removeKeysWithUndefinedValue(object) {
  return Object.entries(object).reduce((acc, [key, value]) => {
    return value === undefined ? acc : { ...acc, [key]: value }
  })
}

```

- Use descriptive boolean variable names.

```typescript
// Wrong way
const runMigration = true
const admin = true
const validOption = true
const permission = true

// Correct way
const shouldRunMigration = true
const isAdmin = true
const isOptionValid = true
const doesUserHavePermission = true
```

- Use object.property instead of destructuring in const declarations.

```typescript
// wrong way
const { audioBuffer } = payload

// correct way
payload.audioBuffer
```

```typescript
// wrong way
const audioBuffer = payload.audioBuffer

// correct way
payload.audioBuffer
```

- Use `??` for null/undefined fallbacks, not `||`.

```typescript
// Wrong way
const remindAt = draft.remindAt || null
const items = draft.todoItems || []

// Correct way
const remindAt = draft.remindAt ?? null
const items = draft.todoItems ?? []
```

- Convert raw string ids from a payload into the `ID` value class with `createID()` at the use-case entry point, before passing them to repositories.

```typescript
// Wrong way
async execute(payload: Payload) {
  return this.taskRepository.get({ id: payload.taskId })
}

// Correct way
async execute(payload: Payload) {
  return this.taskRepository.get({
    id: createID(payload.taskId),
    userId: createID(payload.userId),
  })
}
```

- Throw `DomainError` with both a `code` and a classified `errorType` from `DangerErrors`, never a bare `Error`.

```typescript
// Wrong way
throw new Error('Task not found')

// Correct way
throw new DomainError({
  code: 'TASK_NOT_FOUND',
  errorType: DangerErrors.NOT_FOUND,
})
```

- Use the `HttpStatus` enum for response status codes, not numeric literals.

```typescript
// Wrong way
return res.status(200).json(body)

// Correct way
return res.status(HttpStatus.OK).json(body)
```

- Name Zod schemas after their subject with a `Schema` suffix.

```typescript
// Wrong way
const schema = z.object({ id: z.string() })

// Correct way
const paramsSchema = z.object({ id: z.string() })
const reminderDraftSchema = z.object({ title: z.string() })
```

- Merge Tailwind classes with the `cn()` helper (`@/layout/utils/styles`); never concatenate class strings by hand.

```tsx
// Wrong way
<div className={'flex items-center ' + (isActive ? 'opacity-100' : 'opacity-60')} />

// Correct way
<div className={cn('flex items-center', isActive ? 'opacity-100' : 'opacity-60', className)} />
```

- Name magic numbers as module-level constants instead of inlining them.

```typescript
// Wrong way
const intervalId = setInterval(() => reveal(3), 24)

// Correct way
const TYPING_STEP_MS = 24
const TYPING_CHARS_PER_STEP = 3

const intervalId = setInterval(() => reveal(TYPING_CHARS_PER_STEP), TYPING_STEP_MS)
```

- In `project-mobile`, give a `Pressable` press feedback with NativeWind `active:` variants, not the `({ pressed }) => ...` render-callback form (which the project's NativeWind typing does not support).

```tsx
// Wrong way
<Pressable onPress={onPress}>
  {({ pressed }) => (
    <Text className={cn('text-primary', pressed && 'underline')}>{label}</Text>
  )}
</Pressable>

// Correct way
<Pressable onPress={onPress}>
  <Text className="text-primary active:underline">{label}</Text>
</Pressable>
```

- In `project-mobile`, generate client-side ids with `randomUUID()` from `expo-crypto`, not the web `crypto.randomUUID()` (which is not available in the React Native runtime).

```typescript
// Wrong way
const id = crypto.randomUUID()

// Correct way
import { randomUUID } from 'expo-crypto'

const id = randomUUID()
```
