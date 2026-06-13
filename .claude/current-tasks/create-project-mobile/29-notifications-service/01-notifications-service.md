# Implementation Plan 29 — Local notifications service (`project-mobile/src/services/notifications-service.ts`)

> **Code-level plan only. DO NOT implement yet.** This plan creates the single platform-integration module that encapsulates `expo-notifications` for reminders. It owns the brand-new `src/services/` convention. Parallel-safe: it touches **only** `project-mobile/src/services/`.

## Context & references read

- **Brief:** `29-notifications-service/start-briefing.md` + `briefing/01-notifications-service.md`.
- **Decision:** `MOBILE-PORT-ANALYSIS.md` §87–95 — *"Decisão registrada: notificação local (opção 2)"*: reminders fire a **local** notification via **`expo-notifications`**, scheduled on-device from `firesAt`. No backend change; push is a future evolution. Screens/stores must never import `expo-notifications` directly.
- **New convention:** `MOBILE-PORT-ANALYSIS.md` §128–132 — `project-web` has **no** `src/services/`; mobile introduces it to encapsulate platform integrations. `notifications-service.ts` is the **only** module importing `expo-notifications`.
- **Reminder model (plan 04):** `project-web/src/api/models/reminder.ts` is copied intact to `project-mobile/src/api/models/reminder.ts`:
  ```typescript
  export type ReminderStatus = "upcoming" | "fired";
  export interface Reminder {
    id: string;
    title: string;
    firesAt: string | null;
    body: string | null;
    status: ReminderStatus;
    capturedAt: string;
  }
  export type ReminderListItem = Reminder;
  ```
- **Storage layer (plan 02):** `project-mobile/src/storage/` uses plain async functions over `@react-native-async-storage/async-storage` with a self-contained typed shape, graceful try/catch reads (missing/unparseable → `null`), named exports, no class, no barrel. This plan follows that exact style for its persisted id↔id map.
- **Scaffold (plan 01):** declares `"expo-notifications": "~0.32.0"` (Expo **SDK 54**, RN 0.81, React 19) and registers the `expo-notifications` config plugin. The `@/` alias (`@/api/...`, `@/storage/...`) is wired via tsconfig paths + `babel-plugin-module-resolver`.
- **Consumer (plan 30 — wiring, NOT this plan):** `start-briefing.md` confirms the consumed surface — request permission after auth / on first reminder; schedule when reminders appear/change; cancel/reschedule on change; **reconcile on list load**. All via this service; stores/screens stay free of `expo-notifications`.

### Coding designs / patterns applied

- `code-get-coding-designs` — no existing design covers `src/services/` (it is new). The closest precedent is plan 02's storage layer (plain async functions, named exports, self-contained types, graceful reads). This plan mirrors that functional style rather than introducing a class.
- `code-write-code` + front-end/general code preferences:
  - **kebab-case** filename (`notifications-service.ts`).
  - **No comments**; self-explanatory names.
  - **English** identifiers; **named exports** only.
  - **Path-alias imports** (`@/api/models/reminder`), never deep relative paths.
  - **No barrel/index** file (memory rule: no export-only files) — plan 30 imports the concrete module directly.
  - **One responsibility per unit**; intention-revealing surface that depends only on reminder-shaped inputs.

---

## Key design decisions

### 1. Reminder id IS the notification identifier — no persisted map needed

`expo-notifications` lets us **choose** the scheduled-notification identifier when scheduling, via `scheduleNotificationAsync({ identifier, content, trigger })`, and cancel by that same identifier via `cancelScheduledNotificationAsync(identifier)`. The reminder `id` is already a stable, unique string. Using it directly as the notification identifier means:

- `cancelReminderNotification(reminderId)` → `cancelScheduledNotificationAsync(reminderId)` with **no lookup**.
- `rescheduleReminderNotification(reminder)` → cancel-then-schedule on the same identifier (idempotent; never leaves a duplicate).
- `syncReminderNotifications(reminders)` → list scheduled notifications, treat each scheduled `identifier` as a reminder id, and reconcile against the current set.

This satisfies the brief's *"use the reminder id as the notification identifier, **or** a persisted map via AsyncStorage"* by taking the **simpler, restart-safe** branch: the OS persists scheduled notifications (and their identifiers) across app restarts, so the association survives restarts **without** us persisting anything ourselves. The AsyncStorage map is therefore **not** built — it would be redundant state to keep in sync with the OS scheduler and a second source of truth for orphan detection. (Documented as a rejected alternative below.)

> **NO GUESSING guard:** `scheduleNotificationAsync` accepting a caller-supplied `identifier` and `getAllScheduledNotificationsAsync()` exposing `.identifier` per request are the documented SDK 54 (`expo-notifications` ~0.32) API. If, at implementation time, `tsc` against the installed types shows the `identifier` field is not accepted on the input, fall back to the **AsyncStorage map** variant in "Rejected alternative A" below — the public service surface is identical either way, so plan 30 is unaffected.

