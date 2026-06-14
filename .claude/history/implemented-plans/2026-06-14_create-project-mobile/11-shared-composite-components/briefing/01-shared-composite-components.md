# Plan — Shared composite components (chat-input, chat-banner, brand-mark) for project-mobile

Port the three shared composite layout components from `project-web` to `project-mobile` (React Native / Expo), preserving the compound-component API (`Root` + named parts sharing a React context) so consuming screens use them unchanged.

> Note: the brief refers to these as "Jotai-context" components, but the actual web source shares state through React `createContext`/`useContext`, not Jotai. This plan keeps that same React-context composition pattern; the only state Jotai owns elsewhere is the input draft, which is passed into these components as props.

**Owned files only:** `src/layout/components/chat-input/`, `src/layout/components/chat-banner/`, `src/layout/components/brand-mark.tsx`. Depends on UI primitives (plan 05) and tokens (plan 03).

---

**Plan**

1. **Preserve the compound-component contracts**
   - Keep each component exposed as an object with `Root` plus its named parts, so screens compose them exactly as on web.
   - Keep the chat-input contract: root receives the current draft, a change handler, a send handler, and a disabled flag, and shares them with its parts through context.
   - Keep the chat-banner contract: root receives a tone (info / warn / error) and shares it with its parts through context.
   - Keep brand-mark's contract: orientation (row / column), optional logo sizing, and style overrides.

2. **Port the chat-input composite to native input behavior**
   - Render the rounded input container, the text field, the attach affordance, and the action affordance using native layout and pressable elements instead of HTML.
   - Make the text field a native multi-capable text input that reflects and updates the draft, shows the placeholder, and honors the disabled state.
   - Replace web "Enter to send" with the platform-appropriate submit behavior for a single-line message field, still triggering send.
   - Preserve the action affordance's toggle: show send when there is text, otherwise show the voice/mic action, and keep its disabled conditions (offline, transcribing, or globally disabled) sourced from the existing stores and the record-capability check.
   - Keep the attach affordance as an optional press handler.

3. **Port the chat-banner composite with tone styling**
   - Render the banner container, leading icon, body text, inline action, and dismiss control using native layout and pressable elements.
   - Drive the per-tone colors for container, icon, and action text from the shared tone context, mapping the existing info/warn/error styles to the mobile tokens.
   - Keep the icon part accepting an icon component, the action part accepting a label and press handler, and the dismiss part accepting a press handler.

4. **Port brand-mark for native rendering**
   - Lay out the logo mark and the wordmark in either a horizontal or vertical arrangement per the orientation input.
   - Apply the brand (primary) color and allow size and style overrides for both the mark and the wordmark.

5. **Adapt styling and shared dependencies to the mobile stack**
   - Express all styles with NativeWind classes carrying the same visual intent (radius, spacing, surface/primary/error tokens, opacity-on-disabled), relying on the migrated tokens.
   - Source the logo mark, the typography primitive, and the class-merge helper from the mobile equivalents provided by the primitives and tokens work, rather than the web ones.
   - Swap web icon imports for the mobile icon set, keeping the same icons (send, mic, attach/plus, dismiss/x).
   - Replace web-only affordances (focus-within styling, hover states, ARIA attributes) with native pressed/focused feedback and accessibility labels appropriate to the platform.

6. **Verify the unit in isolation**
   - Confirm type-checking passes for these components against the mobile primitives and token types.
   - Confirm each component renders and reacts to interaction (typing updates the draft and toggles the action, banner tones style correctly, dismiss/action handlers fire, brand-mark renders in both orientations).
