# Simple Plan — Content & composer "done" treatment

1. **Detect the finished state inside each content component**
   - Each content view determines on its own whether the task is finished, using the workspace task it already reads — no new prop comes in from the parent page.
   - Keep this finished detection separate from the existing read-only behavior, so the pending-diff read-only case is never treated as "done".

2. **Apply the muted, struck-through look to finished text content**
   - When the task is finished, the whole text content area appears dimmed.
   - The displayed text reads as struck through to signal completion.
   - This treatment only shows in the normal finished view, not in the pending-diff preview.

3. **Apply the muted, struck-through look to finished todo content**
   - When the task is finished, the whole todo list area appears dimmed.
   - Every todo line reads as struck through, regardless of whether it was checked off.
   - This treatment only shows in the normal finished view, not in the pending-diff preview, and existing diff and done styling stays intact otherwise.

4. **Update the composer placeholder when finished**
   - While the task is finished, the disabled composer invites the user to reopen the task to continue editing.
   - When the task is not finished, the composer keeps its current edit prompt.
   - The composer's existing disabled-when-finished behavior is preserved unchanged.
