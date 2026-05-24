## Item detail — Loading

````
**What this screen is for:**
Bridge the brief moment if item-detail data needs to fetch (in practice, may not be needed if the row already carries full payload).

**What's visible:**
Modal sheet with drag handle. Skeleton content for label, title, body/time slots. Close affordance visible.

**What the user can do:**
- Primary: wait briefly or dismiss.

**Feel:**
Brief, calm.

**State context:**
Data fetch in progress for the item detail. In v1, may be unnecessary if rows carry full data — flag this for the implementer's call.

**Critical affordances:**
If the row already carries the data, render directly to the populated state and skip this state. Don't show loading for the sake of consistency if there's nothing to load.
````
