# Plan 3 [Frontend] — Simple Plan: Chrome components + banner/footer containers

This plan refactors the four task-workspace chrome components to self-subscribe to the Plan 1 stores (no action props) and creates two new container components that absorb the four inline `render*` helpers currently living in `page.tsx`. It consumes only the Plan 1 contract and the existing layout components. It modifies **NO files outside the owned set** (page.tsx, content components, stores, utils stay untouched).

All paths below are relative to `project-web/src/pages/task-workspace/`.

---

## Exported component names (the contract Plan 4 imports)

| File | Exported name | Notes |
| --- | --- | --- |
| `components/workspace-top-bar/workspace-top-bar.tsx` | `WorkspaceTopBar` | unchanged name, props dropped |
| `components/diff-bar/diff-bar.tsx` | `DiffBar` | unchanged name, props dropped, self-guards |
| `components/sub-thread-banner/sub-thread-banner.tsx` | `SubThreadBanner` | unchanged, stays presentational |
| `components/workspace-banner/workspace-banner.tsx` (NEW) | **`WorkspaceTopBanner`** and **`WorkspaceSubThreadBanner`** | two named exports from one file |
| `components/workspace-footer/workspace-footer.tsx` (NEW) | **`WorkspaceFooter`** | one named export |

**Decision — banner split into two exports, not one wrapper.** The page places its two banner concerns into two different shell slots (`topBanner` and `banner`), so a single component cannot serve both. Two named exports from one `workspace-banner.tsx` file: `WorkspaceTopBanner` (offline / voice-error / mic-denied → the `topBanner` slot) and `WorkspaceSubThreadBanner` (ben-typing / send-error / last-reply → the `banner` slot). This mirrors chat's `ChatTopBanner` exactly for the top piece.

---

## Plan

### 1. Refactor `WorkspaceTopBar` to self-subscribe and drop callback props

File: `components/workspace-top-bar/workspace-top-bar.tsx`

- Remove the `WorkspaceTopBarProps` type and the `onBack` / `onFinish` / `onReopen` props entirely; the component takes no props.
- Keep reading `task` via `useWorkspaceTask()` and keep the local `isMenuOpen` state and the early `return null` when `!task`.
- Import `useNavigate` from `react-router` and `ROUTES` from `../../../../core/routes`; import `useTaskStore` from `../../stores/task-store`. Read `finish`, `reopen`, and `isMutating` from `useTaskStore` (individual selectors, e.g. `useTaskStore((s) => s.finish)`).
- Back button `onClick` → `() => navigate(ROUTES.chat)`.
- `handleFinish` → close the menu, then `if (await finish()) navigate(ROUTES.chat)` (mark the handler `async`; `finish()` returns `Promise<boolean>`).
- `handleReopen` → close the menu, then `void reopen()`.
- Disable both menu action buttons while `isMutating` (`disabled={isMutating}` on the Finish / Reopen buttons), matching the disabled-while-mutating behavior of the footer/diff.
- Wrap the export in `memo(...)`: define `WorkspaceTopBarComponent` and `export const WorkspaceTopBar = memo(WorkspaceTopBarComponent)`.

**Resulting signature:** `WorkspaceTopBar()` — no props.

### 2. Refactor `DiffBar` to self-render, self-subscribe, and import the shared summary util

File: `components/diff-bar/diff-bar.tsx`

- Delete the inlined `diffSummary` function and the now-unused `Task` type import. Import `diffSummary` from `../../utils/diff-summary` (Plan 1 export).
- Keep reading `task` via `useWorkspaceTask()`. **Add a self-render guard:** if `!task?.pendingDiff`, `return null`. This absorbs the page's `renderDiffBar` guard so the page can always mount `<DiffBar />` in the `diffBar` slot.
- Remove the `DiffBarProps` type and the `disabled` / `onApprove` / `onReject` props. Import `useTaskStore` and read `isMutating`, `approveDiff`, `rejectDiff`.
- Reject button → `onClick={rejectDiff}`, Approve button → `onClick={approveDiff}`; both `disabled={isMutating}`. Keep the existing markup/classes otherwise.
- Wrap the export in `memo(...)`: `DiffBarComponent` + `export const DiffBar = memo(DiffBarComponent)`.

**Resulting signature:** `DiffBar()` — no props; renders `null` when there is no pending diff.

### 3. Keep `SubThreadBanner` presentational (consumed by the new banner container)

File: `components/sub-thread-banner/sub-thread-banner.tsx`

