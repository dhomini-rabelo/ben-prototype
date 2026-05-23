# Chat surface — Screen Prompts

_Each block below is self-contained. Copy one block, paste into Stitch / Figma AI / Pencil / Claude Design._

The chat surface is the home screen of the app. It carries the conversation stream, the composer (voice + text), and the ledger-drawer affordance. Most user time is spent here.

---

## Chat screen — Empty (first run, no message history)

````
**What this screen is for:**
Welcome a brand-new user and make the primary affordance — press and hold to speak — completely obvious without a tour.

**What's visible:**
A single Ben message bubble in the upper portion of the chat area: a short friend-tone greeting that names the affordance ("yo. press and hold the mic when you got something — or just type."). The bubble is left-aligned, with a small Ben indicator (his name or a quiet identifying mark). The rest of the chat area is calm, generous whitespace. Anchored at the bottom of the screen is the composer: a horizontal bar containing a text input area on the leading edge and a prominent press-and-hold mic affordance on the trailing edge. Just above the composer, the ledger drawer's collapsed peek strip sits in its empty state — a soft strip with quiet copy ("nothing on deck — Ben's listening") and a subtle drag handle indicating it can be expanded.

**What the user can do:**
- Primary: press and hold the mic to record a voice message.
- Secondary: tap the text input area to type.
- Tertiary: tap or drag the drawer peek to expand it (will reveal empty tabs).

**Feel:**
Modern and human. Comfortable type, restrained palette of neutrals with one understated accent reserved for the mic affordance — the eye should land on the mic first. Soft rounded corners on bubbles, composer, and peek. Generous breathing room between greeting and composer. The screen feels confident but warm — like opening a well-made tool that happens to have a soul.

**State context:**
First-time user, immediately after sign-in. No captures yet, no history beyond Ben's welcome message.

**Critical affordances:**
The mic must be the visually dominant element of the composer — larger or more emphasized than the text input — because press-and-hold is the wedge. The drawer peek must be visible even when empty, so the user understands there's something below — but its empty copy should be quiet, not promotional. The greeting message names the affordance in copy; the copy is doing real work and shouldn't be cut to "Welcome!"
````

---

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

---

## Chat screen — Populated (steady state)

````
**What this screen is for:**
Carry the ongoing conversation between the user and Ben, with the ledger peek always one glance away.

**What's visible:**
A chronological message stream filling most of the screen. User messages are right-aligned with a slightly emphasized fill; Ben's messages are left-aligned with a quieter fill and a small Ben indicator. Some of Ben's messages contain inline capture cards (Note, Reminder, or Task — see the inline-capture-cards prompts). The stream scrolls; the latest message is at the bottom by default. Above the composer, the drawer peek displays "Up next: {title} {relative-time}" if there's a near-term reminder, or a quiet count summary ("3 reminders ahead" / "12 notes · 4 tasks · 0 reminders") if not. The composer is anchored at the bottom with the mic dominant and a text input area beside it.

**What the user can do:**
- Primary: press and hold the mic to add another capture.
- Secondary: tap the text input to type a message.
- Tertiary: scroll up to review earlier conversation; tap a capture card to open its detail; tap or drag the drawer peek to expand the ledger.

**Feel:**
The conversation is the foreground; everything else recedes. Type is comfortable to read at length. Bubbles have soft rounded corners and quiet fills — the visual contrast between user and Ben sides is small but legible. Inline capture cards within Ben's messages are clearly differentiated from plain text but live inside the bubble (not separate elements competing for attention). The drawer peek persists, never hides on scroll.

**State context:**
The standard, everyday state of the app. The user has used Ben before and has accumulated captures.

**Critical affordances:**
The drawer peek must remain visible while scrolling the chat — it's the always-on ledger glance. The composer must always be reachable and always have the mic as its dominant element. Capture cards inside Ben's bubbles must feel like part of his reply, not foreign UI dropped into the conversation.
````

---

## Chat screen — Composing (text input focused)

````
**What this screen is for:**
Let the user type a message as a fallback to voice, without ever losing access to voice itself.

