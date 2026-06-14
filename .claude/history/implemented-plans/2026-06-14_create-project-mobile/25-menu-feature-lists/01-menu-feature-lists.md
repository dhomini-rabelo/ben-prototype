# Implementation Plan — Menu feature lists: tasks / notes / reminders (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Plan 14 [Frontend] (parallel).** Rewrite the menu's three per-entity list views for React Native (Expo + NativeWind).
> **Owns exclusively:** `project-mobile/src/layout/components/menu-tasks/`, `project-mobile/src/layout/components/menu-notes/`, `project-mobile/src/layout/components/menu-reminders/`.
> **Parallel-safe:** touches no file outside those three folders. Distinct from plans 21/22/23/24/26/28.
> **Depends on:** plan 21 (menu-list shell + row + state components), plan 08 (entity data hooks), plan 03 (`format-time` helpers), plan 07 (menu store), plan 05 (UI primitives — `Typography`).
> **Auto-approval:** execute every step without asking the user. No formatting/lint step.
> **Verification:** `cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit` passes.

---

## Goal

Port the three web entity list views (`menu-tasks/`, `menu-notes/`, `menu-reminders/`) to React Native, built on the menu-list shell from plan 21 and driven by the plan-08 data hooks. Each entity follows the **web-feature-state-components** structure unchanged: a container `*-view.tsx` that fetches via the hook and renders exactly one of loading → error → empty → data inside `MenuListShell`, and a presentational `*-list.tsx` that renders the loaded items as `MenuListRow`s. Reminders display fire times via `firesAtRelative` (plan 03). Row taps call `openDetail` (notes/reminders) wired through the menu store; tasks have no tap target on web and stay non-interactive here (task navigation is wired in plan 28).

Reference (web, copy-faithful): `project-web/src/layout/components/menu-tasks/`, `menu-notes/`, `menu-reminders/`.

---

## Prerequisite contracts (delivered by dependency plans — consume, do NOT create)

These are the exact APIs this plan consumes. If any is absent at implementation time, do **not** add it here (would break parallel-safety); `tsc` will surface the missing module and the cause is the dependency plan, not this one.

### From plan 21 — `@/layout/components/menu-list/` (RN ports)

The web shell components are presentational; plan 21 ports them to RN preserving prop names except `onClick`→`onPress` per the established RN convention (plan 05 mapping table). This plan assumes the following surfaces (mirroring `project-web/src/layout/components/menu-list/`):

