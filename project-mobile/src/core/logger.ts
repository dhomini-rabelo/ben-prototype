// `__DEV__` is a boolean global injected by the React Native / Metro bundler:
// `true` while developing (Expo Go, dev client, `expo start`) and `false` in
// production builds. We only surface diagnostic warnings during development so
// production builds keep a clean console.
export function devWarn(...args: Parameters<typeof console.warn>): void {
  if (__DEV__) {
    console.warn(...args)
  }
}
