# Plan 1 [Frontend] — Sidebar count badges + loading/error (project-web)

## Context

The menu sidebar in `project-web` currently renders four nav entries (Tasks, Notes, Reminders, Settings) with **no counts and no loading/error states**. The design source of truth — `project-design/src/layout/components/menu-sidebar.tsx` — already specifies the full target: a `variant` + `counts` API, a `CountBadge` subcomponent, a skeleton pill while loading, and a dimmed em-dash on error.

This plan ports that design into `project-web` and wires it to a new dedicated, count-only backend endpoint. The sidebar is rendered as an overlay over `/chat` (`MenuOverlay`), only when the menu store's `view === "menu"`. Counts must fetch when that view is visible, mapping the request hook's `isLoading → variant="loading"` and `isError → variant="error"`, otherwise passing the resolved numeric counts.

### Fixed contract this plan consumes (backend plan provides it, runs in parallel)

```
GET /captures/counts        (auth)
200 →
{
  "tasks":     { "active": number },
  "notes":     { "total":  number },
  "reminders": { "total":  number }
}
```

This plan touches **only `project-web`**. It must not reference or depend on any `project-backend` file.

### Grounding (files actually read)

- Design SoT: `project-design/src/layout/components/menu-sidebar.tsx` — `MenuEntryId`, `CountValue = number | "skeleton" | "dash" | undefined`, `MenuSidebarProps { variant?, counts?, className?, onSelect? }`, the `effectiveCounts` derivation, and the `CountBadge` rendering (skeleton `h-4 w-12 animate-pulse rounded-full bg-outline-variant/40`; dash `Typography variant="label-caps" normal-case text-on-surface-variant/60`; value `Typography variant="label-caps" normal-case text-on-surface-variant`, tasks formatted `"N active"`).
- Design usage: `project-design/src/pages/app/menu-sidebar-populated.tsx` passes `counts={{ tasks: 3, notes: 12, reminders: 4 }}`.
- Current web sidebar: `project-web/src/layout/components/menu/menu-sidebar.tsx` — takes only `{ className }`, reads `selectEntry` from the menu store, imports `MenuEntryId` from `@/layout/stores/menu-store`, uses `cn` from `@/layout/utils/styles` (NOTE: web uses `utils/styles`, design uses `utils/cn`).
- Current overlay: `project-web/src/layout/components/menu/menu-overlay.tsx` — renders `<MenuSidebar />` when `view === "menu"`.
- Menu store: `project-web/src/layout/stores/menu-store.ts` — exports `MenuEntryId = "tasks" | "notes" | "reminders" | "settings"` and `selectEntry`.
- Base hook: `project-web/src/layout/hooks/use-api-request.ts` — `useAPIRequest<T>({ url, params?, enabled? })` returns `{ actions: { refetch, invalidate }, state: { data, isLoading, isError, error } }`.
- Domain hook pattern: `project-web/src/layout/hooks/api/use-note-list-data.ts`, `use-task-list-data.ts` — thin wrappers over `useAPIRequest<T>` typed against a `responses/` or `models/` shape and `API_ROUTES.*`.
- Routes: `project-web/src/api/routes.ts` — `API_ROUTES` const grouped by feature.
- Response shapes: `project-web/src/api/responses/task.ts` — plain exported interfaces. Envelope types in `src/api/types.ts` (`ListingResponse`, `ItemResponse`).

## Decisions

1. **Route group naming.** Add a new `captures` group to `API_ROUTES` with `counts: "/captures/counts"`, matching the contract path exactly. This is a new feature group (no existing `captures` group), consistent with the briefing.

2. **Where the response type lives.** The contract is a bespoke nested object, not a `ListingResponse`/`ItemResponse` envelope and not a single entity. Per the Web API Client Structure design, `responses/{entity}.ts` holds "operation-specific response shapes". Create `src/api/responses/captures.ts` exporting `CapturesCountResponse`. Do **not** add it to `types.ts` (that file is reserved for generic envelopes) and do **not** wrap it in `ItemResponse`.

