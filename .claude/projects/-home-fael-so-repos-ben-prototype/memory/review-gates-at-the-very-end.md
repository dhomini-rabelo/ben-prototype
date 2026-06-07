---
name: review-gates-at-the-very-end
description: User finds review/approval gates slow; run diff review only at the very end, keep it lightweight
metadata:
  type: feedback
---

In the multi-plan task flow, the user wants the diff-review (and similar approval gates) to happen only **at the very end, after all plan implementations are complete** — not interleaved — because the gates "take too long."

**Why:** The user prioritizes speed; interactive review gates feel like overhead.

**How to apply:** Keep Stage 7/8 review and proposal gates fast and batched at the end. Prefer applying the clearly-correct recommended fix and skipping minor ones rather than belaboring multi-select questions. Don't spawn extra sub-agents or ask questions for trivial diffs.
