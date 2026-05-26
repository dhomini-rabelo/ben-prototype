import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../pages/Home/page";
import { ChatAwaitingReply } from "../pages/app/chat-awaiting-reply";
import { ChatComposing } from "../pages/app/chat-composing";
import { CaptureClarifyingQuestion } from "../pages/app/capture-clarifying-question";
import { CaptureClarifyingQuestionEdgeCases } from "../pages/app/capture-clarifying-question-edge-cases";
import { CaptureNoteEdgeCases } from "../pages/app/capture-note-edge-cases";
import { CaptureNoteError } from "../pages/app/capture-note-error";
import { CaptureNoteLoading } from "../pages/app/capture-note-loading";
import { CaptureNotePopulated } from "../pages/app/capture-note-populated";
import { CaptureReminderEdgeCases } from "../pages/app/capture-reminder-edge-cases";
import { CaptureReminderError } from "../pages/app/capture-reminder-error";
import { CaptureReminderFired } from "../pages/app/capture-reminder-fired";
import { CaptureReminderLoading } from "../pages/app/capture-reminder-loading";
import { CaptureReminderUpcoming } from "../pages/app/capture-reminder-upcoming";
import { CaptureTaskActive } from "../pages/app/capture-task-active";
import { CaptureTaskEdgeCases } from "../pages/app/capture-task-edge-cases";
import { CaptureTaskError } from "../pages/app/capture-task-error";
import { CaptureTaskFinished } from "../pages/app/capture-task-finished";
import { CaptureTaskLoading } from "../pages/app/capture-task-loading";
import { CaptureTaskNotStarted } from "../pages/app/capture-task-not-started";
import { ItemDetailEdgeCases } from "../pages/app/item-detail-edge-cases";
import { ItemDetailError } from "../pages/app/item-detail-error";
import { ItemDetailLoading } from "../pages/app/item-detail-loading";
import { ItemDetailNote } from "../pages/app/item-detail-note";
import { ItemDetailReminder } from "../pages/app/item-detail-reminder";
import { ChatEdgeCases } from "../pages/app/chat-edge-cases";
import { ChatEmpty } from "../pages/app/chat-empty";
import { ChatError } from "../pages/app/chat-error";
import { ChatLoading } from "../pages/app/chat-loading";
import { ChatOffline } from "../pages/app/chat-offline";
import { ChatPermissionDenied } from "../pages/app/chat-permission-denied";
import { ChatPopulated } from "../pages/app/chat-populated";
import { ChatRecording } from "../pages/app/chat-recording";
import { ChatTranscribing } from "../pages/app/chat-transcribing";
import { LoginEdgeExtendedWait } from "../pages/app/login-edge-extended-wait";
import { LoginEmpty } from "../pages/app/login-empty";
import { LoginError } from "../pages/app/login-error";
import { LoginLoading } from "../pages/app/login-loading";
import { LoginPermissionDenied } from "../pages/app/login-permission-denied";
import { TaskPickerEdgeCases } from "../pages/app/task-picker-edge-cases";
import { TaskPickerEmpty } from "../pages/app/task-picker-empty";
import { TaskPickerError } from "../pages/app/task-picker-error";
import { TaskPickerLoading } from "../pages/app/task-picker-loading";
import { TaskPickerPopulated } from "../pages/app/task-picker-populated";
import { WorkspaceComposing } from "../pages/app/workspace-composing";
import { WorkspaceEdgeCases } from "../pages/app/workspace-edge-cases";
import { WorkspaceEmpty } from "../pages/app/workspace-empty";
import { WorkspaceError } from "../pages/app/workspace-error";
import { WorkspaceFinished } from "../pages/app/workspace-finished";
import { WorkspaceListPopulated } from "../pages/app/workspace-list-populated";
import { WorkspaceOffline } from "../pages/app/workspace-offline";
import { WorkspacePendingDiff } from "../pages/app/workspace-pending-diff";
import { WorkspacePermissionDenied } from "../pages/app/workspace-permission-denied";
import { WorkspaceRecording } from "../pages/app/workspace-recording";
import { WorkspaceTextPopulated } from "../pages/app/workspace-text-populated";
import { WorkspaceTranscribing } from "../pages/app/workspace-transcribing";
import { BrandMarkPreview } from "../pages/components/brand-mark";
import { ButtonPreview } from "../pages/components/button";
import { CaptureCardPreview } from "../pages/components/capture-card";
import { ItemDetailSheetPreview } from "../pages/components/item-detail-sheet";
import { ChatBannerPreview } from "../pages/components/chat-banner";
import { ChatInputPreview } from "../pages/components/chat-input";
import { ComposerPreview } from "../pages/components/composer";
import { DesignTokens } from "../pages/components/design-tokens";
import { IconButtonPreview } from "../pages/components/icon-button";
import { ActiveTaskPeekPreview } from "../pages/components/active-task-peek";
import { MessageBubblePreview } from "../pages/components/message-bubble";
import { SuggestedActionPreview } from "../pages/components/suggested-action";
import { DiffBarPreview } from "../pages/components/diff-bar";
import { SubThreadBannerPreview } from "../pages/components/sub-thread-banner";
import { TaskPickerSheetPreview } from "../pages/components/task-picker-sheet";
import { TodoListItemPreview } from "../pages/components/todo-list-item";
import { WorkspaceTopBarPreview } from "../pages/components/workspace-top-bar";
import { TypingIndicatorPreview } from "../pages/components/typing-indicator";
import { TypographyPreview } from "../pages/components/typography";
import { MenuSidebarPopulated } from "../pages/app/menu-sidebar-populated";
import { MenuSidebarLoading } from "../pages/app/menu-sidebar-loading";
import { MenuSidebarError } from "../pages/app/menu-sidebar-error";
import { MenuTasksEmpty } from "../pages/app/menu-tasks-empty";
import { MenuTasksPopulated } from "../pages/app/menu-tasks-populated";
import { MenuTasksLoading } from "../pages/app/menu-tasks-loading";
import { MenuTasksError } from "../pages/app/menu-tasks-error";
import { MenuTasksEdgeCases } from "../pages/app/menu-tasks-edge-cases";
import { MenuNotesEmpty } from "../pages/app/menu-notes-empty";
import { MenuNotesPopulated } from "../pages/app/menu-notes-populated";
import { MenuNotesLoading } from "../pages/app/menu-notes-loading";
import { MenuNotesError } from "../pages/app/menu-notes-error";
import { MenuNotesEdgeCases } from "../pages/app/menu-notes-edge-cases";
import { MenuRemindersEmpty } from "../pages/app/menu-reminders-empty";
import { MenuRemindersPopulated } from "../pages/app/menu-reminders-populated";
import { MenuRemindersLoading } from "../pages/app/menu-reminders-loading";
import { MenuRemindersError } from "../pages/app/menu-reminders-error";
import { MenuRemindersEdgeCases } from "../pages/app/menu-reminders-edge-cases";
import { MenuSettingsPopulated } from "../pages/app/menu-settings-populated";
import { MenuSettingsLoading } from "../pages/app/menu-settings-loading";
import { MenuSettingsError } from "../pages/app/menu-settings-error";
import { MenuSettingsEdgeCases } from "../pages/app/menu-settings-edge-cases";
import { MenuSidebarPreview } from "../pages/components/menu-sidebar";
import { MenuListRowPreview } from "../pages/components/menu-list-row";
import { SettingsSheetPreview } from "../pages/components/settings-sheet";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/login-empty" element={<LoginEmpty />} />
        <Route path="/app/login-loading" element={<LoginLoading />} />
        <Route path="/app/login-error" element={<LoginError />} />
        <Route
          path="/app/login-permission-denied"
          element={<LoginPermissionDenied />}
        />
        <Route
          path="/app/login-edge-extended-wait"
          element={<LoginEdgeExtendedWait />}
        />
        <Route path="/app/chat-empty" element={<ChatEmpty />} />
        <Route path="/app/chat-loading" element={<ChatLoading />} />
        <Route path="/app/chat-populated" element={<ChatPopulated />} />
        <Route path="/app/chat-composing" element={<ChatComposing />} />
        <Route path="/app/chat-recording" element={<ChatRecording />} />
        <Route path="/app/chat-transcribing" element={<ChatTranscribing />} />
        <Route
          path="/app/chat-awaiting-reply"
          element={<ChatAwaitingReply />}
        />
        <Route path="/app/chat-error" element={<ChatError />} />
        <Route
          path="/app/chat-permission-denied"
          element={<ChatPermissionDenied />}
        />
        <Route path="/app/chat-offline" element={<ChatOffline />} />
        <Route path="/app/chat-edge-cases" element={<ChatEdgeCases />} />
        <Route
          path="/app/capture-note-loading"
          element={<CaptureNoteLoading />}
        />
        <Route
          path="/app/capture-note-populated"
          element={<CaptureNotePopulated />}
        />
        <Route
          path="/app/capture-note-error"
          element={<CaptureNoteError />}
        />
        <Route
          path="/app/capture-note-edge-cases"
          element={<CaptureNoteEdgeCases />}
        />
        <Route
          path="/app/capture-reminder-loading"
          element={<CaptureReminderLoading />}
        />
        <Route
          path="/app/capture-reminder-upcoming"
          element={<CaptureReminderUpcoming />}
        />
        <Route
          path="/app/capture-reminder-fired"
          element={<CaptureReminderFired />}
        />
        <Route
          path="/app/capture-reminder-error"
          element={<CaptureReminderError />}
        />
        <Route
          path="/app/capture-reminder-edge-cases"
          element={<CaptureReminderEdgeCases />}
        />
        <Route
          path="/app/capture-task-loading"
          element={<CaptureTaskLoading />}
        />
        <Route
          path="/app/capture-task-not-started"
          element={<CaptureTaskNotStarted />}
        />
        <Route
          path="/app/capture-task-active"
          element={<CaptureTaskActive />}
        />
        <Route
          path="/app/capture-task-finished"
          element={<CaptureTaskFinished />}
        />
        <Route
          path="/app/capture-task-error"
          element={<CaptureTaskError />}
        />
        <Route
          path="/app/capture-task-edge-cases"
          element={<CaptureTaskEdgeCases />}
        />
        <Route
          path="/app/capture-clarifying-question"
          element={<CaptureClarifyingQuestion />}
        />
        <Route
          path="/app/capture-clarifying-question-edge-cases"
          element={<CaptureClarifyingQuestionEdgeCases />}
        />
        <Route path="/app/item-detail-note" element={<ItemDetailNote />} />
        <Route
          path="/app/item-detail-reminder"
          element={<ItemDetailReminder />}
        />
        <Route
          path="/app/item-detail-loading"
          element={<ItemDetailLoading />}
        />
        <Route path="/app/item-detail-error" element={<ItemDetailError />} />
        <Route
          path="/app/item-detail-edge-cases"
          element={<ItemDetailEdgeCases />}
        />
        <Route path="/components/design-tokens" element={<DesignTokens />} />
        <Route path="/components/typography" element={<TypographyPreview />} />
        <Route path="/components/button" element={<ButtonPreview />} />
        <Route path="/components/icon-button" element={<IconButtonPreview />} />
        <Route path="/components/brand-mark" element={<BrandMarkPreview />} />
        <Route path="/components/composer" element={<ComposerPreview />} />
        <Route
          path="/components/chat-input"
          element={<ChatInputPreview />}
        />
        <Route
          path="/components/message-bubble"
          element={<MessageBubblePreview />}
        />
        <Route
          path="/components/typing-indicator"
          element={<TypingIndicatorPreview />}
        />
        <Route
          path="/components/active-task-peek"
          element={<ActiveTaskPeekPreview />}
        />
        <Route
          path="/components/capture-card"
          element={<CaptureCardPreview />}
        />
        <Route
          path="/components/item-detail-sheet"
          element={<ItemDetailSheetPreview />}
        />
        <Route
          path="/components/chat-banner"
          element={<ChatBannerPreview />}
        />
        <Route
          path="/components/suggested-action"
          element={<SuggestedActionPreview />}
        />
        <Route
          path="/app/task-picker-empty"
          element={<TaskPickerEmpty />}
        />
        <Route
          path="/app/task-picker-loading"
          element={<TaskPickerLoading />}
        />
        <Route
          path="/app/task-picker-populated"
          element={<TaskPickerPopulated />}
        />
        <Route
          path="/app/task-picker-error"
          element={<TaskPickerError />}
        />
        <Route
          path="/app/task-picker-edge-cases"
          element={<TaskPickerEdgeCases />}
        />
        <Route path="/app/workspace-empty" element={<WorkspaceEmpty />} />
        <Route
          path="/app/workspace-text-populated"
          element={<WorkspaceTextPopulated />}
        />
        <Route
          path="/app/workspace-list-populated"
          element={<WorkspaceListPopulated />}
        />
        <Route
          path="/app/workspace-composing"
          element={<WorkspaceComposing />}
        />
        <Route
          path="/app/workspace-recording"
          element={<WorkspaceRecording />}
        />
        <Route
          path="/app/workspace-transcribing"
          element={<WorkspaceTranscribing />}
        />
        <Route
          path="/app/workspace-pending-diff"
          element={<WorkspacePendingDiff />}
        />
        <Route path="/app/workspace-error" element={<WorkspaceError />} />
        <Route
          path="/app/workspace-permission-denied"
          element={<WorkspacePermissionDenied />}
        />
        <Route
          path="/app/workspace-offline"
          element={<WorkspaceOffline />}
        />
        <Route
          path="/app/workspace-finished"
          element={<WorkspaceFinished />}
        />
        <Route
          path="/app/workspace-edge-cases"
          element={<WorkspaceEdgeCases />}
        />
        <Route
          path="/components/workspace-top-bar"
          element={<WorkspaceTopBarPreview />}
        />
        <Route
          path="/components/todo-list-item"
          element={<TodoListItemPreview />}
        />
        <Route path="/components/diff-bar" element={<DiffBarPreview />} />
        <Route
          path="/components/sub-thread-banner"
          element={<SubThreadBannerPreview />}
        />
        <Route
          path="/components/task-picker-sheet"
          element={<TaskPickerSheetPreview />}
        />
        <Route path="/app/menu-sidebar-populated" element={<MenuSidebarPopulated />} />
        <Route path="/app/menu-sidebar-loading" element={<MenuSidebarLoading />} />
        <Route path="/app/menu-sidebar-error" element={<MenuSidebarError />} />
        <Route path="/app/menu-tasks-empty" element={<MenuTasksEmpty />} />
        <Route path="/app/menu-tasks-populated" element={<MenuTasksPopulated />} />
        <Route path="/app/menu-tasks-loading" element={<MenuTasksLoading />} />
        <Route path="/app/menu-tasks-error" element={<MenuTasksError />} />
        <Route path="/app/menu-tasks-edge-cases" element={<MenuTasksEdgeCases />} />
        <Route path="/app/menu-notes-empty" element={<MenuNotesEmpty />} />
        <Route path="/app/menu-notes-populated" element={<MenuNotesPopulated />} />
        <Route path="/app/menu-notes-loading" element={<MenuNotesLoading />} />
        <Route path="/app/menu-notes-error" element={<MenuNotesError />} />
        <Route path="/app/menu-notes-edge-cases" element={<MenuNotesEdgeCases />} />
        <Route path="/app/menu-reminders-empty" element={<MenuRemindersEmpty />} />
        <Route path="/app/menu-reminders-populated" element={<MenuRemindersPopulated />} />
        <Route path="/app/menu-reminders-loading" element={<MenuRemindersLoading />} />
        <Route path="/app/menu-reminders-error" element={<MenuRemindersError />} />
        <Route path="/app/menu-reminders-edge-cases" element={<MenuRemindersEdgeCases />} />
        <Route path="/app/menu-settings-populated" element={<MenuSettingsPopulated />} />
        <Route path="/app/menu-settings-loading" element={<MenuSettingsLoading />} />
        <Route path="/app/menu-settings-error" element={<MenuSettingsError />} />
        <Route path="/app/menu-settings-edge-cases" element={<MenuSettingsEdgeCases />} />
        <Route path="/components/menu-sidebar" element={<MenuSidebarPreview />} />
        <Route path="/components/menu-list-row" element={<MenuListRowPreview />} />
        <Route path="/components/settings-sheet" element={<SettingsSheetPreview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
