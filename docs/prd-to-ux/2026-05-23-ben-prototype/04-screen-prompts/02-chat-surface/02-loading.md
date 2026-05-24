## Chat screen — Loading (initial app load with existing history)

````
**What this screen is for:**
Bring a returning user back into their conversation as quickly as possible without a blocking spinner.

**What's visible:**
The composer renders immediately, fully interactive — the user can start a new capture before history finishes loading. The chat area shows soft skeleton placeholders where the recent message bubbles will appear: a few alternating left-aligned and right-aligned skeleton blocks of varying widths, no text. The drawer peek shows a single-line skeleton where "Up next" content will land. Skeletons fade out and real content fades in as data arrives — no abrupt swap.

**What the user can do:**
- Primary: press and hold the mic — composer is already live.
- Secondary: tap the text input to type.
- Tertiary: wait for history to populate.

**Feel:**
Calm and fast. Skeletons are quiet — soft neutral shapes, no shimmer animation that feels like a casino. The transition from skeleton to real content is gentle (fade or simple opacity, never a slam).

**State context:**
The user has signed in before and is opening the app to an existing conversation. The model context (last 20 messages) and the ledger are being fetched.

**Critical affordances:**
The composer must be live during loading — the user must never be locked out of capturing because history hasn't loaded. The skeleton's job is to set expectation, not to gate input.
````
