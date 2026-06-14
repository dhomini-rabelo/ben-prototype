# Plan 26 — Menu detail (note/reminder) + settings (React Native / Expo)

> **Status:** PLAN ONLY — do not implement yet.
> **Owns exclusively:** `project-mobile/src/layout/components/menu-detail/` and `project-mobile/src/layout/components/menu-settings/`.
> **Parallel-safe:** touches no file outside those two folders. Runs alongside plans 22/23/24/25 (distinct folders).
> **Depends on:** menu shell (21, provides the bottom-sheet wrapper `MenuSheet`), specialized data hooks (08), `format-time` (03), UI primitives (05, `Typography`), tokens (03), auth store (07).
> **Verification:** `npx tsc --noEmit` (no formatting/lint step).
> **Auto-approval:** execute every step without asking the user.

---

## Goal

Port nine `menu-detail/` files and two `menu-settings/` files from `project-web` to RN, keeping them **presentational**. The item-detail container frames any captured item (note/reminder) with a kind label + icon + close affordance; three transient states (loading skeleton, error+retry, gone) and a shared content+meta layout compose into the note and reminder detail bodies (driven by the plan-08 data hooks). The settings view reads the current user from the auth store, manages an idle/pending/failed sign-out interaction, and signs out via `useAuthStore.clear`. Per `MOBILE-PORT-ANALYSIS.md` §5 these detail/settings surfaces become native modals — but **modal routing is plan 28**; here the close handler is a passed-in callback and the sheet/overlay comes from plan 21.

### web → mobile mapping applied throughout

| web | mobile |
|---|---|
| `<div>` | `View` |
| `<span>` / `<p>` text | `Text` (via `Typography`) or bare `View` for badges/dots |
| `<button onClick>` | `Pressable onPress` |
| `<img src>` (avatar) | `Image source={{ uri }}` from `react-native` |
| `lucide-react` | `lucide-react-native` (color via `color` prop, not `className`) |
| `aria-label` | `accessibilityLabel` + `accessibilityRole="button"` |
| `hover:` / `transition-*` | dropped (touch); pressed feedback via `pressed` |
| `overflow-y-auto max-h-72` | `ScrollView` with a `maxHeight` style |
| `react-router` `useNavigate` + `js-cookie` (settings-view) | dropped; `clear()` only, navigation deferred to plan 28 |

### Hard constraints (do not regress)

