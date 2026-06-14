# Plan 14 — Chat shell: empty state, top bar, top banner (RN port)

Port the chat empty state, the top bar (menu trigger + branding), and the top banner (connectivity / voice status) from `project-web` to `project-mobile` (React Native / Expo).

**Owned folders (this unit only):**
- `project-mobile/src/pages/chat/components/chat-empty-state/`
- `project-mobile/src/pages/chat/components/chat-top-bar/`
- `project-mobile/src/pages/chat/components/chat-top-banner/`

**Depends on:** chat backbone (plan 10), shared `chat-banner` (plan 11), UI primitives (plan 05).

**Cross-parallel dependency flag (for Stage 5 overlap validation):** the empty state in `project-web` imports `SuggestedAction`, which is owned by plan 13 (a sibling parallel plan). This is a real cross-parallel coupling. Resolution per brief: keep the `suggested-action` import lazy/optional, or Stage 5 must move `suggested-action` ownership into this unit. Do not redefine `suggested-action` here.

---

**Plan**

1. **Port the chat empty state**
   - Show the same idle hero: a circular icon badge, a "No recent messages." headline, and the helper line inviting the user to tap the mic or type.
   - Reuse the brand/UI primitives for typography and surface styling rather than redefining them.
   - Render the "Suggested Actions" section below the hero, reusing the suggested-action element owned by plan 13 (import only — never reimplement it).
   - Flag the suggested-action coupling as a cross-parallel dependency for Stage 5; keep the dependency import optional/lazy so this unit stays buildable on its own.

2. **Port the chat top bar**
   - Show the branding mark on the leading side and a menu-trigger button on the trailing side.
   - Expose an `onOpenMenu` callback that fires when the menu trigger is pressed; leave the actual navigation wiring to plan 28.
   - Reuse the shared icon-button primitive for the trigger and preserve its accessible label.

3. **Port the chat top banner (connectivity / status)**
   - Drive visibility from connectivity and voice state: offline, voice error, and microphone-denied are the three surfaced conditions; render nothing when all are clear.
   - Reuse the shared chat-banner element for layout, tone, icon, message, retry action, and dismiss affordance.
   - Map each condition to its tone and message: offline (warning, sending paused), voice error (error, retry + dismiss), mic denied (warning, guidance + dismiss).
   - Source connectivity from the mobile connectivity state and voice status from the voice state; adjust the mic-denied guidance copy to reference device settings instead of browser settings.

4. **Adapt platform-specific concerns for RN**
   - Replace web-only layout and event handling with React Native equivalents (press handlers instead of click, native view/layout primitives instead of DOM elements).
   - Ensure connectivity and voice state are read through the mobile stores already established by the chat backbone, with no direct browser APIs.

5. **Verify the unit**
   - Confirm the three components compile cleanly in the mobile project (`npx tsc --noEmit` passes).
   - Confirm each component renders only the behaviors it owns and relies on shared primitives/stores rather than duplicating them.
