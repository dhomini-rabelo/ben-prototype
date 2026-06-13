# Plan — Wire the notifications service into reminder flows

Connect the local notifications service (plan 29) to the reminder lifecycle so reminders actually schedule device notifications. This unit only edits files already owned by earlier plans (auth bootstrap, chat capture handling, reminder list, reminder detail) to call the service. It runs last and alone because it touches several other plans' files. Every notification action goes through the service; no screen or store touches the native notifications layer directly.

**Plan**

1. **Request notification permission at the right moment**
   - After the user is authenticated and the app is ready, ask once for permission to show notifications through the service
   - Respect an already-settled permission decision instead of prompting repeatedly
   - Let the rest of the flow proceed normally whether or not permission was granted

2. **Schedule notifications when the agent captures new reminders**
   - When a chat reply reports newly captured reminders, schedule a notification for each of them via the service
   - Use each captured reminder's scheduled time, title, and body for its notification
   - Keep this scheduling alongside the existing capture-handling behavior without changing how captured data refreshes the rest of the app

3. **Reconcile notifications when the reminder list loads**
   - When the current reminder list is available, hand the full set to the service to sync against what is actually scheduled
   - Ensure due reminders that are not yet scheduled get scheduled
   - Ensure schedules with no matching active reminder are cleared

4. **Reschedule or cancel from the reminder detail view**
   - When a reminder's fire time or content changes, reschedule its notification through the service
   - When a reminder is completed or removed, cancel its pending notification
   - Avoid leaving duplicate or stale notifications after any change

5. **Keep the native integration isolated**
   - Route all permission, schedule, reschedule, cancel, and sync actions through the single notifications service
   - Keep stores and screens free of any direct dependency on the native notifications layer
   - Verify the wiring end to end: a captured reminder produces a scheduled notification and orphaned schedules disappear on list load
