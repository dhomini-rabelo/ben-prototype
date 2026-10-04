# Mobile app structure

How an app workspace under `packages/infra/mobile/{app}` organizes `src/`. In this repository it describes the design sandbox (`packages/infra/mobile/design`, Vite + React) in full and the layers shared with the Expo app (`packages/infra/mobile/ben`), which adds `api/`, `storage/` and `services/` (see [API client structure](./api-client-structure.md), [Mobile services layer structure](./mobile-services-layer-structure.md) and [Mobile token persistence structure](./mobile-token-persistence-structure.md)). **All file and folder names use kebab-case**; only exported identifiers follow their own casing.

```
src/
  core/          main.tsx, routes.tsx, screens.ts, global.css (Tailwind import and theme tokens)
  layout/
    components/
      ui/        primitives without business rules ({component}.tsx, one per file)
      common/    shared compositions and screen shells ({layout-piece}.tsx)
      {group}/   feature group (capture-card, chat, menu, workspace, icons): one component per file
    utils/       one subject per file (styles.ts holds cn())
  pages/{page}/  page.tsx (the design app: one folder per route, named {page}-{state} or {name}-preview)
```

In the Expo app `core/` also has the env, query client, Firebase and auth bootstrap, `layout/` also has `hooks/` and `stores/`, and each `pages/{page}/` has `components/`, `hooks/`, `states/`, `stores/` and `utils/`; see [Page structure](./page-structure.md).

## Core and utils stay flat files

- `core/` holds app bootstrap (entry, router, registry, `global.css`) as plain files, no subfolders.
- `layout/utils/` has one subject per file.

## Layout and components use subfolders

- Components are grouped into folders by role (`ui`, `common`, `{group}`), one component per file.
- Anything shared between pages goes to `layout/components/`. A page has no `__shared__/` folder.
- Repeated layout shapes live in `layout/components/common/` (for example `chat-shell`, `preview-shell`), not copied class strings.

## Pages export by name and load lazily

- `page.tsx` has a named export `{Name}Page` (no default export) and only composes.
- The design app loads each page with `lazy` in `core/routes.tsx`:

```tsx
const {Name}Page = lazy(() =>
  import('@/pages/{page}/page').then((module) => ({ default: module.{Name}Page })),
)
```

## Styling lives in Tailwind tokens

- Style with Tailwind utility classes in the component; no CSS Modules.
- Colors, type scale, radii, spacing and animations are theme tokens (`core/global.css` in the design app, `tailwind.config.js` in the Expo app); add a missing token there instead of hardcoding a value. See [React component patterns](../../code-write-code/coding-patterns/frontend/react-components.md).

## Renaming rules

- No abbreviations in identifiers, lambda parameters or route params; no comments, names carry the intent.
