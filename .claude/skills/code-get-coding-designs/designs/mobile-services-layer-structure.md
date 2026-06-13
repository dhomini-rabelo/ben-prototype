# Mobile Services Layer Structure

How `project-mobile` isolates native platform integrations behind a services layer. `src/services/` is a **platform-integration boundary** that `project-web` does not have: it is the mobile analogue of the backend's ports-and-adapters split, where the rest of the app depends on a small set of intent-named functions instead of on a native SDK directly. **All file and folder names use kebab-case.**

## The boundary rule

A service module is the **sole importer** of a given native SDK. Screens, stores, and bootstrap code call the service's exported functions and never reach for the native API themselves.

```
src/
└── services/
    └── {capability}-service.ts   # the ONLY file that imports the native SDK
```

- One module per native capability (notifications, location, camera, …), named `{capability}-service.ts`.
- The module owns all SDK setup (handlers, channels, permission config) at the top of the file.
- It exports intent-named async functions describing **what** the app wants, not which SDK call to make.

```ts
import * as Capability from 'expo-{capability}'

Capability.configure(/* one-time SDK setup */)

export async function request{Capability}Permission(): Promise<boolean> {
  // wrap the native permission flow
}

export async function {operation}(payload: Payload): Promise<void> {
  // translate app intent into native SDK calls
}
```

## Consumers

Bootstrap, stores, and screens import only the service functions:

```ts
import { request{Capability}Permission, {operation} } from '@/services/{capability}-service'
```

This keeps every native dependency swappable and testable from a single file, and prevents SDK calls from leaking across the codebase. If a screen or store needs a native capability, add or extend the matching service module rather than importing the SDK inline.
