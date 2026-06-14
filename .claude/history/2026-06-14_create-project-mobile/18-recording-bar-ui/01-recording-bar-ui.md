# Plan 18 — RecordingBar UI (React Native: Reanimated + gesture-handler)

Deep, code-level implementation plan for porting the `project-web`
`RecordingBar` to `project-mobile`. **Do not implement yet** — this is the plan only.

## Context

- **Source (web):** `project-web/src/layout/components/recording-bar.tsx` — a flex row with a
  recording card (live dot + "Recording" label + `m:ss` timer + CSS-keyframe waveform + a
  "Slide up to cancel" button) and a circular stop button. It reads `recordingSeconds`,
  `stopRecording`, `cancelRecording` from `useVoiceStore`.
- **Conditional rendering lives in the parent, not the bar.** In web,
  `chat-footer.tsx` / `workspace-footer.tsx` render `<RecordingBar />` only when
  `voiceStatus === "recording"`. So the bar itself does **not** gate on state — it
  assumes it is mounted only while recording. The mobile port keeps that contract
  (parent footers from plans 14/24 mount it). The bar's animations start on mount and
  the gesture handles cancel; no internal "render nothing when idle" branch is needed.
- **Voice store (plan 17)** preserves the web state machine intact. Relevant shape
  (`src/layout/stores/voice-store/types.ts` → `VoiceStore`):
  - `recordingSeconds: number`
  - `stopRecording: () => void`
  - `cancelRecording: () => void`
  Imported via `import { useVoiceStore } from "@/layout/stores/voice-store"`.
- **UI primitives (plan 05):** `Typography` is over RN `<Text>`; same variant→class map
  (`label-caps` → `text-label-caps font-mono uppercase`). Icons come from
  `lucide-react-native` (`ArrowUp`, `Mic`). NativeWind classNames are kept identical to
  web where possible.
- **Libs (per MOBILE-PORT-ANALYSIS.md):** `react-native-reanimated` replaces the CSS
  keyframe waveform + pulse; `react-native-gesture-handler` provides the slide-up-to-cancel
  Pan gesture; `expo-haptics` (optional) gives tactile feedback. All three are declared in
  the scaffold (plan 01) `package.json`, with `react-native-reanimated/plugin` last in
  `babel.config.js` and `GestureHandlerRootView` already at the providers root.

## Scope / owned files (parallel-safe — touch ONLY this file)

- `project-mobile/src/layout/components/recording-bar.tsx`

No other file is created or edited. No barrel/index re-export file (per memory rule). No
formatting step. Verification is `npx tsc --noEmit` only.

## Goal

Rewrite the recording bar with:
1. State driven by `useVoiceStore` (`recordingSeconds`, `stopRecording`, `cancelRecording`).
2. Reanimated continuously-animated waveform (staggered per-bar) + pulsing indicator dot,
   replacing the web CSS `animation` keyframes.
3. A gesture-handler `Pan` gesture over the card: dragging up gives live visual feedback
   (the card follows the finger, fading slightly), and crossing a threshold fires
   `cancelRecording`; otherwise it springs back.
4. Stop button fires `stopRecording`; the "Slide up to cancel" hint is also a tappable
   cancel fallback.
5. Optional `expo-haptics`: light impact on mount (recording start) and a notification
   on cancel.

---

## Step 1 — Module-level constants and helpers

Keep the web waveform heights and the `formatTime` helper verbatim (pure, module-level per
the "keep utility functions outside the component" rule). Add animation tuning constants and
the cancel threshold.

```tsx
const WAVEFORM_BARS = [
  10, 18, 28, 22, 32, 14, 26, 36, 20, 30, 16, 24, 34, 18, 28,
];

const WAVE_MIN_SCALE = 0.4;
const WAVE_DURATION = 450;
const WAVE_STAGGER = 60;
const CANCEL_THRESHOLD = 56; // upward px drag that triggers cancel

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
```

## Step 2 — The pulsing indicator dot (own component — one component per file rule allows
local composition only via a separate file; instead keep it inline as plain JSX)