- `MenuListShell` — `{ title: string; onBack: () => void; children: ReactNode }`.
- `MenuListLoading` — no props (skeleton rows).
- `MenuListError` — `{ message: string; onRetry: () => void }`.
- `MenuListEmpty` — `{ title: string; description: ReactNode }` (web's `description` is `ReactNode`; the reminders empty state relies on this to nest a mono-styled fragment).
- `MenuListRow` — props from web `MenuListRowProps`, with the single rename `onClick` → `onPress`:
  ```ts
  type MenuListRowProps = {
    kind: "task-text" | "task-list" | "note" | "reminder";
    title: string;
    supporting?: string;
    trailing?: string;
    bodyPreview?: string;
    muted?: boolean;
    emphasizeTrailing?: boolean;
    className?: string;
    onPress?: () => void;
  };
  ```
  Exported type `MenuListRowKind` is **not** imported by this plan (the helper below derives the kind locally, exactly as web does).

> If plan 21 lands `MenuListRow` keeping `onClick` instead of `onPress`, the notes/reminders lists must use whatever prop name plan 21 actually ships. The faithful web prop is `onClick`; the RN convention (plan 05) renames interaction handlers to `onPress`. **This plan writes `onPress`** to follow the RN convention; if a mismatch surfaces at `tsc` time, align to plan 21's shipped name (one-token change, stays in this folder).

### From plan 08 — `@/layout/hooks/api/` (data hooks, copied intact from web)

- `useTaskListData({ status }?)` → `{ state, actions }`; `state.data?.items` is `TaskListItem[]`. (Called with no args here.)
- `useNoteListData()` → `{ state, actions }`; `state.data?.items` is `NoteListItem[]`.
- `useReminderListData()` → `{ state, actions }`; `state.data?.items` is `ReminderListItem[]`.
- Return shape (from generic hooks, plan 06): `state.isLoading: boolean`, `state.isError: boolean`, `state.data?: ListingResponse<T>` (`{ items: T[] }`), `actions.refetch(): void`.

### From plan 04 — `@/api/...` models / responses

- `@/api/responses/task` → `TaskListItem` (`{ id; title; contentType: "text" | "todo"; status: "created" | "active" | "finished"; hasPendingDiff; lastActivityAt; createdAt }`).
- `@/api/models/note` → `NoteListItem` (= `Note`: `{ id; title; body; capturedAt }`).
- `@/api/models/reminder` → `ReminderListItem` (= `Reminder`: `{ id; title; firesAt: string | null; body: string | null; status: "upcoming" | "fired"; capturedAt }`).

### From plan 03 — `@/layout/utils/format-time`

- `relativeTime(iso: string): string`
- `firesAtRelative(iso: string | null): string`

### From plan 07 — `@/layout/stores/menu-store`

- `useMenuStore` (zustand). Selectors used here: `goBackToMenu: () => void`, `openDetail: (target: { kind: "note" | "reminder"; id: string }) => void`. (Copied intact from web; `MenuDetailTarget` only has `note`/`reminder`, so tasks do not open a detail.)

### From plan 05 — `@/layout/components/ui/typography`

- `Typography` — `{ variant: TypographyVariant; className?: string; children: ReactNode } & TextProps`. Variants used here: `"label-caps"` (renders `text-label-caps font-mono uppercase`). `numberOfLines` is available via `TextProps` for truncation but is **not needed** in these files (`MenuListRow`, owned by plan 21, handles its own truncation).

---

## RN port conventions applied (from plan 05 mapping table — do not re-derive)

| web | mobile |
|---|---|
| `<section className="flex flex-col gap-2">` | `<View className="flex flex-col gap-2">` |
| `<div className="flex flex-col">` | `<View className="flex flex-col">` |
| `<span className="font-mono …">` (in empty desc) | `<Typography variant="body-md" className="font-mono …">` |
| `onClick` | `onPress` |
| `lucide-react` | not imported here (icons live inside `MenuListRow`, plan 21) |

All `className` strings are copied **byte-for-byte** from web wherever the class has an RN equivalent; layout classes (`flex flex-col gap-2`, `px-3 pt-2`, `mt-4 px-3`, `pt-2`, color `text-on-surface-variant`) all resolve under NativeWind v4 with the plan-03 tokens. No web-only utilities appear in these list/view files (hover/focus/transition live inside `MenuListRow`, owned by plan 21).

---

## Step 1 — Tasks list

### `project-mobile/src/layout/components/menu-tasks/menu-tasks-list.tsx`

Presentational. Splits tasks into **Active** (`status !== "finished"`) and **Finished** (`status === "finished"`) groups, each under a `label-caps` section header. Each row's `kind` is derived from `contentType` (`"todo"` → `"task-list"`, else `"task-text"`). Active rows show `` `active · ${relativeTime(lastActivityAt)}` ``; finished rows show `` `finished ${relativeTime(lastActivityAt)}` `` and are `muted`. Tasks have **no** `onPress` (web has no `onClick`); task navigation is plan 28's concern.

```tsx
import type { TaskListItem } from "@/api/responses/task";
import { MenuListRow } from "@/layout/components/menu-list/menu-list-row";
import { Typography } from "@/layout/components/ui/typography";
import { relativeTime } from "@/layout/utils/format-time";
import { View } from "react-native";

type MenuTasksListProps = {
  tasks: TaskListItem[];
};

function taskKind(task: TaskListItem) {
  return task.contentType === "todo" ? "task-list" : "task-text";
}

export function MenuTasksList({ tasks }: MenuTasksListProps) {
  const active = tasks.filter((task) => task.status !== "finished");
  const finished = tasks.filter((task) => task.status === "finished");

  return (
    <View className="flex flex-col gap-2">
      {active.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            Active
          </Typography>
          <View className="flex flex-col">
            {active.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`active · ${relativeTime(task.lastActivityAt)}`}
              />
            ))}
          </View>
        </>
      )}

      {finished.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="mt-4 px-3 text-on-surface-variant"
          >
            Finished
          </Typography>
          <View className="flex flex-col">
            {finished.map((task) => (
              <MenuListRow
                key={task.id}
                kind={taskKind(task)}
                title={task.title}
                supporting={`finished ${relativeTime(task.lastActivityAt)}`}
                muted
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
```

Notes:
- `<section>`/`<div>` → `<View>`. `flex flex-col` is redundant on RN (`View` defaults to column flex) but kept **verbatim** from web for class-string parity; NativeWind accepts it harmlessly.
- `taskKind` returns a literal union assignable to `MenuListRowKind` — no explicit annotation needed (web has none).
- The `·` middot in the supporting string is a literal Unicode char, copied as-is.

### `project-mobile/src/layout/components/menu-tasks/menu-tasks-view.tsx`

Container. Calls `useTaskListData()`, reads `goBackToMenu` from the menu store, renders the four-state machine inside `MenuListShell` titled "Tasks". Tasks have **no** `openDetail` (web `MenuTasksView` does not read it).

```tsx
import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuTasksList } from "./menu-tasks-list";

export function MenuTasksView() {
  const { actions, state } = useTaskListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const tasks = state.data?.items ?? [];

  return (
    <MenuListShell title="Tasks" onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your tasks"
          onRetry={() => actions.refetch()}
        />
      ) : tasks.length === 0 ? (
        <MenuListEmpty
          title="no tasks yet"
          description="talk to Ben — he'll set one up when something needs working on."
        />
      ) : (
        <MenuTasksList tasks={tasks} />
      )}
    </MenuListShell>
  );
}
```

Notes: identical to web byte-for-byte (no web DOM elements in this file). Branch order fixed: loading → error → empty → data, per the feature-state-components structure.

---

## Step 2 — Notes list

### `project-mobile/src/layout/components/menu-notes/menu-notes-list.tsx`

Presentational. One ungrouped column of `note` rows; each shows `title`, `bodyPreview = note.body`, `trailing = relativeTime(note.capturedAt)`, and an `onPress` that fires `onSelect(note.id)`.

```tsx
import type { NoteListItem } from "@/api/models/note";
import { MenuListRow } from "@/layout/components/menu-list/menu-list-row";
import { relativeTime } from "@/layout/utils/format-time";
import { View } from "react-native";

type MenuNotesListProps = {
  notes: NoteListItem[];
  onSelect: (noteId: string) => void;
};

export function MenuNotesList({ notes, onSelect }: MenuNotesListProps) {
  return (
    <View className="flex flex-col pt-2">
      {notes.map((note) => (
        <MenuListRow
          key={note.id}
          kind="note"
          title={note.title}
          bodyPreview={note.body}
          trailing={relativeTime(note.capturedAt)}
          onPress={() => onSelect(note.id)}
        />
      ))}
    </View>
  );
}
```

Notes: web `<div className="flex flex-col pt-2">` → `<View>`; `onClick` → `onPress`. `onSelect` is the single minimal callback (per minimum-props strategy); the view owns the store interaction.

### `project-mobile/src/layout/components/menu-notes/menu-notes-view.tsx`

Container. `useNoteListData()`, reads `goBackToMenu` + `openDetail`, renders the state machine inside `MenuListShell` titled "Notes". On select → `openDetail({ kind: "note", id })`.

```tsx
import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { useNoteListData } from "@/layout/hooks/api/use-note-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuNotesList } from "./menu-notes-list";

export function MenuNotesView() {
  const { actions, state } = useNoteListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const openDetail = useMenuStore((store) => store.openDetail);
  const notes = state.data?.items ?? [];

  return (
    <MenuListShell title="Notes" onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your notes"
          onRetry={() => actions.refetch()}
        />
      ) : notes.length === 0 ? (
        <MenuListEmpty
          title="no notes yet"
          description="talk to Ben — he'll save the keepers."
        />
      ) : (
        <MenuNotesList
          notes={notes}
          onSelect={(id) => openDetail({ kind: "note", id })}
        />
      )}
    </MenuListShell>
  );
}
```

Notes: byte-for-byte identical to web (no DOM elements). `openDetail` is wired now (the menu store already supports `note` detail targets from plan 07); plan 26 builds the detail surface and plan 28 mounts it.

---

## Step 3 — Reminders list

### `project-mobile/src/layout/components/menu-reminders/menu-reminders-list.tsx`

Presentational. Splits into **Upcoming** (`status === "upcoming"`) and **Fired** (`status === "fired"`) groups under `label-caps` headers. Every row is `kind="reminder"` with `trailing = firesAtRelative(firesAt)`. Upcoming rows set `emphasizeTrailing` and `supporting = \`captured ${relativeTime(capturedAt)}\``. Fired rows set `supporting="fired"` and `muted`. Both fire `onSelect(reminder.id)`.

```tsx
import type { ReminderListItem } from "@/api/models/reminder";
import { MenuListRow } from "@/layout/components/menu-list/menu-list-row";
import { Typography } from "@/layout/components/ui/typography";
import { firesAtRelative, relativeTime } from "@/layout/utils/format-time";
import { View } from "react-native";

type MenuRemindersListProps = {
  reminders: ReminderListItem[];
  onSelect: (reminderId: string) => void;
};

export function MenuRemindersList({
  reminders,
  onSelect,
}: MenuRemindersListProps) {
  const upcoming = reminders.filter(
    (reminder) => reminder.status === "upcoming",
  );
  const fired = reminders.filter((reminder) => reminder.status === "fired");

  return (
    <View className="flex flex-col gap-2">
      {upcoming.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="px-3 pt-2 text-on-surface-variant"
          >
            Upcoming
          </Typography>
          <View className="flex flex-col">
            {upcoming.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                trailing={firesAtRelative(reminder.firesAt)}
                emphasizeTrailing
                supporting={`captured ${relativeTime(reminder.capturedAt)}`}
                onPress={() => onSelect(reminder.id)}
              />
            ))}
          </View>
        </>
      )}

      {fired.length > 0 && (
        <>
          <Typography
            variant="label-caps"
            className="mt-4 px-3 text-on-surface-variant"
          >
            Fired
          </Typography>
          <View className="flex flex-col">
            {fired.map((reminder) => (
              <MenuListRow
                key={reminder.id}
                kind="reminder"
                title={reminder.title}
                trailing={firesAtRelative(reminder.firesAt)}
                supporting="fired"
                muted
                onPress={() => onSelect(reminder.id)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
```

Notes:
- `firesAtRelative(reminder.firesAt)` — `firesAt` is `string | null`; `firesAtRelative` accepts `string | null` (returns "no time set" on null), so no guard needed (matches web).
- `<section>`/`<div>` → `<View>`; `onClick` → `onPress`. Class strings verbatim.

### `project-mobile/src/layout/components/menu-reminders/menu-reminders-view.tsx`

Container. `useReminderListData()`, reads `goBackToMenu` + `openDetail`, renders the state machine inside `MenuListShell` titled "Reminders". On select → `openDetail({ kind: "reminder", id })`. The empty-state `description` is a `ReactNode` with a mono-styled inline fragment — web used a `<span className="font-mono text-[14px] text-on-surface">`; on RN that becomes a nested `Typography` (a `Text`), valid as a child of the outer `Typography` (`Text` nests inside `Text` on RN).

```tsx
import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { Typography } from "@/layout/components/ui/typography";
import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuRemindersList } from "./menu-reminders-list";

export function MenuRemindersView() {
  const { actions, state } = useReminderListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const openDetail = useMenuStore((store) => store.openDetail);
  const reminders = state.data?.items ?? [];

  return (
    <MenuListShell title="Reminders" onBack={goBackToMenu}>
      {state.isLoading ? (
        <MenuListLoading />
      ) : state.isError ? (
        <MenuListError
          message="couldn't load your reminders"
          onRetry={() => actions.refetch()}
        />
      ) : reminders.length === 0 ? (
        <MenuListEmpty
          title="no reminders yet"
          description={
            <>
              say{" "}
              <Typography
                variant="body-md"
                className="font-mono text-[14px] text-on-surface"
              >
                "remind me to…"
              </Typography>{" "}
              and Ben'll catch it.
            </>
          }
        />
      ) : (
        <MenuRemindersList
          reminders={reminders}
          onSelect={(id) => openDetail({ kind: "reminder", id })}
        />
      )}
    </MenuListShell>
  );
}
```

Notes:
- The web `<span className="font-mono text-[14px] text-on-surface">` → `<Typography variant="body-md" className="font-mono text-[14px] text-on-surface">`. Same class string plus `font-mono`/`text-[14px]`/`text-on-surface`; `variant="body-md"` provides the base `Text` size and is overridden by `text-[14px]` via `cn()` last-wins. RN renders a `Text` nested inside the description's outer `Text` (from `MenuListEmpty`), preserving the inline flow.
- The `{" "}` whitespace tokens and the literal quotes/ellipsis are copied verbatim so the rendered phrase matches web.
- **Risk flag (depends on plan 21's `MenuListEmpty`):** this requires `MenuListEmpty.description` to be typed `ReactNode` (as web is) **and** for plan 21 to render `description` such that a nested `Typography` flows inline (i.e. render it inside a `Text`, as web's `<Typography variant="body-md">` wrapper does). If plan 21 instead types `description` as `string`, this fragment must collapse to a plain string `'say "remind me to…" and Ben\'ll catch it.'` (loses the mono styling) — a contained one-block change in this file. Flag to plan 21; do not edit plan 21 from here.

---

## Step 4 — Reuse of shared dependencies (no new shared code)

This plan **creates no shared building blocks** — it only consumes plan 21 (`MenuListShell`/`MenuListRow`/state components), plan 08 (data hooks), plan 03 (`relativeTime`/`firesAtRelative`), plan 07 (menu store), plan 05 (`Typography`). All timestamps go through the relative-time helpers; no inline date formatting. No barrel/index file is created (memory: no export-only files). One component per file (memory). All filenames kebab-case; exported identifiers PascalCase.

---

## Files created (exhaustive — nothing outside these three folders)

```
project-mobile/src/layout/components/
├── menu-tasks/
│   ├── menu-tasks-view.tsx      (Step 1)
│   └── menu-tasks-list.tsx      (Step 1)
├── menu-notes/
│   ├── menu-notes-view.tsx      (Step 2)
│   └── menu-notes-list.tsx      (Step 2)
└── menu-reminders/
    ├── menu-reminders-view.tsx  (Step 3)
    └── menu-reminders-list.tsx  (Step 3)
```

## Conventions honored

- **Web-feature-state-components structure:** container `*-view.tsx` (fetch + state machine, fixed order loading → error → empty → data) + presentational `*-list.tsx` (data only, minimal `onSelect` callback).
- **Container reads the menu store directly** (`useMenuStore` selectors) rather than prop-drilling; the list child gets only the data and a single `onSelect` callback.
- **RN primitives:** `View` for layout containers, `Typography` for section labels and the empty-state fragment, `onPress` for taps. No web DOM elements, no `lucide-react` (icons live in `MenuListRow`).
- **Class strings copied byte-for-byte** from web wherever an RN equivalent exists; tokens resolve via plan-03 `tailwind.config.js`.
- Destructured props, function declarations, named exports, no comments (write-code skill).

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. This confirms each view resolves its data hook (plan 08), its shell/row/state components (plan 21), the menu store (plan 07), the `format-time` helpers (plan 03), and `Typography` (plan 05), and that the row props (`kind`, `supporting`, `trailing`, `bodyPreview`, `emphasizeTrailing`, `muted`, `onPress`) typecheck against plan 21's `MenuListRow`. No formatting/lint step.

## Open risks to flag (not resolved here — keep parallel-safe)

1. **`MenuListRow` interaction prop name.** This plan writes `onPress` (RN convention per plan 05). If plan 21 ships `onClick`, align to it — a one-token change in `menu-notes-list.tsx` and `menu-reminders-list.tsx`.
2. **`MenuListEmpty.description` type.** This plan passes a `ReactNode` fragment (mono-styled) for reminders, matching web. Requires plan 21 to keep `description: ReactNode` and render it inline-capable. If it ships `string`, collapse the reminders empty description to a plain string in `menu-reminders-view.tsx`.

Neither risk requires editing a file outside the three owned folders.