### 2. SDK 54 date trigger shape

In `expo-notifications` ~0.32, a one-shot calendar trigger is typed as a `DateTriggerInput`: `{ type: SchedulableTriggerInputTypes.DATE, date: Date | number }`. We pass a `Date` derived from `reminder.firesAt`. (A bare `Date` is also accepted at runtime, but the explicit `{ type: SchedulableTriggerInputTypes.DATE, date }` form is the type-safe, version-correct shape and is what we write.)

### 3. Skip rules — encapsulated in one guard

A reminder is **schedulable** iff: `status !== "fired"` **and** `firesAt` is non-null **and** the parsed `firesAt` is **strictly in the future** (`> Date.now()`). The brief's *"skip reminders that are already fired or whose time is in the past"* maps directly. A single `getSchedulableFireDate(reminder)` helper returns the `Date` or `null`, so every public function shares one definition of "schedulable" — no duplicated date logic (mirrors web's centralized `firesAt` handling in `format-time.ts`, though we do not import it; this module needs only the millisecond comparison).

### 4. Permission handling — settle, don't re-prompt

`requestNotificationPermission()` first reads current status via `getPermissionsAsync()`; if already `granted` it returns `true` without prompting; if `granted === false` **and** `canAskAgain === false` (user permanently denied) it returns `false` without prompting; otherwise it calls `requestPermissionsAsync()` and returns whether the result is granted. This satisfies *"avoid prompting again when permission is already settled"*.

### 5. Android notification channel

On Android, scheduled notifications require a channel to display. `expo-notifications` posts to the `default` channel automatically in managed Expo if none is set, but to be explicit and avoid silent drops, the service ensures a `default` channel exists (idempotent) the first time we schedule. This is wrapped in `ensureAndroidChannel()` guarded by `Platform.OS === "android"`. (Kept internal; not part of the public surface.)

### 6. Foreground presentation handler

So a notification that fires while the app is foregrounded is still shown, we set a module-level `Notifications.setNotificationHandler(...)`. This is a one-time module-load side effect that belongs to the notifications integration and nowhere else — consistent with keeping **all** `expo-notifications` contact in this single module.

---

## Owned file — `project-mobile/src/services/notifications-service.ts`

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { Reminder } from "@/api/models/reminder";

const ANDROID_CHANNEL_ID = "default";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function getSchedulableFireDate(reminder: Reminder): Date | null {
  if (reminder.status === "fired" || reminder.firesAt === null) {
    return null;
  }
  const fireDate = new Date(reminder.firesAt);
  const fireTime = fireDate.getTime();
  if (Number.isNaN(fireTime) || fireTime <= Date.now()) {
    return null;
  }
  return fireDate;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  const fireDate = getSchedulableFireDate(reminder);
  if (fireDate === null) {
    return;
  }
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: reminder.title,
      body: reminder.body ?? undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

export async function cancelReminderNotification(
  reminderId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId);
}

export async function rescheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  await cancelReminderNotification(reminder.id);
  await scheduleReminderNotification(reminder);
}

