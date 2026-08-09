# Plan 01 — Hide the Android system navigation bar (immersive)

## Context

- Stack: Expo SDK 54 / React Native 0.81, new architecture + edge-to-edge enabled.
- `expo-navigation-bar` is currently **not** a dependency and is **not** installed, so a **new dependency is required**.
- In edge-to-edge mode (SDK 54) `expo-navigation-bar` supports controlling the bar's **visibility** and **behavior** (the immersive, swipe-to-reveal experience). Styling the bar background/buttons is not supported in edge-to-edge and is out of scope here.
- The top status bar must stay exactly as it is today.

## Plan

1. **Add the navigation-bar capability to the app**
   - Bring in the Expo-recommended package for controlling the Android system navigation bar.
   - Make sure it is reflected in the project's dependency list and dependency lockfile.
   - Confirm the package version is the one aligned with the project's Expo SDK.

2. **Define the desired immersive behavior**
   - The bottom system buttons (back, home, recents) should not be shown all the time.
   - The bar should be hidden by default, giving an immersive full-height experience.
   - The user should still be able to reveal the bar temporarily with a swipe gesture, after which it auto-hides again.

3. **Apply the behavior only on Android**
   - The hiding logic must run on Android only and be a safe no-op on iOS and web.
   - Trigger it once when the app shell starts up, so the bar is hidden from the first screen onward.
   - Keep this concern isolated in its own small setup unit, consistent with how other platform/runtime concerns are organized in the project.

4. **Preserve the existing top status bar**
   - Leave the current status bar appearance and behavior untouched.
   - Verify the change affects only the bottom system navigation bar.

5. **Validate the immersive result**
   - On Android, the bottom system bar is hidden by default and the app content extends to the bottom edge.
   - Swiping up from the bottom temporarily shows the bar, which then hides again.
   - On iOS and web, nothing changes and no errors occur.
