## Note card — Edge cases

````
**What this screen is for:**
Handle small content edges (empty title, very long body) cleanly so cards never look broken.

**What's visible:**
- **Empty title from the model** — the title slot renders a quiet placeholder ("untitled note") in slightly muted type. Body preview continues as normal. This is a model artifact, not a user mistake — the placeholder is forgiving, not corrective.
- **Very long body** — the body preview truncates at two lines with an ellipsis. The full body is available in detail view. The card's height does not grow indefinitely.

**What the user can do:**
- Primary: tap the card to open detail and see full content.

**Feel:**
Indistinguishable from a normal populated card — these edges should not look broken or "wrong."

**State context:**
Real-world content variability. Models sometimes produce odd outputs; users sometimes dictate long thoughts.

**Critical affordances:**
The placeholder for empty titles must be friend-tone, not technical ("untitled" is fine, "null" is not). Truncation must always preserve the ellipsis cue so the user knows to tap for more.
````
