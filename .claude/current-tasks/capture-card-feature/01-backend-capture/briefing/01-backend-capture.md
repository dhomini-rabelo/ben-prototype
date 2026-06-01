# Simple Plan — [Backend] Capture persistence & enriched capture API

**Plan**

1. **Introduce captured-item records**
   - Define the three things Ben can capture from a conversation: notes, reminders, and tasks
   - For each, decide the data it carries: a note keeps a title and body; a reminder keeps a title plus an optional human-readable time and optional notes; a task keeps a title, optional details, and a status that starts as pending
   - Store reminder times exactly as the agent phrased them (free-form text), without interpreting them as real dates
   - Keep each record tied to the user who owns it and the moment it was created

2. **Persist everything Ben captures in a turn**
   - When Ben replies, save all of the draft notes, reminders, and tasks he produced, so nothing is lost for future listing screens
   - Choose a single primary captured item to highlight for that turn, using the order reminders first, then tasks, then notes, and taking the first item saved
   - Remember which captured item the primary one is so it can be re-displayed later

3. **Link the highlighted capture to Ben's reply**
   - Associate the chosen primary captured item with the message Ben sent in that turn
   - Allow a Ben message to carry no capture when the turn produced nothing to capture

4. **Define a shared display shape for a captured item**
   - Agree on a single, display-ready representation of a captured item: its kind, its identifier, a main line (the title), and an optional secondary line
   - Decide the secondary line per kind: notes and tasks show none; a reminder shows its time text when present, otherwise none
   - This same shape is used both when Ben replies live and when history is reloaded

5. **Return the highlighted capture when Ben replies**
   - Keep everything the chat reply already returns unchanged
   - Add the display-ready primary captured item to the reply, or signal nothing when the turn captured nothing

6. **Enrich captured items when listing past messages**
   - When loading message history, look up each message's linked captured item and present it in the shared display-ready shape
   - If a message has no linked capture, show none
   - If a previously linked item can no longer be found, simply omit the capture rather than failing
