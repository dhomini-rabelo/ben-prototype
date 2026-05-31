# Page Structure

## File layout

Each page lives in its own folder under `src/pages/` and follows this structure. **All file and folder names use kebab-case**; only the exported React component identifiers stay PascalCase.

```
{page-name}/
├── page.tsx
├── components/
│   ├── {unique-component}.tsx
│   └── {medium-big-component}/
│       ├── {component-name}.tsx
│       ├── {sub-component-name}.tsx
│       └── {medium-big-sub-component}/
│           └── {sub-sub-component-name}.tsx
├── hooks/
└── states/
```

## page.tsx

The `page.tsx` file is the entry point of the page. It composes layout elements and page-level components.

```tsx
import { EmployeeActiveEvents } from "./components/employee-active-events/employee-active-events";
import { EmployeeTaskList } from "./components/employee-task-list/employee-task-list";

export function EmployeeEvents() {
  return (
    <main>
      <EmployeeActiveEvents />
      <EmployeeTaskList />
    </main>
  );
}
```

## components/

Contains components scoped to the page. There are two patterns:

- **Small unique component** — a single file: `components/{unique-component}.tsx`
- **Medium/big component** — a folder: `components/{component-name}/{component-name}.tsx`
  - Can have sub-components: `components/{component-name}/{sub-component-name}.tsx`
  - Can have nested folders for medium/big sub-components: `components/{component-name}/{sub-component-name}/{sub-sub-component-name}.tsx`

Example from `EmployeeEvents`:

```
components/
├── employee-active-events/
│   ├── employee-active-events.tsx
│   └── event-selection.tsx
└── employee-task-list/
    ├── employee-task-list.tsx
    └── task.tsx
```

## hooks/

Contains custom hooks scoped to the page, used to extract reusable logic from `page.tsx` or its components. Hook files are kebab-case (e.g. `use-chat.ts`), while the exported hook identifier stays camelCase (e.g. `useChat`).

## states/

Contains shared state definitions scoped to the page.
