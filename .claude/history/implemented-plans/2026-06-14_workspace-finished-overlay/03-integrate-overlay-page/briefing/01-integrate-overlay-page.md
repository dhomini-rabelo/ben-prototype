# Plan — Integrate the done-overlay into the workspace page

1. **Surface the done-overlay when the task is finished**
   - Use the existing finished-state signal the page already computes to decide whether the overlay should appear
   - Render the done-overlay only while the task is in the finished state, and keep it absent otherwise

2. **Layer the overlay correctly within the workspace**
   - Place the overlay above the main content but below the fixed header and footer
   - Keep the overlay non-interactive so it never blocks the existing controls, including the reopen affordance in the top bar
