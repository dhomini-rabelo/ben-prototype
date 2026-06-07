# Plan 1 [Frontend] — Done-overlay (toast) component

A simple, high-level plan for building the celebratory completion overlay shown when a Task Workspace task is finished. This plan is self-contained and only creates new files inside the `workspace-done-overlay/` folder.

---

**Plan**

1. **Define the overlay's role and scope**
   - Treat the overlay as a pure presentational element with no awareness of task status or business logic
   - Ensure it carries no triggering condition itself, leaving the decision of when to show it to the integrating page
   - Keep it free of any dependency on files owned by the parallel plans

2. **Build the celebratory toast visual**
   - Show a dark rounded pill anchored to the bottom of the workspace, centered horizontally
   - Pair a check mark with the friendly completion copy "nice. that one's done."
   - Apply a soft elevation/shadow so the toast reads as a floating confirmation

3. **Adapt the design to web conventions**
   - Use the web project's own text, icon, and styling helpers rather than the design sandbox primitives
   - Reuse the established color and spacing tokens so the toast matches the rest of the workspace
   - Constrain and center the overlay to the workspace column width so it aligns with the workspace content rather than the full viewport

4. **Make it non-interactive and layered correctly**
   - Ensure the overlay never intercepts taps or clicks, letting interactions pass through to content beneath
   - Place it above workspace content but consistent with existing layering so it sits as an unobtrusive confirmation
   - Add a subtle full-surface dim behind the toast to draw focus to the completion moment

5. **Expose the component for integration**
   - Provide the overlay as a ready-to-render component that the page can mount conditionally
   - Keep its public shape free of required inputs so it can be dropped in without configuration
