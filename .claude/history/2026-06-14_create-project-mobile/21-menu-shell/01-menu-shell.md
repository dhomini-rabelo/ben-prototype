# Implementation Plan — Menu shell + generic list-state shell (project-mobile)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/layout/components/menu/` and `project-mobile/src/layout/components/menu-list/`.
> **Parallel-safe:** touches no file outside those two folders (runs alongside plan 20 / task logic — distinct trees).
> **Depends on:** plan 05 (UI primitives + icons), plan 07 (menu store), plan 03 (tokens + `cn()`), plan 01 (Expo scaffold: NativeWind, `react-native-reanimated`, `react-native-safe-area-context`, `lucide-react-native`), plan 11 (`brand-mark`, `chat-banner`), plan 08 (`use-captures-counts-data`).
> **Verification:** `npx tsc --noEmit` from `project-mobile` (no formatting/lint step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port the menu container (sidebar + native sheet/modal surfaces) and the reusable list-state shell (shell/row/loading/empty/error) from `project-web` to React Native. **Presentational only** — these pieces render whichever surface the menu store asks for and emit selection/back/retry/close events; they do **not** decide navigation or routing (that is wired in plan 28). The feature lists (plan 25) and detail/settings (plan 26) build on this shell.

Per MOBILE-PORT-ANALYSIS.md point 5: the web overlay (a fixed-position, state-driven layer over the page) becomes a **native `Modal` surface** for the primary menu, and a **bottom sheet** (`Modal` anchored bottom) for the detail/settings surfaces — keeping the same logical layers (primary menu surface, bottom detail surface, bottom settings surface) and preserving close-on-backdrop + reset-on-dismiss.

### Web→RN substitution rules applied throughout

- `<div>`/`<aside>`/`<header>`/`<main>`/`<nav>` → `View`; `<button>` → `Pressable`; text → `Typography`/`Text`.
- NativeWind `className` strings preserved verbatim where the utility has an RN equivalent.
- Drop web-only affordances: `hover:*`, `backdrop-blur-*`, `fixed`/`inset-0`/`z-*`/`-translate-x-1/2`, `overflow-y-auto`, `aria-label`, `type="button"`. Replace with: `accessibilityLabel`/`accessibilityRole`, `ScrollView`/`FlatList` for scroll, `Modal` for overlay layering, `pressed`-state feedback via the `({ pressed }) => className` form.
- `lucide-react` → `lucide-react-native`: icons take numeric `size`/`color`/`strokeWidth`, **not** `className`. Convert `size-9`→a sized `View` wrapper + `size={16}` icon (web used `size-4` = 16px icon inside a `size-9` box), `size-5`→`size={20}`, `size-4`→`size={16}`. Resolve color from a plan-03 token hex (see "Open detail — icon/skeleton colors").
- `animate-pulse` (CSS keyframes — do not exist in RN) → a Reanimated opacity loop (`react-native-reanimated`), matching the convention established in plan 18.
- Safe areas: the primary menu `Modal` respects the top inset; the bottom sheet respects the bottom inset, via `react-native-safe-area-context` (`useSafeAreaInsets`).

### Naming note (front-end preference vs. brief)

Front-end code preferences prefer `*-root` over `*-shell` for top-level wrappers. The brief and downstream plans (25/26) reference the **exact file names** `menu-list-shell.tsx` and `menu-overlay.tsx`, and the web source uses `MenuListShell`/`MenuOverlay`. To keep the cross-plan contract stable, this plan **keeps the web names verbatim** (`menu-list-shell.tsx` → `MenuListShell`, `menu-overlay.tsx` → `MenuOverlay`). Do not rename.

---

## Prerequisite assumptions (delivered by other plans — consume, do not create)

| Symbol | Mobile source | Provided by |
| --- | --- | --- |
| `cn` | `@/layout/utils/styles` | plan 03 |
| `Typography` (`body-md`, `label-caps`) | `@/layout/components/ui/typography` | plan 05 |
| `BrandMark` | `@/layout/components/brand-mark` | plan 11 |
| `ChatBanner` (`Root`/`Icon`/`Text`/`Action`) | `@/layout/components/chat-banner` | plan 11 |
| `useMenuStore`, `MenuEntryId`, `MenuView`, `MenuDetailTarget` | `@/layout/stores/menu-store` | plan 07 |
| color/text tokens (`surface-container-lowest`, `surface-container-high`, `surface-container-low`, `on-surface`, `on-surface-variant`, `outline-variant`, `surface`, `inverse-surface`) | NativeWind config | plan 03 |
| `Bell`, `ListTodo`, `NotebookPen`, `Settings`, `ChevronLeft`, `List`, `Type`, `AlertCircle` icons | `lucide-react-native` | plan 01 dep set |
| `react-native-reanimated`, `react-native-safe-area-context` | (deps) | plan 01 |

> The menu store (plan 07) is the **verbatim port** of `project-web/src/layout/stores/menu-store.ts` (zustand is platform-agnostic per the analysis): `view`, `detailTarget`, `isSettingsOpen`, and actions `selectEntry`/`goBackToMenu`/`openDetail`/`closeDetail`/`closeSettings`/`reset`. This plan consumes it directly (no prop-drilling — feature-state pattern, "child reads the store directly").
> If any imported symbol/path differs at integration, only the import line changes — no structural change. `tsc` surfaces mismatches.

---

## Part A — Menu container (`src/layout/components/menu/`)

Files: `menu-sheet.tsx`, `menu-sidebar-count-badge.tsx`, `menu-sidebar.tsx`, `menu-sidebar-view.tsx`, `menu-overlay.tsx`.

### A1. `menu-sheet.tsx` — content-agnostic bottom sheet wrapper

Web is a `<div>` with rounded top, grab handle, surface bg, and an upward shadow. RN: `View` with the same classes; add the bottom safe-area inset as padding so the sheet content clears the home indicator (analysis: "respect safe areas at the top and bottom"). Keep it **content-agnostic** (children slotted by plans 26).

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/layout/utils/styles";

type MenuSheetProps = {
  children: ReactNode;
  className?: string;
};

export function MenuSheet({ children, className }: MenuSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className={cn(
        "w-full rounded-t-3xl bg-surface-container-lowest pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <View className="items-center px-5 pt-3 pb-2">
        <View className="h-1 w-10 rounded-full bg-outline-variant/60" />
      </View>
      {children}
    </View>
  );
}
```

Notes:
- Web `flex w-full flex-col` → RN default column, keep `w-full`. Grab handle `<span>` → `View`; `justify-center` collapses into the parent `items-center` (single child centered horizontally).
- `style={{ paddingBottom: insets.bottom }}` is **additive** on top of the static `pb-6`; the safe-area inset is dynamic and cannot be a Tailwind class, so it uses the `style` prop (the only inline style in this plan). `pb-6` is kept for the base spacing.
- Arbitrary shadow `shadow-[0_-8px_32px_rgba(0,0,0,0.08)]` kept; NativeWind maps to RN shadow/elevation. If it rejects at build, drop (non-load-bearing).
- This file does **not** own the `Modal` wrapping — `menu-overlay.tsx` owns surface presentation; `MenuSheet` is purely the visual container so detail/settings can slot in.

### A2. `menu-sidebar-count-badge.tsx` — count value semantics + Reanimated skeleton

The web badge has four render branches by `CountValue` (`undefined` → null, `"skeleton"` → pulsing placeholder, `"dash"` → em-dash, `number` → formatted text). Preserve all four. The `animate-pulse` skeleton becomes a Reanimated opacity loop.

```tsx
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Typography } from "@/layout/components/ui/typography";
import type { MenuEntryId } from "@/layout/stores/menu-store";

export type CountValue = number | "skeleton" | "dash" | undefined;

function CountSkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={style}
      className="h-4 w-12 rounded-full bg-outline-variant/40"
    />
  );
}

