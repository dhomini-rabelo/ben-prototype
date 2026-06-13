# Plan 18 — RecordingBar UI (Reanimated + gesture-handler)

**Plan 11 [Frontend] (parallel)**: Rewrite the voice RecordingBar UI.

- Depends on the voice store (plan 17), UI primitives (plan 05). Owns `src/layout/components/recording-bar.tsx`. Runs at its own slot after plan 17.

## Goal

Rewrite the recording bar (waveform + elapsed timer + "slide up to cancel") with **`react-native-reanimated`** (waveform/pulse animations replace CSS keyframes) and **`react-native-gesture-handler`** (slide-up-to-cancel gesture), per the analysis libs table.

## Scope / owned files

- `project-mobile/src/layout/components/recording-bar.tsx` — RN RecordingBar driven by `useVoiceStore` state; Reanimated animated waveform/pulse; gesture-handler pan gesture for slide-to-cancel; optional `expo-haptics` feedback on start/cancel.

## Verification

`npx tsc --noEmit` passes.