3. **Hook returns the raw response, no unwrapping.** `useAPIRequest` returns the parsed body directly (it does not unwrap `.item`). The contract body *is* the payload, so the hook types `useAPIRequest<CapturesCountResponse>` and callers read `state.data?.tasks.active` etc. This mirrors `use-task-list-data.ts` which reads `state.data?.items`.

4. **Hook naming.** `use-captures-count-data.ts` exporting `useCapturesCountData()`, matching the briefing and the `use-*-data` convention.

5. **Fetch gating.** The sidebar is only mounted when `view === "menu"` (overlay conditionally renders it), so simply calling the hook inside the sidebar's wiring is sufficient — it unmounts when the user navigates into a sub-view. To keep the fetch declaratively tied to the menu view and avoid firing when not needed, the hook is called from a small **container** component, `MenuSidebarContainer`, that the overlay renders in place of `MenuSidebar`. This keeps `MenuSidebar` purely presentational (matching the design SoT's prop-driven API) and follows the Web Feature State Components Structure (container fetches, presentational renders). `useAPIRequest`'s `enabled` defaults to `true`; mounting only when `view === "menu"` is the gate.

6. **Presentational sidebar mirrors the design exactly.** `MenuSidebar` gains `variant` + `counts` props and the `CountBadge` subcomponent, replicating the design SoT byte-for-byte except:
   - `cn` imported from `@/layout/utils/styles` (web path), not `@/layout/utils/cn`.
   - `MenuEntryId` continues to be imported from `@/layout/stores/menu-store` (already the source of truth in web; do not redeclare it — the design declares it locally, but web already owns it in the store).
   - `BrandMark` from `@/layout/components/brand-mark`, `Typography` from `@/layout/components/ui/typography` (existing web paths).
   - `onSelect` wiring: the design exposes `onSelect?`. In web, selection is store-driven. Keep `MenuSidebar` presentational with an `onSelect` prop and let the container pass `selectEntry`. This preserves existing entry-selection behavior while matching the design API.

7. **One component per file / no barrels.** `CountBadge` stays as a non-exported local function inside `menu-sidebar.tsx` exactly as the design does (it is a private helper of `MenuSidebar`, not a second public React component — the design SoT itself co-locates it, so this is the established convention for this component and does not violate the "one component per file" memory rule, which targets multiple *public* components). `MenuSidebarContainer` is a new public component → its own file. No re-export-only files are created.

## Files to Modify / Create

### 1. `project-web/src/api/routes.ts` (modify)

Add a `captures` group. Place it after `reminders` to keep capture-domain groups together.

```ts
  reminders: {
    list: "/reminders/list",
    detail: (id: string) => `/reminders/${id}/detail`,
  },
  captures: {
    counts: "/captures/counts",
  },
} as const;
```

### 2. `project-web/src/api/responses/captures.ts` (create)

```ts
export interface CapturesCountResponse {
  tasks: { active: number };
  notes: { total: number };
  reminders: { total: number };
}
```

### 3. `project-web/src/layout/hooks/api/use-captures-count-data.ts` (create)

Mirror `use-note-list-data.ts` exactly (no params).

```ts
import type { CapturesCountResponse } from "@/api/responses/captures";
import { API_ROUTES } from "@/api/routes";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useCapturesCountData() {
  return useAPIRequest<CapturesCountResponse>({
    url: API_ROUTES.captures.counts,
  });
}
```

### 4. `project-web/src/layout/components/menu/menu-sidebar.tsx` (rewrite — presentational)

Replicate the design SoT, adapted to web import paths and the store-owned `MenuEntryId`. `MenuSidebar` becomes prop-driven (`variant`, `counts`, `onSelect`) and no longer reads the store directly (the container does).