export function CountBadge({
  entryId,
  value,
  formatCount,
}: {
  entryId: MenuEntryId;
  value: CountValue;
  formatCount?: (n: number) => string;
}) {
  if (value === undefined) return null;
  if (value === "skeleton") return <CountSkeleton />;
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

Notes:
- Branch order and value semantics copied **verbatim** from web (`undefined`/`skeleton`/`dash`/number; tasks-specific `formatCount` only applied for `entryId === "tasks"`).
- `CountSkeleton` is a **separate component declaration in the same file** — required because hooks (`useSharedValue`/`useEffect`/`useAnimatedStyle`) cannot run inside a conditional branch of `CountBadge`. This is the one allowed exception to "one component per file": the skeleton is a private animated helper, not an independently-exported component. (Same pattern plan 18 uses for animated sub-pieces.) If strict one-component-per-file is enforced at review, extract to `menu-sidebar-count-skeleton.tsx` in this folder — single mechanical move, still parallel-safe.
- `animate-pulse` (CSS) → Reanimated opacity `withRepeat(..., -1, true)` (infinite, reversing). `bg-outline-variant/40`, `h-4 w-12 rounded-full` kept verbatim.
- `<span>` → `Animated.View`; the em-dash and number branches stay `Typography` (text inherits color from its own `className`).

### A3. `menu-sidebar.tsx` — brand mark + four entries, three variants

Pure presentational sidebar. Same `ENTRIES` config (tasks/notes/reminders/settings with icons + tasks `formatCount`), same `variant` → `effectiveCounts` mapping, same `showCount = id !== "settings"` gate, same `onSelect` emission.

```tsx
import { Bell, ListTodo, NotebookPen, Settings } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { BrandMark } from "@/layout/components/brand-mark";
import { Typography } from "@/layout/components/ui/typography";
import type { MenuEntryId } from "@/layout/stores/menu-store";
import { cn } from "@/layout/utils/styles";
import { CountBadge, type CountValue } from "./menu-sidebar-count-badge";

type MenuSidebarProps = {
  variant?: "default" | "loading" | "error";
  counts?: Partial<Record<MenuEntryId, CountValue>>;
  className?: string;
  onSelect?: (id: MenuEntryId) => void;
};

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const ENTRIES: {
  id: MenuEntryId;
  label: string;
  icon: ComponentType<IconProps>;
  formatCount?: (n: number) => string;
}[] = [
  { id: "tasks", label: "Tasks", icon: ListTodo, formatCount: (n) => `${n} active` },
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
    <View
      className={cn(
        "h-full w-full bg-surface-container-lowest shadow-[8px_0_32px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <View className="h-16 flex-row items-center px-5">
        <BrandMark logoWidth={24} logoHeight={19} />
      </View>

      <View className="px-2 pt-2">
        {ENTRIES.map(({ id, label, icon: Icon, formatCount }) => {
          const value = effectiveCounts[id];
          const showCount = id !== "settings";
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              onPress={() => onSelect?.(id)}
              className={({ pressed }) =>
                cn(
                  "flex-row items-center gap-3 rounded-xl px-3 py-3.5",
                  pressed && "bg-surface-container-low",
                )
              }
            >
              <View className="size-9 items-center justify-center rounded-lg bg-surface-container-high">
                <Icon size={16} strokeWidth={1.75} color={ON_SURFACE_VARIANT} />
              </View>
              <Typography
                variant="body-md"
                className="flex-1 font-semibold text-on-surface"
              >
                {label}
              </Typography>
              {showCount && (
                <CountBadge entryId={id} value={value} formatCount={formatCount} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
```

Notes:
- `ENTRIES` and the variant→counts logic copied **verbatim** (including tasks `formatCount: (n) => \`${n} active\``).
- `<aside>`→`View`, `<nav>`→`View`, `<button>`→`Pressable`, icon `<span>`→`View`. Web `flex h-full w-full flex-col` → RN default column; the brand-row and nav-row inner layouts that were horizontal get explicit `flex-row`.
- `hover:bg-surface-container-low` → `pressed && "bg-surface-container-low"`.
- Icon color: lucide-react-native needs a `color` string. Web inherited `text-on-surface-variant` via `currentColor`; here pass the resolved hex `ON_SURFACE_VARIANT` (see "Open detail"). Icon box keeps `bg-surface-container-high` and `size-9`.
- `onSelect?.(id)` emission unchanged — the sidebar does not decide what selection does.

### A4. `menu-sidebar-view.tsx` — store + counts data binding (verbatim logic)

Reads `selectEntry` from the menu store and the counts from `use-captures-counts-data`, derives the `variant`, maps the counts. This is the only non-presentational file in Part A; logic is identical to web (the hook is platform-agnostic per analysis).

```tsx
import { useCapturesCountsData } from "@/layout/hooks/api/use-captures-counts-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuSidebar } from "./menu-sidebar";

export function MenuSidebarView() {
  const selectEntry = useMenuStore((store) => store.selectEntry);
  const { state } = useCapturesCountsData();

  const variant = state.isLoading
    ? "loading"
    : state.isError
      ? "error"
      : "default";

  const counts = state.data
    ? {
        tasks: state.data.item.tasks.active,
        notes: state.data.item.notes.total,
        reminders: state.data.item.reminders.total,
      }
    : undefined;

  return (
    <MenuSidebar variant={variant} counts={counts} onSelect={selectEntry} />
  );
}
```

Notes:
- Copied **verbatim** from web — no DOM, no platform API. `useCapturesCountsData` (plan 08) returns the same `{ state }` `{ item: { tasks.active, notes.total, reminders.total } }` shape.
- Child reads the store directly (`selectEntry`) per the feature-state pattern (no prop-drilling).

### A5. `menu-overlay.tsx` — native surfaces (primary `Modal` + bottom-sheet `Modal`s)

The single most-rewritten file. Web stacked three fixed-position layers with manual `z-*` and backdrops over the page. RN replaces the page-overlay model with **native `Modal`s**: a left-anchored slide-in primary menu surface, and a bottom-anchored sheet `Modal` for detail and for settings. Preserve: which surface renders is driven by the menu store (`view` / `detailTarget` / `isSettingsOpen`); close-on-backdrop calls the store close action; **reset-on-dismiss** (the web `useEffect(() => () => reset(), [reset])`).

**Presentational boundary for this plan:** the inner feature views (`MenuSidebarView`, `MenuTasksView`, `MenuNotesView`, `MenuRemindersView`, `NoteDetail`, `ReminderDetail`, `SettingsView`) are **plans 25/26** — they are NOT created here. To keep this plan parallel-safe and presentational, `MenuOverlay` accepts the surface content as **render props / props** instead of importing the not-yet-existing feature views. Plan 28 wires the real views in. Only `MenuSidebarView` (A4) exists in this plan and may be referenced directly for the primary surface; the rest are slots.

```tsx
import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMenuStore } from "@/layout/stores/menu-store";
import { MenuSheet } from "./menu-sheet";
import { MenuSidebarView } from "./menu-sidebar-view";

type MenuOverlayProps = {
  visible: boolean;
  onClose: () => void;
  renderView?: (view: ReturnType<typeof selectView>) => ReactNode;
  renderDetail?: (target: { kind: "note" | "reminder"; id: string }) => ReactNode;
  renderSettings?: () => ReactNode;
};

function selectView(view: string) {
  return view;
}

export function MenuOverlay({
  visible,
  onClose,
  renderView,
  renderDetail,
  renderSettings,
}: MenuOverlayProps) {
  const view = useMenuStore((store) => store.view);
  const detailTargetKind = useMenuStore((store) => store.detailTarget?.kind);
  const detailTargetId = useMenuStore((store) => store.detailTarget?.id);
  const isSettingsOpen = useMenuStore((store) => store.isSettingsOpen);
  const closeDetail = useMenuStore((store) => store.closeDetail);
  const closeSettings = useMenuStore((store) => store.closeSettings);
  const reset = useMenuStore((store) => store.reset);
  const insets = useSafeAreaInsets();

  useEffect(() => () => reset(), [reset]);

  const hasDetail = Boolean(detailTargetKind && detailTargetId);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 flex-row bg-inverse-surface/30">
          <View
            style={{ paddingTop: insets.top }}
            className="h-full w-[78%] max-w-120 overflow-hidden bg-surface-container-lowest"
          >
            {view === "menu" ? <MenuSidebarView /> : renderView?.(view)}
          </View>
          <Pressable className="h-full flex-1" onPress={onClose} />
        </View>
      </Modal>

      <Modal
        visible={hasDetail}
        transparent
        animationType="slide"
        onRequestClose={closeDetail}
      >
        <View className="flex-1 justify-end bg-inverse-surface/30">
          <Pressable className="flex-1" onPress={closeDetail} />
          {detailTargetKind && detailTargetId
            ? renderDetail?.({ kind: detailTargetKind, id: detailTargetId })
            : null}
        </View>
      </Modal>

      <Modal
        visible={isSettingsOpen}
        transparent
        animationType="slide"
        onRequestClose={closeSettings}
      >
        <View className="flex-1 justify-end bg-inverse-surface/40">
          <Pressable className="flex-1" onPress={closeSettings} />
          {renderSettings?.()}
        </View>
      </Modal>
    </>
  );
}
```

Notes / rationale:
- **Three logical layers preserved** exactly: primary menu surface (left-anchored slide-in), bottom detail sheet, bottom settings sheet — each its own `Modal`.
- **Backdrop close:** web used a `<div onClick={onClose}>` full-screen layer. RN: the translucent `bg-inverse-surface/30` `View` is the dim backdrop; a `Pressable` filling the empty area calls the close action. `onRequestClose` (Android back button) also calls close — RN best practice.
- **Reset-on-dismiss preserved verbatim:** `useEffect(() => () => reset(), [reset])`.
- `backdrop-blur-[1px]` dropped (no RN blur without `expo-blur`; analysis lists blur as a web-only construct to translate away — the dim `bg-inverse-surface/30` carries the affordance). `z-40/50/60/70` dropped — `Modal` stacking order is render order + native layering.
- `fixed top-0 bottom-0 left-1/2 -translate-x-1/2 max-w-120` (web centered the 120-max column on desktop) → on mobile the surface is `w-[78%] max-w-120` left-anchored inside the `Modal`; `max-w-120` retained so it never exceeds the web cap on tablets. The detail/settings sheets are full-width bottom-anchored (`justify-end`).
- **Safe area:** primary surface gets `paddingTop: insets.top` so the brand row clears the notch; the bottom sheets get their bottom inset from `MenuSheet` (A1).
- **`visible` prop + render-prop slots:** this plan stays presentational and parallel-safe. `MenuOverlay` reads the menu store for *which* surface, but the *contents* of the non-menu surfaces are injected by the integrator (plan 28) via `renderView`/`renderDetail`/`renderSettings`, because `MenuTasksView`/`NoteDetail`/`SettingsView` etc. live in plans 25/26 and importing them here would break parallel-safety and the presentational boundary. `MenuSidebarView` is the only inner view owned here, so it is referenced directly. `visible` (open/closed of the whole menu) is owned by the page (plan 27) / integration (plan 28), not by this presentational shell. Drop the `selectView` helper if the integrator types `renderView` directly against `MenuView`; it exists only to avoid importing the `MenuView` type-name twice — replace its `string` with `MenuView` from the store at implementation for proper typing.

> **Integration note for plan 28:** the web `MenuOverlay` imported and switch-rendered the feature views inline. The mobile version inverts this to render-props so plans 25/26 own their trees independently. Plan 28 will pass the concrete views: `renderView={(v) => v === "tasks" ? <MenuTasksView/> : ...}`, `renderDetail`, `renderSettings`. The `MenuSheet` wrapper is applied by the detail/settings views themselves (as on web, where `NoteDetail`/`SettingsView` render their own sheet), so `MenuOverlay` only provides the bottom-anchored backdrop region.

---

## Part B — Generic list-state shell (`src/layout/components/menu-list/`)

Files: `menu-list-shell.tsx`, `menu-list-row.tsx`, `menu-list-loading.tsx`, `menu-list-empty.tsx`, `menu-list-error.tsx`. This is the web-feature-state-components pattern (loading/empty/error status components + presentational row + the shell that frames them). All pure/stateless; no data fetching.

### B1. `menu-list-shell.tsx` — back affordance + title + scroll area

```tsx
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "@/layout/components/ui/icon-button";
import { Typography } from "@/layout/components/ui/typography";

type MenuListShellProps = {
  title: string;
  onBack: () => void;
  children: ReactNode;
};

export function MenuListShell({ title, onBack, children }: MenuListShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="h-full w-full bg-surface"
    >
      <View className="h-16 flex-row items-center gap-2 px-3">
        <IconButton label="Back to menu" onPress={onBack}>
          <ChevronLeft size={20} strokeWidth={2} color={ON_SURFACE_VARIANT} />
        </IconButton>
        <Typography variant="body-md" className="font-semibold text-on-surface">
          {title}
        </Typography>
      </View>

      <ScrollView
        className="flex-1 px-3"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
```

Notes:
- `<header>`→`View` (`flex-row` added — web header was horizontal), `<main overflow-y-auto>`→`ScrollView`.
- Back button: web's bare `<button>` with `hover:bg-surface-container-low` and `ChevronLeft` maps cleanly to the plan-05 `IconButton` (circular `size-10`, `pressed` background, `accessibilityLabel`). Reuse `IconButton` rather than re-implementing — DRY against plan 05. Its child icon carries `color`.
- `pb-10` (web) → `contentContainerStyle={{ paddingBottom: 40 }}` (10 × 4px). NativeWind `pb-10` on a `ScrollView`'s content needs `contentContainerStyle`, not `className`; using the numeric padding is the reliable RN form.
- `text-on-surface` on the root `View` (web set it on the container for text inheritance) — kept; NativeWind inherits text color to `Typography`/`Text` descendants. `bg-surface` kept.
- **Note:** later list views (plan 25) may prefer a `FlatList` for virtualization (analysis: paginated lists should use `FlatList`). The shell intentionally uses `ScrollView` to remain content-agnostic (matches the web `<main>` scroll container); plan 25 can place a `FlatList` *inside* the shell's children, or the shell stays `ScrollView` for short lists. Keep `ScrollView` here — virtualization is the list's concern, not the shell's.

### B2. `menu-list-row.tsx` — kind icon + title + optional lines, muted/emphasized variants

```tsx
import { Bell, List, NotebookPen, Type } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

export type MenuListRowKind = "task-text" | "task-list" | "note" | "reminder";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

type MenuListRowProps = {
  kind: MenuListRowKind;
  title: string;
  supporting?: string;
  trailing?: string;
  bodyPreview?: string;
  muted?: boolean;
  emphasizeTrailing?: boolean;
  className?: string;
  onPress?: () => void;
};

const KIND_ICON: Record<MenuListRowKind, ComponentType<IconProps>> = {
  "task-text": Type,
  "task-list": List,
  note: NotebookPen,
  reminder: Bell,
};

export function MenuListRow({
  kind,
  title,
  supporting,
  trailing,
  bodyPreview,
  muted,
  emphasizeTrailing,
  className,
  onPress,
}: MenuListRowProps) {
  const Icon = KIND_ICON[kind];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={({ pressed }) =>
        cn(
          "w-full flex-row items-start gap-3 rounded-xl px-3 py-3",
          pressed && "bg-surface-container-low",
          className,
        )
      }
    >
      <View
        className={cn(
          "mt-0.5 size-9 items-center justify-center rounded-lg bg-surface-container-high",
          muted && "opacity-60",
        )}
      >
        <Icon size={16} strokeWidth={1.75} color={ON_SURFACE_VARIANT} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-baseline gap-2">
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              "flex-1 font-semibold",
              muted ? "text-on-surface-variant" : "text-on-surface",
            )}
          >
            {title}
          </Typography>
          {trailing ? (
            <Typography
              variant="label-caps"
              className={cn(
                "shrink-0 normal-case",
                emphasizeTrailing
                  ? "font-semibold text-on-surface"
                  : "text-on-surface-variant/70",
                muted && "text-on-surface-variant/70",
              )}
            >
              {trailing}
            </Typography>
          ) : null}
        </View>
        {bodyPreview ? (
          <Typography
            variant="body-md"
            numberOfLines={1}
            className={cn(
              "text-on-surface-variant",
              muted && "text-on-surface-variant/70",
            )}
          >
            {bodyPreview}
          </Typography>
        ) : null}
        {supporting ? (
          <Typography
            variant="label-caps"
            className={cn(
              "normal-case",
              muted ? "text-on-surface-variant/60" : "text-on-surface-variant",
            )}
          >
            {supporting}
          </Typography>
        ) : null}
      </View>
    </Pressable>
  );
}
```

Notes:
- All props, the `KIND_ICON` map, `muted`/`emphasizeTrailing` class logic copied **verbatim** from web.
- **API rename:** web prop `onClick` → `onPress` (canonical RN; consumers are plan 25, written after this). Documented.
- `truncate` (web) → `numberOfLines={1}` on the title and `bodyPreview` `Typography` (RN truncation). The title also needs `flex-1` so it shrinks before the trailing element instead of pushing it off-row (web's `truncate` + flex did this; on RN `numberOfLines` alone won't constrain width, so `flex-1` is required on the truncating title).
- Web `ml-auto` on trailing (pushed it right) → the title's `flex-1` consumes the row, leaving `trailing` at the end; `shrink-0` keeps it intact. Drops `ml-auto` (no RN equivalent needed once title is `flex-1`).
- `&&`-rendered optional blocks rewritten as ternary returning `null` (RN cannot render a bare falsy string/`""` as a text node safely; ternary `: null` is the safe RN idiom). Visual result identical.
- `hover:bg-surface-container-low` → `pressed`. Icon `<span>`→`View`; icon color via `ON_SURFACE_VARIANT`. `mt-0.5` kept.

### B3. `menu-list-loading.tsx` — skeleton rows (Reanimated pulse)

Five skeleton rows; the three pulsing bars per row become Reanimated. To keep hooks legal (no hook inside `.map`), the pulse is driven by **one** shared value at the top and shared across rows via a single `useAnimatedStyle` applied to each `Animated.View`.

```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const SKELETON_ROWS = [0, 1, 2, 3, 4];

export function MenuListLoading() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="gap-1 pt-2">
      {SKELETON_ROWS.map((index) => (
        <View key={index} className="flex-row items-start gap-3 rounded-xl px-3 py-3">
          <Animated.View
            style={pulse}
            className="size-9 rounded-lg bg-outline-variant/40"
          />
          <View className="flex-1 gap-2">
            <Animated.View style={pulse} className="h-4 w-2/3 rounded bg-outline-variant/40" />
            <Animated.View style={pulse} className="h-3 w-full rounded bg-outline-variant/30" />
            <Animated.View style={pulse} className="h-3 w-1/4 rounded bg-outline-variant/30" />
          </View>
        </View>
      ))}
    </View>
  );
}
```

Notes:
- `SKELETON_ROWS`, layout classes, bar widths/heights/bg copied **verbatim**. `<div>`→`View`/`Animated.View`.
- **One** `useSharedValue` + **one** `useAnimatedStyle` declared at the top, reused on every `Animated.View` (a single shared style object is valid Reanimated usage and avoids the "no hooks in `.map`" trap). All skeletons pulse in unison — visually equivalent to `animate-pulse`.
- `flex flex-col` → RN default column; horizontal row gets `flex-row`.

### B4. `menu-list-empty.tsx` — title + description

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

type MenuListEmptyProps = {
  title: string;
  description: ReactNode;
};

export function MenuListEmpty({ title, description }: MenuListEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Typography variant="body-md" className="text-center text-on-surface">
        {title}
      </Typography>
      <Typography variant="body-md" className="mt-1 text-center text-on-surface-variant">
        {description}
      </Typography>
    </View>
  );
}
```

Notes:
- `<div>`→`View`; `text-center` moves from the container (web `text-center` cascaded to children) onto each `Typography` (RN `Text` does not inherit text-align from a `View`). Classes otherwise verbatim (`flex-1 items-center justify-center px-6`, `mt-1`, color tokens).
- `description: ReactNode` kept (consumers may pass nested `Typography`/`Text`).

### B5. `menu-list-error.tsx` — message + retry, reusing `ChatBanner`

```tsx
import { AlertCircle } from "lucide-react-native";
import { View } from "react-native";
import { ChatBanner } from "@/layout/components/chat-banner";

