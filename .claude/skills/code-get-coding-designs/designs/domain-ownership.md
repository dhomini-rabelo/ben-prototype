# Domain Ownership

Feature domain modules are not peers that share entity classes. Every entity has **one owning module**. Another module may consume that concept only as a **consumer**: it stores the owner's identity and, when it needs a rule the owner enforces, it imports the owner's **public contract**. Two feature modules do not use each other's entities directly.

Use this design when adding a field, import, or use case that reaches into another `packages/domain/<module>`, or when deciding whether a type belongs in `domain/base`.

## Owner and consumer

```text
domain/{owner}
  owns {Entity}, its repository port, and its invariants
        ▲
        │  public contract only
        │  (ports, authorization helpers, owner-owned enums)
        │  never the entity class nested in consumer props
        │
domain/{consumer}
  stores {owner}Id: ID on its own entities
```

The owner never imports the consumer. The graph stays acyclic. `domain/base` stays primitives (`Entity`, `ID`, `UseCase`, errors) — do not move a feature entity there in order to share it.

## What the consumer stores

Consumer entity props hold the owner's identity, not a copy of the owner's object data.

```ts
// Wrong way
export interface TaskProps {
  project: Project
  projectName: string
  projectSlug: string
}

// Correct way
export interface TaskProps {
  projectId: ID
  title: string
}
```

Do not duplicate the owner's fields (`name`, `slug`, members, or any other owner state) onto the consumer entity. If a use case needs an owner rule (access, membership, existence), call the owner's contract; do not read `owner.props.*` as the consumer's source of those fields.

## What the consumer may import

From the owner module's public entrypoint only:

- repository ports used to check access
- authorization or validation functions the owner defines
- enums that belong to the owner's language for that check

```ts
// Wrong way — consumer imports the entity class to use it as data
import { Project } from '@domain/project'

// Correct way — consumer uses identity plus the owner's contract
import type { ProjectRepository } from '@domain/project'
import { requireProjectAccess } from '@domain/project'
```

A consumer use case may receive a transient value from that contract (for example a role). That return value is not stored as a nested owner object on the consumer entity.

## Product map

Declare this product's owner/consumer pairs in `packages/domain/ownerships.md`. List each feature module, the entities it owns, and the owner modules it consumes (identity fields and public contract). Create the file when the product has more than one feature domain. Update it when adding an entity or a cross-module identity field. `domain/base` is omitted; it owns primitives only.

## Cross-module use cases

Orchestration that needs two aggregates still lives in the **consumer** use case: load the consumer entity, read `{owner}Id`, then call the owner's contract. Do not invert the dependency so the owner loads consumer entities. Do not create a third "shared" domain module just to host both entity classes.
