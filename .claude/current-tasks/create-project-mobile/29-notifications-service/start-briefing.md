# Plan 29 — Notifications service (`src/services/notifications-service.ts`)

**Plan 17 [Frontend] (parallel)**: Create the local-notifications service (new `src/services/` convention).

- Depends on the reminder model (04) and reminder data hooks (08). Owns the new `src/services/` directory. Runs at its own slot; the wiring into reminder flows is plan 30.

## Goal

Implement the **decision registered in the analysis**: reminders fire a **local notification** (option 2) via **`expo-notifications`**. Encapsulate all of it in a service so screens/stores never import `expo-notifications` directly (the new `src/services/` convention the analysis introduces — `project-web` has no `services/`).

## Scope / owned files

- `project-mobile/src/services/notifications-service.ts` — the single module importing `expo-notifications`:
  - `requestNotificationPermission(): Promise<boolean>`.
  - `scheduleReminderNotification(reminder)`: schedule a local notification from `firesAt` (skip past/`fired`).
  - `cancelReminderNotification(reminderId)` and `rescheduleReminderNotification(reminder)`.
  - `syncReminderNotifications(reminders)`: reconcile scheduled notifications with the current reminder list — clears **orphan** schedules.
  - Maps reminder id ↔ scheduled-notification id (persist the map via AsyncStorage helper from plan 02 if needed, or `expo-notifications` cancel-by-identifier using the reminder id as the identifier).

## Verification

`npx tsc --noEmit` passes. No screen/store imports `expo-notifications` directly.