type MenuListErrorProps = {
  message: string;
  onRetry: () => void;
};

export function MenuListError({ message, onRetry }: MenuListErrorProps) {
  return (
    <View className="pt-4">
      <ChatBanner.Root tone="error">
        <ChatBanner.Icon icon={AlertCircle} />
        <ChatBanner.Text>{message}</ChatBanner.Text>
        <ChatBanner.Action label="retry" onPress={onRetry} />
      </ChatBanner.Root>
    </View>
  );
}
```

Notes:
- Reuses the plan-11 `ChatBanner` compound (already RN). `<div className="pt-4">`→`View`.
- `ChatBanner.Action`'s prop is `onPress` in the mobile port (plan 11 renamed `onClick`→`onPress`); `ChatBanner.Icon` takes a `lucide-react-native` icon (`AlertCircle`) whose props already match the `IconProps` shape plan 11 expects. Message + retry contract unchanged.

---

## Files created (exhaustive — nothing outside the two folders)

```
project-mobile/src/layout/components/
├── menu/
│   ├── menu-sheet.tsx                 (A1)
│   ├── menu-sidebar-count-badge.tsx   (A2, exports CountValue + CountBadge; private CountSkeleton)
│   ├── menu-sidebar.tsx               (A3)
│   ├── menu-sidebar-view.tsx          (A4)
│   └── menu-overlay.tsx               (A5)
└── menu-list/
    ├── menu-list-shell.tsx            (B1)
    ├── menu-list-row.tsx              (B2)
    ├── menu-list-loading.tsx          (B3)
    ├── menu-list-empty.tsx            (B4)
    └── menu-list-error.tsx            (B5)
