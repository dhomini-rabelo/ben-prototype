# Plan — Local notifications service (`src/services/`)

Port reminders to **local notifications** (decision: option 2) by introducing a single platform-integration service in the new `src/services/` convention. This service is the only place that talks to the native notifications layer; screens and stores stay agnostic. Reminders carry `firesAt`, `status` (`upcoming`/`fired`), `title` and `body`.

**Plan**

1. **Establish the service boundary**
   - Create the new `src/services/` location as the single owner of platform notification integration
   - Keep all native notification access inside this one module; nothing else in the app touches it directly
   - Expose a small, intention-revealing surface so screens and stores depend only on reminder-shaped inputs

2. **Handle notification permission**
   - Provide a way to ask the user for permission to show notifications
   - Report back clearly whether permission was granted
   - Avoid prompting again when permission is already settled

3. **Schedule a notification for a single reminder**
   - Derive the fire time from the reminder's scheduled moment
   - Show the reminder's title and body in the notification
   - Skip reminders that are already fired or whose time is in the past

4. **Cancel and reschedule on reminder changes**
   - Cancel a reminder's pending notification when it is removed or completed
   - Reschedule when a reminder's time or content changes
   - Ensure rescheduling never leaves a duplicate notification behind

5. **Map reminders to their scheduled notifications**
   - Maintain a stable association between each reminder and its scheduled notification
   - Make the mapping survive app restarts so notifications can be found and cancelled later
   - Allow looking up or removing a scheduled notification from its reminder identity alone

6. **Reconcile the full reminder set**
   - Sync the current list of reminders against what is actually scheduled
   - Schedule reminders that are due and not yet scheduled
   - Clear orphaned schedules that no longer correspond to any active reminder
