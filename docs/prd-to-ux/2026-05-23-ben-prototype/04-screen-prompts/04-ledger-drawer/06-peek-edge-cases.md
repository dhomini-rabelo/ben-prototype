## Drawer peek (collapsed) — Edge cases

````
**What this screen is for:**
Handle layout edges cleanly.

**What's visible:**
- **Keyboard open** (mobile, user is typing in the composer) — the peek may compress to its drag handle only, or hide entirely if vertical space is constrained. When the keyboard dismisses, the peek restores to its previous content state.
- **Mid-drag gesture** (user is dragging the peek up but hasn't committed to expand) — a transitional state where the peek content lerps toward the expanded sheet's content. The user can release to expand or pull back down to collapse.

**What the user can do:**
- Primary: same as the relevant steady state.

**Feel:**
The transitions should feel responsive and physical. Drag gestures should track the finger smoothly.

**State context:**
Real-world layout interactions on mobile.

**Critical affordances:**
The peek's compression on keyboard-open is a tolerated layout concession, not a feature — when possible, keep the peek visible. The mid-drag state must be smooth; jank here breaks the "well-made tool" feel.
````
