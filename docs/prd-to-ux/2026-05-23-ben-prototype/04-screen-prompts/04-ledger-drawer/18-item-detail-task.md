## Item detail — Task detail

````
**What this screen is for:**
Show the full task state with a large primary action for toggling done.

**What's visible:**
Modal sheet with drag handle and close affordance. Content:
- "Task" label (small, secondary).
- Title (prominent).
- A large, primary checkbox affordance (larger than the inline-card checkbox) — clearly the focal interactive element. Tap toggles done state.
- Captured-at timestamp (small, secondary).
- If done: done-at timestamp also shown (small, secondary).

**What the user can do:**
- Primary: tap the large checkbox to toggle done.
- Secondary: drag down or tap close to dismiss.

**Feel:**
The checkbox is the focal point — large, comfortable to tap, with a satisfying toggle animation. The rest of the layout is calm and supporting.

**State context:**
The user tapped a task card in chat or a task row in the drawer.

**Critical affordances:**
The large checkbox here must produce the same toggle effect as the smaller checkbox on cards and list rows — single source of truth. Toggling done-state from item detail must update the corresponding card in chat and the row in the drawer.
````
