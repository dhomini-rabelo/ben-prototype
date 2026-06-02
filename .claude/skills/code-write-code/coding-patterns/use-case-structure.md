# Use Case Coding Patterns

A use case has a single public `execute` method. Its job is to read like a
short summary of what the use case does, delegating the real work to small,
well-named private methods. Use these patterns when creating or refactoring
any `UseCase` class.

## Keep `execute` as a summary of named steps

- `execute` builds the shared values it needs, delegates each responsibility to
  a private method, and composes the results.
- A reader should understand the whole flow from `execute` alone, without
  scrolling into the details of each step.
- Extract a private method for each distinct responsibility: each entity
  created, each branch resolved, each validation, each side effect.

```typescript
// Wrong way
async execute(payload: Payload): Promise<CaptureView[]> {
  const now = new Date()
  const reminderViews: CaptureView[] = []
  const taskViews: CaptureView[] = []

  for (const draft of payload.newReminders) {
    const reminder = await this.reminderRepository.create({ /* ... */ })
    reminderViews.push({ /* ... */ })
  }

  for (const draft of payload.newTasks) {
    const task = await this.taskRepository.create({ /* ... */ })
    taskViews.push({ /* ... */ })
  }

  return [...reminderViews, ...taskViews]
}

// Correct way
async execute(payload: Payload): Promise<CaptureView[]> {
  const now = new Date()

  const reminderViews = await this.createReminderViews(payload.userId, payload.newReminders, now)
  const taskViews = await this.createTaskViews(payload.userId, payload.newTasks, now)

  return [...reminderViews, ...taskViews]
}
```

## Name private methods after the outcome they produce

- Use verb-based names that describe the result of the step: `createReminderViews`,
  `buildLoginResponse`, `collectTopicSummaries`, `applyTextContent`.
- Avoid generic names that hide what the step does, such as `handleReminders`,
  `processStep`, or `doWork`.

```typescript
// Wrong way
private async handleReminders(/* ... */): Promise<CaptureView[]> {}

// Correct way
private async createReminderViews(/* ... */): Promise<CaptureView[]> {}
```

## Dispatch each branch to its own resolver

When `execute` chooses between variants (by kind, type, or status), give each
branch its own private method and keep `execute` as the dispatcher.

```typescript
// Wrong way
async execute(payload: Payload): Promise<CaptureView | null> {
  const id = new ID(payload.capture.itemId)

  if (payload.capture.kind === 'reminder') {
    const reminder = await this.reminderRepository.findUnique({ id })
    if (!reminder) return null
    return { kind: 'reminder', itemId: payload.capture.itemId, title: reminder.props.title, meta: reminder.props.remindAt ?? null }
  }

  if (payload.capture.kind === 'task') {
    const task = await this.taskRepository.findUnique({ id })
    if (!task) return null
    return { kind: 'task', itemId: payload.capture.itemId, title: task.props.title, meta: null }
  }

  const note = await this.noteRepository.findUnique({ id })
  if (!note) return null
  return { kind: 'note', itemId: payload.capture.itemId, title: note.props.title, meta: null }
}

// Correct way
async execute(payload: Payload): Promise<CaptureView | null> {
  const id = new ID(payload.capture.itemId)

  if (payload.capture.kind === 'reminder') {
    return this.resolveReminderView(id, payload.capture.itemId)
  }

  if (payload.capture.kind === 'task') {
    return this.resolveTaskView(id, payload.capture.itemId)
  }

  return this.resolveNoteView(id, payload.capture.itemId)
}
```

## Extract validations into `ensure`/`require` guard methods

- A method named `ensure...` validates an invariant and throws when it is broken;
  it returns `void`.
- A method named `require...` returns the value it guarantees is present, and
  throws otherwise.
- This keeps `execute` reading as `load → ensure → apply` instead of mixing
  guards with the main flow.

```typescript
// Wrong way
async execute(payload: Payload): Promise<Task> {
  const task = await loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)

  if (task.props.contentType !== 'text') {
    throw new DomainError({ code: 'TASK_CONTENT_TYPE_MISMATCH', errorType: DangerErrors.DATA_INTEGRITY })
  }

  return this.taskRepository.update(task.id, { /* ... */ })
}

// Correct way
async execute(payload: Payload): Promise<Task> {
  const task = await loadOwnedTask(this.taskRepository, payload.taskId, payload.userId)

  this.ensureTaskHoldsTextContent(task)

  return this.applyTextContent(task, payload.textContent)
}

private ensureTaskHoldsTextContent(task: Task): void {
  if (task.props.contentType !== 'text') {
    throw new DomainError({ code: 'TASK_CONTENT_TYPE_MISMATCH', errorType: DangerErrors.DATA_INTEGRITY })
  }
}
```

## Separate `build` (compose a result) from `apply` (persist a change)

- `build...` methods assemble an in-memory value (a response, a diff, a set of props).
- `apply...`/`record...`/`register...`/`create...` methods perform the side effect
  (persist, update, create). Splitting them makes each responsibility testable and
  obvious from the name.

```typescript
// Correct way
async execute(payload: Payload): Promise<Response> {
  const userFromProvider = await getUserFromProviderTokenOrThrow(this.authProviderService, payload.token)
  const existingUser = await this.userRepository.findUnique({ providerId: userFromProvider.id })

  if (existingUser) {
    return this.buildLoginResponse(existingUser)
  }

  return this.registerUser(userFromProvider)
}
```

## Type extracted method parameters explicitly

- Give each private method real parameters and import the domain types it needs
  instead of relying on inline `Awaited<ReturnType<...>>` or `any`.
- Pass only the values the step needs (e.g. `userId`, `drafts`, `now`) rather than
  threading the whole `payload` through every method.

```typescript
// Wrong way
private async registerUser(userFromProvider: Awaited<ReturnType<typeof getUserFromProviderTokenOrThrow>>) {}

// Correct way
private async registerUser(userFromProvider: GetUserFromTokenResponse): Promise<Response> {}
```

## Do not split a use case that already has one responsibility

- When `execute` is a single linear flow with one responsibility — a lone
  `repository.create(...)`, a single `update`, or a one-line delegation — leave it
  inline. Extracting a method that is only ever called once from a trivial body adds
  indirection without improving readability.

```typescript
// Correct way — leave this as is, do not extract
async execute(payload: Payload): Promise<Message> {
  return this.messageRepository.create({
    userId: payload.userId,
    role: 'user',
    content: payload.content,
    createdAt: new Date(),
  })
}
```
