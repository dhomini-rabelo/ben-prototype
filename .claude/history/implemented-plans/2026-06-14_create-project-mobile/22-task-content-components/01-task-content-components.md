# Implementation Plan 22 — Task-workspace content components (text-content, todo-content, diff-bar) → project-mobile

> **Status:** PLAN ONLY — do **not** implement yet.
> **Owns exclusively:** `project-mobile/src/pages/task-workspace/components/text-content/`, `…/todo-content/`, `…/diff-bar/`.
> **Parallel-safe:** touches no file outside those three folders. Runs alongside plans 23/24/25/26 (distinct folders).
> **Depends on (consume, do not create):** plan 20 (task logic: stores/utils/hooks), plan 05 (UI primitives: `Typography`), plan 11 (shared composites — none directly required, but the same RN substitution conventions are reused), plan 03 (tokens + `cn`), plan 04 (`@/api/models/task` types).
> **Verification:** `cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit`. **No formatting/lint step.**
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the three web task-workspace **content/presentation** components to React Native primitives, preserving:

- The exact business logic (re-sync-on-render, save-on-end-of-edit-when-changed, toggle/add-via-`todo-order`, diff views, approve/reject via `task-diff-store`).
- The NativeWind `className` token strings byte-for-byte wherever an RN equivalent exists.
- The same diff styling cues (muted/struck-through, `diff-added`, `diff-removed`).

Reference (web, read in full):
- `project-web/src/pages/task-workspace/components/text-content/text-content.tsx`
- `project-web/src/pages/task-workspace/components/todo-content/{todo-content.tsx,todo-list-item.tsx,add-todo-row.tsx}`
- `project-web/src/pages/task-workspace/components/diff-bar/diff-bar.tsx`

## Cross-plan symbols consumed (must exist when this runs)

| Symbol (import path) | Owner |
|---|---|
| `Typography` (`@/layout/components/ui/typography`) | plan 05 |
| `cn` (`@/layout/utils/styles`) | plan 03 |
| `useWorkspaceTask` (`@/pages/task-workspace/hooks/use-workspace-task`) | plan 20 |
| `useTaskContentStore` (`@/pages/task-workspace/stores/task-content-store`) | plan 20 |
| `useTaskTodosStore` (`@/pages/task-workspace/stores/task-todos-store`) | plan 20 |
| `useTaskDiffStore` (`@/pages/task-workspace/stores/task-diff-store`) | plan 20 |
| `sortByOrder` (`@/pages/task-workspace/utils/todo-order`) | plan 20 |
| `diffSummary` (`@/pages/task-workspace/utils/diff-summary`) | plan 20 |
| `TodoItemDiff` (`@/api/models/task`) | plan 04 |
| `Check`, `Plus`, `X` (`lucide-react-native`) | plan 01 dep set |

> If `tsc` fails *solely* because one of these upstream symbols differs in name/path, fix only that single import line — it is an upstream gap, not this unit's logic.

### Web→RN substitution rules applied throughout (same as plans 05/11)

- `<section>`/`<div>` → `View`; `<textarea>`/`<input>` → `TextInput`; `<button>` → `Pressable`; text → `Typography`.
- `flex flex-col` is RN's default for a `View` → drop `flex flex-col`; `flex flex-row` web rows that are `<div>`s need explicit **`flex-row`** (the rows in `todo-list-item`/`add-todo-row` are horizontal). `flex-1` kept.
- `onChange`/`event.target.value` → `onChangeText`; `onBlur` → `onBlur` (RN `TextInput` has it); `onKeyDown` Enter → `onSubmitEditing`.
- `onClick` → `onPress`; `aria-label` → `accessibilityLabel`; add `accessibilityRole="button"`/`"checkbox"`.
- Drop web-only classes: `border-none`, `resize-none`, `focus:outline-none`, `focus:ring-0`, `focus:*`, `hover:*`, `transition-*`, `placeholder:*`, `pointer-events-none`, `leading-*` (RN has no `leading-relaxed`/`leading-snug` utility — line-height comes from the `text-*` token; drop the standalone `leading-*` class).
- `lucide-react-native` icons take numeric **`size`** + **`color`** (not `size-*`/`text-*` className). `size-3.5`→`size={14}`, `size-3`→`size={12}`, `size-4`→`size={16}`.
- `placeholderTextColor` and icon `color` come from the **plan-03 hex palette** (see the color constants block below) — these are the only values not directly portable from class strings, identical convention to plan 11 "Open detail 1/2".