export async function syncReminderNotifications(
  reminders: Reminder[],
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIds = new Set(scheduled.map((item) => item.identifier));
  const schedulableIds = new Set<string>();

  for (const reminder of reminders) {
    if (getSchedulableFireDate(reminder) === null) {
      continue;
    }
    schedulableIds.add(reminder.id);
    if (!scheduledIds.has(reminder.id)) {
      await scheduleReminderNotification(reminder);
    } else {
      await rescheduleReminderNotification(reminder);
    }
  }

  for (const scheduledId of scheduledIds) {
    if (!schedulableIds.has(scheduledId)) {
      await cancelReminderNotification(scheduledId);
    }
  }
}
```

### Per-function mapping to the brief

| Brief requirement | Function | Notes |
|---|---|---|
| `requestNotificationPermission(): Promise<boolean>` | `requestNotificationPermission` | Reads settled status first; only prompts when askable; returns granted boolean. |
| Schedule from `firesAt`, skip past/`fired` | `scheduleReminderNotification(reminder)` | `getSchedulableFireDate` guard returns early for fired / null / past / unparseable. Title + body from the reminder. |
| `cancelReminderNotification(reminderId)` | `cancelReminderNotification` | Cancel by identifier = reminder id; no lookup. |
| `rescheduleReminderNotification(reminder)` | `rescheduleReminderNotification` | Cancel-then-schedule on the same identifier → never duplicates. |
| `syncReminderNotifications(reminders)` — reconcile + clear orphans | `syncReminderNotifications` | Schedules missing schedulables, reschedules existing ones (picks up time/body changes), and **cancels any scheduled identifier not in the current schedulable set** (orphans: deleted, completed→`fired`, or now-past reminders). |
| reminder id ↔ notification id mapping | (implicit) | The reminder `id` **is** the notification identifier; the OS persists it across restarts. No AsyncStorage map needed (decision 1). |

### Reconciliation logic (orphan handling) in detail

`syncReminderNotifications` is the heart of brief step 6. It computes two sets:

- `scheduledIds` — what the OS currently has scheduled (each scheduled item's `identifier`, which by construction equals a reminder id).
- `schedulableIds` — reminder ids from the incoming list that pass `getSchedulableFireDate` (upcoming + future + has a time).

Then:
1. **Ensure schedulables are scheduled & current** — for each schedulable reminder: if not already scheduled → schedule; if already scheduled → reschedule (cheap, idempotent, captures any `firesAt`/`title`/`body` edit since last sync).
2. **Clear orphans** — any `scheduledId` not in `schedulableIds` is cancelled. This covers reminders that were **deleted**, **completed** (`status: "fired"`), had their **time removed** (`firesAt: null`), or whose **fire time has passed**. This is exactly the brief's *"clears orphan schedules"*.

> Sequential `await` (not `Promise.all`) is intentional: it keeps ordering deterministic and avoids hammering the native scheduler with a burst of concurrent calls. Reminder lists are small (a user's captures), so this is not a performance concern.

---

## Rejected alternative A — AsyncStorage persisted id↔id map

The brief allows *"a persisted map via AsyncStorage"*. We reject it because:

- The reminder id is already unique and accepted as the notification identifier, so there is **nothing extra to map** (it would be an identity map `id → id`).
- The OS scheduler already persists scheduled notifications (and their identifiers) across restarts, so the association is durable **without** our own storage.
- A separate AsyncStorage map would be a **second source of truth** for orphan detection that could drift from the real OS scheduler state, reintroducing exactly the orphan bugs `syncReminderNotifications` exists to prevent. `getAllScheduledNotificationsAsync()` is the authoritative source.

**Fallback trigger:** only if implementation reveals that the installed `expo-notifications` ~0.32 types/runtime do **not** accept a caller-supplied `identifier` (NO GUESSING guard in decision 1). In that case, build `project-mobile/src/services/notification-map-storage.ts` (mirroring plan 02's storage style: `getNotificationId(reminderId)`, `setNotificationId(reminderId, notificationId)`, `removeNotificationId(reminderId)`, `getAllMappings()` over a single `@ben/reminder-notification-map` AsyncStorage JSON blob, graceful try/catch reads), let `scheduleNotificationAsync` return its generated id, and key cancel/sync off the stored map. The **public service surface stays identical**, so plan 30 needs no change. This file is **not** created unless the guard fires.

---

## Things explicitly NOT done here (owned by other plans)

- **No wiring into reminder flows / stores / screens** — that is **plan 30** (`reminders-notifications-wiring`). Plan 30 calls `requestNotificationPermission` after auth (`core/auth-bootstrap.ts`, plan 09) and calls `schedule`/`cancel`/`reschedule`/`sync` from the reminder data hooks (plan 08) and list load. This plan only provides the callable surface.
- **No `expo-notifications` import anywhere else** — this module is the sole importer (analysis §132 + brief verification). Plan 30 must not import it directly.
- **No reminder model edits** — `models/reminder.ts` is owned by plan 04; imported type-only here.
- **No `app.config.ts` / plugin / permission config** — the `expo-notifications` dependency + plugin are owned by plan 01.
- **No barrel/index file** in `src/services/` (no export-only files rule); plan 30 imports `@/services/notifications-service` directly.
- **No formatting step** (per task instructions).
- **No changes outside `src/services/`** — parallel-safe. `@/api/models/reminder` is a read-only type dependency owned by plan 04.

---

## Implementation order (when executed)

1. Create `project-mobile/src/services/`.
2. Write `notifications-service.ts` exactly as above.
3. Run the verification; if it fails **only** because the installed `expo-notifications` types reject the supplied `identifier`, switch to Rejected-alternative-A fallback (add `notification-map-storage.ts`, keep the public surface identical).

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

Must pass with no errors. Manual check of the brief's hard constraint: `grep -rn "expo-notifications" project-mobile/src` returns **only** `src/services/notifications-service.ts`. (No formatting step, per instructions.)

### Verification caveat

`expo-notifications` is installed by plan 01 and `@/api/models/reminder` is created by plan 04. If this plan is type-checked **before** those land, `tsc --noEmit` reports missing-module errors for those two imports only; in that case verify the file in isolation against the installed `expo-notifications` types, and treat the full-project `tsc --noEmit` as the gate once plans 01 + 04 are merged.