```tsx
import { Bell, ListTodo, NotebookPen, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { BrandMark } from "@/layout/components/brand-mark";
import { Typography } from "@/layout/components/ui/typography";
import type { MenuEntryId } from "@/layout/stores/menu-store";
import { cn } from "@/layout/utils/styles";

type CountValue = number | "skeleton" | "dash" | undefined;

type MenuSidebarProps = {
  variant?: "default" | "loading" | "error";
  counts?: Partial<Record<MenuEntryId, CountValue>>;
  className?: string;
  onSelect?: (id: MenuEntryId) => void;
};

const ENTRIES: {
  id: MenuEntryId;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  formatCount?: (n: number) => string;
}[] = [
  {
    id: "tasks",
    label: "Tasks",
    icon: ListTodo,
    formatCount: (n) => `${n} active`,
  },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function MenuSidebar({
  variant = "default",
  counts,
  className,
  onSelect,
}: MenuSidebarProps) {
  const effectiveCounts: Partial<Record<MenuEntryId, CountValue>> =
    variant === "loading"
      ? { tasks: "skeleton", notes: "skeleton", reminders: "skeleton" }
      : variant === "error"
        ? { tasks: "dash", notes: "dash", reminders: "dash" }
        : (counts ?? {});

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <BrandMark logoWidth={24} logoHeight={19} />
      </div>

      <nav className="flex flex-col px-2 pt-2">
        {ENTRIES.map(({ id, label, icon: Icon, formatCount }) => {
          const value = effectiveCounts[id];
          const showCount = id !== "settings";
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect?.(id)}
              className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-left hover:bg-surface-container-low"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <Typography
                variant="body-md"
                className="flex-1 font-semibold text-on-surface"
              >
                {label}
              </Typography>
              {showCount && (
                <CountBadge
                  entryId={id}
                  value={value}
                  formatCount={formatCount}
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function CountBadge({
  entryId,
  value,
  formatCount,
}: {
  entryId: MenuEntryId;
  value: CountValue;
  formatCount?: (n: number) => string;
}) {
  if (value === undefined) return null;
  if (value === "skeleton") {
    return (
      <span className="h-4 w-12 animate-pulse rounded-full bg-outline-variant/40" />
    );
  }
  if (value === "dash") {
    return (
      <Typography
        variant="label-caps"
        className="normal-case text-on-surface-variant/60"
      >
        —
      </Typography>
    );
  }
  const text =
    entryId === "tasks" && formatCount ? formatCount(value) : `${value}`;
  return (
    <Typography
      variant="label-caps"
      className="normal-case text-on-surface-variant"
    >
      {text}
    </Typography>
  );
}
```

> Verify before finalizing: confirm `Typography` exposes a `label-caps` variant and `BrandMark` accepts `logoWidth`/`logoHeight` in web (they are used in the current web sidebar already, so safe). Confirm `bg-outline-variant`, `text-on-surface-variant`, etc. tokens exist in web's Tailwind theme (the current web sidebar already uses `bg-surface-container-*` / `text-on-surface*`; `outline-variant` is a standard M3 token in this theme — verify in `project-web/src/index.css` / theme config during implementation, and if absent, that is a theme gap to flag, not to silently substitute).

### 5. `project-web/src/layout/components/menu/menu-sidebar-container.tsx` (create — container)

Fetches counts, maps request state → `variant` + `counts`, wires `selectEntry`.

```tsx
import { useCapturesCountData } from "@/layout/hooks/api/use-captures-count-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuSidebar } from "./menu-sidebar";

export function MenuSidebarContainer() {
  const selectEntry = useMenuStore((store) => store.selectEntry);
  const { state } = useCapturesCountData();

  const variant = state.isLoading
    ? "loading"
    : state.isError
      ? "error"
      : "default";

  const counts = state.data
    ? {
        tasks: state.data.tasks.active,
        notes: state.data.notes.total,
        reminders: state.data.reminders.total,
      }
    : undefined;

  return (
    <MenuSidebar variant={variant} counts={counts} onSelect={selectEntry} />
  );
}
```

### 6. `project-web/src/layout/components/menu/menu-overlay.tsx` (modify)