- No store access, no API change. Keep props `variant` (`"ben-reply" | "ben-typing" | "error"`), `text`, `onRetry`. It is now imported by `workspace-banner.tsx` instead of the page.
- Optionally wrap in `memo(...)` for consistency (it is a leaf presentational component). Behavior stays identical.

**Resulting signature:** unchanged — `SubThreadBanner({ variant?, text?, onRetry? })`.

### 4. Keep `WorkspaceShell` as the pure layout/slot component (no logic change)

File: `components/workspace-shell/workspace-shell.tsx`

- Leave behavior fully identical: it accepts `topBar`, `topBanner?`, `banner?`, `diffBar?`, `footer`, `children` as `ReactNode` and owns the footer-height `ResizeObserver`.
- Do **not** add `memo` (it receives elements as props, so memo would not help). Do **not** change the slot wrappers — in particular the shell keeps wrapping `topBanner` in `<div className="px-4 pb-2">{topBanner}</div>`, so the new top-banner component must NOT carry its own padding wrapper (see step 5). The shell's `{topBanner && ...}` and `{banner}`/`{diffBar}` placements tolerate `null`/`undefined`, so self-guarding child components are safe to mount unconditionally.

**Resulting signature:** unchanged.

### 5. Create `workspace-banner.tsx` with two self-subscribing exports

File (NEW): `components/workspace-banner/workspace-banner.tsx`

Exports two memoized components that absorb the page's `renderTopBanner` (lines 72–105) and `renderBanner` (lines 107–127).

