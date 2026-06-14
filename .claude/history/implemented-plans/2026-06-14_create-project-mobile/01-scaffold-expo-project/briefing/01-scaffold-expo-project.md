# Plan 01 — Scaffold the Expo project shell

A high-level plan to stand up the `project-mobile` Expo app foundation. This runs first and alone; it ports no feature, it only establishes the ground every later plan builds on.

## Plan

1. **Establish the project toolchain and dependencies**
   - Create a managed-workflow Expo project alongside the existing web project, with run scripts for starting the dev server and launching iOS and Android
   - Declare the full dependency set the later plans rely on: navigation, styling, animation and gestures, safe areas, vector rendering, icons, networking, server/global/draft state, validation and forms, AI streaming, authentication, audio, secure and local storage, connectivity, fonts, splash and status bar, haptics, and local notifications
   - Provide the same lint and lint-fix workflow used by the web project, plus formatting (a new addition for mobile)
   - Ignore build artifacts and local secrets from version control

2. **Configure the build and resolution pipeline**
   - Mirror the web project's strict TypeScript settings and its short import alias that points at the source root
   - Make the bundler and the type checker both resolve that alias consistently
   - Wire styling so utility classes work natively, including the type declarations and the global stylesheet entry point (the style tokens themselves are owned by a later plan)
   - Order the build transforms so animation and gesture support function correctly

3. **Declare the native app configuration**
   - Set the app's display name, deep-link scheme, and the plugins required by navigation, audio, authentication, notifications, and fonts
   - Request the platform permissions needed for voice recording on both iOS and Android
   - Expose runtime configuration (backend address, authentication keys, sign-in identifiers) to the app in a single place

4. **Centralize environment and shared runtime values**
   - Replace the web project's build-time environment variables with a typed reader over the native runtime configuration, covering the backend address, the authentication provider keys, and the sign-in client identifiers
   - Create one shared server-state client instance that both the navigation shell and the future networking layer can reference, so ownership never splits
   - Define the route map adapted to file-based navigation paths for the login, chat, and task detail screens

5. **Build the bootable navigation shell**
   - Assemble the root layout that wraps the app in gesture handling, safe-area awareness, and the shared server-state provider
   - Load the required fonts, manage the splash screen until the app is ready, and apply the status bar styling
   - Render an empty placeholder destination so the app boots to a blank screen with no feature code
   - Confirm the type checker passes and the app launches successfully
