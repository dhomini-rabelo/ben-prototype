# Plan 01 — Fix the broken chat-input voice (and send) icon

**Plan**

1. **Reproduce and confirm the icon defect**
   - Open the chat screen and observe the input footer
   - Confirm the microphone (voice) icon renders broken — missing fill or wrong color
   - Note the send icon shares the same coloring approach and is at risk of the same issue

2. **Align the icon coloring with the working pattern**
   - Identify why the chat-footer icons fail to pick up their intended color while other chat icons render correctly
   - Apply the same color-passing approach already used by the working icons elsewhere in the chat experience
   - Ensure both the voice icon and the send icon use the correct on-primary color

3. **Preserve existing behavior and appearance**
   - Keep the action button's background and shape unchanged
   - Keep the existing tap/press behavior of the voice and send actions intact
   - Make sure the only visible change is the corrected icon color

4. **Verify the corrected result**
   - Confirm the voice icon now displays with the proper fill and color
   - Confirm the send icon also renders correctly against the button background
   - Check the icons remain legible in the chat input footer