**What's visible:**
The text input area inside the composer is expanded to accommodate typing — the soft keyboard is up (this is mobile web). As soon as any character is in the input, the mic affordance morphs (or yields visual prominence) to a send affordance on the trailing edge of the composer. The drawer peek may compress or hide momentarily because mobile keyboard takes vertical space — this is a tolerated layout concession, not a feature; when the peek can stay visible, it should.

**What the user can do:**
- Primary: type and tap send (or press enter) to submit the message.
- Secondary: tap outside the composer to dismiss the keyboard and return to the standard populated layout (mic returns to dominance).

**Feel:**
The transition from "mic dominant" to "send dominant" is small and quiet — a morph, not a swap. Type in the input is comfortable and matches the conversation type. The composer doesn't suddenly become busy when the user starts typing.

**State context:**
The user has chosen text input — could be because they're somewhere they can't speak, the mic is unavailable, or they just prefer typing for this message.

**Critical affordances:**
The mic must remain visible (even if visually de-emphasized) — the user should be able to swap modes at any time. Clearing the input restores the mic to its dominant state. The morph between mic-dominant and send-dominant should not flash or jitter.
````

---

## Chat screen — Recording (press-and-hold active)

````
**What this screen is for:**
Show the user that Ben is listening, give them confidence the audio is being captured, and offer a clear cancel path.

**What's visible:**
The chat behind dims slightly to focus attention on the composer area. The composer transforms into a recording state: where the mic was, an active mic indicator (held, pulsing, or glowing with the accent color); above the composer, an overlay panel containing a live waveform or audio-level meter responding to the user's voice, an elapsed timer counting up (with the 30-second maximum implied), and a "slide left to cancel" hint with a leftward arrow indicator. The text input area is hidden or de-emphasized while recording.

**What the user can do:**
- Primary: hold the mic and speak; release to send.
- Secondary: slide the finger left past a threshold to cancel — recording discarded, no message sent.
- Tertiary: lift early without sliding — same as release, sends what was captured.

**Feel:**
Alive and confident. The waveform / level meter reacts in real time to the user's voice — that responsiveness is the trust signal. Motion is purposeful, not decorative. The recording overlay feels like a small, well-crafted moment — the kind of micro-interaction that rewards attention without demanding it. Calm color, no flashing.

**State context:**
The user is actively pressing the mic. This state lasts seconds at most and ends on release or cancel.

**Critical affordances:**
The waveform / level meter must be visibly responsive — a static "recording…" label is not enough; the user needs to see that their voice is being heard. The slide-to-cancel must be discoverable from the visible hint without prior knowledge. The 30-second cap is implicit in the timer; when it's reached, the recording auto-stops with a brief explanatory banner (see the audio-over-30s error state).
````

---

## Chat screen — Transcribing (post-release, waiting on transcription)

````
**What this screen is for:**
Bridge the moment between "user finished speaking" and "user sees their words written down" so the wait doesn't feel empty.

**What's visible:**
The recording overlay collapses. A pending user-message bubble appears at the bottom of the chat (right-aligned) with a subtle transcribing indicator — a few small dots or a quiet "hearing you…" label inside or adjacent to the bubble. The composer's mic returns to its idle position but is briefly disabled to prevent double-sends. A small cancel affordance is reachable from the pending bubble (tap to discard the in-flight transcription).

**What the user can do:**
- Primary: wait — transcription typically completes within a second or two.
- Secondary: tap to cancel the in-flight transcription (rare but possible).

**Feel:**
Quick and quiet. The pending bubble matches the look of a normal user bubble but is clearly in-flight — slightly reduced opacity, or a soft pending indicator. No spinner that dominates.

**State context:**
The user has just released the mic; the audio blob is in flight to Whisper. This state is short-lived — under a second in the happy case, a few seconds at worst.

**Critical affordances:**
The pending bubble must appear immediately on release — even a half-second of "nothing happening" undermines the press-and-hold flow. The cancel affordance must exist but be quiet enough that users don't tap it by accident.
````

---

## Chat screen — Awaiting Ben reply (model thinking)

