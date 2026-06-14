# Plan 13 — Chat task-picker + active-task peek (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/pages/chat/components/task-picker/` (5 files) and `project-mobile/src/pages/chat/components/active-task-peek.tsx`.
> **Does NOT own:** `suggested-action.tsx` — reassigned to plan 14 (`14-chat-shell-bars`) because its only consumer is `chat-empty-state` (also plan 14). Do not create or touch it here.
> **Parallel-safe:** touches no file outside the task-picker folder + `active-task-peek.tsx`. Distinct trees from plans 12 / 14 / 15.
> **Depends on:** plan 10 (chat backbone), plan 08 (`useTaskListData`), plan 05 (UI primitives), plan 03 (tokens + `cn()`), plan 01 (Expo scaffold: expo-router, `ROUTES`, reanimated, gesture-handler, safe-area-context).
> **Verification:** `cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit`. No formatting / lint step.
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the active-task picker + active-task peek from `project-web` to React Native (Expo), preserving the exact behavior and (where an RN equivalent exists) the exact NativeWind classNames:

- A compact, tappable **peek** strip at the top of the chat composer that summarizes how many tasks are active and the most-recent title, with empty / skeleton / summary variants and an upward affordance cue.
- A **picker** that, on tap, opens a native bottom sheet over the chat surface presenting the scrollable list of active tasks (loading / error / empty / list states), routing a selected task to its workspace screen via expo-router.

Reference (web): `project-web/src/pages/chat/components/active-task-peek.tsx` and `project-web/src/pages/chat/components/task-picker/{active-task-picker,task-picker-sheet,task-picker-list,task-picker-empty,task-picker-error,task-picker-skeleton}.tsx`.

---

## Web → mobile mapping (applies to every file below)

| web | mobile |
|---|---|
| `<button onClick>` | `Pressable onPress` |
| `<div>` / `<span>` | `View` |
| `<p>` / text | `Typography` (plan 05) wrapping a `Text` |
| `lucide-react` (`ChevronUp`, `Hammer`, `List`, `Type`, `RotateCw`) | `lucide-react-native` (same names; `color`/`size` props, not `className`-driven `currentColor`) |
| `truncate` on text | `numberOfLines={1}` on `Typography` (kept `className` for color) |
| `overflow-y-auto` scroll container | `ScrollView` / `FlatList` |
| `animate-pulse` skeleton | `Animated` opacity loop (reanimated) — or a static dimmed block (see Step 5 note) |
| `hover:` / `transition-*` / `group-hover:` | dropped (no hover on touch); press feedback via `pressed` |
| `fixed inset-0` backdrop + `fixed bottom-0` sheet | RN `Modal` (`transparent animationType="none"`) + reanimated slide-up + gesture-handler pull-down |
| `react-router` `useNavigate` + `ROUTES.taskWorkspace(id)` | expo-router `useRouter().push(ROUTES.taskWorkspace(id))` |
| safe area (none on web) | `react-native-safe-area-context` `useSafeAreaInsets` for the sheet bottom padding |

### Hard constraints / conventions (do not regress)