### Color constants (from plan-03 `tailwind.config.js` palette)

Define a per-file `const` (no shared util — memory rule forbids barrel/util-only re-export files; these are tiny literals local to each consumer). Values:

```ts
const ON_SURFACE = "#1a1c1c";
const ON_SURFACE_VARIANT = "#444748";
const ON_PRIMARY = "#ffffff";
const DIFF_ADDED_FG = "#6b5e3f";
const DIFF_REMOVED_FG = "#8e8f90";
// placeholder = on-surface-variant @ 60% → use rgba
const ON_SURFACE_VARIANT_60 = "rgba(68, 71, 72, 0.6)";
```

> Only the constants each file actually uses are declared in that file. If plan 05/03 later expose a NativeWind theme/`vars()` accessor or `react-native-svg` `currentColor` forwarding that the lucide-native lib honors, those could replace the literals — but the literals are the safe, portable default and keep this plan self-contained.

---

## Step 1 — `text-content/text-content.tsx`

Editable text over a multiline `TextInput`. Preserve **all** web logic verbatim:

1. **Controlled + re-sync-on-render.** Keep the exact `syncKey`/`syncedKey` "adjust state when a prop changes" pattern (no `useEffect`, no remount `key`). `content = task?.textContent ?? ""`.
2. **Early `null`** when no task; compute `isFinished = task.status === "finished"`.
3. **Diff branch:** when `task.pendingDiff?.changes.contentType === "text"`, render a read-only before/after preview (no input). `before` only shown when non-empty.
4. **Save on end-of-edit when changed.** Web saved `onBlur` only if `value !== content`. RN `TextInput` fires `onBlur` with an event whose `nativeEvent.text` holds the value; to avoid relying on that, capture from the controlled `value` state in the blur handler (and also wire `onEndEditing` for keyboard-dismiss parity — both call the same guarded save). Keep `void editText(value)`.
5. **Read-only / finished:** `readOnly` → `editable={!readOnly}`; finished → muted + line-through.

Web→RN class mapping for the editor `TextInput`:
- `min-h-60 flex-1 resize-none border-none bg-transparent text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0`
  → `min-h-60 flex-1 bg-transparent text-body-md text-on-surface` + `multiline` + `textAlignVertical="top"` + `placeholderTextColor={ON_SURFACE_VARIANT_60}`. (`resize-none`/`border-none`/`focus:*`/`placeholder:*`/`leading-relaxed` dropped per rules; the placeholder text moves to the `placeholder` prop.)
- Finished editor extra: `text-on-surface-variant line-through` (kept).
- Diff `before` block: `rounded-lg bg-diff-removed/60 px-3 py-2 text-diff-removed-fg line-through` (drop `leading-relaxed`).
- Diff `after` block: `rounded-lg bg-diff-added px-3 py-2 text-diff-added-fg ring-1 ring-diff-added-outline/60`. `ring-1 ring-…` has no RN equivalent → replace with `border border-diff-added-outline/60` (faithful visual: a 1px outline in the same token). Drop `leading-relaxed`.
- Root `section`: `flex flex-1 flex-col pt-2` → `flex-1 pt-2`; finished → `opacity-60`. Diff root `flex flex-1 flex-col gap-3 pt-2` → `flex-1 gap-3 pt-2`.