````
**What this screen is for:**
Signal that Ben has heard the user and is composing a reply, while keeping the composer available for follow-up.

**What's visible:**
The user's message bubble is now finalized with the transcribed text (no longer pending). Below it, a Ben-side typing indicator appears — a small left-aligned bubble with three quiet animated dots (or equivalent typing affordance), styled to match Ben's normal messages. The composer is fully re-enabled — the user can press and hold the mic again or type a follow-up while waiting.

**What the user can do:**
- Primary: wait for Ben's reply — the typing indicator suggests it's imminent.
- Secondary: stack a follow-up message via voice or text — the composer is live.

**Feel:**
The typing indicator is the friendliest part of the conversation visually — gentle dots, calm animation, no urgency. It feels like a friend gathering their thoughts.

**State context:**
The user's transcribed message has been sent to the model; the model is composing a reply and possibly calling a tool (save_note / save_reminder / save_task / ask_clarifying_question).

**Critical affordances:**
The composer must remain live — blocking the user while Ben replies would break the rapid-fire capture flow the founder explicitly wants. The typing indicator should appear quickly after transcription completes; a perceptible delay between "transcript visible" and "Ben starts typing" feels like a stall.
````

---

## Chat screen — Error states

````
**What this screen is for:**
Surface failures along the capture flow honestly, in place, with a clear and friendly recovery path — never lose the user's input silently.

**What's visible:**
There are five distinct error surfaces, each in its own location:

1. **Mic-record failed** (browser-level mic API error during press-and-hold) — A soft inline toast or banner appears just above the composer with a friend-tone message ("mic glitched — try again or type it"). The pending user-message bubble (if one was rendering) is removed. The composer returns to its idle state with the mic still visible.

2. **Transcription failed** (the audio was captured but Whisper returned an error or empty text) — The pending user-message bubble flips into an error state: a quiet error fill (not red-screaming), friend-tone copy ("couldn't catch that — tap to retry or type it instead"), and a clear retry affordance integrated into the bubble. The original audio is held for one retry.

3. **Ben reply failed** (the model API returned an error) — The Ben typing indicator flips into an error bubble in the same chat position: a soft error fill with friend-tone copy ("brain hiccup — give me a sec") and a tap-to-retry affordance. The user's message remains unchanged.