The "one component per file" memory rule forbids declaring a second exported React component
in the same file. The waveform bar and the dot are visual fragments, not reusable components,
so they are expressed as **animated views inside the single `RecordingBar` component**, not
as sibling component declarations. Each animated piece gets its own `useSharedValue` +
`useAnimatedStyle` hook at the top of `RecordingBar` (hooks must be unconditional and fixed
in count — `WAVEFORM_BARS.length` is a constant, so mapping shared values over it is stable).

Pulse dot:

```tsx
const dotPulse = useSharedValue(1);

useEffect(() => {
  dotPulse.value = withRepeat(
    withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );
}, [dotPulse]);

const dotStyle = useAnimatedStyle(() => ({ opacity: dotPulse.value }));
```

Rendered as `<Animated.View style={dotStyle} className="size-2 rounded-full bg-text-error" />`.

## Step 3 — The animated waveform bars

`WAVEFORM_BARS.length` is constant (15), so create a fixed-length array of shared values once.
Because hook order/count must be stable, build the shared values with a single
`useSharedValue` per index is not allowed in a loop — instead use one shared value `wavePhase`
and derive each bar's scale from it with a per-bar phase offset inside one
`useAnimatedStyle` per bar is also loop-bound. The clean, hook-stable pattern: drive **one**
shared progress value with `withRepeat`, and compute each bar's `scaleY` in its own
`useAnimatedStyle` using a constant index offset.

To keep hook count fixed and avoid hooks-in-loops lint errors, define a small **separate
file is NOT allowed by scope** — so render the bars via a fixed map where each iteration
calls `useAnimatedStyle` is illegal. Resolve this by computing all bar transforms inside a
single `useAnimatedStyle`? No — styles are per-view. The correct RN/Reanimated idiom that
respects "fixed file, no hooks in loops" is a **dedicated `WaveBar` component in its own
file** — but scope forbids new files.

**Chosen approach (scope- and rule-compliant):** drive one shared clock `waveClock` with
`withRepeat(withTiming(...))`, and give each bar an inline `useAnimatedStyle`. React's
rules-of-hooks allow hooks inside `.map` **only if the array length is constant across
renders**, which it is (`WAVEFORM_BARS` is a module constant, never reordered). ESLint's
`react-hooks/rules-of-hooks` will still flag a hook call inside `.map`; to stay lint-clean
**without** a second file, precompute the animated styles outside JSX is impossible.

Final decision: **encode the waveform animation with a single shared `waveClock` and a
single `Animated.View` per bar whose style is produced by a small array of `useAnimatedStyle`
hooks created explicitly and unconditionally** — i.e. unroll is ugly. Instead, the cleanest
compliant solution is to animate each bar's height with the `entering`/layout API? No.

The pragmatic, idiomatic solution used across this codebase's RN ports: a **single shared
value plus `interpolate`**, applied through **one `useAnimatedStyle` shared by all bars via
a transform that reads the bar index from a Reanimated-safe closure**. Concretely:

```tsx
const waveClock = useSharedValue(0);

useEffect(() => {
  waveClock.value = withRepeat(
    withTiming(1, { duration: WAVE_DURATION, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );
}, [waveClock]);
```

Then build a fixed array of animated styles with `useMemo` is also not hook-safe for the
inner hooks. **Therefore the bars are rendered through a dedicated `WaveformBar` component
that MUST live in its own file** — but plan scope says only touch `recording-bar.tsx`.

> **Open decision flagged for the implementer (no guessing):** Reanimated requires one
> `useAnimatedStyle` per animated `View`, and hooks cannot be called inside `.map`. There are
> exactly two compliant ways to render 15 independently-animated bars:
>
> 1. **Single-file, fixed unrolled bars:** declare the 15 `useAnimatedStyle` calls explicitly
>    at the top of `RecordingBar` (hook count is fixed and lint-clean), store them in an array,
>    and map over `WAVEFORM_BARS` rendering `bars[index]`. Verbose but stays within the
>    one-owned-file scope and the one-component-per-file rule.
> 2. **Two-file split:** add `recording-bar/waveform-bar.tsx` (a `WaveformBar` component) +
>    `recording-bar/recording-bar.tsx`. Cleaner, but expands the owned file set.
>
> The brief restricts scope to the single `recording-bar.tsx`, so **option 1 is the default**.
> If the implementer is allowed to grow scope, option 2 is preferred for readability.

