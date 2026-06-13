# Plan — Task workspace page assembly + route

1. **Load the task and handle its lifecycle states**
   - Read the task identifier coming from navigation and fetch the matching task detail
   - Publish that identifier into the task state so the rest of the screen and its parts can rely on it
   - Reset the task state when the user leaves the screen so a later task does not inherit stale data
   - Show a loading state while the task is being fetched
   - Show an error state with retry and a way back to chat when the task cannot be loaded
   - Keep connectivity awareness active while the workspace is open

2. **Compose the workspace screen layout for mobile**
   - Arrange the screen as a fixed top region, a scrollable middle region, and a fixed bottom region
   - Place the top bar and the top banner in the top region
   - Place the sub-thread banner, the diff bar, and the footer in the bottom region
   - Reserve space in the middle region so content is never hidden behind the footer
   - Respect device safe areas at the top and bottom so nothing is covered by the notch or home indicator
   - Keep the bottom region visible above the keyboard when the keyboard opens

3. **Switch the main content by task type**
   - Render the checklist-style content when the task is a to-do
   - Render the text content otherwise
   - Make content read-only when the task is finished, and also for text content when there is a pending change awaiting review

4. **Connect voice input to the task conversation**
   - When a voice transcript is produced, send that text into the task conversation
   - Wire the footer record action to begin a voice recording
   - Establish the transcript-to-conversation link while the workspace is open

5. **Show completion state**
   - Display the done overlay when the task is finished

6. **Register the task workspace route**
   - Add the dynamic route that maps a task identifier from the address to the workspace screen
   - Read the identifier from the route, feed it into the task state, and render the workspace
   - Confirm that opening a task from elsewhere navigates into a fully rendered workspace