```tsx
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskContentStore } from "@/pages/task-workspace/stores/task-content-store";

const ON_SURFACE_VARIANT_60 = "rgba(68, 71, 72, 0.6)";

type TextContentProps = {
  readOnly?: boolean;
};

export function TextContent({ readOnly }: TextContentProps) {
  const task = useWorkspaceTask();
  const editText = useTaskContentStore((s) => s.editText);

  const content = task?.textContent ?? "";

  // Controlled TextInput seeded from the server content. Re-sync during render
  // (React's "adjust state when a prop changes" pattern) whenever the task or
  // its persisted content changes, instead of remounting via `key` or effects.
  const syncKey = `${task?.id ?? ""}:${content}`;
  const [value, setValue] = useState(content);
  const [syncedKey, setSyncedKey] = useState(syncKey);
  if (syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setValue(content);
  }

  if (!task) {
    return null;
  }

  const isFinished = task.status === "finished";

  const diff =
    task.pendingDiff?.changes.contentType === "text"
      ? task.pendingDiff.changes
      : null;

  if (diff) {
    return (
      <View className="flex-1 gap-3 pt-2">
        {diff.before.length > 0 && (
          <Typography
            variant="body-md"
            className="rounded-lg bg-diff-removed/60 px-3 py-2 text-diff-removed-fg line-through"
          >
            {diff.before}
          </Typography>
        )}
        <Typography
          variant="body-md"
          className="rounded-lg bg-diff-added px-3 py-2 text-diff-added-fg border border-diff-added-outline/60"
        >
          {diff.after}
        </Typography>
      </View>
    );
  }

  function handleSave() {
    if (value !== content) {
      void editText(value);
    }
  }

  return (
    <View className={cn("flex-1 pt-2", isFinished && "opacity-60")}>
      <TextInput
        value={value}
        editable={!readOnly}
        multiline
        textAlignVertical="top"
        placeholder="tell Ben what to put here…"
        placeholderTextColor={ON_SURFACE_VARIANT_60}
        onChangeText={setValue}
        onBlur={handleSave}
        onEndEditing={handleSave}
        className={cn(
          "min-h-60 flex-1 bg-transparent text-body-md text-on-surface",
          isFinished && "text-on-surface-variant line-through",
        )}
      />
    </View>
  );
}
```

> **Save parity note:** web saved once on `onBlur`. RN: `onBlur` (focus lost) and `onEndEditing` (keyboard return / dismiss) can both fire; `handleSave` is idempotent because after the first save the cache invalidation updates `content`, so the `value !== content` guard short-circuits the second call. This matches the brief's "persist only when editing ends and the value actually differs". Single-line web behavior was a `<textarea>`; `multiline` + `textAlignVertical="top"` reproduces the top-aligned growing editor.

---

## Step 2 — `todo-content/todo-list-item.tsx`

Row with a toggle control + title; reflects done / finished / diff(added/removed). Keep `memo`. Same props (`title`, `done`, `diff`, `finished`, `onToggle`) and the same derived booleans (`isAdded`, `isRemoved`, `isDiff`, `isMuted`).

Web→RN:
- Outer `<div>` row → `View` with `flex-row items-center gap-3 rounded-lg px-2 py-2.5` (add `flex-row`; web row was horizontal). Keep diff bg: `isAdded && "bg-diff-added"` + outline → `border border-diff-added-outline/60` (replacing `ring-1 ring-…`); `isRemoved && "bg-diff-removed/60"`.
- Toggle `<button>` → `Pressable`. `aria-label`→`accessibilityLabel`, `onClick`→`onPress`, keep `disabled={isDiff}`, `accessibilityRole="checkbox"`. Drop `transition-colors`, `hover:*`, `pointer-events-none` (RN: `disabled` already blocks press). Box classes kept: `size-5 shrink-0 items-center justify-center rounded-md border`; done → `border-on-surface-variant bg-on-surface-variant`, undone → `border-outline-variant bg-surface-container-lowest`. (`text-on-primary` on the button is web `currentColor` for the check; on RN the check color is set on the icon via `color={ON_PRIMARY}`.)
- The check glyph: `Check` from `lucide-react-native`, only when `done`, `size={14} strokeWidth={3} color={ON_PRIMARY}` (web `size-3.5`).
- Title `Typography variant="body-md"`: drop `leading-snug`; keep `flex-1`, `isMuted && "text-on-surface-variant line-through"`, `isRemoved && "text-diff-removed-fg line-through"`, `isAdded && "text-diff-added-fg"`, default `!done && !isRemoved && !isAdded && "text-on-surface"`.

