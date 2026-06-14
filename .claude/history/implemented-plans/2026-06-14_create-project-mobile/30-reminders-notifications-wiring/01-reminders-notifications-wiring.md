# Implementation Plan 30 — Reminders ↔ notifications wiring (SYNC, runs LAST and alone)

> **Status: PLAN ONLY — do not implement yet.** Deep, code-level implementation plan for wiring
> `project-mobile`'s reminder lifecycle into the local-notifications service.
> **Runs LAST and alone.** It is **SYNC** (not parallel-safe): it edits files owned by several
> earlier plans (auth-bootstrap plan 09, messages-store plan 10, menu-reminders plan 25,
> reminder-detail plan 26) to call the service. Because it touches other plans' files, it must run
> after every other mobile plan has landed.
> **Depends on:** notifications-service (plan 29) — the only module that imports `expo-notifications`;
> reminder model + data hooks (plans 04 / 08); auth-bootstrap (plan 09); messages-store (plan 10);
> menu-reminders list (plan 25); reminder-detail (plan 26).
> **Verification:** `npx tsc --noEmit` (no formatting / no `lint:fix` step in this plan).
> **Auto-approval:** execute every step without asking the user.

---

## 1. Context & references read

- **Brief:** `30-reminders-notifications-wiring/start-briefing.md` +
  `30-reminders-notifications-wiring/briefing/01-reminders-notifications-wiring.md`.
- **Decision (`MOBILE-PORT-ANALYSIS.md`):** point under *"Decisão de produto pendente: notificações
  de reminders"* — **registered decision: local notification (option 2)** via `expo-notifications`,
  encapsulated in `project-mobile/src/services/notifications-service.ts`. Screens/stores call the
  service; they **never** import `expo-notifications`. The service: requests permission, schedules
  from `firesAt`, cancels/reschedules on change, clears orphan schedules. Push is a future evolution.
  The `src/services/` directory is the **new mobile convention** (`project-web` has no `services/`).
- **Service API consumed (plan 29, `src/services/notifications-service.ts`):**
  - `requestNotificationPermission(): Promise<boolean>`
  - `scheduleReminderNotification(reminder): Promise<void>` — schedules from `firesAt`, skips
    past / `fired`
  - `cancelReminderNotification(reminderId: string): Promise<void>`
  - `rescheduleReminderNotification(reminder): Promise<void>` — cancel-then-schedule, never duplicates
  - `syncReminderNotifications(reminders): Promise<void>` — reconcile the full set; schedule the
    due-and-unscheduled, clear orphan schedules
  - reminder id ↔ scheduled-notification id mapping is owned internally by the service (the reminder
    id is the cancel-by-identifier key; persistence via the plan-02 AsyncStorage helper if plan 29
    needs it). **This plan does not touch that mapping.**
- **Web reference (the flow being wired):**
  - `project-web/src/api/responses/agent-reply.ts` — `AgentReply.newReminders: ReminderDraft[]`,
    where `ReminderDraft = { title: string; remindAt?: string; notes?: string }`. **Drafts, not
    entities** (see §3 key finding).
  - `project-web/src/api/models/reminder.ts` — `Reminder = { id, title, firesAt: string | null,
    body: string | null, status: "upcoming" | "fired", capturedAt }`. This is the **reminder shape
    the service operates on** (it has `id` / `firesAt` / `status` / `title` / `body`).
  - `project-web/src/pages/chat/stores/messages-store/dispatch-reply.ts` — backend round-trip →
    `invalidateCapturedQueries(reply)` → append Ben message → `animateReply`.
  - `.../invalidate-captured-queries.ts` — maps captured kinds → list query invalidation
    (`reply.newReminders.length > 0` ⇒ invalidate `API_ROUTES.reminders.list`).
  - `project-web/src/layout/components/menu-reminders/menu-reminders-view.tsx` — list load point:
    `useReminderListData()` → `state.data?.items ?? []`.
  - `project-web/src/layout/components/menu-detail/reminder-detail.tsx` — detail view:
    `useReminderDetailData(reminderId)` → `state.data?.item`; computes `isGone` (404 / missing).
  - `project-web/src/layout/hooks/api/use-reminder-list-data.ts` /
    `use-reminder-detail-data.ts` — `useAPIRequest<ListingResponse<ReminderListItem>>` /
    `useAPIRequest<ItemResponse<Reminder>>`, both returning `{ state, actions }`.
