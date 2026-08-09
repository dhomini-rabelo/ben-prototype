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

## Platform file variants

When a service wraps an Android/native-only capability, the native SDK must never reach the web bundle. Split the module into two siblings that export the **same function signatures**, and let Metro pick the right one per platform.

```
src/
└── services/
    ├── {capability}-service.ts       # native (Android/iOS) implementation
    └── {capability}-service.web.ts   # web no-op sibling, same exports
```

- Metro resolves `.web.ts` for the web bundle and `.ts` for native automatically. Callers import the **single** path `@/services/{capability}-service` and never branch on platform at the call site.
- The `.web.ts` variant exports the same functions as no-ops, preserving return types so consumers stay type-safe.

```ts
// {capability}-service.ts (native)
import * as Capability from 'expo-{capability}'
import { Platform } from 'react-native'

export async function {operation}(payload: Payload): Promise<void> {
  if (Platform.OS !== 'android') return
  await Capability.{operation}(payload)
}
```

```ts
// {capability}-service.web.ts (no-op sibling)
export async function {operation}(_payload: Payload): Promise<void> {}
```

Inside the native variant, still guard platform-specific work with `Platform.OS` and return early as a safe no-op when the capability is not available on the current native platform. This keeps a single, branch-free call site while ensuring the native SDK is excluded from the web build entirely.
