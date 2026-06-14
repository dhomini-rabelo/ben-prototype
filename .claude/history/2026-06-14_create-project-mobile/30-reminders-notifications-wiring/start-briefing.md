# Plan 30 — Wire the notifications service into reminder flows

**Plan 18 [Frontend] (sync)**: Connect the notifications service to the reminder lifecycle.

- Runs **last and alone**. It edits files owned by several earlier plans (auth bootstrap, reminders list/detail, chat capture handling) to call the service, so it must run sequentially after everything.

## Goal

Make reminders actually schedule local notifications via the service (plan 29) without screens/stores touching `expo-notifications`. Request permission at the right moment, schedule when reminders appear/change, and reconcile on list load.

## Scope / owned files (edits to existing files)

- `src/core/auth-bootstrap.ts` (plan 09) — after auth, request notification permission once (or defer to first reminder) via `notifications-service`.
- Reminder list flow (plan 25 `menu-reminders` and/or the reminder data hook usage) — on reminder list load, call `syncReminderNotifications(reminders)`.
- Capture handling in `messages-store/invalidate-captured-queries.ts` or `dispatch-reply.ts` (plan 10) — when the agent returns `newReminders`, call `scheduleReminderNotification` for each.
- Reminder detail (plan 26 `reminder-detail.tsx`) — reschedule/cancel hooks if a reminder's `firesAt`/status changes.

All calls go through `src/services/notifications-service.ts` (plan 29). Keep stores/screens free of direct `expo-notifications` imports.

## Verification

`npx tsc --noEmit` passes; a captured reminder schedules a local notification; orphans are cleared on list load.