- **Earlier mobile plans whose files this plan edits:**
  - Plan 09 — `src/core/auth-bootstrap.ts` (`useAuthBootstrap()` hook; runs `loadTokenIntoMemory` +
    `hydrate` + registers the 401 handler, returns `{ isReady }`).
  - Plan 10 — `src/pages/chat/stores/messages-store/` (folder: `dispatch-reply.ts`,
    `invalidate-captured-queries.ts`, etc.). Mobile copies web 1:1 except the id generator.
  - Plan 25 — `src/layout/components/menu-reminders/menu-reminders-view.tsx` (+ `-list.tsx`).
  - Plan 26 — `src/layout/components/menu-detail/reminder-detail.tsx`.
- **Design (`code-get-coding-designs`):** *Web Page Stores Structure* (messages-store stays a folder
  with one concern per file; the side-effecting logic lives in `dispatch-reply.ts` /
  `invalidate-captured-queries.ts`). *Web Feature State Components Structure* (the list/detail views
  render loading/error/empty/loaded; the wiring hooks fire on the loaded branch). *Service Structure*
  (the native integration is a single service module behind an intention-revealing surface).
- **`code-write-code` + frontend preferences:** kebab-case filenames; no comments; self-explanatory
  English; named exports; no barrel/index-only files (user memory); one component per file (user
  memory); `@/…` path-alias imports. **All notification calls go through `@/services/notifications-service`
  — no file edited here imports `expo-notifications`.**

### Cross-plan symbols consumed (already exist when this plan runs — do NOT recreate)

| Import | From | Plan | Used for |
|---|---|---|---|
| `requestNotificationPermission`, `scheduleReminderNotification`, `cancelReminderNotification`, `rescheduleReminderNotification`, `syncReminderNotifications` | `@/services/notifications-service` | 29 | every notification action |
| `Reminder`, `ReminderListItem` | `@/api/models/reminder` | 04 | reminder-shaped service inputs |
| `AgentReply` | `@/api/responses/agent-reply` | 04 | `reply.newReminders` capture signal |
| `useAuthBootstrap` (`{ isReady }`) | `@/core/auth-bootstrap` | 09 | permission request after boot |
| messages-store folder (`dispatch-reply.ts`, `invalidate-captured-queries.ts`) | `@/pages/chat/stores/messages-store` | 10 | capture-time scheduling hook |
| `useReminderListData` (`{ state, actions }`, `state.data?.items`) | `@/layout/hooks/api/use-reminder-list-data` | 08 | list-load reconcile |
| `useReminderDetailData` (`{ state, actions }`, `state.data?.item`) | `@/layout/hooks/api/use-reminder-detail-data` | 08 | detail reschedule/cancel |

---

## 2. Owned edits (the only files this plan touches — all EDITS to existing files)

```
project-mobile/
├── src/core/
│   └── auth-bootstrap.ts                                  (EDIT — request permission once after boot)
├── src/pages/chat/stores/messages-store/
│   └── invalidate-captured-queries.ts                     (EDIT — schedule on captured reminders)
├── src/layout/components/menu-reminders/
│   └── menu-reminders-view.tsx                            (EDIT — syncReminderNotifications on load)
└── src/layout/components/menu-detail/
    └── reminder-detail.tsx                                (EDIT — reschedule/cancel on detail load)
```

No new files. No new components (one-component-per-file untouched — only effects added inside existing
components). No barrel/index files. All four files already exist (owned by plans 09 / 10 / 25 / 26).

> **Why edit `invalidate-captured-queries.ts` and not `dispatch-reply.ts`** — see §3. Both are valid
> seams; the plan attaches scheduling to the capture-query-invalidation file because that is the single
> place that already inspects `reply.newReminders` and the reminder list query, keeping all
> "reminders changed → react" logic co-located. If a future refactor prefers `dispatch-reply.ts`, the
> call moves there with no behavior change.

---

## 3. KEY FINDING — `newReminders` are **drafts**, not entities (drives the whole design)