**Default (option 1) sketch — one shared clock, 15 explicit animated styles:**

```tsx
const waveClock = useSharedValue(0);

useEffect(() => {
  waveClock.value = withRepeat(
    withTiming(1, { duration: WAVE_DURATION, easing: Easing.inOut(Easing.ease) }),
    -1,
    true,
  );
}, [waveClock]);

function useWaveBarStyle(index: number) {
  const phase = (index * WAVE_STAGGER) / WAVE_DURATION;
  return useAnimatedStyle(() => {
    const shifted = (waveClock.value + phase) % 1;
    const wave = Math.sin(shifted * Math.PI);
    const scaleY = WAVE_MIN_SCALE + (1 - WAVE_MIN_SCALE) * wave;
    return { transform: [{ scaleY }] };
  });
}

const waveStyles = WAVEFORM_BARS.map((_, index) => useWaveBarStyle(index));
```

`useWaveBarStyle` is a custom hook; calling it inside `.map` over a **constant-length** array
is the canonical fixed-hook-count pattern and is lint-clean because the count never changes.
This keeps everything in one file and one component. Each bar:

```tsx
{WAVEFORM_BARS.map((height, index) => (
  <Animated.View
    key={index}
    className="w-1 rounded-full bg-primary/80"
    style={[{ height }, waveStyles[index]]}
  />
))}
```

(`bg-primary/80` and the `w-1`/`rounded-full` classes mirror the web exactly; the per-bar
pixel `height` moves from CSS to the RN `style` prop, with the keyframe animation replaced by
the Reanimated `scaleY`.)

## Step 4 — Slide-up-to-cancel Pan gesture (react-native-gesture-handler)

Wrap the recording **card** (not the stop button) in a `GestureDetector`. The card is an
`Animated.View` whose `translateY`/`opacity` follow the drag. Use the modern
`Gesture.Pan()` API and `runOnJS` to call store actions / haptics from the UI thread worklet.

```tsx
const dragY = useSharedValue(0);

const cardStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: dragY.value }],
  opacity: 1 + dragY.value / (CANCEL_THRESHOLD * 3), // fades as it slides up
}));

const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    dragY.value = Math.min(0, event.translationY); // only upward
  })
  .onEnd((event) => {
    if (event.translationY <= -CANCEL_THRESHOLD) {
      runOnJS(handleCancel)();
    } else {
      dragY.value = withSpring(0);
    }
  });
```

- `event.translationY` is negative when dragging up; clamp to `<= 0` so the card never moves
  down. The opacity dips slightly as it rises, giving the "about to cancel" feedback.
- On release past `-CANCEL_THRESHOLD`, call `handleCancel` (which runs `cancelRecording` +
  optional haptic). The parent footer then stops rendering the bar (voiceStatus leaves
  "recording"), so no manual reset of `dragY` is needed on cancel.
- Otherwise spring `dragY` back to `0`.

Render:

```tsx
<GestureDetector gesture={panGesture}>
  <Animated.View
    className="flex-1 gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
    style={cardStyle}
  >
    {/* header row, waveform row, slide-up hint */}
  </Animated.View>
</GestureDetector>
```