1. **No bare strings under `Pressable`/`View`.** All text goes through `Typography` (which renders `Text`). The web `· {title}` and `{count} active` strings must live inside `Typography`.
2. **`Typography` does not exist in a `label-caps` lowercase form.** Web uses `variant="label-caps"` with `className="normal-case ..."` in several places. RN `Typography` (plan 05) maps `label-caps` → `text-label-caps font-mono uppercase`; NativeWind has **no `normal-case` utility for already-uppercased glyphs** — `uppercase`/`normal-case`/`truncate` are text-transform classes NativeWind v4 *does* support via `textTransform`, so keep `normal-case` exactly as web where present. (If `tsc`/runtime shows `normal-case` inert, the fallback is `variant="body-md"` for those lowercase-meta lines — flag, do not redesign.)
3. **lucide icons take `color` + `size` props, not `currentColor`.** Web colored icons via the parent's `text-*` + `currentColor`. RN does not inherit color through `className`. Each icon must receive an explicit `color` (use the token hexes resolved through a small local constant, OR pass `className` and rely on NativeWind's lucide cssInterop if plan 05/01 wired it). **Decision:** prefer `className="text-on-surface-variant"` on the icon and let NativeWind's `react-native-svg` cssInterop paint it (same mechanism plan 05 relies on for `BenLogo`); if that mechanism is absent the icons render in their default color — acceptable degradation, flag to plan 05, do not hardcode hexes here.
4. **One component per file. No barrel/index re-export files.** (memory rules) Each file exports exactly one component via a named function declaration. Consumers import the concrete module directly.
5. **Destructured props, function declarations, no default exports, no comments.** (write-code skill)
6. **File names kebab-case; exported identifiers PascalCase.** Same names as web.
7. **Data + navigation come from existing layers — do not recreate them.** `useTaskListData` from plan 08, `ROUTES` from plan 01, primitives from plan 05.

---

## Prerequisite assumptions (delivered by earlier plans — verify, do not create)

