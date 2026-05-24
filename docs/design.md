---
name: Warm Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#121213'
  on-primary: '#ffffff'
  primary-container: '#272727'
  on-primary-container: '#8f8e8d'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#636262'
  tertiary: '#111312'
  on-tertiary: '#ffffff'
  tertiary-container: '#252726'
  on-tertiary-container: '#8d8e8d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e3e1'
  tertiary-fixed-dim: '#c6c7c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#454746'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  accent-active: '#1A1A1A'
  surface-error: '#FFF5F5'
  text-error: '#C53030'
  slate-deep: '#0F172A'
  soft-gray: '#E2E8F0'
typography:
  wordmark:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.04em
  tagline:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  tagline-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  margin-edge: 24px
  gutter: 16px
  max-width: 480px
---

## Brand & Style
The design system embodies a "Linear-adjacent" philosophy: it is sharp, fast, and restrained, yet intentionally softened to feel like a tool for a single human rather than a corporate team. The brand personality is **Modern and Human**—it avoids the clinical coldness of enterprise software and the over-eager playfulness of consumer "toys."
The visual style is a hybrid of **Minimalism** and **Modern Corporate**, utilizing heavy whitespace and a disciplined neutral palette to create a sense of "quiet confidence." Personality is injected through "friend-tone" copy and high-quality typographic execution rather than ornamental flourishes. Every interaction should feel instantaneous and reliable, reinforcing trust through visible state changes and optimistic UI patterns.
## Colors
The palette is predominantly neutral, relying on a range of whites, soft grays, and deep slates to define hierarchy. 
- **Primary:** A deep, near-black used for the wordmark and primary action buttons. It provides the "sharp" anchor for the design.
- **Secondary:** Mid-tone grays for taglines and secondary information, maintaining legibility without competing for attention.
- **Accent:** Understated and reserved. It is used sparingly for primary call-to-action states.
- **Surface Tones:** Soft, warm grays (`#F5F5F3`) are used for error bands and card backgrounds to "take the edge off" pure white, making the tool feel more approachable and less clinical.
- **Functional Colors:** Errors are signaled with soft, non-alarming washes rather than aggressive "system-red" alerts.
## Typography
The system uses **Hanken Grotesk** as its primary typeface. It strikes a balance between technical precision and human warmth, with rounded forms that feel friendly without becoming "bubbly." 
- **Hierarchy:** The wordmark is heavy and confident. Taglines use a lighter weight with generous leading to feel calm and breathable.
- **Technical Accents:** **JetBrains Mono** is used sparingly for small labels or secondary system status indicators to lean into the "tool-like" nature of the product.
- **Mobile Scale:** On smaller screens, taglines and headlines should scale down slightly to maintain the sense of "generous whitespace" without crowding the viewport.
## Layout & Spacing
The layout philosophy is **Fixed and Centered**. For the mobile-first productivity experience, content is contained within a maximum width of 480px, even on larger displays, to maintain focus and speed.
- **Vertical Rhythm:** Use a strict 8px-based grid. Heavy vertical spacing (32px+) is used between the wordmark/tagline and the primary action to create a sense of calm.
- **Breathing Room:** Margins are generous (24px) to ensure the UI never feels cramped.
- **Reflow:** On desktop, the central column remains fixed, surrounded by "quiet whitespace" to prevent the interface from stretching and losing its focus.
## Elevation & Depth
The design system uses **Tonal Layers** rather than heavy shadows to convey hierarchy. 
- **Surface Levels:** The base background is neutral white. Cards and "inline bands" (errors/notices) sit slightly above this using soft gray or tinted fills (`#F5F5F3`).
- **Subtle Depth:** Where depth is required, use ultra-diffused, low-opacity shadows (e.g., `0px 4px 12px rgba(0,0,0,0.03)`).
- **Interactivity:** Elements should not "pop" off the screen. Instead, they use tonal shifts—a button might darken slightly on hover or press, rather than gaining a larger shadow.
- **State Indicators:** Use faded borders or tiny "pending dots" to show activity within a card, keeping the user's focus on the content.
## Shapes
The shape language is **Rounded** (0.5rem / 8px) to provide the "human" softening of the Linear-inspired precision. 
- **Standard Elements:** Buttons and input fields use the base 8px radius.
- **Large Containers:** Capture cards and the "ledger peek" drawer use `rounded-xl` (1.5rem / 24px) to feel distinct and substantial.
- **Micro-elements:** Chips and progress indicators may use pill-shaped rounding to differentiate them from functional containers.
## Components
- **Primary Buttons:** High-contrast (Primary Color background, White text). Rounded corners. No heavy gradients; a flat, confident surface.
- **Inline Error Bands:** Soft tinted surfaces (`surface-error`) with matching text (`text-error`). They should appear above the primary action, shifting the layout minimally.
- **Capture Cards:** The core of the experience. They appear optimistically with a subtle "pending" state (faded border) until persistence is confirmed.
- **Composer:** The press-and-hold mic is the visual anchor. It should be a large, circular or softly rounded square affordance that feels tactile.
- **Ledger Peek:** A persistent drawer sitting at the top of the composer. It uses a soft background blur or a subtle tonal difference to separate "upcoming" data from the active capture area.
- **Loading States:** Avoid heavy spinners. Use a quiet, slow pulse of the button label or a "barely-there" linear progress line integrated into the button top edge.
- 