4. **Save failed** (the model classified successfully but the capture didn't persist) — The inline capture card inside Ben's reply shows a small "couldn't save — retry" affordance integrated into the card. The chat continues normally; the missing artifact is the only signal of the failure. The card's retry tap re-attempts the save.

5. **Audio over 30 seconds** — Recording auto-stopped at the cap. A brief banner appears just above the composer ("hit the 30s cap — sent what I got") and fades after a few seconds. The transcribing flow continues normally with the truncated audio.

**What the user can do:**
- Primary: tap the relevant retry affordance for the specific error surface.
- Secondary: fall back to text input (always available except during recording).

**Feel:**
Friendly, non-alarming. Error fills are soft and distinguishable from normal bubbles but never aggressive (no red-screen energy). Friend-tone copy carries the recovery — the visual treatment is quiet.

**State context:**
One specific stage of the capture pipeline has failed. The rest of the conversation is intact; only the affected element shows an error.

**Critical affordances:**
Each error must surface in the exact location of the affected element (toast above composer for mic, the user bubble itself for transcription, Ben's typing bubble for reply, the inline card for save) — that locality is the trust signal. The retry must be one tap, not a multi-step recovery. Text fallback must remain reachable through all error states.
````

---

## Chat screen — Permission-denied (mic access denied)

````
**What this screen is for:**
Recover from the highest-stakes single moment in the app — the user denied mic access — without losing them.

**What's visible:**
The recording overlay (if it was open) collapses. The screen returns to the populated chat layout. A persistent, dismissible banner appears just above the composer with a friend-tone message ("Ben can't hear you yet — turn on mic in browser settings") and a tap-target ("show me how") that opens a help sheet or modal explaining how to grant mic access in mobile browser settings. The mic affordance in the composer remains visible but tapping it re-surfaces the banner rather than triggering recording. The text input area in the composer remains fully functional.

**What the user can do:**
- Primary: tap "show me how" to see browser-specific instructions for enabling mic.
- Secondary: type messages via the text input — text fallback works regardless of mic state.
- Tertiary: dismiss the banner (it will reappear next time the user taps the mic).

**Feel:**
Honest and non-judgmental. The banner is a quiet alert surface, not an angry warning. Copy assumes the user might fix it later and doesn't shame the choice. Text input remains a first-class option, not a punishment.

**State context:**
The user denied mic permission via the browser's prompt. Voice capture is unavailable until they change browser settings. This may be permanent if the user doesn't fix it — text fallback is the lifeline.

**Critical affordances:**
The help sheet must give clear, browser-specific guidance — many mobile browsers don't allow deep-linking to settings, so the instructions need to be readable and easy to follow. The mic affordance must not silently fail when tapped — it must always re-surface the banner so the user understands why nothing is happening. Text input must work flawlessly.
````

---

## Chat screen — Offline

````
**What this screen is for:**
Keep the user informed and, where possible, keep capture working when the network is unavailable.

**What's visible:**
A subtle banner appears at the top of the chat area with a friend-tone message ("offline — Ben's listening but can't reply yet"). The composer remains visible. Two possible behaviors for the composer depending on implementation depth:

- **Queueing supported**: voice and text inputs continue to work; the user-message bubble appears with a "pending" indicator (similar to the transcribing state but distinct) and waits in a local queue. On reconnect, queued messages send in order and Ben's replies stream in.
- **Queueing not supported**: the composer is disabled with the same offline banner; the mic and text input show a quiet non-interactive state.

The drawer peek and existing chat history remain readable — local data is still accessible.

**What the user can do:**
- Primary (queueing): record or type — capture is queued for send on reconnect.
- Primary (no queueing): wait for reconnect; review prior captures via the ledger drawer.
- Secondary: dismiss the offline banner (it will reappear if still offline on next action).

**Feel:**
Calm and informative. The offline banner is the same quiet surface as the error band on sign-in — soft, friendly, not red. The user shouldn't feel locked out of their data, only delayed in sending new captures.

**State context:**
The browser's online detection returned false, or a recent fetch failed in a network-error way. The user may be in a tunnel, on a plane, or in a spotty area.

**Critical affordances:**
The user must always be able to read existing captures and chat history offline — the local state is intact. The offline banner must be honest about what works and what doesn't; if queueing isn't implemented, don't pretend the input went through.
````

---

## Chat screen — Edge cases

````
**What this screen is for:**
Handle the small visual variations that fall outside the primary states cleanly.

**What's visible:**
Three edge variations, each a small adjustment of the populated state:

1. **Very long single user message** (a long voice clip transcribed to dense text) — The user bubble grows vertically to accommodate the full transcript; no truncation. The chat auto-pins to the bottom so the latest content stays visible. The bubble's max-width is the same as a normal bubble; only height grows.

2. **Rapid-fire captures** (user records two clips back-to-back before Ben replies) — Two user bubbles render in order at the bottom of the chat, each with their own lifecycle (transcribing → final). Ben's replies stream in below in order as they arrive. The composer never blocks between captures.

3. **Returning from background** (the app was backgrounded mid-recording or mid-transcription) — Any in-flight recording is cancelled; the chat shows the standard error banner for the affected stage. The state is restored to the populated view at the last scroll position.

**What the user can do:**
- Primary: continue normally — these are visual edges of the standard populated state.

**Feel:**
Indistinguishable from the standard populated state except for the specific variation. The app should feel resilient — none of these edges should produce a janky or broken-looking surface.

**State context:**
Real-life usage patterns that come up during daily dogfooding. None are failures; all are normal variations the surface needs to absorb gracefully.

**Critical affordances:**
Long messages must scroll fully into view, not get cut off. Rapid-fire captures must preserve order — if Ben's replies arrive out of order due to varying model latencies, the UI must still pair each reply with the correct user message. Background return must not leave the user staring at a broken state.
````
