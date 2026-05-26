# Menu sidebar — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

The menu sidebar is a slide-in panel from the leading edge of the chat surface (or workspace). It's reached by tapping a small menu affordance in the top bar. It contains four entries: **Tasks** (history of active + finished), **Notes** (browse), **Reminders** (browse, with relative-time labels — the PRD's "mocked alarms list"), **Settings** (modal with profile + sign-out).

Notes and Reminders rows in this sidebar's lists open the **item-detail modal** defined in [03-inline-capture-cards.md](./03-inline-capture-cards.md). Task rows open the **task workspace** defined in [04-task-workspaces.md](./04-task-workspaces.md).

---

## Sidebar panel — Populated (default)

````
**What this screen is for:**
Give the user one obvious place to reach their full notes, reminders, tasks history, and settings — without cluttering the chat surface.

**What's visible:**
A panel that slides in from the leading edge of the screen, covering roughly two-thirds to three-quarters of the width on mobile (exact proportion is the renderer's call). The chat surface behind is dimmed and remains visible at the trailing edge as a tap-to-dismiss target. At the top of the panel, a small header strip — quiet, possibly a wordmark hint or a small identity element. Below the header, four list entries stacked vertically, each with comfortable padding:
- **Tasks** — with a quiet icon hint and a small count badge ("3 active").
- **Notes** — with a quiet icon hint and a count badge (total notes).
- **Reminders** — with a quiet icon hint and a count badge (upcoming reminders).
- **Settings** — with a quiet icon hint, no count.

Each entry's full row is tappable. Below the four entries, generous whitespace; no other content.

**What the user can do:**
- Primary: tap any entry to drill into its view (Tasks view, Notes view, Reminders view, or Settings modal).
- Secondary: tap the dimmed chat area at the trailing edge (or drag the panel left) to dismiss.

**Feel:**
Calm and orderly. The sidebar should feel like a quiet archive — not the place the user lives, but the place they know they can reach what they need. Type hierarchy: entry label primary, count badge supporting. The icon hints are subtle, not loud. The dimming behind the panel signals "this is a layer," not a separate screen.

**State context:**
The user tapped the menu affordance in the top bar. The data layer has already provided counts.

**Critical affordances:**
The four entries are the only interactive elements in the panel — no extra controls in v1. Dismissal must be obvious (drag, or tap-outside). Count badges are scannable but supporting; the entry label is the focal point.
````

---

## Sidebar panel — Loading

````
**What this screen is for:**
Show the four entries immediately and let counts populate as data arrives.

**What's visible:**
Panel slid in. The four entry labels are visible immediately (they don't depend on data). The count badges show small skeleton placeholders that resolve to numbers as the counts load.

**What the user can do:**
- Primary: tap any entry — drilling into a view that's still loading its own data will show that view's loading state.
- Secondary: dismiss.

**Feel:**
Brief and calm. Skeleton badges are quiet — small shapes, no shimmer.

**State context:**
Sidebar just opened; count data not yet returned.

**Critical affordances:**
Entries must be tappable during loading. The sidebar's job is navigation; counts are supporting.
````

---

## Sidebar panel — Error

````
**What this screen is for:**
Handle a count-load failure gracefully without breaking navigation.

**What's visible:**
Panel slid in. The four entries are visible and tappable as normal. Count badges either show a quiet placeholder ("—") or are simply omitted. No prominent error band — the count failure is a minor concern relative to the entries themselves.

**What the user can do:**
- Primary: tap any entry — the entry's view will surface its own errors if needed.
- Secondary: dismiss.

**Feel:**
Forgiving. The sidebar continues to function even when supporting data fails.

**State context:**
Count-loading failed; navigation still works.

**Critical affordances:**
Navigation must remain available. Don't surface a heavy error band for what is essentially missing supporting metadata.
````

---

## Tasks view — Empty

````
**What this screen is for:**
Tell the user that no tasks have ever been created, with a hint at how to create one.

**What's visible:**
The Tasks view replaces the sidebar's content area (or the sidebar may transition into a full-panel "Tasks" screen — design call; for v1 default to the sidebar expanding into the view, with a small back affordance to return to the sidebar entries). Top of the view shows a small header strip with a back affordance on the leading edge and the title "Tasks". Below, the empty state: friend-tone copy ("no tasks yet — talk to Ben, he'll set one up when something needs working on") sitting in calm whitespace.

**What the user can do:**
- Primary: tap back to return to the sidebar entries, or dismiss the sidebar entirely.
- Secondary: dismiss to the chat and dictate a task.

**Feel:**
Quiet and instructive. The empty copy teaches Ben's behavior without commanding the user.

**State context:**
No tasks have been created yet (or all have been deleted, though delete isn't in v1).

**Critical affordances:**
The back affordance to return to the sidebar entries must be obvious.
````

---

## Tasks view — Populated

````
**What this screen is for:**
Let the user browse and reach every task they've ever had — active and finished.

**What's visible:**
Tasks view with header and back affordance. Two sections:
- **Active** — top of the list. Sorted by most recent activity (most recently touched first). Each row: content-type icon hint, task title (primary), and a supporting line ("active · 2h ago" / "just created"). Tap a row to enter that task's workspace.
- **Finished** — below Active. Sorted descending by finished-at (most recently finished first). Each row: same layout with a quiet "finished" supporting line ("finished yesterday"). Tap a row to enter the workspace in read-only mode.

If Active is empty but Finished has items, only the Finished section renders (no empty section headers).

**What the user can do:**
- Primary: tap any row to enter that task's workspace.
- Secondary: tap back to return to the sidebar entries; dismiss to chat.
- Tertiary: scroll through long lists.

**Feel:**
Scannable. Active and Finished sections are visually distinct but related — a section header sets the context; row treatment differentiates further (Finished rows are slightly muted). Generous row spacing.

**State context:**
At least one task exists.

**Critical affordances:**
Active tasks must visually outweigh Finished — Active is what the user usually wants. The content-type icon hint helps the user remember "the one with the list" vs "the one with the draft."
````

---

## Tasks view — Loading

````
**What this screen is for:**
Bridge the brief moment between opening the Tasks view and the list arriving.

**What's visible:**
Tasks view with header. Soft skeleton placeholder rows for four to six entries — each skeleton row has placeholder shapes for icon, title, and supporting line.

**What the user can do:**
- Primary: wait briefly.
- Secondary: tap back to return.

**Feel:**
Quiet and brief.

**State context:**
Task data loading.

**Critical affordances:**
Back affordance must remain available during loading.
````

---

## Tasks view — Error

````
**What this screen is for:**
Handle a list-load failure with retry.

**What's visible:**
Tasks view with header. Inline soft-error band with friend-tone copy ("couldn't load your tasks — tap to retry") and retry tap-target. Back affordance remains usable.

**What the user can do:**
- Primary: tap retry.
- Secondary: tap back to return to the sidebar entries.

**Feel:**
Calm, matches other error states.

**State context:**
Task list query failed.

**Critical affordances:**
Back must remain usable.
````

---

## Tasks view — Edge cases

````
**What this screen is for:**
Handle list-level edges cleanly.

**What's visible:**
- **Long list of finished tasks** — standard scroll. No pagination in v1.
- **Active section empty, Finished populated** — Active header hidden; only Finished section renders.
- **Both populated heavily** — Active section may grow tall; the Finished section is reached by scrolling.

**What the user can do:**
- Primary: scroll, tap rows, navigate back.

**Feel:**
Resilient.

**State context:**
Real-world data scales.

**Critical affordances:**
Smooth scroll. Section headers must remain readable while scrolling adjacent content.
````

---

## Notes view — Empty

````
**What this screen is for:**
Show that no notes exist yet with a friendly hint.

**What's visible:**
Notes view with header (back affordance + title "Notes"). Friend-tone empty copy ("no notes yet — talk to Ben, he'll save the keepers") sitting in calm whitespace.

**What the user can do:**
- Primary: tap back to return to the sidebar entries.
- Secondary: dismiss to chat.

**Feel:**
Calm and instructive.

**State context:**
No notes captured yet.

**Critical affordances:**
Empty copy should suggest notes are an organic outcome of conversation, not a formal capture action.
````

---

## Notes view — Populated

````
**What this screen is for:**
Let the user browse captured notes in reverse-chronological order.

**What's visible:**
Notes view with header. Vertical list of note rows, reverse-chronological (newest first). Each row:
- Title (primary).
- One-line body preview (supporting, truncated with ellipsis).
- Captured-at relative time ("today" / "yesterday" / "3d ago") as small supporting text.

Tap a row to open the shared item-detail modal (defined in 03-inline-capture-cards.md).

**What the user can do:**
- Primary: tap any row to open detail modal and read the full note.
- Secondary: scroll; tap back.

**Feel:**
A quiet, readable list. Type hierarchy: title prominent, body preview comfortable but secondary, captured-at smallest. Generous row spacing. The list feels like a well-kept commonplace book.

**State context:**
At least one note exists.

**Critical affordances:**
Body preview must always preserve the ellipsis cue when truncated. Captured-at relative time helps with memory anchoring — "the one I jotted yesterday" — and must read naturally.
````

---

## Notes view — Loading

````
**What this screen is for:**
Bridge the brief moment between opening the Notes view and the list arriving.

**What's visible:**
Notes view with header. Skeleton placeholder rows (four to six).

**What the user can do:**
- Primary: wait briefly.
- Secondary: tap back.

**Feel:**
Quiet, brief.

**State context:**
Notes data loading.

**Critical affordances:**
Back available during loading.
````

---

## Notes view — Error

````
**What this screen is for:**
Handle a list-load failure with retry.

**What's visible:**
Notes view with header. Inline soft-error band ("couldn't load your notes — tap to retry") with retry tap-target. Back affordance usable.

**What the user can do:**
- Primary: tap retry.
- Secondary: tap back.

**Feel:**
Calm.

**State context:**
Notes list query failed.

**Critical affordances:**
Back remains usable.
````

---

## Notes view — Edge cases

````
**What this screen is for:**
Handle long lists cleanly.

**What's visible:**
- **Long list** — standard scroll.
- **Very long body previews** — always truncate at one line with ellipsis in the row; full body in detail modal.

**What the user can do:**
- Primary: scroll, tap rows.

**Feel:**
Resilient.

**State context:**
Real-world scale.

**Critical affordances:**
Ellipsis cue always preserved on truncation.
````

---

## Reminders view — Empty

````
**What this screen is for:**
Show that no reminders exist yet with a friendly, instructive hint.

**What's visible:**
Reminders view with header (back affordance + title "Reminders"). Friend-tone empty copy ("no reminders yet — say 'remind me to…' and Ben'll catch it") in calm whitespace. The example phrasing is slightly emphasized inline to teach Ben's affordance.

**What the user can do:**
- Primary: tap back to return.
- Secondary: dismiss to chat and dictate a reminder.

**Feel:**
Calm and instructive. The example phrasing reads like a friend's tip, not a CLI instruction.

**State context:**
No reminders captured yet.

**Critical affordances:**
Example phrasing teaches Ben's behavior; back affordance is obvious.
````

---

## Reminders view — Populated

````
**What this screen is for:**
Let the user browse upcoming and fired reminders — the PRD's mocked-alarms list with relative-time labels, relocated to the menu sidebar.

**What's visible:**
Reminders view with header. Two sections:
- **Upcoming** — sorted ascending by `fires_at` (soonest first). Each row: title (primary), relative-time string (emphasized — "in 2h" / "tomorrow 9am" / "Fri 6pm"), and possibly a small supporting captured-at hint.
- **Fired** — below Upcoming, sorted descending by `fires_at` (most recently fired first). Each row: title, past-relative time ("3h ago" / "yesterday 9am"), and a small "fired" supporting indicator. Visually de-emphasized compared to Upcoming.

If only one section has content, the other is hidden (no empty section headers). Tap a row to open the shared item-detail modal.

**What the user can do:**
- Primary: tap any row to open detail modal.
- Secondary: scroll; tap back.

**Feel:**
Scannable and well-organized. Type hierarchy: title prominent, relative-time emphasized but supporting, fired-status visually distinct but quiet. Comfortable row spacing.

**State context:**
At least one reminder exists. This view is the PRD-named "in-app list with relative-time labels" for mocked alarms.

**Critical affordances:**
The Upcoming / Fired distinction must be legible at a glance. Relative-time strings must update over time (minute resolution for near-term, hour for medium, day for distant). Relative time must always be a human phrase, never raw timestamps.
````

---

## Reminders view — Loading

````
**What this screen is for:**
Bridge the brief moment between opening the view and data arriving.

**What's visible:**
Reminders view with header. Skeleton placeholder rows (four to six).

**What the user can do:**
- Primary: wait briefly.
- Secondary: tap back.

**Feel:**
Quiet, brief.

**State context:**
Reminders data loading.

**Critical affordances:**
Back available during loading.
````

---

## Reminders view — Error

````
**What this screen is for:**
Handle a list-load failure with retry.

**What's visible:**
Reminders view with header. Inline soft-error band ("couldn't load your reminders — tap to retry") with retry tap-target. Back affordance usable.

**What the user can do:**
- Primary: tap retry.
- Secondary: tap back.

**Feel:**
Calm.

**State context:**
Reminders list query failed.

**Critical affordances:**
Back remains usable.
````

---

## Reminders view — Edge cases

````
**What this screen is for:**
Handle list-level edges cleanly.

**What's visible:**
- **No upcoming, has fired** — only Fired section renders; no empty Upcoming header.
- **All in the past** — same as above.
- **Long list** — standard scroll.

**What the user can do:**
- Primary: scroll, tap rows.

**Feel:**
Resilient.

**State context:**
Real-world data variations.

**Critical affordances:**
Section headers hide cleanly when their section is empty.
````

---

## Settings modal — Populated (default)

````
**What this screen is for:**
Give the user a minimal place to see who they're signed in as and sign out when needed.

**What's visible:**
A modal sheet (bottom-sheet on mobile, or centered modal — design direction's call). Title: "Settings". Below the title, a small profile section:
- User's avatar (from Google profile picture) — quiet, not large.
- User's name (from Google).
- User's email (small, supporting type).

Below the profile section, a clear **Sign out** action — a single button or list-row affordance, low-stakes visual weight (not red-alarming, just clear).

No other settings in v1 — no vibe selector, no Notion toggle, no notification preferences. The modal is intentionally sparse.

**What the user can do:**
- Primary: tap Sign out to end the session and return to the sign-in screen.
- Secondary: drag down / tap close / tap outside to dismiss the modal.

**Feel:**
Calm and minimal. The modal should feel like a tiny utility surface, not a configuration panel. Type hierarchy: name primary, email supporting, sign-out action clear but not aggressive.

**State context:**
The user opened Settings from the menu sidebar.

**Critical affordances:**
Sign out is the only action besides dismissal. Sign out must be confirmable without leaving the user wondering if it succeeded — the redirect to sign-in is the success signal.
````

---

## Settings modal — Loading

````
**What this screen is for:**
Bridge the brief moment if profile data needs to fetch.

**What's visible:**
Modal with title visible. Skeleton placeholders for avatar, name, email. Sign-out action visible and active (sign-out doesn't depend on profile load).

**What the user can do:**
- Primary: tap sign out (works regardless of profile load).
- Secondary: dismiss.

**Feel:**
Quiet and brief.

**State context:**
Profile data loading. In practice, profile may be available from auth context immediately; this state may rarely appear.

**Critical affordances:**
Sign-out must always work, even during loading.
````

---

## Settings modal — Error

````
**What this screen is for:**
Surface a profile-load failure without blocking sign-out.

**What's visible:**
Modal with title. Profile section shows only the email (from auth context) and a quiet line ("couldn't load full profile"). Sign-out action remains available.

**What the user can do:**
- Primary: tap sign out.
- Secondary: dismiss.

**Feel:**
Forgiving. The user came here to sign out anyway; profile metadata is supporting.

**State context:**
Profile fetch failed.

**Critical affordances:**
Sign-out must work even when the profile load fails.
````

---

## Settings modal — Edge cases

````
**What this screen is for:**
Handle the sign-out transition cleanly.

**What's visible:**
- **Sign-out in progress** — sign-out action briefly shows a non-interactive state with a quiet pending indicator. On completion, the modal dismisses and the user is redirected to the sign-in screen.
- **Sign-out failed** (network blip) — sign-out action returns to interactive state with a small inline error label ("didn't sign you out — try again?") and a retry tap-target.

**What the user can do:**
- Primary: wait for the sign-out to complete, or retry on failure.

**Feel:**
The sign-out transition should feel quietly decisive — a brief moment, then the user is back at the sign-in screen.

**State context:**
Sign-out flow in progress or failed.

**Critical affordances:**
The transition to sign-in must be unambiguous on success. On failure, retry must be obvious.
````
