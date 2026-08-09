# Plan — Add safe-area top spacing to the menu sidebar header

1. **Read the device's top safe-area inset**
   - Obtain the current top safe-area measurement so the header can react to the status bar height on any device.

2. **Apply the top spacing to the sidebar container**
   - Offset the top of the menu sidebar by the safe-area amount so the header content begins below the status bar.
   - Reuse the same spacing approach already used by the notes/reminders list screens so behavior stays consistent across the app.

3. **Verify header alignment with other screens**
   - Confirm the Ben brand mark and the close control no longer overlap the status bar.
   - Confirm the menu header now sits at the same vertical position as the chat and notes headers.