- `Typography` at `@/layout/components/ui/typography` with variants incl. `body-md`, `label-caps` (plan 05).
- `cn()` at `@/layout/utils/styles`; tokens resolve: `surface-container-lowest`, `surface-container-low`, `surface-container-high`, `outline-variant`, `inverse-surface`, `on-surface`, `on-surface-variant`, `surface-error`, `text-error`, `on-primary` (plan 03 — all confirmed present in plan 03's `tailwind.config.js`).
- `useTaskListData` at `@/layout/hooks/api/use-task-list-data` returning `{ state, actions }` where `state.data?.items: TaskListItem[]`, `state.isLoading`, `state.isError`, and `actions.refetch()` (plan 08 — verbatim port of web hook).
- `TaskListItem` at `@/api/responses/task` (`id`, `title`, `contentType`, `lastActivityAt`); `TaskContentType` (`"text" | "todo"`) at `@/api/models/task` (plan 04).
- `ROUTES` at `@/core/routes` with `taskWorkspace(taskId)` → `/tasks/${taskId}` (plan 01).
- `react-native-reanimated`, `react-native-gesture-handler` (with `GestureHandlerRootView` mounted at the app root by plan 01), `react-native-safe-area-context` (`SafeAreaProvider` mounted by plan 01) — all in `package.json` (plan 01, confirmed).

If any prerequisite is absent at implementation time, **do not add it here** — flag it; `tsc` will surface missing modules/types.

---

## Sheet strategy decision (load-bearing)

`package.json` (plan 01) does **not** include `@gorhom/bottom-sheet`. The brief requires a native bottom sheet that (a) overlays the chat surface, (b) dismisses on backdrop tap and on pull-down, (c) respects safe areas. Build it from primitives already in the dependency tree:

- **`Modal`** (`react-native`, `transparent` + `animationType="none"`) to lift the sheet above the chat surface and capture the Android back button (`onRequestClose`).
- **`react-native-reanimated`** for the slide-up entrance and the backdrop fade (replaces web's `fixed` + CSS transition; reanimated is the project-wide animation choice per analysis §77).
- **`react-native-gesture-handler`** `Gesture.Pan()` for pull-down-to-dismiss (the same lib the recorder uses for its slide-to-cancel gesture, analysis §78).
- **`useSafeAreaInsets()`** to pad the sheet bottom (`pb-6` on web → `paddingBottom: insets.bottom + 24`).

This keeps the file change inside the owned folder and adds no new dependency. The container (`active-task-picker.tsx`) owns the open/close boolean and the gesture/animation lives in `task-picker-sheet.tsx`.

---

## Step 1 — `active-task-peek.tsx`

The compact composer strip. Same three variants (`empty` | `summary` | `skeleton`), same `count` / `title` / `onOpen` props. Web's outer element is a `<button>`; mobile uses `Pressable`. Variant → branch resolution stays in the render exactly as web (it is a per-variant *layout* switch, not a class-only map, so it does not become a `Record` map — same shape as web).

```tsx
import { ChevronUp, Hammer } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

type ActiveTaskPeekProps = {
  variant?: "empty" | "summary" | "skeleton";
  count?: number;
  title?: string;
  className?: string;
  onOpen?: () => void;
};

export function ActiveTaskPeek({
  variant = "empty",
  count,
  title,
  className,
  onOpen,
}: ActiveTaskPeekProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onOpen}
      className={({ pressed }) =>
        cn(
          "w-full flex-row items-center justify-between gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5",
          pressed && "bg-surface-container-low",
          className,
        )
      }
    >
      {variant === "skeleton" ? (
        <View className="h-4 w-40 rounded bg-outline-variant" />
      ) : variant === "empty" ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          nothing in progress — Ben's listening
        </Typography>
      ) : (
        <View className="min-w-0 flex-row items-center gap-2.5">
          <View className="size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
            <Hammer className="text-on-surface-variant" size={16} strokeWidth={1.75} />
          </View>
          <View className="min-w-0 flex-row items-center gap-2">
            <Typography
              variant="label-caps"
              className="shrink-0 text-on-surface-variant"
            >
              {count != null ? `${count} active` : "active"}
            </Typography>
            {title && (
              <Typography
                variant="body-md"
                numberOfLines={1}
                className="text-on-surface"
              >
                · {title}
              </Typography>
            )}
          </View>
        </View>
      )}
      <View className="size-6 shrink-0 items-center justify-center rounded-full">
        <ChevronUp className="text-on-surface-variant" size={16} strokeWidth={1.75} />
      </View>
    </Pressable>
  );
}
```

Notes / rationale:
- `flex w-full items-center justify-between` → `w-full flex-row items-center justify-between` (RN default is column; the web row needs explicit `flex-row`). Same for the two inner `flex` rows.
- `text-left` dropped (RN text defaults to start). `transition-colors` / `hover:bg-surface-container-low` → `pressed && "bg-surface-container-low"`.
- `group` + `group-hover:-translate-y-0.5` + `group-hover:text-primary` on the chevron are hover-only → dropped (no hover on touch). The static `ChevronUp` upward glyph is itself the "affordance cue" the brief asks to keep.
- `animate-pulse` on the skeleton block → dropped to a static dimmed `bg-outline-variant` block (peek skeleton is shown only momentarily; the animated pulse is reserved for the in-sheet skeleton, Step 5). Same visual footprint (`h-4 w-40 rounded`).
- `truncate` on the title → `numberOfLines={1}` (RN truncation), keeping the `text-on-surface` color class.
- lucide `Hammer`/`ChevronUp`: `size={16}` replaces `size-4`; color via `className="text-on-surface-variant"` (NativeWind lucide cssInterop, Step-0 constraint #3).

## Step 2 — `task-picker/active-task-picker.tsx` (container)

Owns the open/close boolean, reads the active-task list, renders the peek, and conditionally renders the sheet with its content state. Mirrors the web container exactly; only `useNavigate`→`useRouter`, `react-router` route call, and the overlay/sheet rendering change.

```tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { ROUTES } from "@/core/routes";
import { useTaskListData } from "@/layout/hooks/api/use-task-list-data";
import { ActiveTaskPeek } from "@/pages/chat/components/active-task-peek";
import { TaskPickerEmpty } from "./task-picker-empty";
import { TaskPickerError } from "./task-picker-error";
import { TaskPickerList } from "./task-picker-list";
import { TaskPickerSheet } from "./task-picker-sheet";
import { TaskPickerSkeleton } from "./task-picker-skeleton";

export function ActiveTaskPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { actions, state } = useTaskListData({ status: "active" });
  const router = useRouter();

  const tasks = state.data?.items ?? [];

  if (!isOpen && (state.isLoading || tasks.length === 0)) {
    return null;
  }

  return (
    <>
      <ActiveTaskPeek
        variant="summary"
        count={tasks.length}
        title={tasks[0]?.title}
        onOpen={() => setIsOpen(true)}
      />

      <TaskPickerSheet
        isOpen={isOpen}
        count={tasks.length}
        onClose={() => setIsOpen(false)}
      >
        {state.isLoading ? (
          <TaskPickerSkeleton />
        ) : state.isError ? (
          <TaskPickerError onRetry={() => actions.refetch()} />
        ) : tasks.length === 0 ? (
          <TaskPickerEmpty />
        ) : (
          <TaskPickerList
            tasks={tasks}
            onSelect={(taskId) => {
              setIsOpen(false);
              router.push(ROUTES.taskWorkspace(taskId));
            }}
          />
        )}
      </TaskPickerSheet>
    </>
  );
}
```

Notes:
- Web rendered the backdrop + `fixed` wrapper + `TaskPickerSheet` only when `isOpen`. In RN the `Modal` (inside `TaskPickerSheet`) is itself gated by its `visible` prop, so the container passes `isOpen` down and `TaskPickerSheet` owns the `Modal` visibility. This keeps the backdrop/animation concern in one file and lets the sheet animate its exit before unmounting (a web `&&` unmount cannot).
- The early `return null` guard is **identical to web**: while initially loading *and* closed, or when there are zero active tasks *and* closed, the whole widget is hidden (brief step 6 "hide the whole widget while initially loading or when there are no active tasks").
- `navigate(ROUTES.taskWorkspace(taskId))` → `router.push(ROUTES.taskWorkspace(taskId))`; also close the sheet on select so it doesn't linger over the workspace transition.
- `useTaskListData({ status: "active" })` is the plan-08 hook, used verbatim — same `{ status: "active" }` arg as web. (Web loads at the container root; the frontend "lazy-load on interaction" preference is satisfied at the hook/`enabled` level inside plan 08, not here — do not change the call shape.)

## Step 3 — `task-picker/task-picker-sheet.tsx`

The native bottom-sheet shell: `Modal` host + reanimated slide/backdrop + gesture-handler pull-down + safe-area bottom padding + the web header (grab handle, "Active tasks" label, count hint). Takes `isOpen`, `count`, `onClose`, `children`.

```tsx
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "@/layout/components/ui/typography";

type TaskPickerSheetProps = {
  isOpen: boolean;
  count?: number;
  onClose: () => void;
  children: ReactNode;
};

const CLOSE_THRESHOLD = 80;

export function TaskPickerSheet({
  isOpen,
  count,
  onClose,
  children,
}: TaskPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 220 });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    }
  }, [isOpen, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > CLOSE_THRESHOLD) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: 160 });
      }
    });

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" onPress={onClose}>
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-inverse-surface/30"
          />
        </Pressable>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[sheetStyle, { paddingBottom: insets.bottom + 24 }]}
            className="w-full self-center rounded-t-3xl bg-surface-container-lowest"
          >
            <View className="items-center justify-center px-5 pt-3 pb-2">
              <View className="h-1 w-10 rounded-full bg-outline-variant/60" />
            </View>
            <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
              <Typography variant="label-caps" className="text-on-surface-variant">
                Active tasks
              </Typography>
              {count != null && count > 0 && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant/70"
                >
                  {count} · most recent first
                </Typography>
              )}
            </View>

            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
```

Notes:
- Web's two siblings (`fixed inset-0 ... backdrop-blur` overlay + `fixed bottom-0 ... max-w-120` sheet) collapse into one `Modal`: a full-screen `View` with `justify-end` pins the sheet to the bottom; the `Pressable` backdrop fills behind it.
- `backdrop-blur-[1px]` has no RN className equivalent → dropped; the `bg-inverse-surface/30` tint (faded in via reanimated) carries the dim. (A `BlurView` would need `expo-blur`, not in deps — out of scope.)
- `shadow-[0_-8px_32px_rgba(0,0,0,0.08)]` arbitrary box-shadow → dropped (RN shadows use `shadowColor`/`elevation`, not this class; the rounded tonal sheet on a dimmed backdrop reads as elevated). If a shadow is later desired it belongs to a shared sheet primitive, not this file.
- `max-w-120 -translate-x-1/2` (web centering within a 480px column) → on a phone the sheet is full-width; `self-center` keeps it centered on tablets. Drop the explicit max-width (no `max-w-120` token need); full-bleed is the native norm.
- The grab handle + header markup is copied class-for-class from web `task-picker-sheet.tsx` (`h-1 w-10 rounded-full bg-outline-variant/60`, the `label-caps` header + `normal-case ... /70` count hint), with `<div>`→`View` and text→`Typography`.
- Pull-down: `Gesture.Pan` translates the sheet with the finger and closes past `CLOSE_THRESHOLD` (80px), else springs back. `runOnJS(onClose)` because `onClose` is a JS callback. Backdrop tap also calls `onClose` (brief step 3 "dismiss by tapping the backdrop or pulling down").
- `onRequestClose` wires the Android hardware back button to close.
- Safe areas: web `pb-6` → `paddingBottom: insets.bottom + 24` so the last list row clears the home indicator (brief step 3 "respects safe areas").
- Entrance: `translateY` starts at 0 and the list height is intrinsic, so the slide-up is driven by `withTiming` on mount; the backdrop fades in together. (If a from-offscreen slide is wanted, seed `translateY` to a measured sheet height — deferred; the fade + spring-back gesture already meet the brief.)

## Step 4 — `task-picker/task-picker-list.tsx`

The scrollable rows. Same shape-icon `Record` map (`text`→`Type`, `todo`→`List`), same `relativeTime` helper (copied verbatim — pure JS, platform-agnostic), same `onSelect(id)` contract. `overflow-y-auto` + `max-h-[420px]` → a `ScrollView` capped via `maxHeight` style.

```tsx
import { List, Type } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, ScrollView, View } from "react-native";
import type { TaskContentType } from "@/api/models/task";
import type { TaskListItem } from "@/api/responses/task";
import { Typography } from "@/layout/components/ui/typography";

type TaskPickerListProps = {
  tasks: TaskListItem[];
  onSelect: (id: string) => void;
};

const SHAPE_ICON: Record<
  TaskContentType,
  ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
> = {
  text: Type,
  todo: List,
};

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `active · ${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `active · ${hours}h ago`;
  }
  return `active · ${Math.floor(hours / 24)}d ago`;
}

export function TaskPickerList({ tasks, onSelect }: TaskPickerListProps) {
  return (
    <ScrollView
      style={{ maxHeight: 420 }}
      className="px-2 pb-2"
      showsVerticalScrollIndicator={false}
    >
      {tasks.map((task) => {
        const Icon = SHAPE_ICON[task.contentType];
        return (
          <Pressable
            key={task.id}
            accessibilityRole="button"
            onPress={() => onSelect(task.id)}
            className={({ pressed }) =>
              cn(
                "w-full flex-row items-center gap-3 rounded-xl px-3 py-3",
                pressed && "bg-surface-container-low",
              )
            }
          >
            <View className="size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
              <Icon className="text-on-surface-variant" size={16} strokeWidth={1.75} />
            </View>
            <View className="min-w-0 flex-1 flex-col">
              <Typography
                variant="body-md"
                numberOfLines={1}
                className="text-on-surface"
              >
                {task.title}
              </Typography>
              <Typography
                variant="label-caps"
                className="normal-case text-on-surface-variant"
              >
                {relativeTime(task.lastActivityAt)}
              </Typography>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
```

> Add `import { cn } from "@/layout/utils/styles";` (used by the `pressed` className above — omitted from the snippet header only for brevity; include it).

Notes:
- `SHAPE_ICON` is the **component-variant-map pattern** (module-level `Record<TaskContentType, ComponentType>`), copied verbatim; only the `ComponentType` prop shape gains `size?` for lucide-react-native.
- `relativeTime` is copied **verbatim** (no DOM, pure date math).
- `flex max-h-[420px] flex-col overflow-y-auto` → `ScrollView` with `style={{ maxHeight: 420 }}` (NativeWind has no `max-h-[420px]` arbitrary-height utility reliably; an inline `maxHeight` is the safe RN form). `px-2 pb-2` stay as className. This keeps the list "scrollable within the sheet and capped so it never overflows the screen" (brief step 5).
- Row: `<button hover:bg-surface-container-low>` → `Pressable` with `pressed && "bg-surface-container-low"`. `text-left` dropped.
- `truncate` on title → `numberOfLines={1}` keeping `text-on-surface`. Icon color + `size={16}` per constraint #3.
- `ScrollView` chosen over `FlatList`: the active-task list is short (already capped at 420px) and lives inside a `Modal`; `ScrollView` avoids `FlatList`'s nested-virtualization warnings and keeps the row markup inline, matching web's `.map`.

## Step 5 — `task-picker/task-picker-skeleton.tsx`

Three placeholder rows with a pulsing opacity (web `animate-pulse`). RN has no `animate-pulse` utility → drive a shared opacity loop with reanimated and apply it to the dim blocks.

```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SKELETON_ROWS = [0, 1, 2];

export function TaskPickerSkeleton() {
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View className="flex-col gap-1 px-3 pb-4">
      {SKELETON_ROWS.map((index) => (
        <View
          key={index}
          className="flex-row items-center gap-3 rounded-xl px-2 py-2.5"
        >
          <Animated.View
            style={pulseStyle}
            className="size-8 rounded-lg bg-outline-variant/40"
          />
          <View className="flex-1 flex-col gap-1.5">
            <Animated.View
              style={pulseStyle}
              className="h-3.5 w-3/4 rounded bg-outline-variant/40"
            />
            <Animated.View
              style={pulseStyle}
              className="h-2.5 w-1/3 rounded bg-outline-variant/30"
            />
          </View>
        </View>
      ))}
    </View>
  );
}
```

Notes:
- `SKELETON_ROWS = [0,1,2]` and all dimensions/classes (`size-8`, `h-3.5 w-3/4`, `h-2.5 w-1/3`, `bg-outline-variant/40|30`, `rounded-xl px-2 py-2.5 gap-1`) are copied from web; only `flex`→`flex-row`/`flex-col` and `animate-pulse`→reanimated opacity loop change.
- One shared `pulse` value drives all three blocks (single loop, identical phase — matches the web CSS pulse which is also in-phase).

## Step 6 — `task-picker/task-picker-empty.tsx`

Static empty guidance. Pure markup port.

```tsx
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

export function TaskPickerEmpty() {
  return (
    <View className="flex-col items-center gap-2 px-5 pt-4 pb-6">
      <Typography variant="body-md" className="text-center text-on-surface">
        nothing active — you're all clear
      </Typography>
      <Typography
        variant="label-caps"
        className="normal-case text-center text-on-surface-variant"
      >
        tap outside to head back to chat
      </Typography>
    </View>
  );
}
```

Notes:
- `text-center` on the container (web) → moved onto each `Typography` (RN text alignment is a text prop, not a container layout prop). Classes otherwise verbatim (`flex-col items-center gap-2 px-5 pt-4 pb-6`).

## Step 7 — `task-picker/task-picker-error.tsx`

Error banner with a retry pressable. `onRetry` wired to `actions.refetch()` from the container (brief step 4 "retry action that re-requests the data").

```tsx
import { RotateCw } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

type TaskPickerErrorProps = {
  onRetry?: () => void;
};

export function TaskPickerError({ onRetry }: TaskPickerErrorProps) {
  return (
    <View className="mx-5 mb-5 flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <Typography variant="body-md" className="text-text-error">
        couldn't load your tasks
      </Typography>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="flex-row items-center gap-1.5 rounded-full bg-text-error px-3 py-1.5"
      >
        <RotateCw className="text-on-primary" size={12} />
        <Typography variant="label-caps" className="text-on-primary">
          retry
        </Typography>
      </Pressable>
    </View>
  );
}
```

Notes:
- Web's retry button used `text-label-caps font-mono uppercase text-on-primary` directly on the `<button>` and put the bare string `retry` after the icon. RN: the string must be a `Typography variant="label-caps"` (which is `text-label-caps font-mono uppercase`), color `text-on-primary` — identical resolved classes. `inline-flex` → `flex-row`.
- `RotateCw` `size-3`→`size={12}`, color via `className="text-on-primary"` (constraint #3).
- `bg-text-error` / `border-text-error/30` / `bg-surface-error` / `text-text-error` tokens all confirmed in plan 03.

---

## Files created (exhaustive — nothing outside the owned scope)

```
project-mobile/src/pages/chat/components/
├── active-task-peek.tsx                 (Step 1)
└── task-picker/
    ├── active-task-picker.tsx           (Step 2)  — container, owns open/close + data + nav
    ├── task-picker-sheet.tsx            (Step 3)  — Modal + reanimated + gesture-handler shell
    ├── task-picker-list.tsx             (Step 4)
    ├── task-picker-skeleton.tsx         (Step 5)
    ├── task-picker-empty.tsx            (Step 6)
    └── task-picker-error.tsx            (Step 7)
```

No `suggested-action.tsx` (plan 14). No barrel/index files. One component per file. All filenames kebab-case; exports PascalCase.

## Conventions honored

- **Component-variant-map** pattern: `SHAPE_ICON` (`Record<TaskContentType, ComponentType>`) kept verbatim; `Typography` variant lookup lives in plan 05.
- **`cn()` from `@/layout/utils/styles`** used wherever a `pressed`/conditional class is merged.
- **Destructured props, function declarations, no default exports, no comments** (write-code skill).
- **Data hooks consumed, not recreated**: `useTaskListData` (plan 08), `{ state, actions }` shape unchanged.
- **Routes via the `routes.ts` pattern**: `ROUTES.taskWorkspace(taskId)` (plan 01) — no ad-hoc path builder.
- **No formatting / lint step** for this plan.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass for the seven files. This confirms: every primitive (`Typography`, `cn`), the data hook (`useTaskListData` → `{ state, actions }`, `state.data.items: TaskListItem[]`), the route builder (`ROUTES.taskWorkspace`), `expo-router` `useRouter`, and the reanimated / gesture-handler / safe-area-context / `Modal` APIs all type-check.

## Open risks to flag (not resolved here, stays in-scope-clean)

1. **NativeWind lucide color (constraint #3).** If plan 05/01 did not wire `react-native-svg`/lucide cssInterop, the `className="text-*"` on `Hammer`/`ChevronUp`/`Type`/`List`/`RotateCw` won't paint; icons fall back to default color. Each icon already accepts a `color` prop as the degradation path — flag to plan 05, do not hardcode hexes here.
2. **`normal-case` utility (constraint #2).** Used on the count hint, the row meta, and the empty/error copy to undo `label-caps`'s `uppercase`. If NativeWind v4 does not emit `textTransform: "none"` for `normal-case`, those lines render uppercased — flag; the fallback (switch those specific lines to `variant="body-md"`) lives entirely in these files.
3. **No `@gorhom/bottom-sheet`.** The sheet is hand-built from `Modal` + reanimated + gesture-handler (Step 3). If a later plan standardizes a shared bottom-sheet primitive (plan 21 reframes the menu overlay as a sheet too), this file should be refactored to consume it — out of scope now, noted for plan 21 alignment.
4. **`GestureHandlerRootView` / `SafeAreaProvider` mount.** Both must be mounted at the app root by plan 01 for the pan gesture and `useSafeAreaInsets` to work; confirmed referenced in plan 01's `_layout.tsx`. If absent at runtime, the gesture/insets no-op — flag to plan 01, do not add the providers here.