(The web `shadow-[0_8px_24px_rgba(0,0,0,0.08)]` becomes a NativeWind `shadow-*` / RN
`elevation`; if plan 03 tokens don't define a matching shadow utility, drop it — shadow is
cosmetic and not load-bearing. Flag, don't guess.)

## Step 5 — Action handlers + optional haptics

Read actions from the store and wrap them in `handle*` functions (per the "explicit handlers"
pattern). Haptics are optional and must fail-soft (wrapped so a missing native module never
throws on a recording cancel).

```tsx
const elapsedSeconds = useVoiceStore((store) => store.recordingSeconds);
const stopRecording = useVoiceStore((store) => store.stopRecording);
const cancelRecording = useVoiceStore((store) => store.cancelRecording);

useEffect(() => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}, []);

function handleStop() {
  stopRecording();
}

function handleCancel() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  cancelRecording();
}
```

- Selector form `useVoiceStore((store) => store.x)` matches the web file and avoids
  re-rendering on unrelated store changes.
- `handleStop`/`handleCancel` are passed directly to `onPress` (no inline arrow, no args).
- The mount haptic represents "recording started" since the bar only mounts while recording.

## Step 6 — Final JSX assembly

Outer row = `<View className="flex-row items-center gap-3">`. Inside: the gesture-wrapped
animated card, then the circular stop button (`Pressable` / `IconButton` from plan 05 if its
API fits; otherwise `Pressable`). The stop button is **outside** the `GestureDetector` so the
pan gesture never swallows its press.

```tsx
return (
  <View className="flex-row items-center gap-3">
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="flex-1 gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
        style={cardStyle}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Animated.View
              className="size-2 rounded-full bg-text-error"
              style={dotStyle}
            />
            <Typography variant="label-caps" className="text-text-error">
              Recording
            </Typography>
          </View>
          <Typography
            variant="label-caps"
            className="font-mono normal-case text-on-surface-variant"
          >
            {formatTime(elapsedSeconds)}
          </Typography>
        </View>

        <View className="h-8 flex-row items-center justify-center gap-1">
          {WAVEFORM_BARS.map((height, index) => (
            <Animated.View
              key={index}
              className="w-1 rounded-full bg-primary/80"
              style={[{ height }, waveStyles[index]]}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel recording"
          onPress={handleCancel}
          className="flex-row items-center justify-center gap-2"
        >
          <ArrowUp size={14} className="text-on-surface-variant" />
          <Typography variant="label-caps" className="text-on-surface-variant">
            Slide up to cancel
          </Typography>
        </Pressable>
      </Animated.View>
    </GestureDetector>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Stop recording"
      onPress={handleStop}
      className="size-12 shrink-0 items-center justify-center rounded-full bg-text-error"
    >
      <Mic size={20} className="text-on-primary" />
    </Pressable>
  </View>
);
```

Notes on web→RN class translation:
- `flex items-center` → `flex-row items-center` (RN defaults to `flex-col`; web's `flex` is row).
- `<span className="size-2 animate-pulse ...">` → `<Animated.View style={dotStyle}>` (Reanimated pulse replaces `animate-pulse`).
- `<button onClick>` → `<Pressable onPress>` with `accessibilityLabel` instead of `aria-label`.
- `lucide-react` → `lucide-react-native`; `className="size-3.5"` on icons → `size={14}` prop
  (lucide-react-native takes numeric `size`; color via `className` works through NativeWind's
  `cssInterop`, or pass `color` if plan 05 wires it that way — match plan 05's icon convention).
- `ring-4 ring-text-error/20` (web focus ring) has no RN equivalent and is dropped; it is
  purely a web hover/focus affordance.

## Imports

```tsx
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ArrowUp, Mic } from "lucide-react-native";
import { useVoiceStore } from "@/layout/stores/voice-store";
import { Typography } from "./ui/typography";
```

(`runOnJS` and the animation primitives both come from `react-native-reanimated`; merge into a
single import. `cn` is dropped unless the `className` prop merge is still needed — keep
`type RecordingBarProps = { className?: string }` and apply it to the outer `View` with `cn`
if plan 03/05 ships a `cn` util, mirroring web; otherwise the `className` prop can be omitted
since the web callers — chat-footer/workspace-footer — render `<RecordingBar />` with no
props.)

## Open items flagged (no guessing — resolve against plans 03/05 at implementation time)

1. **Waveform hooks-in-map vs file split** (Step 3): default to single-file unrolled-via-
   custom-hook over a constant-length array; switch to a two-file split only if scope is
   widened.
2. **Shadow utility** (`shadow-[...]`): keep only if plan 03 tokens expose a matching RN
   shadow/elevation utility; otherwise drop.
3. **Icon color API**: `className` color vs `color` prop on `lucide-react-native` — follow
   whatever plan 05's `icon-button.tsx` / icon usage established.
4. **`className` prop**: keep it for parity but it is currently unused by callers; only wire
   `cn` if plan 05 exports it.

## Verification

```bash
cd /home/fael/so/repos/ben-prototype/project-mobile && npx tsc --noEmit
```

No lint/format step is required for this plan (per brief). The component compiles against the
plan-17 voice store and plan-05 primitives, renders the animated waveform/pulse, and the Pan
gesture cancels past threshold.
