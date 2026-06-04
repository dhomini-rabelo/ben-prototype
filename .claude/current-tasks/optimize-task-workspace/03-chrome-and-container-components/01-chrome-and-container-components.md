# Plan 3 [Frontend] — Deep Plan: Chrome components + banner/footer containers

## Context

Plan 1 (state foundation) is already implemented on disk under
`project-web/src/pages/task-workspace/{states,stores,utils}/`. This plan refactors the
four chrome components to self-subscribe to those stores (dropping all callback props) and
creates two new container components (`workspace-banner`, `workspace-footer`) that absorb the
four inline `render*` helpers currently in `page.tsx` (lines 72–170). `page.tsx`, the content
components, the stores, and the utils are NOT touched (another agent edits content in parallel).

All paths below are relative to `project-web/src/pages/task-workspace/` unless noted.

## Verified contract (read from disk)

- `useTaskStore` (`stores/task-store`): state `taskId, isAwaitingReply, lastBenReply, sendError, isMutating`; actions `setTaskId, sendText(content)→Promise<boolean>, approveDiff, rejectDiff, toggleTodo, addTodo, editText, finish→Promise<boolean>, reopen, reset`.
- `useVoiceStore` + `selectVoiceStatus` (`stores/voice-store`): status `idle|recording|transcribing|error`; state `micPermission, recordingSeconds`; actions `startRecording, stopRecording, cancelRecording, retryVoice, dismissError`.
- `taskDraftAtom` (`states/task-workspace-state`): `atom("")`.
- `diffSummary(task)` (`utils/diff-summary`).
- `useWorkspaceTask()` (`hooks/use-workspace-task`) → `Task | null`.
- `useConnectivityStore((s)=>s.isOffline)` (`../../../chat/stores/connectivity-store`).
- `ROUTES.chat` (`../../../../core/routes`), `useNavigate` from `react-router`.
- `ChatInputDesign` props: `value, placeholder, mode("idle"|"composing"|"disabled"|"sending-disabled"), onChange(e), onSend, onStartRecording, canRecord`.
- `RecordingBarDesign` props: `elapsedSeconds, onStop, onCancel`.
- Chat reference: `ChatTopBanner` (memo, self-subscribes) and `ChatFooter` (memo). Chat's `use-chat-input` send-then-clear: clears draft optimistically, restores on failure.

## Exported names (contract Plan 4 imports)

| File | Export | Notes |
| --- | --- | --- |
| `components/workspace-top-bar/workspace-top-bar.tsx` | `WorkspaceTopBar` | memo, no props |
| `components/diff-bar/diff-bar.tsx` | `DiffBar` | memo, no props, self-guards on `pendingDiff` |
| `components/sub-thread-banner/sub-thread-banner.tsx` | `SubThreadBanner` | presentational, memo, unchanged signature |
| `components/workspace-banner/workspace-banner.tsx` (NEW) | `WorkspaceTopBanner`, `WorkspaceSubThreadBanner` | two memo'd no-prop exports |
| `components/workspace-footer/workspace-footer.tsx` (NEW) | `WorkspaceFooter` | memo, no props |

Banner split into two exports because the page places its two banner concerns into two
different shell slots (`topBanner`, `banner`).

## Steps

### 1. `workspace-top-bar.tsx`
- Drop `WorkspaceTopBarProps` and all props.
- Keep `useWorkspaceTask()`, local `isMenuOpen`, `return null` when `!task`.
- Add `useNavigate()`; read `finish, reopen, isMutating` from `useTaskStore` (one selector each).
- Back button → `() => navigate(ROUTES.chat)`.
- `handleFinish` async: `setIsMenuOpen(false); if (await finish()) navigate(ROUTES.chat)`.
- `handleReopen`: `setIsMenuOpen(false); void reopen()`.
- Add `disabled={isMutating}` to Finish/Reopen menu buttons.
- `export const WorkspaceTopBar = memo(WorkspaceTopBarComponent)`.

### 2. `diff-bar.tsx`
- Delete inlined `diffSummary` + unused `Task` import; import `diffSummary` from `../../utils/diff-summary`.
- Keep `useWorkspaceTask()`; add guard `if (!task?.pendingDiff) return null`.
- Drop `DiffBarProps`/props; read `isMutating, approveDiff, rejectDiff` from `useTaskStore`.
- Reject `onClick={rejectDiff}`, Approve `onClick={approveDiff}`, both `disabled={isMutating}`.
- `export const DiffBar = memo(DiffBarComponent)`.

### 3. `sub-thread-banner.tsx`
- Keep presentational props/markup identical. Wrap export in `memo`.

### 4. `workspace-shell.tsx`
- No logic change. No memo (takes elements as props). Leave identical.

### 5. `workspace-banner/workspace-banner.tsx` (NEW)
- `WorkspaceTopBanner` mirrors `renderTopBanner` / chat's `ChatTopBanner` body, but WITHOUT the
  `px-4 pb-2` wrapper (the shell wraps `topBanner`). Reads `isOffline, voiceStatus, micPermission,
  retryVoice, dismissError`. Order: offline (WifiOff warn) → voice error (AlertCircle error + Retry/Dismiss)
  → mic denied (TriangleAlert warn + bare Dismiss) → `null`.
- `WorkspaceSubThreadBanner` mirrors `renderBanner`. Reads `task` (`useWorkspaceTask`), `isAwaitingReply,
  sendError, lastBenReply, sendText`, and `taskDraftAtom` via `useAtomValue`. Order: `task?.pendingDiff` → null;
  `isAwaitingReply` → `<SubThreadBanner variant="ben-typing" />`; `sendError` → error banner with
  `onRetry={() => void sendText(draft)}` (mirrors page's `handleSend` = send current draft); `lastBenReply` →
  `<SubThreadBanner text={lastBenReply} />`; else null.
- Both `memo`'d.

### 6. `workspace-footer/workspace-footer.tsx` (NEW)
- Mirrors `renderFooter`. Reads `voiceStatus` (derive `isRecording`/`isTranscribing`), `recordingSeconds,
  startRecording, stopRecording, cancelRecording, micPermission`, `isOffline`, `task` (derive `isFinished`),
  `[draft,setDraft]=useAtom(taskDraftAtom)`, `sendText`. Derive `canRecord = micPermission !== "denied" && !isOffline`.
- Recording branch → `<RecordingBarDesign elapsedSeconds onStop onCancel />`.
- Idle branch → `<ChatInputDesign value placeholder="Ask Ben to edit…" mode canRecord onChange onSend onStartRecording />`
  with `mode = isFinished ? "disabled" : (isOffline || isTranscribing) ? "sending-disabled" : "idle"`.
- `handleSend` mirrors chat's `use-chat-input`: clear draft optimistically, `sendText(draft)`, restore on failure.
- `export const WorkspaceFooter = memo(WorkspaceFooterComponent)`.

## Out of scope / rules
- Touch ONLY the six owned files. No `page.tsx`, content, stores, utils.
- Do not run `npm run lint:fix`. `tsc --noEmit` globally will fail until Plan 4 (expected).
</content>
</invoke>