```tsx
import { Check } from "lucide-react-native";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import type { TodoItemDiff } from "@/api/models/task";

const ON_PRIMARY = "#ffffff";

type TodoListItemProps = {
  title: string;
  done?: boolean;
  diff?: TodoItemDiff;
  finished?: boolean;
  onToggle?: () => void;
};

function TodoListItemComponent({
  title,
  done,
  diff,
  finished,
  onToggle,
}: TodoListItemProps) {
  const isAdded = diff === "added";
  const isRemoved = diff === "removed";
  const isDiff = isAdded || isRemoved;
  const isMuted = done || finished;

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-lg px-2 py-2.5",
        isAdded && "bg-diff-added border border-diff-added-outline/60",
        isRemoved && "bg-diff-removed/60",
      )}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={done ? "Mark not done" : "Mark done"}
        accessibilityState={{ checked: !!done, disabled: isDiff }}
        onPress={onToggle}
        disabled={isDiff}
        className={cn(
          "size-5 shrink-0 items-center justify-center rounded-md border",
          done
            ? "border-on-surface-variant bg-on-surface-variant"
            : "border-outline-variant bg-surface-container-lowest",
        )}
      >
        {done && <Check size={14} strokeWidth={3} color={ON_PRIMARY} />}
      </Pressable>
      <Typography
        variant="body-md"
        className={cn(
          "flex-1",
          isMuted && "text-on-surface-variant line-through",
          isRemoved && "text-diff-removed-fg line-through",
          isAdded && "text-diff-added-fg",
          !done && !isRemoved && !isAdded && "text-on-surface",
        )}
      >
        {title}
      </Typography>
    </View>
  );
}

export const TodoListItem = memo(TodoListItemComponent);
```

---

## Step 3 — `todo-content/add-todo-row.tsx`

Add-item entry: trimmed, non-empty commit, then clears. Keep `value` state + `commit()` exactly. Web committed on Enter (`onKeyDown`) **and** `onBlur`. RN: commit on `onSubmitEditing` (keyboard "done"/return) and on `onBlur`. Keep `returnKeyType="done"` (this is a list-add field, not a chat send).

Web→RN:
- Outer `<div>` → `View` `flex-row items-center gap-3 rounded-lg px-2 py-2.5 text-on-surface-variant`. (`text-on-surface-variant` on a `View` is inert in RN — drop it; the icon carries its own color.) → `flex-row items-center gap-3 rounded-lg px-2 py-2.5`.
- The dashed plus badge `<span>` → `View` `size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant`. (`flex` dropped.) `Plus` icon `size={12} strokeWidth={2} color={ON_SURFACE_VARIANT}` (web `size-3`).
- `<input>` → `TextInput`: `onChange`→`onChangeText`, drop `onKeyDown` (use `onSubmitEditing`), keep `onBlur={commit}`. Class `min-w-0 flex-1 border-none bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-0` → `flex-1 bg-transparent text-body-md text-on-surface` + `placeholderTextColor` (use the 70% variant). `min-w-0`/`border-none`/`focus:*`/`placeholder:*` dropped.

```tsx
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useTaskTodosStore } from "@/pages/task-workspace/stores/task-todos-store";

const ON_SURFACE_VARIANT = "#444748";
const ON_SURFACE_VARIANT_70 = "rgba(68, 71, 72, 0.7)";

export function AddTodoRow() {
  const addTodo = useTaskTodosStore((s) => s.addTodo);
  const [value, setValue] = useState("");

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    void addTodo(trimmed);
    setValue("");
  }

  return (
    <View className="flex-row items-center gap-3 rounded-lg px-2 py-2.5">
      <View className="size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant">
        <Plus size={12} strokeWidth={2} color={ON_SURFACE_VARIANT} />
      </View>
      <TextInput
        value={value}
        placeholder="add item"
        placeholderTextColor={ON_SURFACE_VARIANT_70}
        onChangeText={setValue}
        onSubmitEditing={commit}
        onBlur={commit}
        returnKeyType="done"
        blurOnSubmit={false}
        className="flex-1 bg-transparent text-body-md text-on-surface"
      />
    </View>
  );
}
```

> `blurOnSubmit={false}` keeps the keyboard up after a return so the user can add multiple items in a row (the `commit()` clears `value`); without it RN dismisses the keyboard on submit. `onBlur` still commits when the user taps away — matching web's dual commit path.

---

## Step 4 — `todo-content/todo-content.tsx`

Container. Keep logic exactly: early `null`, `isFinished`, diff branch (`contentType === "todo"` → render `diff.items` as non-interactive `TodoListItem`s keyed `${item.id}-${item.diff}`), else `sortByOrder(task.todoItems ?? [])` and render interactive rows + `AddTodoRow` when not read-only. Toggle wired `readOnly ? undefined : () => void toggleTodo(item.id)`.

Web→RN:
- `<section>` → `View`. Diff root `flex flex-1 flex-col gap-1 pt-2` → `flex-1 gap-1 pt-2`. Main root `flex flex-1 flex-col gap-1 pt-2` + finished `opacity-60` → `flex-1 gap-1 pt-2` (+ `opacity-60`).

