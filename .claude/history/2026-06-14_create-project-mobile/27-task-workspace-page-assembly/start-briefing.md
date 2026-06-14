# Plan 27 — Task workspace page assembly + route

**Plan 15 [Frontend] (sync)**: Assemble the task-workspace page and register its route.

- Runs **alone** after the parallel task-component plans (22/23/24). It composes pieces owned by several plans and owns the new route file, so it must not run in parallel.

## Goal

Compose the task-workspace screen (top bar, banners, text/todo content, diff bar, footer, done overlay) into `page.tsx`, switch on `task.contentType`, add `KeyboardAvoidingView` + safe areas, register `setTranscriptHandler` → `useTaskChatStore.sendText`, and register the expo-router dynamic route.

## Scope / owned files

- `project-mobile/src/pages/task-workspace/page.tsx` — `TaskWorkspace` assembling the parts; loads via `useTaskDetailData(taskId)`; voice transcript handler → `task-chat-store`; wires the footer record button to `useVoiceStore.startRecording` (voice store exists from plan 17).
- `project-mobile/app/(protected)/tasks/[taskId].tsx` — route reading `taskId` param, setting `useTaskStore`, rendering `TaskWorkspace`.

## Verification

`npx tsc --noEmit` passes; navigating to a task renders the workspace end-to-end.
