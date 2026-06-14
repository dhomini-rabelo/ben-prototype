# Plan — Port task-workspace logic cluster to project-mobile

This unit ports the non-UI task-workspace logic (Zustand stores, Jotai state, utils, page hooks) from `project-web` into `project-mobile`. The logic is platform-agnostic; the work is recreating the same behavior with only import-level and platform-primitive adjustments. Depends on the foundation + auth groundwork (plans 01–09) and the shared data hooks (plan 08). Owns only the task-workspace `stores/`, `states/`, `utils/`, and `hooks/` folders.

## Plan

1. **Port the task-workspace utilities**
   - Reproduce the diff-summary helper that turns a task's pending diff into a human-readable change summary, preserving the todo-count vs. draft-revision wording.
   - Reproduce the todo ordering helpers that compute the next ordering value and sort todo items by order.
   - Keep these pure and free of any platform dependency.

2. **Port the draft input state**
   - Recreate the shared draft state holding the in-progress task message text.
   - Keep it as a single atom so input editing and sending stay decoupled from the stores.

3. **Port the cache access helpers**
   - Recreate the helpers that read the current task from the shared server cache and that invalidate a task to force a refetch.
   - Point them at the mobile project's API client and task routes.

4. **Port the root and per-concern stores**
   - Recreate the root task store that holds the active task identifier and resets the per-concern stores.
   - Recreate the chat store: guard against empty text, in-flight replies, offline state, and missing task; send a message, refresh the task, expose awaiting/last-reply/error state.
   - Recreate the content store: edit task text only when it actually changed, then refresh.
   - Recreate the todos store: toggle a todo's done state and add a new todo (using a mobile-compatible unique id source in place of the web crypto API), then refresh.
   - Recreate the diff store: approve or reject the pending diff with an in-flight guard, then refresh.
   - Recreate the lifecycle store: finish or reopen the task with an in-flight guard, then refresh.
   - Preserve the existing best-effort / no-op-on-failure error behavior across all mutations.

5. **Port the page hooks**
   - Recreate the hook that resolves the active task: obtain the task identifier from the mobile navigation layer (route params) instead of the web router, then read the task via the shared data hooks.
   - Recreate the input hook that binds the draft state to the chat store's send action, clearing the draft on send and restoring it if sending fails.

6. **Validate the ported cluster**
   - Confirm the type checker passes with no errors across the ported folders.
   - Confirm every cross-module reference resolves against the mobile project's API, layout, and data-hook layers.
