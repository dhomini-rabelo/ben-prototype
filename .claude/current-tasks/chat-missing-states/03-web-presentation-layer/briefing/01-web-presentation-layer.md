# Plan

1. **Build the reusable status banner**
   - Support three visual tones (info, warn, error) with matching colors
   - Allow an optional leading icon and an optional action that runs a provided handler
   - Allow the banner to be dismissible when requested
   - Render any caller-provided message content
   - Remain purely presentational, driven entirely by incoming props

2. **Build the recording footer**
   - Show a recording indicator with a pulsing dot and a "Recording" label
   - Display an elapsed-time-over-maximum-time counter from provided values
   - Show an animated waveform that conveys active listening
   - Include a "Slide up to cancel" hint and an active microphone button
   - Surface a cancel action handler without itself accessing the microphone

3. **Build the transcribing message footer**
   - Show a "Hearing you" label with animated bouncing dots
   - Offer a cancel control that triggers a provided handler
   - Keep it compact so a message bubble can host it inline

4. **Build the error retry message footer**
   - Show a "Tap to retry" affordance with an error tone
   - Trigger a provided retry handler when activated
   - Keep it compact for inline use within a message bubble

5. **Ensure visual fidelity and reusability**
   - Match the existing design sources for spacing, color, and motion
   - Keep all components free of data fetching, device access, and page-specific logic
   - Expose clear, minimal props so a later integration step can render each piece