**`WorkspaceTopBanner`** — absorbs `renderTopBanner`, mirrors chat's `ChatTopBanner` logic exactly:
- Imports: `AlertCircle`, `TriangleAlert`, `WifiOff` from `lucide-react`; `memo` from `react`; `ChatBanner` from `../../../../layout/components/chat-banner`; `useConnectivityStore` from `../../../chat/stores/connectivity-store`; `selectVoiceStatus`, `useVoiceStore` from `../../stores/voice-store`.
- Reads: `isOffline` via `useConnectivityStore((s) => s.isOffline)`; `voiceStatus` via `useVoiceStore(selectVoiceStatus)`; `micPermission` via `useVoiceStore((s) => s.micPermission)`; actions `retryVoice` and `dismissError` via `useVoiceStore`.
- Render order matches the page: offline → `ChatBanner` warn (`WifiOff`); else voice `"error"` → `ChatBanner` error (`AlertCircle`) with `Action label="Retry" onClick={retryVoice}` and `Dismiss onClick={dismissError}`; else `micPermission === "denied"` → `ChatBanner` warn (`TriangleAlert`) with a bare `Dismiss`. Otherwise `return null`.
- **Do NOT add the `px-4 pb-2` wrapper div** — the shell already wraps the `topBanner` slot. (This differs from chat's `ChatTopBanner`, which carries its own padding because the chat page has no shell.)

**`WorkspaceSubThreadBanner`** — absorbs `renderBanner`:
- Imports: `memo` from `react`; `SubThreadBanner` from `../sub-thread-banner/sub-thread-banner`; `useWorkspaceTask` from `../../hooks/use-workspace-task`; `useTaskStore` from `../../stores/task-store`.
- Reads: `task` via `useWorkspaceTask()` (to check `task?.pendingDiff`); `isAwaitingReply`, `sendError`, `lastBenReply` via `useTaskStore`; `sendText` via `useTaskStore` for the retry handler.
- Render order matches page lines 108–126: if `task?.pendingDiff` → `return null` (suppress sub-thread while a diff is pending); else if `isAwaitingReply` → `<SubThreadBanner variant="ben-typing" />`; else if `sendError` → `<SubThreadBanner variant="error" text="Ben didn't reply — tap to retry" onRetry={...} />` where the retry re-sends the last attempt — call `void sendText(lastBenReply ?? "")`? **No** — the page's retry calls `workspace.handleSend`, which sends the current draft, not the last reply. Since this container has no draft access, the retry must re-trigger a send of the current draft. To keep this container store-only and avoid pulling the draft atom in, the retry handler delegates to the footer's send path is not possible here; instead read `taskDraftAtom` via `useAtomValue` and call `void sendText(draft)` to mirror `handleSend` exactly. (Import `useAtomValue` from `jotai` and `taskDraftAtom` from `../../states/task-workspace-state`.) Else if `lastBenReply` → `<SubThreadBanner text={lastBenReply} />`. Otherwise `return null`.
- Export both as memoized: `export const WorkspaceTopBanner = memo(WorkspaceTopBannerComponent)` and `export const WorkspaceSubThreadBanner = memo(WorkspaceSubThreadBannerComponent)`.

**Resulting signatures:** `WorkspaceTopBanner()` and `WorkspaceSubThreadBanner()` — both no props, both self-guard with `null`.

### 6. Create `workspace-footer.tsx` as a self-subscribing memoized footer

File (NEW): `components/workspace-footer/workspace-footer.tsx`

Absorbs the page's `renderFooter` (lines 142–170), mirroring chat's `ChatFooter`.
- Imports: `memo` from `react`; `useAtom` from `jotai`; `ChatInputDesign` from `../../../../layout/components/chat-input-design/chat-input-design`; `RecordingBarDesign` from `../../../../layout/components/recording-bar-design/recording-bar-design`; `taskDraftAtom` from `../../states/task-workspace-state`; `useTaskStore` from `../../stores/task-store`; `selectVoiceStatus`, `useVoiceStore` from `../../stores/voice-store`; `useConnectivityStore` from `../../../chat/stores/connectivity-store`; `useWorkspaceTask` from `../../hooks/use-workspace-task`.
- Reads:
  - `voiceStatus` via `useVoiceStore(selectVoiceStatus)`; derive `isRecording = voiceStatus === "recording"` and `isTranscribing = voiceStatus === "transcribing"`.
  - `recordingSeconds`, `startRecording`, `stopRecording`, `cancelRecording`, `micPermission` via `useVoiceStore`.
  - `isOffline` via `useConnectivityStore((s) => s.isOffline)`.
  - `task` via `useWorkspaceTask()`; derive `isFinished = task?.status === "finished"`.
  - `[draft, setDraft]` via `useAtom(taskDraftAtom)`.
  - `sendText` via `useTaskStore`.
  - Derive `canRecord = micPermission !== "denied" && !isOffline` (this replaces what the monolith hook computed for `workspace.canRecord`).
- Recording branch: if `isRecording` → `<RecordingBarDesign elapsedSeconds={recordingSeconds} onStop={stopRecording} onCancel={cancelRecording} />`.
- Idle branch: `<ChatInputDesign value={draft} placeholder="Ask Ben to edit…" mode={...} canRecord={canRecord} onChange={(e) => setDraft(e.target.value)} onSend={handleSend} onStartRecording={startRecording} />`.
  - `mode` identical to page lines 157–163: `isFinished ? "disabled" : (isOffline || isTranscribing) ? "sending-disabled" : "idle"`.
  - `handleSend`: read current `draft`, call `const sent = await sendText(draft)`; on `sent` clear the atom (`setDraft("")`), mirroring chat's `use-chat-input` send-then-clear. (Restoring the draft on failure is optional and not required.)
- Wrap the export in `memo(...)`: `WorkspaceFooterComponent` + `export const WorkspaceFooter = memo(WorkspaceFooterComponent)` (chat memoizes `ChatFooter`).

**Resulting signature:** `WorkspaceFooter()` — no props.

---

## Contract Plan 4 consumes (no callback props anywhere)

Plan 4's thin page will mount, inside `WorkspaceShell`:
- `topBar={<WorkspaceTopBar />}`
- `topBanner={<WorkspaceTopBanner />}` (from `components/workspace-banner/workspace-banner.tsx`)
- `banner={<WorkspaceSubThreadBanner />}` (from `components/workspace-banner/workspace-banner.tsx`)
- `diffBar={<DiffBar />}` (self-guards on `pendingDiff`)
- `footer={<WorkspaceFooter />}` (from `components/workspace-footer/workspace-footer.tsx`)

All five render with no props; each handles its own guard/`null`. The page no longer needs the four `render*` helpers.

---

## Files this plan OWNS

**Refactor:** `components/workspace-top-bar/workspace-top-bar.tsx`, `components/diff-bar/diff-bar.tsx`, `components/sub-thread-banner/sub-thread-banner.tsx`, `components/workspace-shell/workspace-shell.tsx`.

**Create:** `components/workspace-banner/workspace-banner.tsx`, `components/workspace-footer/workspace-footer.tsx`.

## Out of scope / rules

- Do **not** modify `page.tsx`, the content components (`text-content`, `todo-content/*`), `hooks/use-task-workspace.ts`, `hooks/use-workspace-task.ts`, the stores, the utils, or the shared layout components (import them, do not duplicate).
- Reuse `ChatBanner.*`, `ChatInputDesign`, `RecordingBarDesign`, and chat's `useConnectivityStore` by import.
- Do **not** run `npm run lint:fix`. `npx tsc --noEmit` runs once globally after all plans; ensure every store/selector/util import resolves against Plan 1's exports.