`AgentReply.newReminders` is `ReminderDraft[]` = `{ title: string; remindAt?: string; notes?: string }`.
It has **no `id`, no `status`, and no `firesAt`** — only an optional `remindAt`. The notifications
service operates on the **`Reminder` entity** (`id` / `firesAt` / `status` / `title` / `body`), because
it must key the scheduled-notification mapping by the reminder's stable `id` so it can cancel /
reschedule / reconcile later.

Consequences this plan honors:

1. **Capture time cannot reliably schedule a final notification.** A draft has no server `id` (the id
   the list/detail/cancel paths use) and may lack `remindAt`. Scheduling off a draft would create a
   notification the service can never match to the persisted reminder during `syncReminderNotifications`
   → guaranteed orphan/duplicate. **So the capture path's job is to make the persisted reminders
   reachable, then defer authoritative scheduling to the list-load reconcile.**
2. The existing `invalidateCapturedQueries(reply)` **already** invalidates `reminders.list` whenever
   `reply.newReminders.length > 0`. That invalidation causes the reminder list (when next observed) to
   refetch from the backend with real `id` / `firesAt` / `status` — and the list-load reconcile (§6)
   then schedules them. **This is the correct, idempotent scheduling path for captures.**
3. The brief item 2 ("schedule a notification for each captured reminder via the service, using each
   captured reminder's scheduled time/title/body") is satisfied by the **service's
   `syncReminderNotifications`** running on the freshly-invalidated list — every newly captured reminder
   becomes due-and-unscheduled and gets scheduled exactly once, with its real `firesAt`. The plan wires
   capture → an **explicit prefetch + sync** so the schedule happens promptly (not only the next time
   the user opens the reminders menu). See §5.

This avoids the draft-vs-entity id mismatch entirely and keeps a single source of truth (the
service-owned id↔notification map keyed by the persisted reminder id).

---

## 4. Step 1 — Request notification permission once, after boot (`src/core/auth-bootstrap.ts`)

**Goal (brief item 1):** after the user is authenticated and the app is ready, ask **once** for
notification permission via the service; respect an already-settled decision; never block the flow.

`useAuthBootstrap()` (plan 09) is the post-auth "app is ready" seam: it runs inside the protected
guard's effect, loads the token cache, hydrates the user, and flips `isReady`. The permission request
is fire-and-forget after a successful bootstrap — it must not gate `isReady` (brief: "let the rest of
the flow proceed normally whether or not permission was granted").

The service's `requestNotificationPermission()` already encapsulates "don't prompt again when settled"
(plan 29 item 2 — it reads the current permission status and only prompts when undetermined). So this
file just **calls it once** after boot succeeds; no decision-caching logic lives here.

**Edit — inside the existing `bootstrap()` async function, after `hydrate()` succeeds:**

```ts
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { setUnauthorizedHandler } from "@/api/client";
import { ROUTES } from "@/core/routes";
import { useAuthStore } from "@/layout/stores/auth-store";
import { requestNotificationPermission } from "@/services/notifications-service";
import { loadTokenIntoMemory } from "@/storage/token-storage";

export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    setUnauthorizedHandler(() => {
      useAuthStore.getState().clear();
      router.replace(ROUTES.login);
    });

    async function bootstrap() {
      await loadTokenIntoMemory();
      await useAuthStore.getState().hydrate();
      if (isActive) {
        setIsReady(true);
      }
      void requestNotificationPermission();
    }

    void bootstrap();

    return () => {
      isActive = false;
      setUnauthorizedHandler(() => {});
    };
  }, []);

  return { isReady };
}
```

Notes:
- **`void requestNotificationPermission()`** — fire-and-forget, placed **after** `setIsReady(true)` so
  it never delays the guard rendering the protected stack. The boolean result is intentionally
  ignored here (brief: proceed whether granted or not); scheduling later simply no-ops if permission
  was denied (the service skips scheduling without permission — plan 29).
- **Called after `hydrate()`** so it only fires for a session that actually booted (a 401 path returns
  before reaching here via the guard's redirect; on a genuine cold-but-unauthed start the guard
  redirects to login and the protected layout — hence this effect — does not stay mounted). This is the
  "after the user is authenticated and the app is ready" moment the brief asks for.
- **Idempotency / re-prompt safety** is the service's responsibility, not this file's: every call to
  `requestNotificationPermission()` is safe because the service checks the settled status first. If the
  guard re-mounts, a second call is a cheap status read, not a second prompt.
- **No `isActive` guard around the permission call** — it has no `setState`, so a late resolve after
  unmount is harmless; wrapping it would add nothing.
- This is the **only** change to `auth-bootstrap.ts`: one import + one fire-and-forget line. The 401
  wiring, token load, and hydrate from plan 09 are untouched.

---

## 5. Step 2 — Schedule on captured new reminders (`messages-store/invalidate-captured-queries.ts`)

**Goal (brief item 2):** when a chat reply reports newly captured reminders, ensure each becomes a
scheduled notification — using its real scheduled time/title/body — without changing how captured data
refreshes the rest of the app.

Per §3, the reply's `newReminders` are drafts (no id/firesAt), so we **refetch the authoritative
reminder list and hand it to the service**, rather than scheduling off drafts. The existing function
already invalidates `reminders.list` when reminders were captured; we extend that branch to **refetch
that query and reconcile** through `syncReminderNotifications`.

**Edit — keep the whole existing body, then add a reminders-specific reconcile when reminders were
captured:**

```ts
import { queryClient } from "@/api/client";
import type { ReminderListItem } from "@/api/models/reminder";
import type { CaptureKind } from "@/api/models/message";
import { API_ROUTES } from "@/api/routes";
import type { AgentReply } from "@/api/responses/agent-reply";
import type { ListingResponse } from "@/api/types";
import { syncReminderNotifications } from "@/services/notifications-service";

const LIST_ROUTE_BY_KIND: Record<CaptureKind, string> = {
  note: API_ROUTES.notes.list,
  task: API_ROUTES.tasks.list,
  reminder: API_ROUTES.reminders.list,
};

async function scheduleCapturedReminders() {
  const listing = await queryClient.fetchQuery<ListingResponse<ReminderListItem>>({
    queryKey: [API_ROUTES.reminders.list],
  });
  await syncReminderNotifications(listing.items);
}

export function invalidateCapturedQueries(reply: AgentReply) {
  const capturedKinds = new Set<CaptureKind>();

  if (reply.newNotes.length > 0) capturedKinds.add("note");
  if (reply.newTasks.length > 0) capturedKinds.add("task");
  if (reply.newReminders.length > 0) capturedKinds.add("reminder");
  if (reply.capture) capturedKinds.add(reply.capture.kind);

  if (capturedKinds.size === 0) return;

  for (const kind of capturedKinds) {
    queryClient.invalidateQueries({ queryKey: [LIST_ROUTE_BY_KIND[kind]] });
  }

  queryClient.invalidateQueries({ queryKey: [API_ROUTES.captures.counts] });

  if (capturedKinds.has("reminder")) {
    void scheduleCapturedReminders();
  }
}
```

Notes:
- **The original signature and behavior are preserved** — `invalidateCapturedQueries(reply)` stays
  synchronous and still invalidates the same three query families exactly as plan 10 copied from web.
  The only addition is the trailing `if (capturedKinds.has("reminder"))` branch (brief: "keep this
  scheduling alongside the existing capture-handling behavior without changing how captured data
  refreshes the rest of the app").
- **`void scheduleCapturedReminders()`** is fire-and-forget so `dispatchReply` (plan 10) is not slowed:
  `dispatch-reply.ts` calls `invalidateCapturedQueries(reply)` then immediately appends the Ben message
  and starts the typing animation — the notification scheduling runs in the background and must not
  block that UX.
- **`queryClient.fetchQuery` (not `getQueryData`)** is used so the refetch actually reaches the backend
  and returns reminders with real `id` / `firesAt` / `status` (the just-invalidated cache is stale).
  The `queryKey: [API_ROUTES.reminders.list]` exactly matches the key the reminder-list hook uses
  (plan 08's `useReminderListData` → `useAPIRequest({ url: API_ROUTES.reminders.list })`, whose generic
  hook keys by `[url]` — confirm against plan 06's `useAPIRequest` queryKey shape; if plan 06 keys with
  more than `[url]`, mirror that exact key here — this is the one integration seam to verify).
- **`syncReminderNotifications(listing.items)`** does the actual work: every newly captured reminder is
  now due-and-unscheduled in the authoritative list → the service schedules it once (with its real
  `firesAt`/title/body), skipping `fired`/past ones, and clears any orphan — covering brief item 2
  through the same reconcile primitive item 3 uses. No draft is ever passed to the service.
- **`ReminderListItem` = `Reminder`** (model `reminder.ts`), so `listing.items` is already the
  reminder-shaped input the service expects; no mapping needed.
- **No `expo-notifications` import** — only `@/services/notifications-service`.

> **Alternative considered & rejected:** scheduling directly from `reply.newReminders` inside
> `dispatch-reply.ts`. Rejected because drafts lack the stable `id`/`firesAt` the service's mapping and
> later cancel/reconcile depend on (→ orphans/duplicates). The refetch-then-sync path is the only one
> that keeps the id↔notification map authoritative. Documented per "NO GUESSING".

---

## 6. Step 3 — Reconcile on reminder list load (`menu-reminders/menu-reminders-view.tsx`)

**Goal (brief item 3):** when the current reminder list is available, hand the full set to the service
to sync — schedule the due-but-unscheduled, clear schedules with no matching active reminder.

The list-load point is `MenuRemindersView`, which already reads `useReminderListData()` and derives
`reminders = state.data?.items ?? []`. We add an effect that calls `syncReminderNotifications` whenever
the loaded list changes (and only once loading has succeeded).

**Edit — add the import, `useEffect`, and a load-success-gated sync; the existing render is unchanged:**

```tsx
import { useEffect } from "react";
import { MenuListEmpty } from "@/layout/components/menu-list/menu-list-empty";
import { MenuListError } from "@/layout/components/menu-list/menu-list-error";
import { MenuListLoading } from "@/layout/components/menu-list/menu-list-loading";
import { MenuListShell } from "@/layout/components/menu-list/menu-list-shell";
import { useReminderListData } from "@/layout/hooks/api/use-reminder-list-data";
import { useMenuStore } from "@/layout/stores/menu-store";
import { syncReminderNotifications } from "@/services/notifications-service";
import { MenuRemindersList } from "./menu-reminders-list";

export function MenuRemindersView() {
  const { actions, state } = useReminderListData();
  const goBackToMenu = useMenuStore((store) => store.goBackToMenu);
  const openDetail = useMenuStore((store) => store.openDetail);
  const reminders = state.data?.items ?? [];

  useEffect(() => {
    if (state.isLoading || state.isError || !state.data) {
      return;
    }
    void syncReminderNotifications(state.data.items);
  }, [state.isLoading, state.isError, state.data]);

  return (
    /* …existing MenuListShell / loading / error / empty / MenuRemindersList render, unchanged… */
  );
}
```

Notes:
- **Effect gated on a successful load** (`!isLoading && !isError && state.data`) so we only ever sync a
  real, fully-loaded list — never `[]` while loading (which would wrongly look like "no reminders" and
  prompt the service to clear everything as orphans). This is the precise meaning of brief item 3's
  "when the current reminder list is available".
- **`syncReminderNotifications(state.data.items)`** reconciles both directions in one call (schedule
  due-and-unscheduled, clear orphans) — the service owns the diff against its persisted id↔notification
  map (plan 29 item 6). The screen passes only reminder-shaped data; it has no knowledge of what is
  currently scheduled.
- **Dependency array uses `state.data`** (the query's data object reference) rather than the derived
  `reminders` array — `reminders` is re-created (`?? []`) every render and would re-fire the effect
  needlessly; `state.data` changes reference only on an actual data change (React Query returns a stable
  reference between renders for unchanged data). If plan 06's `useAPIRequest` exposes the items at a
  different path than `state.data.items` (e.g. `state.items`), adjust the read + deps to match that
  shape — single integration seam, no logic change.
- **`void`** the promise — list rendering must not await scheduling.
- This is the **only place orphan-clearing is guaranteed** (brief verification: "orphaned schedules
  disappear on list load"): completing/deleting a reminder elsewhere makes it absent from the next
  loaded list, so this sync drops its schedule.
- **`menu-reminders-list.tsx` is NOT edited** — it is purely presentational; the wiring belongs in the
  view that owns the data hook.

---

## 7. Step 4 — Reschedule / cancel from reminder detail (`menu-detail/reminder-detail.tsx`)

**Goal (brief item 4):** when a reminder's fire time or content changes, reschedule via the service;
when it is completed or removed, cancel its pending notification; never leave duplicates or stale
schedules.

`ReminderDetail` already loads a single `Reminder` via `useReminderDetailData(reminderId)` and computes
`isGone` (404 or missing → the reminder no longer exists / was removed). We add an effect that, on each
settled detail load:

- **reschedules** when a live reminder is present (covers a changed `firesAt`/`title`/`body`, and is a
  no-op-equivalent re-assert when nothing changed — `rescheduleReminderNotification` is cancel-then-
  schedule, so it never duplicates; the service also skips `fired`/past, which cancels a now-`fired`
  reminder's pending schedule);
- **cancels** when the detail resolves to gone (removed / not found).

**Edit — add the import + a settled-load effect; the existing render is unchanged:**

```tsx
import { useEffect } from "react";
import { isAxiosError } from "axios";
import { useReminderDetailData } from "@/layout/hooks/api/use-reminder-detail-data";
import {
  absoluteDateTime,
  firesAtRelative,
  relativeTime,
} from "@/layout/utils/format-time";
import {
  cancelReminderNotification,
  rescheduleReminderNotification,
} from "@/services/notifications-service";
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

  useEffect(() => {
    if (state.isLoading) {
      return;
    }
    if (reminder) {
      void rescheduleReminderNotification(reminder);
      return;
    }
    if (isGone) {
      void cancelReminderNotification(reminderId);
    }
  }, [state.isLoading, reminder, isGone, reminderId]);

  return (
    /* …existing ItemDetailRoot / loading / gone / error / ItemDetailContent render, unchanged… */
  );
}
```

Notes:
- **`rescheduleReminderNotification(reminder)`** is the safe primitive for "fire time or content
  changed": plan 29 specifies it cancels the existing schedule (by the reminder `id`) before scheduling
  the new one, so it **never leaves a duplicate** (brief item 4 last bullet). Re-asserting on every
  detail open when nothing changed is harmless and cheap, and guarantees the device matches the latest
  server state (the detail fetch is the freshest single-reminder data we have). A reminder whose
  `status` flipped to `fired` (or whose `firesAt` is now past) is handled by the service's skip rule —
  reschedule effectively **cancels** it, which is the correct "completed" behavior.
- **`cancelReminderNotification(reminderId)` on `isGone`** covers "removed" — a 404 / missing detail
  means the reminder no longer exists, so its pending notification must go. Keyed by `reminderId`
  (always in scope from props), not by the absent `reminder` object.
- **Effect gated on `!state.isLoading`** so we never act on a half-loaded state; the `reminder` vs
  `isGone` branches are mutually exclusive given the existing derivations. The error-but-not-404 branch
  (`state.isError && !isNotFound`) deliberately does **nothing** — a transient fetch error must not
  cancel a valid schedule (we lack the data to decide). Only a definitive *gone* cancels.
- **Deps** include `reminder` (reference changes when the loaded reminder changes) and `reminderId`
  (changes when the modal is opened for a different reminder). `isGone` is derived from those + load
  flags; including it keeps the effect honest if the derivation evolves.
- **No edit to `item-detail-*` children** — they are presentational; the lifecycle wiring lives in the
  detail view that owns the data hook, mirroring §6.
- If plan 26's final `reminder-detail.tsx` renamed `state.data?.item` or the `isGone` derivation,
  adjust the effect's reads to match — single integration seam, behavior unchanged.

---

## 8. Step 5 — Keep the native integration isolated (cross-cutting invariant)

**Goal (brief item 5):** route every permission / schedule / reschedule / cancel / sync action through
the single service; keep stores and screens free of any direct `expo-notifications` dependency.

- Every edit above imports **only** from `@/services/notifications-service`. No file edited here
  imports `expo-notifications`, references `Notifications.*`, or touches the id↔notification map.
- The five service entry points are each used exactly once at the right lifecycle moment:
  `requestNotificationPermission` (boot, §4), `syncReminderNotifications` (capture §5 + list-load §6),
  `rescheduleReminderNotification` + `cancelReminderNotification` (detail §7). `scheduleReminderNotification`
  is **not called directly** by this plan — captures route through `syncReminderNotifications` (§3/§5) so
  the service stays the sole owner of the schedule-vs-skip decision and the id mapping. (If plan 29's
  surface omits a single-reminder reschedule and only exposes schedule+cancel, §7 becomes
  `cancelReminderNotification` then `scheduleReminderNotification` — same net effect; prefer
  `rescheduleReminderNotification` if present.)
- **Verification of isolation** (run after implementing): a grep confirms no leak.

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile \
  && grep -rn "expo-notifications" src app | grep -v "src/services/notifications-service"
```

Must return nothing (only the plan-29 service file may import `expo-notifications`).

---

## 9. End-to-end flow trace (verifies the wiring)

1. **Boot:** user authenticates → protected guard mounts → `useAuthBootstrap()` loads token + hydrates
   user → `isReady` → `void requestNotificationPermission()` prompts once (or no-ops if already
   settled). Flow proceeds regardless of the answer.
2. **Capture:** user says "remind me to…" → `sendText` → `dispatchReply` → backend returns
   `AgentReply` with `newReminders` (drafts) → `invalidateCapturedQueries(reply)` invalidates the three
   query families **and** (reminder branch) `void scheduleCapturedReminders()` → `fetchQuery` pulls the
   authoritative reminder list (real ids/firesAt) → `syncReminderNotifications` schedules each new
   reminder once. Ben's reply animation runs unblocked.
3. **List load:** user opens the reminders menu → `MenuRemindersView` loads via `useReminderListData`
   → on success the effect calls `syncReminderNotifications(items)` → due-and-unscheduled get
   scheduled, orphans (completed/deleted reminders no longer in the list) get cleared.
4. **Detail change:** user opens a reminder → `ReminderDetail` loads via `useReminderDetailData` → live
   reminder ⇒ `rescheduleReminderNotification` (re-asserts latest firesAt/title/body, no duplicate;
   skips/cancels if now `fired`/past); gone (404/missing) ⇒ `cancelReminderNotification(reminderId)`.
5. **Isolation:** every step touched only `@/services/notifications-service`; the grep in §8 is clean.

This satisfies the brief's functional acceptance: *a captured reminder produces a scheduled
notification* (step 2/3) and *orphaned schedules disappear on list load* (step 3).

---

## 10. Things explicitly NOT done here

- **No new files / no `expo-notifications` import** — plan 29 owns the service and the only
  `expo-notifications` import; this plan only **calls** it.
- **No edits to the id↔notification mapping or persistence** — owned by plan 29.
- **No scheduling off `reply.newReminders` drafts** — rejected (§3/§5) because drafts lack the stable
  `id`/`firesAt` the service requires; captures schedule via the authoritative refetch+sync.
- **No edits to `menu-reminders-list.tsx`, `item-detail-*` children, or `dispatch-reply.ts`** — the
  wiring lives in the data-owning views (`menu-reminders-view.tsx`, `reminder-detail.tsx`) and the
  capture-reaction file (`invalidate-captured-queries.ts`).
- **No changes to web** (`project-web`) — this is a `project-mobile` task only.
- **No backend changes** — local notifications only (analysis option 2); push is future work.
- **No formatting / `lint:fix` step** — verification is type-check only, per task instruction.

---

## 11. Conventions honored

- kebab-case filenames; named exports; no comments; self-explanatory English; `@/…` path-alias
  imports; one component per file (no new components — only effects added to existing components);
  no barrel/index-only files.
- *Web Page Stores Structure* — the messages-store stays a folder with one concern per file; the new
  reminder-scheduling side effect lives in the existing `invalidate-captured-queries.ts` (the file that
  already reacts to captures), keeping `index.ts` thin.
- *Web Feature State Components Structure* — list/detail keep their loading/error/empty/loaded render
  order; the notification effects fire only on the settled/loaded branch.
- *Service Structure* — all native notification access stays behind the single
  `@/services/notifications-service` surface (§8).

---

## 12. Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with zero errors across the four edited files. Then the isolation grep (§8) must return
nothing outside `src/services/notifications-service`. Functional acceptance (brief §30): a captured
reminder schedules a local notification (§9 step 2/3); orphaned schedules clear on list load (§9 step 3).

> If `tsc` fails solely on a differing dependency surface — e.g. plan 06's `useAPIRequest` query-key
> shape or `state.data` path, plan 29's exact service export names, or plan 26's final detail
> derivations — adjust only the corresponding import/read/key line to match that plan's landed surface.
> No logic change. These are the documented integration seams (called out inline in §5/§6/§7).