1. **Bare strings must live inside `Text`.** Every textual node goes through `Typography` (plan 05) — never a bare string under `View`/`Pressable`.
2. **lucide-react-native color.** RN does not inherit text color into the icon via `className`. The web `text-on-surface-variant` on an icon's parent does nothing on RN, so pass an explicit `color` prop to each lucide icon using the literal token hex from `tailwind.config.js` (plan 03). Token hexes referenced here: `on-surface-variant` = `#444748`, `text-error` = `#c53030`.
3. **`size-*` / `gap-*` / radius / color classNames** are kept byte-for-byte where NativeWind supports them (it does for these). `flex flex-col` → drop `flex flex-col` (RN `View` defaults to column flex); `flex` rows become `flex-row`.
4. **`animate-pulse` skeletons.** Kept as className (matches plan 21's skeleton convention). If NativeWind does not animate it, it degrades to a static placeholder of the correct size/shape — acceptable, no Reanimated added here (out of scope, would break parallel-safety). Flagged as a risk below.
5. **Hook return shape is `{ actions, state }`** (plan 08 ports the web `useAPIRequest` verbatim — confirmed `state.{data,isLoading,isError,error}` + `actions.refetch`). `state.data?.item` is the entity. The plan-08 hooks are `useNoteDetailData(noteId)` and `useReminderDetailData(reminderId)` returning `ItemResponse<Note>` / `ItemResponse<Reminder>`.
6. **404 / gone detection** uses `isAxiosError(error) && error.response?.status === 404`. `axios` ports intact to RN (analysis §"copiar quase intacto"), so `import { isAxiosError } from "axios"` stays.

### Prerequisite assumptions (delivered by deps — verify, do not create)

- `@/layout/components/ui/typography` exports `Typography` with variants `headline-lg`, `body-md`, `label-caps` (plan 05). **Note:** plan 05 renamed the web `button` variant to `button-text`, but **none** of the 11 files in this plan use the button variant, so no rename concern here.
- `@/layout/components/menu/menu-sheet` exports `MenuSheet({ children, className })` — the bottom-sheet wrapper (grab handle + rounded top + surface) from plan 21 step 4. (Same import path the web files use; plan 21 ports it to `View`.) **If plan 21 named it differently, adjust the import only — no behavioral change.**
- `@/layout/utils/styles` exports `cn` (plan 03).
- `@/layout/utils/format-time` exports `absoluteDateTime`, `relativeTime`, `firesAtRelative` (plan 03, copied verbatim).
- `@/layout/hooks/api/use-note-detail-data` and `use-reminder-detail-data` (plan 08).
- `@/layout/stores/auth-store` exports `useAuthStore` with `user` + `clear` (plan 07; `clear()` removes stored user + token via the mobile storage layer — no cookie).
- `@/api/models/reminder` exports `ReminderStatus = "upcoming" | "fired"` (plan 04). Used to type the `status` prop instead of an inline union, matching the entity contract.
- Dependencies present: `axios`, `lucide-react-native`, `nativewind`, `react-native`.

If a prerequisite is absent at implementation time, **do not add it here** — note it and proceed; `tsc` surfaces missing types.

### Conventions honored

- One component per file; kebab-case file names; PascalCase exports; no barrel/index files; no comments; destructured props; function declarations; no default exports.
- **Feature-state pattern** (`web-feature-state-components-structure`): container (`note-detail` / `reminder-detail`) owns the data hook and the fixed branch order **loading → gone → error → data → null**; each transient state is its own stateless file; `item-detail-content` is the presentational part. This mirrors the web exactly.
- **Component-variant-map** pattern: `item-detail-root` keeps the module-level `KIND_META` record; `settings-sheet` keeps its `variant`/`signOutState` string-union props.

---

## Step 1 — `menu-detail/item-detail-root.tsx` (container shell + KIND_META)

Frames any item in a `MenuSheet` with a kind icon, kind label, and a close button. Web header is a flex row with the icon chip on the left and an X close on the right.

```tsx
import { Bell, NotebookPen, X } from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { View } from "react-native";
import { MenuSheet } from "@/layout/components/menu/menu-sheet";
import { IconButton } from "@/layout/components/ui/icon-button";
import { Typography } from "@/layout/components/ui/typography";

type ItemKind = "note" | "reminder";

type ItemDetailRootProps = {
  kind: ItemKind;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

const KIND_META: Record<
  ItemKind,
  { label: string; icon: ComponentType<{ size?: number; color?: string }> }
> = {
  note: { label: "Note", icon: NotebookPen },
  reminder: { label: "Reminder", icon: Bell },
};

export function ItemDetailRoot({
  kind,
  children,
  onClose,
  className,
}: ItemDetailRootProps) {
  const { label, icon: Icon } = KIND_META[kind];

  return (
    <MenuSheet className={className}>
      <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="size-7 items-center justify-center rounded-lg bg-surface-container-high">
            <Icon size={16} color="#444748" />
          </View>
          <Typography variant="label-caps" className="text-on-surface-variant">
            {label}
          </Typography>
        </View>
        <IconButton label="Close" onPress={onClose} className="size-8">
          <X size={16} color="#444748" />
        </IconButton>
      </View>
      {children}
    </MenuSheet>
  );
}
```

Notes:
- Icon chip: `flex size-7 ...` → `size-7 ...` (drop `flex`); the icon's web `text-on-surface-variant strokeWidth={1.75}` becomes `color="#444748"` (lucide-react-native has no `strokeWidth` on the typed surface used here; default stroke is fine and matches visual weight — drop `strokeWidth` to keep the icon prop type minimal). The icon prop type in `KIND_META` is `{ size?, color? }` (lucide-react-native props), replacing the web `{ className?, strokeWidth? }`.
- Close button: the web `<button>` (rounded-full, `hover:bg-surface-container-low`, X icon) maps to the ported `IconButton` (plan 05) which already provides `accessibilityRole="button"`, `accessibilityLabel`, rounded-full, and a `pressed` background. Web was `size-8`; pass `className="size-8"` to override the IconButton default `size-10`. `onClick`→`onPress`.
- `onClose` is optional and passed through (the bodies pass it; modal dismissal lives in plan 28).

## Step 2 — `menu-detail/item-detail-loading.tsx` (skeleton)

```tsx
import { View } from "react-native";

export function ItemDetailLoading() {
  return (
    <View className="gap-3 px-5 pb-5">
      <View className="h-6 w-3/4 animate-pulse rounded bg-outline-variant/50" />
      <View className="h-4 w-full animate-pulse rounded bg-outline-variant/40" />
      <View className="h-4 w-5/6 animate-pulse rounded bg-outline-variant/40" />
      <View className="mt-2 h-3 w-1/3 animate-pulse rounded bg-outline-variant/30" />
    </View>
  );
}
```

Notes: `flex flex-col` → drop. Four placeholder bars copied verbatim (heights/widths/opacities). `animate-pulse` kept (constraint 4).

## Step 3 — `menu-detail/item-detail-error.tsx` (error + retry)

```tsx
import { RotateCw } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

type ItemDetailErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function ItemDetailError({ message, onRetry }: ItemDetailErrorProps) {
  return (
    <View className="mx-5 mb-5 flex-row items-start gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-3">
      <View className="flex-1 gap-1">
        <Typography variant="body-md" className="text-text-error">
          {message ?? "couldn't load this one — tap to retry"}
        </Typography>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-1 flex-row items-center gap-1.5 self-start"
        >
          <RotateCw size={14} color="#c53030" />
          <Typography
            variant="label-caps"
            className="font-mono text-text-error"
          >
            retry
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}
```

Notes:
- Outer `flex items-start` → `flex-row items-start` (web row). Inner `flex flex-1 flex-col` → `flex-1` (column default).
- Web retry button used a bare text node `"retry"` plus a `text-label-caps font-mono uppercase` button class. On RN the string must be in `Typography`; `label-caps` variant already carries `font-mono uppercase` (plan 05 map), so the word reads `retry` uppercased exactly as web. The `RotateCw` icon color is the `text-error` hex `#c53030` (constraint 2). `inline-flex`→`flex-row`.

## Step 4 — `menu-detail/item-detail-gone.tsx` (not-found)

```tsx
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

export function ItemDetailGone() {
  return (
    <View className="px-5 pb-6">
      <Typography variant="body-md" className="text-on-surface-variant">
        this one's gone — must've been cleared elsewhere.
      </Typography>
    </View>
  );
}
```

Notes: direct port; `<div>`→`View`, `<p>`/Typography text unchanged.

## Step 5 — `menu-detail/item-detail-captured-meta.tsx`

Absolute + relative capture times under a labeled top-divider.

```tsx
import { View } from "react-native";
import { Typography } from "@/layout/components/ui/typography";

type ItemDetailCapturedMetaProps = {
  absolute?: string;
  relative?: string;
};

export function ItemDetailCapturedMeta({
  absolute,
  relative,
}: ItemDetailCapturedMetaProps) {
  return (
    <View className="mt-1 gap-0.5 border-t border-outline-variant/40 pt-3">
      <Typography variant="label-caps" className="text-on-surface-variant">
        Captured
      </Typography>
      {absolute && (
        <Typography variant="body-md" className="text-on-surface-variant">
          {absolute}
        </Typography>
      )}
      {relative && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant/70"
        >
          {relative}
        </Typography>
      )}
    </View>
  );
}
```

Notes: `flex flex-col gap-0.5` → `gap-0.5`. `border-t border-outline-variant/40` is the labeled divider — NativeWind supports `border-t`/`pt-3`. `normal-case` undoes the `label-caps` uppercase for the relative line (matches web).

## Step 6 — `menu-detail/item-detail-reminder-meta.tsx`

Relative fire time + upcoming/fired status pill + absolute fire time, with the upcoming-vs-fired visual distinction.

```tsx
import { View } from "react-native";
import type { ReminderStatus } from "@/api/models/reminder";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

type ItemDetailReminderMetaProps = {
  firesAtRelative?: string;
  firesAtAbsolute?: string;
  status?: ReminderStatus;
};

export function ItemDetailReminderMeta({
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailReminderMetaProps) {
  const isFired = status === "fired";

  return (
    <View className="gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
      <View className="flex-row items-center gap-2">
        {firesAtRelative && (
          <Typography
            variant="body-md"
            className={cn(
              "font-semibold",
              isFired ? "text-on-surface-variant" : "text-on-surface",
            )}
          >
            {firesAtRelative}
          </Typography>
        )}
        {status && (
          <View
            className={cn(
              "rounded-full px-1.5 py-px",
              isFired
                ? "bg-surface-container-high"
                : "bg-primary/10",
            )}
          >
            <Typography
              variant="label-caps"
              className={cn(
                "font-mono",
                isFired ? "text-on-surface-variant/70" : "text-primary",
              )}
            >
              {status}
            </Typography>
          </View>
        )}
      </View>
      {firesAtAbsolute && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {firesAtAbsolute}
        </Typography>
      )}
    </View>
  );
}
```

Notes:
- `status` typed as `ReminderStatus` (constraint: reuse the entity contract, not an inline `"upcoming" | "fired"`).
- The web status pill was a `<span>` mixing background + text classes (`bg-primary/10 text-primary` / `bg-surface-container-high text-on-surface-variant/70`, plus `font-mono text-[10px] uppercase tracking-wider`). On RN a `<span>` with both bg and text cannot carry the label as a bare string — split into a `View` (pill background) wrapping a `Typography` (the label). `label-caps` already gives `uppercase` + tracking-equivalent + `font-mono`; the web `text-[10px]` is close to `label-caps`'s 12px — keep `label-caps` for token consistency (visual parity, no arbitrary `text-[10px]` which NativeWind would need as a literal). Text color moves onto the `Typography`, bg stays on the `View`.
- `firesAtRelative`/`firesAtAbsolute` and the `cn` fired/upcoming weight swap copied verbatim.

## Step 7 — `menu-detail/item-detail-content.tsx` (presentational layout)

Renders title → reminder-meta → body (scrollable) → captured-meta in the same order as web.

```tsx
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import type { ReminderStatus } from "@/api/models/reminder";
import { Typography } from "@/layout/components/ui/typography";
import { ItemDetailCapturedMeta } from "./item-detail-captured-meta";
import { ItemDetailReminderMeta } from "./item-detail-reminder-meta";

type ItemDetailContentProps = {
  title?: string;
  body?: ReactNode;
  capturedAtAbsolute?: string;
  capturedAtRelative?: string;
  firesAtRelative?: string;
  firesAtAbsolute?: string;
  status?: ReminderStatus;
};

export function ItemDetailContent({
  title,
  body,
  capturedAtAbsolute,
  capturedAtRelative,
  firesAtRelative,
  firesAtAbsolute,
  status,
}: ItemDetailContentProps) {
  return (
    <View className="gap-3 px-5 pb-5">
      {title && (
        <Typography variant="headline-lg" className="text-on-surface">
          {title}
        </Typography>
      )}

      {(firesAtRelative || firesAtAbsolute) && (
        <ItemDetailReminderMeta
          firesAtRelative={firesAtRelative}
          firesAtAbsolute={firesAtAbsolute}
          status={status}
        />
      )}

      {body && (
        <ScrollView className="max-h-72 pr-1">
          <Typography variant="body-md" className="text-on-surface">
            {body}
          </Typography>
        </ScrollView>
      )}

      {(capturedAtAbsolute || capturedAtRelative) && (
        <ItemDetailCapturedMeta
          absolute={capturedAtAbsolute}
          relative={capturedAtRelative}
        />
      )}
    </View>
  );
}
```

Notes:
- `flex flex-col gap-3` → `gap-3`. Render order preserved exactly: title, reminder-meta, body, captured-meta.
- Body: web `<div class="max-h-72 overflow-y-auto pr-1">` → `ScrollView className="max-h-72 pr-1"` (scroll is implicit in `ScrollView`; `overflow-y-auto` has no RN equivalent). `body` stays `ReactNode` even though the detail bodies pass plain strings — `Typography` renders a string child fine.
- Dropped the web-only `leading-tight`/`leading-relaxed` from the title/body Typography: line-height already comes from the `headline-lg`/`body-md` `fontSize` token tuple (plan 03), so the extra `leading-*` is redundant and `leading-tight`/`leading-relaxed` are not registered tokens on RN. (Visual parity preserved by the token line-heights.)
- `status` typed `ReminderStatus`, passed straight to reminder-meta.

## Step 8 — `menu-detail/note-detail.tsx` (note container)

Loads one note, drives loading/gone/error/loaded, feeds title/body/captured into content. Direct port of the web container.

```tsx
import { isAxiosError } from "axios";
import { useNoteDetailData } from "@/layout/hooks/api/use-note-detail-data";
import { absoluteDateTime, relativeTime } from "@/layout/utils/format-time";
import { ItemDetailContent } from "./item-detail-content";
import { ItemDetailError } from "./item-detail-error";
import { ItemDetailGone } from "./item-detail-gone";
import { ItemDetailLoading } from "./item-detail-loading";
import { ItemDetailRoot } from "./item-detail-root";

type NoteDetailProps = {
  noteId: string;
  onClose: () => void;
};

export function NoteDetail({ noteId, onClose }: NoteDetailProps) {
  const { actions, state } = useNoteDetailData(noteId);
  const note = state.data?.item;
  const isNotFound =
    isAxiosError(state.error) && state.error.response?.status === 404;
  const isGone =
    (state.isError && isNotFound) ||
    (!state.isLoading && !state.isError && !note);

  return (
    <ItemDetailRoot kind="note" onClose={onClose}>
      {state.isLoading ? (
        <ItemDetailLoading />
      ) : isGone ? (
        <ItemDetailGone />
      ) : state.isError ? (
        <ItemDetailError onRetry={() => actions.refetch()} />
      ) : note ? (
        <ItemDetailContent
          title={note.title}
          body={note.body}
          capturedAtAbsolute={absoluteDateTime(note.capturedAt)}
          capturedAtRelative={relativeTime(note.capturedAt)}
        />
      ) : null}
    </ItemDetailRoot>
  );
}
```

Notes: byte-for-byte logic port; only the imports resolve to mobile equivalents. Branch order matches the feature-state pattern (loading → gone → error → data → null). `onClose` stays a passed-in callback (plan 28 controls dismissal).

## Step 9 — `menu-detail/reminder-detail.tsx` (reminder container)

Same as note, plus status + fire times.

```tsx
import { isAxiosError } from "axios";
import { useReminderDetailData } from "@/layout/hooks/api/use-reminder-detail-data";
import {
  absoluteDateTime,
  firesAtRelative,
  relativeTime,
} from "@/layout/utils/format-time";
import { ItemDetailContent } from "./item-detail-content";
import { ItemDetailError } from "./item-detail-error";
import { ItemDetailGone } from "./item-detail-gone";
import { ItemDetailLoading } from "./item-detail-loading";
import { ItemDetailRoot } from "./item-detail-root";

type ReminderDetailProps = {
  reminderId: string;
  onClose: () => void;
};

export function ReminderDetail({ reminderId, onClose }: ReminderDetailProps) {
  const { actions, state } = useReminderDetailData(reminderId);
  const reminder = state.data?.item;
  const isNotFound =
    isAxiosError(state.error) && state.error.response?.status === 404;
  const isGone =
    (state.isError && isNotFound) ||
    (!state.isLoading && !state.isError && !reminder);

  return (
    <ItemDetailRoot kind="reminder" onClose={onClose}>
      {state.isLoading ? (
        <ItemDetailLoading />
      ) : isGone ? (
        <ItemDetailGone />
      ) : state.isError ? (
        <ItemDetailError onRetry={() => actions.refetch()} />
      ) : reminder ? (
        <ItemDetailContent
          title={reminder.title}
          body={reminder.body ?? undefined}
          status={reminder.status}
          firesAtRelative={firesAtRelative(reminder.firesAt)}
          firesAtAbsolute={
            reminder.firesAt ? absoluteDateTime(reminder.firesAt) : undefined
          }
          capturedAtAbsolute={absoluteDateTime(reminder.capturedAt)}
          capturedAtRelative={relativeTime(reminder.capturedAt)}
        />
      ) : null}
    </ItemDetailRoot>
  );
}
```

Notes: byte-for-byte logic port. `firesAtRelative(reminder.firesAt)` handles the nullable `firesAt`; `absoluteDateTime` is only called when `firesAt` is truthy (web guard preserved). `status` is `ReminderStatus`, type-compatible with content's prop.

## Step 10 — `menu-settings/settings-sheet.tsx` (presentational settings)

Populated / loading / error variants showing avatar (or fallback), name, email, a sign-out control, and a sign-out failure/retry affordance.

```tsx
import { LogOut, RotateCw, User } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import { MenuSheet } from "@/layout/components/menu/menu-sheet";
import { Typography } from "@/layout/components/ui/typography";
import { cn } from "@/layout/utils/styles";

type SettingsVariant = "populated" | "loading" | "error";
type SignOutState = "idle" | "pending" | "failed";

type SettingsSheetProps = {
  variant?: SettingsVariant;
  name?: string;
  email?: string;
  avatarUrl?: string;
  signOutState?: SignOutState;
  className?: string;
  onSignOut?: () => void;
  onRetry?: () => void;
};

export function SettingsSheet({
  variant = "populated",
  name,
  email,
  avatarUrl,
  signOutState = "idle",
  className,
  onSignOut,
  onRetry,
}: SettingsSheetProps) {
  return (
    <MenuSheet className={className}>
      <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
        <Typography variant="label-caps" className="text-on-surface-variant">
          Settings
        </Typography>
      </View>

      <View className="flex-row items-center gap-3 px-5 pt-1 pb-5">
        {variant === "loading" ? (
          <>
            <View className="size-12 animate-pulse rounded-full bg-outline-variant/40" />
            <View className="flex-1 gap-2">
              <View className="h-4 w-32 animate-pulse rounded bg-outline-variant/40" />
              <View className="h-3 w-44 animate-pulse rounded bg-outline-variant/30" />
            </View>
          </>
        ) : (
          <>
            <View className="size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="size-full"
                  resizeMode="cover"
                />
              ) : (
                <User size={20} color="#444748" />
              )}
            </View>
            <View className="min-w-0 flex-1">
              {variant === "populated" && name && (
                <Typography
                  variant="body-md"
                  numberOfLines={1}
                  className="font-semibold text-on-surface"
                >
                  {name}
                </Typography>
              )}
              {email && (
                <Typography
                  variant="label-caps"
                  numberOfLines={1}
                  className="normal-case text-on-surface-variant"
                >
                  {email}
                </Typography>
              )}
              {variant === "error" && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant/70"
                >
                  couldn't load full profile
                </Typography>
              )}
            </View>
          </>
        )}
      </View>

      <View className="px-5">
        <Pressable
          accessibilityRole="button"
          disabled={signOutState === "pending"}
          onPress={onSignOut}
          className={cn(
            "w-full flex-row items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3",
            signOutState === "pending" && "opacity-60",
          )}
        >
          <Typography variant="body-md" className="font-semibold text-on-surface">
            {signOutState === "pending" ? "signing out…" : "Sign out"}
          </Typography>
          <LogOut size={16} color="#444748" />
        </Pressable>

        {signOutState === "failed" && (
          <View className="mt-3 flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5">
            <Typography variant="body-md" className="text-text-error">
              didn't sign you out — try again?
            </Typography>
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              className="flex-row items-center gap-1.5"
            >
              <RotateCw size={12} color="#c53030" />
              <Typography variant="label-caps" className="font-mono text-text-error">
                retry
              </Typography>
            </Pressable>
          </View>
        )}
      </View>
    </MenuSheet>
  );
}
```

Notes:
- Variant + sign-out unions extracted to named types (`SettingsVariant`, `SignOutState`) — `SignOutState` is reused by the view (Step 11) by re-declaring it there, to avoid an export-only coupling; both copies are identical 3-member unions (kept local per "no barrel/re-export" memory rule; the view does not import the sheet's type).
- Avatar: `<img src alt="">` → `<Image source={{ uri: avatarUrl }} resizeMode="cover" className="size-full">`. Fallback `User` lucide icon gets `color="#444748"` (was `text-on-surface-variant`). `object-cover` → `resizeMode="cover"`.
- Sign-out button: web `<button>` → `Pressable`; `disabled` kept (RN supports it), `opacity-60` when pending kept. `hover:bg-surface-container` and `transition-colors` dropped (touch). `text-left` dropped (RN default). `LogOut` icon `color="#444748"`.
- Failure row retry: same bare-string→`Typography` treatment as Step 3; `RotateCw` `color="#c53030"`.
- `truncate` (web) → `numberOfLines={1}` on the name/email Typography (plan 05 exposes `...TextProps`, so `numberOfLines` flows through). `min-w-0` kept (harmless on RN; ensures flex child can shrink).
- `flex items-center` rows → `flex-row items-center`; `flex flex-col` inner stacks → drop `flex flex-col`.

## Step 11 — `menu-settings/settings-view.tsx` (auth-bound container)

Reads the current user from the auth store, manages idle/pending/failed sign-out, signs out via `clear()`. **No** `react-router`, **no** `js-cookie` (analysis §5 + plan briefing step 4); post-logout navigation deferred to plan 28.

```tsx
import { useState } from "react";
import { useAuthStore } from "@/layout/stores/auth-store";
import { SettingsSheet } from "./settings-sheet";

type SignOutState = "idle" | "pending" | "failed";

export function SettingsView() {
  const user = useAuthStore((store) => store.user);
  const clear = useAuthStore((store) => store.clear);
  const [signOutState, setSignOutState] = useState<SignOutState>("idle");

  function handleSignOut() {
    setSignOutState("pending");
    try {
      clear();
    } catch {
      setSignOutState("failed");
    }
  }

  return (
    <SettingsSheet
      variant={user ? "populated" : "error"}
      name={user?.name}
      email={user?.email}
      avatarUrl={user?.avatarUrl ?? undefined}
      signOutState={signOutState}
      onSignOut={handleSignOut}
      onRetry={handleSignOut}
    />
  );
}
```

Notes:
- The web version did `Cookies.remove(JWT_COOKIE)`, `Cookies.remove(PROVIDER_COOKIE)`, `clear()`, then `navigate(ROUTES.login)`. On mobile, **`clear()` alone** removes the stored user + auth token (plan 07 step 1 folds token/user removal into `clear()` via the storage layer), so the cookie removals are gone. `useNavigate`/`ROUTES`/`Cookies`/`JWT_COOKIE`/`PROVIDER_COOKIE` imports are all dropped.
- `navigate(ROUTES.login)` is **intentionally omitted** — plan 28 owns the post-logout routing (Expo Router). Without it, `signOutState` stays `pending` after a successful clear, but the menu/modal is dismissed by plan 28's reaction to the cleared auth state, so the transient `pending` label is never seen. This matches the briefing ("defer any post-logout navigation to plan 28"). The `try/catch` still flips to `failed` if `clear()` throws, driving the retry affordance.
- `read store directly` (feature-state pattern): the view selects `user` and `clear` from the store; no prop-drilling of auth state.

---

## Files created (exhaustive — nothing outside these two folders)

```
project-mobile/src/layout/components/
├── menu-detail/
│   ├── item-detail-root.tsx            (Step 1)
│   ├── item-detail-loading.tsx         (Step 2)
│   ├── item-detail-error.tsx           (Step 3)
│   ├── item-detail-gone.tsx            (Step 4)
│   ├── item-detail-captured-meta.tsx   (Step 5)
│   ├── item-detail-reminder-meta.tsx   (Step 6)
│   ├── item-detail-content.tsx         (Step 7)
│   ├── note-detail.tsx                 (Step 8)
│   └── reminder-detail.tsx             (Step 9)
└── menu-settings/
    ├── settings-sheet.tsx              (Step 10)
    └── settings-view.tsx               (Step 11)
```

No barrel/index files. One component per file. kebab-case files, PascalCase exports, no comments, no default exports.

## Out of scope

- Modal routing / overlay mounting these surfaces (plan 28). `onClose` stays a passed-in callback; `SettingsView` does no navigation.
- The `MenuSheet` bottom-sheet wrapper, grab handle, backdrop, safe-area handling (plan 21).
- Post-logout redirect to login (plan 28).
- `IconButton`/`Typography` primitive implementations and the lucide-native wiring (plan 05); tokens/`cn`/`format-time` (plan 03); data hooks (plan 08); auth store + token persistence (plan 07).
- Reanimated skeleton animation (later/risk note).

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass. No formatting/lint step for this plan. Type-check confirms: the two data hooks resolve `{ actions, state }`; `isAxiosError`/`axios` resolves; `ReminderStatus` import resolves; `Typography` variants and `numberOfLines` passthrough type-check; `useAuthStore` `user`/`clear` selectors type-check; `Image`/`Pressable`/`View`/`ScrollView` and `lucide-react-native` `size`/`color` props type-check.

## Risks to flag (not resolved here, stay in-scope-clean)

1. **`animate-pulse` on RN** — if plan 21's NativeWind setup does not provide a pulse animation, the loading skeletons (`item-detail-loading`, `settings-sheet` loading variant) render as static placeholders of the correct shape. Acceptable degradation; the proper fix (a shared Reanimated skeleton) belongs to plan 21's skeleton convention, not here.
2. **`MenuSheet` import path / name** — assumes plan 21 keeps `@/layout/components/menu/menu-sheet` exporting `MenuSheet({ children, className })`. If renamed, adjust the import in Steps 1 and 10 only.
3. **lucide-react-native color** — icons are colored via explicit hex `color` props (`#444748`, `#c53030`) because RN does not inherit `text-*` into SVG. If plan 05 wires `react-native-svg` cssInterop so `className` colors work, these could later switch to className, but the hex approach is correct and self-contained now.
4. **`IconButton` default size** — assumes plan 05's `IconButton` is `size-10` and accepts a `className` override (it does, per plan 05 Step 2); `className="size-8"` shrinks it to match web. If `cn` last-wins on `size-*` does not override (it should via the size group), the close button is slightly larger — cosmetic only.
