# Simple Plan — [Frontend] Render real capture cards from the API

**Plan**

1. **Adopt the enriched capture shape coming from the backend**
   - Expect each captured item to carry not just its kind and identifier, but its own display title and an optional secondary detail line.
   - Treat the secondary detail as optional and tolerate its absence so older or simpler captures still work.

2. **Receive a capture alongside the live reply**
   - When Ben answers a message, accept an optional captured item for that turn (or none, when nothing was filed).
   - Make sure history items loaded from the past also continue to carry their captured item with the same enriched details.

3. **Attach the captured item to its Ben message**
   - When a live reply comes back with a captured item, associate that item with the Ben message being shown so it travels with the message in the conversation.
   - Keep the existing behavior of associating captured items with messages loaded from history.

4. **Show the capture card with the item's own information**
   - Display the card using the captured item's real title as the main line, not the text of Ben's reply.
   - Show the optional secondary detail line when present and omit it when absent.
   - Keep the card positioned where it already appears — directly beneath Ben's reply text within his message.
   - Render the card in its plain, non-interactive display state.

5. **Ensure cards appear both live and after reload**
   - Confirm a capture card shows immediately under a freshly typed-out reply when something was captured.
   - Confirm the same card reappears, with the same title and detail, after the conversation is reloaded from history.

6. **Defer card interactions**
   - Keep the card display-only for now, with no actions to start or complete the captured item.
   - Note interactive card actions as a follow-up once supporting behavior exists.
