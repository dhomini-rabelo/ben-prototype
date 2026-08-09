// `expo-navigation-bar` is an Android-only native module with no web behavior.
// The web bundle has no system navigation bar to hide, so this is a no-op.
// Metro picks this `.web.ts` variant for the web bundle; native uses
// `system-ui-service.ts`.
export async function hideAndroidNavigationBar(): Promise<void> {}