```

No barrel/`index.ts` re-export files (memory: no export-only files). One component per file, with the single documented exception of the private `CountSkeleton` helper in A2 (hook-constrained; extractable if review requires). All file names kebab-case; exported identifiers PascalCase.

## Conventions honored

- **Feature-state pattern:** `menu-list-{shell,row,loading,empty,error}` mirror the web container/status/presentational split; status components are pure and stateless; children read the menu store directly (`menu-sidebar-view`) instead of prop-drilling.
- **Component variant map:** `MenuSidebar.ENTRIES`, `KIND_ICON`, and the `variant→effectiveCounts` mapping kept as module-level maps merged with `cn()`.
- **`cn()` from `@/layout/utils/styles`** in every styled component.
- **Destructured props, function declarations, no default exports, no comments** (write-code skill).
- **Names kept verbatim** (`MenuListShell`/`MenuOverlay`) to preserve the cross-plan contract, despite the `*-root` preference.

## Open details to resolve at implementation (do not block planning)

1. **Icon/skeleton colors (`ON_SURFACE_VARIANT`).** `lucide-react-native` icons need a `color` string, not a `text-*` class. Source the resolved hex of the `on-surface-variant` token from the plan-03 palette and define it as a small local `const` per file (or share the plan-05/03 icon-color convention if one exists — match whatever plan 05 / plan 11 settled on for `ON_SURFACE_VARIANT`). This is the only value in this plan not directly portable from a web class string. If plan 05 wired `react-native-svg` `cssInterop` so `className="text-on-surface-variant"` paints the icon, prefer that and drop the hex const — match plan 05's final convention.
2. **`Modal` vs. a sheet library.** The plan uses RN core `Modal` (`animationType="slide"`, `transparent`) to avoid a new dependency, satisfying "native sheet/modal" from the analysis without `@gorhom/bottom-sheet`. If plan 01 already added a bottom-sheet lib, the detail/settings `Modal`s can be swapped for it at integration (plan 28) — `MenuSheet` (the visual container) is unaffected.
3. **`MenuOverlay` render-prop slots vs. direct imports.** Kept as render props to preserve parallel-safety and the presentational boundary (feature views are plans 25/26). Plan 28 supplies the concrete `renderView`/`renderDetail`/`renderSettings`. If the integrator prefers direct imports, that change lives in plan 28, not here. Type `renderView` against `MenuView` from the store (drop the `selectView` stub).
4. **`ScrollView` vs `FlatList` in the shell.** Shell stays `ScrollView` (content-agnostic, mirrors web `<main>`); virtualization is the list's concern (plan 25 may nest a `FlatList`).
5. **Arbitrary shadow classes** (`shadow-[8px_0_...]`, `shadow-[0_-8px_...]`) — kept; drop if NativeWind rejects at build (non-load-bearing).
6. **`numberOfLines` truncation + `flex-1` on the row title** — required for RN truncation parity with web `truncate`; verify the trailing element is not pushed off-row in a later visual check (plan 25/28).

## Verification (no formatting step)

From `project-mobile`:

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Expected: passes against plan-05 primitives (`Typography`, `IconButton`), plan-11 (`BrandMark`, `ChatBanner`), plan-07 menu store types (`MenuEntryId`, `MenuView`, `MenuDetailTarget`), plan-08 `useCapturesCountsData`, and plan-01 deps (`react-native-reanimated`, `react-native-safe-area-context`, `lucide-react-native`). Additionally confirm by inspection:

- `CountBadge` renders all four value branches (null/skeleton/dash/number) and applies tasks `formatCount`.
- `MenuSidebar` maps `loading`→skeletons, `error`→dashes, `default`→counts; `settings` shows no badge; `onSelect` fires per entry.
- `MenuOverlay` renders the primary surface for `view`, the bottom detail sheet when `detailTarget` is set, the settings sheet when `isSettingsOpen`; backdrop press / Android back call the matching close action; `reset()` runs on unmount.
- `MenuListShell` shows back + title and scrolls children; `MenuListLoading` pulses; `MenuListEmpty` centers title+description; `MenuListError` renders the error `ChatBanner` with a working `retry`.
- `MenuListRow` renders the kind icon, truncates title/body, and applies `muted`/`emphasizeTrailing`; `onPress` fires.
- No `lucide-react` (web) import remains in either owned folder.

## Non-goals

- No modal **routing** / navigation decisions (plan 28). `MenuOverlay` is presentational; surface contents for non-menu views are injected.
- No feature views (`MenuTasksView`, `NoteDetail`, `SettingsView`, the per-domain lists) — plans 25/26.
- No menu store creation — consumed from plan 07.
- No formatting/lint step. Touch only the two owned folders.
