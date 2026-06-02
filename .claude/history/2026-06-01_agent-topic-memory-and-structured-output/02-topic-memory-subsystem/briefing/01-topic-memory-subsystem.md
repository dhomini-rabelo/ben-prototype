# Plan 2 — Topic-memory subsystem

**Plan**

1. **Model the topic memory**
   - Represent a recurring subject a user keeps returning to, identified by its shared topic key
   - Represent a stored summary that captures what was discussed about a given topic, optionally tied to the originating message
   - Follow the existing conventions for creating and referencing these stored items

2. **Provide storage for topics and summaries**
   - Allow topics and their summaries to be saved and later retrieved per user
   - Reuse the established querying and listing behavior already used for other stored data
   - Keep this storage self-contained and not yet connected to the rest of the system

3. **Build the topic index**
   - Gather the distinct topics a user has accumulated
   - Return them in the agreed topic-key shape so they can later be surfaced as suggestions

4. **Serve history for requested topics**
   - Accept a set of topics and return the stored summaries associated with each
   - Return all matching summaries without trimming or merging them
   - Match the agreed history-context shape so the agent can consume it directly

5. **Persist new topics and summaries after a turn**
   - For each topic the turn relates to, reuse the matching existing topic or create it when none exists
   - Save the turn's summary for that topic, linking it to the originating message when available
   - Ensure this happens after the agent has produced its output

6. **Confirm the subsystem holds in isolation**
   - Keep the work limited to this subsystem's own pieces without wiring into routes or the agent
   - Verify everything type-checks on its own