```tsx
import { View } from "react-native";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskTodosStore } from "@/pages/task-workspace/stores/task-todos-store";
import { sortByOrder } from "@/pages/task-workspace/utils/todo-order";
import { AddTodoRow } from "./add-todo-row";
import { TodoListItem } from "./todo-list-item";

type TodoContentProps = {
  readOnly?: boolean;
};

export function TodoContent({ readOnly }: TodoContentProps) {
  const task = useWorkspaceTask();
  const toggleTodo = useTaskTodosStore((s) => s.toggleTodo);

  if (!task) {
    return null;
  }

  const isFinished = task.status === "finished";

  const diff =
    task.pendingDiff?.changes.contentType === "todo"
      ? task.pendingDiff.changes
      : null;

  if (diff) {
    return (
      <View className="flex-1 gap-1 pt-2">
        {diff.items.map((item) => (
          <TodoListItem
            key={`${item.id}-${item.diff}`}
            title={item.title}
            done={item.done}
            diff={item.diff}
          />
        ))}
      </View>
    );
  }

  const todoItems = sortByOrder(task.todoItems ?? []);

  return (
    <View className={cn("flex-1 gap-1 pt-2", isFinished && "opacity-60")}>
      {todoItems.map((item) => (
        <TodoListItem
          key={item.id}
          title={item.title}
          done={item.done}
          finished={isFinished}
          onToggle={readOnly ? undefined : () => void toggleTodo(item.id)}
        />
      ))}
      {!readOnly && <AddTodoRow />}
    </View>
  );
}
```

> `task.todoItems` may be optional on the model (web uses `?? []`); keep the nullish coalesce so `tsc` is satisfied regardless of the plan-04 field optionality.

---

## Step 5 — `diff-bar/diff-bar.tsx`

Approve/reject bar wired to `task-diff-store`. Keep `memo`, the early `null` when no `task?.pendingDiff`, `diffSummary(task)`, and the `isMutating`-disabled actions.

