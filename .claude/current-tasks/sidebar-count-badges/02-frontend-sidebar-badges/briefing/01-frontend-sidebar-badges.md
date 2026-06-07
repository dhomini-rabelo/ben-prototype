# Simple Plan — Frontend Sidebar Count Badges + Loading/Error (project-web)

1. **Expose the counts endpoint in the API client**
   - Register the dedicated count-only capture route so the rest of the app can reach it.
   - Define the response shape that mirrors the fixed contract: per-section figures for tasks (active), notes (total), and reminders (total).

2. **Add a hook that fetches the capture counts**
   - Build a single data hook on top of the existing shared request hook so counts come back with loading and error states.
   - Keep its surface consistent with the other capture list hooks (status object exposing data, loading, and error).

3. **Make the menu sidebar render counts and visual states**
   - Accept an incoming variant (default, loading, error) and the resolved counts, matching the design source of truth.
   - Render the tasks badge as a formatted "N active" value, and notes/reminders as plain totals.
   - Show no badge for the settings entry.
   - Show an animated skeleton pill for every count while loading.
   - Show a dimmed em-dash for every count on error.

4. **Wire the counts into the sidebar when the menu is open**
   - Trigger the counts fetch while the menu view of the overlay is visible.
   - Translate the hook's loading state into the loading variant and its error state into the error variant; otherwise pass through the real counts.
   - Preserve the existing entry-selection behavior already driven by the menu store.

5. **Validate the change end-to-end against the contract**
   - Confirm the badges, skeleton, and em-dash render exactly as the design specifies across populated, loading, and error states.
   - Confirm the work stays entirely within the web project and consumes the agreed counts contract without altering backend code.
