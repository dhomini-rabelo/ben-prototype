# Service Structure

## The idea

When an infrastructure service file (e.g. an adapter implementation under `src/infra/services/`) grows large because it bundles the service class together with all of its supporting pieces — schemas, prompt builders, tools, client setup — split it into a folder.

The goal is to make the **main class easy to view**: `index.ts` reads as a clear summary of what the service does, and each operation's supporting code moves into its own subfolder and subfiles next to that operation.

## File layout

The service file `{service-name}.ts` becomes a folder `{service-name}/` resolved through its `index.ts`, so existing imports of the service keep working unchanged. **All file and folder names use kebab-case**; only exported class identifiers stay PascalCase.

```
{service-name}/
├── index.ts                       # service class + shared setup
├── {shared-helper}.ts             # helpers shared across operations
├── {operation-a}/                 # one folder per public method of the service
│   ├── schemas.ts
│   ├── {builder}.ts
│   └── {operation-tool}.ts
└── {operation-b}/
    ├── schemas.ts
    └── {builder}.ts
```

## index.ts

`index.ts` holds the service class and the shared setup it needs (clients, instances). Each method stays thin: it composes the helpers imported from the operation folders. No schemas, prompt strings, or tool definitions live here.

## Operation folders

Each public method of the service gets one folder named after it (kebab-case). It groups everything that method needs — its schemas, builders, and any tools specific to it. Only the top-level pieces a method consumes are exported; anything composed internally stays file-private.

## Shared helpers

Code shared across more than one operation lives in its own file at the folder root (not inside an operation folder), and each operation imports it.
