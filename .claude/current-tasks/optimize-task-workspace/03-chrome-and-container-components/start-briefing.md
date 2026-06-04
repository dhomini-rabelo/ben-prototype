# Plan 2 [Frontend] (parallel): Refactor chrome components + create banner/footer containers

**Plan line:** Plan 2 [Frontend] (parallel)
**Justification:** Depends only on the state layer from Plan 1. It owns the chrome component folders and two **new** container folders — a disjoint file set from the content plan (Plan 2, folder 02), so the two run in parallel with no conflict. Runs after Plan 1 because it consumes `useTaskStore`, `useVoiceStore`, `selectVoiceStatus`, `useConnectivityStore`, and `diffSummary`.

## Goal

Refactor the chrome components to self-subscribe to the Plan 1 stores (no action props), and extract the four inline `render*` helpers currently living in `page.tsx` (lines 72–170) into dedicated **container components** that read from stores. This is what lets `page.tsx` become a thin chat-style composition in Plan 4. Add memoization where chat does.

## Files this plan OWNS

### Existing (refactor)
- `components/workspace-top-bar/workspace-top-bar.tsx`
- `components/diff-bar/diff-bar.tsx`
- `components/sub-thread-banner/sub-thread-banner.tsx`
- `components/workspace-shell/workspace-shell.tsx`

### New (create)
- `components/workspace-banner/workspace-banner.tsx`
- `components/workspace-footer/workspace-footer.tsx`

## Required changes

### workspace-top-bar.tsx
- Keep `task` via `useWorkspaceTask()` and the local menu open state.
- **Drop the `onBack`/`onFinish`/`onReopen` props.** Read `finish`, `reopen`, `isMutating` from `useTaskStore`; get `navigate` via `useNavigate()`. `onBack` → `navigate(ROUTES.chat)`; finish → `if (await finish()) navigate(ROUTES.chat)`; reopen → `void reopen()`. Disable the menu actions while `isMutating`.
- Wrap export in `memo(...)`.

### diff-bar.tsx
- **Remove the inlined `diffSummary` function**; import it from `../../utils/diff-summary`.
- **Self-render decision:** read `task` via `useWorkspaceTask()`. If there is no `task.pendingDiff`, return `null` (this absorbs the page's `renderDiffBar` guard so the page can always render `<DiffBar />`).
- **Drop the `disabled`/`onApprove`/`onReject` props.** Read `isMutating`, `approveDiff`, `rejectDiff` from `useTaskStore`. Buttons use `disabled={isMutating}`.
- Wrap export in `memo(...)`.

### sub-thread-banner.tsx
- Keep it **presentational** (props: `variant`, `text`, `onRetry`). It is consumed by `workspace-banner`. No store access. No signature change needed (optionally `memo`).

### workspace-shell.tsx
- Keep as the pure layout/slot component (topBar, topBanner, banner, diffBar, footer, children) with its footer-height `ResizeObserver`. No logic change. Optionally `memo` is unnecessary here (it takes elements as props). Leave behavior identical.

### NEW components/workspace-banner/workspace-banner.tsx
Encapsulates BOTH the page's `renderTopBanner` (offline / voice-error / mic-denied) and `renderBanner` (ben-typing / send-error / last-reply) logic — OR split into a top-banner part and a sub-thread part if cleaner. Reads from stores:
- offline → `useConnectivityStore((s) => s.isOffline)`
- voice status → `useVoiceStore(selectVoiceStatus)`, `micPermission` → `useVoiceStore`
- voice actions `retryVoice`, `dismissError` → `useVoiceStore`
- sub-thread → `useTaskStore` (`isAwaitingReply`, `sendError`, `lastBenReply`) and `sendText` for the retry, plus `task.pendingDiff` via `useWorkspaceTask()` to suppress the sub-thread banner when a diff is pending (page lines 108–110).
- Reuse `ChatBanner.*` (`layout/components/chat-banner`) and `SubThreadBanner` exactly as the page does today (same copy, tones, icons).
- Export the relevant pieces so the page can place them in the shell's `topBanner` and `banner` slots. Decide a clean API: e.g. export `WorkspaceTopBanner` and `WorkspaceSubThreadBanner` (two components), or one `WorkspaceBanner` with sub-parts. Document the exported names in this plan's deep plan.

### NEW components/workspace-footer/workspace-footer.tsx
Encapsulates the page's `renderFooter` (lines 142–170): if recording → `<RecordingBarDesign />`; else → `<ChatInputDesign />`. Reads from stores:
- voice status → `useVoiceStore(selectVoiceStatus)`; `recordingSeconds`, `startRecording`, `stopRecording`, `cancelRecording`, `canRecord` (derive `micPermission !== "denied" && !isOffline`).
- draft → `taskDraftAtom` (Jotai) via `useAtom`; `onChange` sets the atom; `onSend` → read `sendText` from `useTaskStore` and send the current draft then clear the atom (mirror chat's `use-chat-input` send-then-clear, restoring on failure is optional but nice).
- `isOffline` → `useConnectivityStore`; finished state → `useWorkspaceTask()` (`task.status === "finished"`).
- mode logic identical to page lines 157–163 (`disabled` / `sending-disabled` / `idle`).
- Reuse `ChatInputDesign` and `RecordingBarDesign` from `layout/components/...` exactly as today.
- Wrap export in `memo(...)` (chat memoizes `ChatFooter`).

## Contract notes for the integration plan (Plan 4)
After this plan the page will render (no callback props):
- `<WorkspaceTopBar />`
- `<DiffBar />` (self-guards on pendingDiff)
- the banner component(s) exported from `workspace-banner` in the shell's `topBanner` / `banner` slots
- `<WorkspaceFooter />` in the shell's `footer` slot

Document the exact exported component names in the deep plan so Plan 4 imports them correctly.

## Out of scope / rules
- Do **not** modify `page.tsx`, the content components (`text-content`, `todo-content/*`), the old `use-task-workspace.ts`, or the stores/utils (Plan 1 owns them).
- Reuse chat's low-level/layout modules by import; do not duplicate.
- Do **not** run `npm run lint:fix`.

## Verification
- `npx tsc --noEmit` runs once globally after all plans. Ensure all store/selector/util imports resolve against Plan 1's exports.