Swap the presentational `MenuSidebar` for the container so counts fetch when `view === "menu"`.

- Change the import from `./menu-sidebar` to:

```ts
import { MenuSidebarContainer } from "./menu-sidebar-container";
```

- Change the render line:

```tsx
{view === "menu" && <MenuSidebarContainer />}
```

No other overlay logic changes; selection behavior is unchanged (still `selectEntry`, now passed via the container).

## Existing code to reuse

- `useAPIRequest` (`@/layout/hooks/use-api-request`) — the only fetching primitive; `enabled` defaults true, mount-gating handles "fetch only on menu view".
- `API_ROUTES` (`@/api/routes`) — extend with `captures.counts`.
- `useMenuStore` (`@/layout/stores/menu-store`) — `MenuEntryId` type + `selectEntry` action (already drives selection; reused, not reimplemented).
- `BrandMark` (`@/layout/components/brand-mark`), `Typography` (`@/layout/components/ui/typography`), `cn` (`@/layout/utils/styles`) — already used by the current sidebar.
- Hook shape modeled on `use-note-list-data.ts` / `use-task-list-data.ts`.
- Container/presentational split modeled on `menu-tasks-view.tsx` (container reads hook `state`, branches on `isLoading`/`isError`).

## Contract / response-shape table

| HTTP | `GET /captures/counts` (auth) |
|---|---|
| 200 body | `{ tasks: { active: number }, notes: { total: number }, reminders: { total: number } }` |
| TS type | `CapturesCountResponse` in `src/api/responses/captures.ts` |
| `state.isLoading` | → `variant="loading"` → all three badges render skeleton pill |
| `state.isError` | → `variant="error"` → all three badges render dimmed em-dash |
| `state.data` present | → `variant="default"`, `counts={{ tasks: data.tasks.active, notes: data.notes.total, reminders: data.reminders.total }}` |

| Entry | Badge |
|---|---|
| Tasks | `"{active} active"` (formatted) |
| Notes | `"{total}"` (plain) |
| Reminders | `"{total}"` (plain) |
| Settings | none (`showCount === false`) |

## Impact on other flows

- `MenuSidebar`'s prop signature changes from `{ className }` (store-coupled) to `{ variant, counts, className, onSelect }` (presentational). The **only** consumer in web is `menu-overlay.tsx`, which is updated to render `MenuSidebarContainer` instead. Grep `MenuSidebar` usages in `project-web/src` before finalizing to confirm no other importer exists; if one does, it must pass `onSelect`/counts or use the container.
- No change to `project-design` (its own `MenuSidebar` is untouched and remains the SoT).
- No backend files touched. The endpoint is provided by the parallel backend plan; until it exists, the sidebar will render the `error` variant (em-dash) on fetch failure — acceptable and design-specified.

## Verification

1. **Types:** `cd /home/fael/so/repos/ben-prototype/project-web && npx tsc --noEmit` — expect no new errors.
2. **Usage grep:** `grep -rn "MenuSidebar" /home/fael/so/repos/ben-prototype/project-web/src` — confirm only `menu-overlay.tsx` (now container) and the two sidebar files reference it.
3. **Theme tokens:** confirm `outline-variant`, `on-surface-variant`, `surface-container-*`, `label-caps` resolve in web (used by current sidebar + theme); flag if any are missing rather than substituting.
4. **Manual smoke test** (overlay open at menu view over `/chat`):
   - Populated: backend returns counts → Tasks shows `"N active"`, Notes/Reminders show plain numbers, Settings shows no badge.
   - Loading: while the request is in flight → all three show the animated skeleton pill (`h-4 w-12 animate-pulse rounded-full bg-outline-variant/40`).
   - Error: force a failed/absent endpoint → all three show the dimmed em-dash (`text-on-surface-variant/60`).
   - Selection still works: clicking an entry navigates the menu view / opens settings as before.

> Do NOT run `npm run lint:fix` for this plan (explicitly excluded; runs in parallel with the backend plan).