Web→RN:
- Outer `<div>` → `View` `flex flex-col gap-2 rounded-2xl border border-diff-added-outline/70 bg-diff-added px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]` → drop `flex flex-col` (default), keep the rest; the arbitrary `shadow-[…]` is kept (NativeWind maps to RN shadow/elevation; if it rejects at build, drop — non-load-bearing, same call as plan 11).
- Summary `Typography variant="label-caps" className="normal-case text-diff-added-fg"`. `normal-case` overrides the `uppercase` baked into the `label-caps` variant; RN has no `normal-case` utility and NativeWind won't undo `textTransform: uppercase`. To preserve the web "normal case" look, use `variant="body-md"` here instead of fighting the variant, with `text-diff-added-fg` (the summary text is sentence-case "Ben suggested N changes" / "Ben revised the draft"). This is the one variant swap; keep the color token.
- Buttons `<button>` → `Pressable` + inner `Typography`/`Text` (Pressable can't hold a bare string). `onClick`→`onPress`, keep `disabled={isMutating}`. Row container `flex gap-2` → `flex-row gap-2`.
  - Reject: `flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-2 ring-1 ring-outline-variant/60 hover:bg-surface-container-low disabled:opacity-60` → `flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 px-3 py-2` (+ `isMutating && "opacity-60"`); drop `hover:*` and `disabled:` variant (use the explicit `isMutating && "opacity-60"` form — NativeWind `disabled:` is unreliable on `Pressable`, per plan 05/11). `ring-1 ring-…`→`border border-…`. Label `Text` `text-button font-semibold text-on-surface`. Icon `X size={16} strokeWidth={2} color={ON_SURFACE}`.
  - Approve: `…bg-primary px-3 py-2 text-button font-semibold text-on-primary hover:bg-surface-tint disabled:opacity-60` → `flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2` (+ `isMutating && "opacity-60"`). Label `Text` `text-button font-semibold text-on-primary`. Icon `Check size={16} strokeWidth={2} color={ON_PRIMARY}`.

```tsx
import { Check, X } from "lucide-react-native";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";
import { useWorkspaceTask } from "@/pages/task-workspace/hooks/use-workspace-task";
import { useTaskDiffStore } from "@/pages/task-workspace/stores/task-diff-store";
import { diffSummary } from "@/pages/task-workspace/utils/diff-summary";

const ON_SURFACE = "#1a1c1c";
const ON_PRIMARY = "#ffffff";

function DiffBarComponent() {
  const task = useWorkspaceTask();
  const isMutating = useTaskDiffStore((store) => store.isMutating);
  const approveDiff = useTaskDiffStore((store) => store.approveDiff);
  const rejectDiff = useTaskDiffStore((store) => store.rejectDiff);

  if (!task?.pendingDiff) {
    return null;
  }

  const summary = diffSummary(task);

  return (
    <View className="gap-2 rounded-2xl border border-diff-added-outline/70 bg-diff-added px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <Typography variant="body-md" className="text-diff-added-fg">
        {summary}
      </Typography>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reject"
          onPress={rejectDiff}
          disabled={isMutating}
          className={cn(
            "flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/60 px-3 py-2",
            isMutating && "opacity-60",
          )}
        >
          <X size={16} strokeWidth={2} color={ON_SURFACE} />
          <Text className="text-button font-semibold text-on-surface">
            Reject
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Approve"
          onPress={approveDiff}
          disabled={isMutating}
          className={cn(
            "flex-row flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2",
            isMutating && "opacity-60",
          )}
        >
          <Check size={16} strokeWidth={2} color={ON_PRIMARY} />
          <Text className="text-button font-semibold text-on-primary">
            Approve
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const DiffBar = memo(DiffBarComponent);
```

> The web `label-caps` + `normal-case` combo was a way to get the mono font at caption size without the uppercase. Swapping to `body-md` is the cleanest RN-faithful choice since `normal-case` can't cancel the variant's baked `uppercase`. If a later integration plan wants the mono caption look exactly, it can add a non-uppercase mono variant to `Typography` (plan 05) — out of scope here.

---

## Files created (exhaustive — nothing outside the three owned folders)

```
project-mobile/src/pages/task-workspace/components/
├── text-content/
│   └── text-content.tsx        (Step 1)
├── todo-content/
│   ├── todo-list-item.tsx      (Step 2)
│   ├── add-todo-row.tsx        (Step 3)
│   └── todo-content.tsx        (Step 4)
└── diff-bar/
    └── diff-bar.tsx            (Step 5)
```

No `index.ts`/barrel/re-export-only files (memory rule). One component per file (memory). File names kebab-case; exported identifiers PascalCase. The page-assembly plan (27) imports each component directly by path.

## Implementation order (when executed)

1. `todo-content/todo-list-item.tsx` (leaf, no in-folder deps).
2. `todo-content/add-todo-row.tsx` (leaf).
3. `todo-content/todo-content.tsx` (imports the two above).
4. `text-content/text-content.tsx` (independent).
5. `diff-bar/diff-bar.tsx` (independent).

## Conventions honored (from `code-write-code` + memory)

- Destructured props, function declarations, **no comments** except the two load-bearing ones carried over from web (the `text-content` re-sync rationale and the `text-content` save-parity note) — kept because they document a deliberate non-obvious pattern, matching the web source's intent.
- `cn` from `@/layout/utils/styles` in every styled component.
- NativeWind class strings preserved verbatim where an RN utility exists; web-only utilities dropped per the substitution table.
- No default exports.

## Things explicitly NOT done here

- **No store/util/hook logic** — consumed read-only from plan 20.
- **No page assembly / mounting** — plan 27 renders `TextContent`/`TodoContent`/`DiffBar`.
- **No bars/banners/footer** — plans 23/24.
- **No barrel/index files**; **no formatting/lint step.**
- **No edits to plan-05 `Typography`** (the `label-caps` `normal-case` case is handled by a local variant swap, not a primitive change).
- **No changes outside the three owned folders** — parallel-safe vs plans 23/24/25/26.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass. Confirms every cross-module reference resolves against plan 20 (stores/utils/hooks), plan 05 (`Typography`), plan 03 (`cn`/tokens), plan 04 (`TodoItemDiff`), and the `lucide-react-native` / `react-native` primitives. If `tsc` fails solely on a missing upstream module (`@/pages/task-workspace/*`, `@/layout/components/ui/typography`, `@/layout/utils/styles`, `@/api/models/task`), the cause is an unfinished dependency plan (20/05/03/04), not this unit — do not work around it by changing import paths here.

Manual (once a screen mounts these, later plan): typing in `TextContent` and blurring persists only on change; toggling/adding todos mutates; a pending text/todo diff swaps to the read-only diff view; the diff bar shows the summary and approve/reject disable while mutating.
