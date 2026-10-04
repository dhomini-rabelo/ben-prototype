import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";

const HomePage = lazy(() =>
  import("@/pages/home/page").then((module) => ({ default: module.HomePage })),
);
const ChatAwaitingReplyPage = lazy(() =>
  import("@/pages/chat-awaiting-reply/page").then((module) => ({ default: module.ChatAwaitingReplyPage })),
);
const ChatComposingPage = lazy(() =>
  import("@/pages/chat-composing/page").then((module) => ({ default: module.ChatComposingPage })),
);
const CaptureClarifyingQuestionPage = lazy(() =>
  import("@/pages/capture-clarifying-question/page").then((module) => ({ default: module.CaptureClarifyingQuestionPage })),
);
const CaptureClarifyingQuestionEdgeCasesPage = lazy(() =>
  import("@/pages/capture-clarifying-question-edge-cases/page").then((module) => ({ default: module.CaptureClarifyingQuestionEdgeCasesPage })),
);
const CaptureNoteEdgeCasesPage = lazy(() =>
  import("@/pages/capture-note-edge-cases/page").then((module) => ({ default: module.CaptureNoteEdgeCasesPage })),
);
const CaptureNoteErrorPage = lazy(() =>
  import("@/pages/capture-note-error/page").then((module) => ({ default: module.CaptureNoteErrorPage })),
);
const CaptureNoteLoadingPage = lazy(() =>
  import("@/pages/capture-note-loading/page").then((module) => ({ default: module.CaptureNoteLoadingPage })),
);
const CaptureNotePopulatedPage = lazy(() =>
  import("@/pages/capture-note-populated/page").then((module) => ({ default: module.CaptureNotePopulatedPage })),
);
const CaptureReminderEdgeCasesPage = lazy(() =>
  import("@/pages/capture-reminder-edge-cases/page").then((module) => ({ default: module.CaptureReminderEdgeCasesPage })),
);
const CaptureReminderErrorPage = lazy(() =>
  import("@/pages/capture-reminder-error/page").then((module) => ({ default: module.CaptureReminderErrorPage })),
);
const CaptureReminderFiredPage = lazy(() =>
  import("@/pages/capture-reminder-fired/page").then((module) => ({ default: module.CaptureReminderFiredPage })),
);
const CaptureReminderLoadingPage = lazy(() =>
  import("@/pages/capture-reminder-loading/page").then((module) => ({ default: module.CaptureReminderLoadingPage })),
);
const CaptureReminderUpcomingPage = lazy(() =>
  import("@/pages/capture-reminder-upcoming/page").then((module) => ({ default: module.CaptureReminderUpcomingPage })),
);
const CaptureTaskActivePage = lazy(() =>
  import("@/pages/capture-task-active/page").then((module) => ({ default: module.CaptureTaskActivePage })),
);
const CaptureTaskEdgeCasesPage = lazy(() =>
  import("@/pages/capture-task-edge-cases/page").then((module) => ({ default: module.CaptureTaskEdgeCasesPage })),
);
const CaptureTaskErrorPage = lazy(() =>
  import("@/pages/capture-task-error/page").then((module) => ({ default: module.CaptureTaskErrorPage })),
);
const CaptureTaskFinishedPage = lazy(() =>
  import("@/pages/capture-task-finished/page").then((module) => ({ default: module.CaptureTaskFinishedPage })),
);
const CaptureTaskLoadingPage = lazy(() =>
  import("@/pages/capture-task-loading/page").then((module) => ({ default: module.CaptureTaskLoadingPage })),
);
const CaptureTaskNotStartedPage = lazy(() =>
  import("@/pages/capture-task-not-started/page").then((module) => ({ default: module.CaptureTaskNotStartedPage })),
);
const ItemDetailEdgeCasesPage = lazy(() =>
  import("@/pages/item-detail-edge-cases/page").then((module) => ({ default: module.ItemDetailEdgeCasesPage })),
);
const ItemDetailErrorPage = lazy(() =>
  import("@/pages/item-detail-error/page").then((module) => ({ default: module.ItemDetailErrorPage })),
);
const ItemDetailLoadingPage = lazy(() =>
  import("@/pages/item-detail-loading/page").then((module) => ({ default: module.ItemDetailLoadingPage })),
);
const ItemDetailNotePage = lazy(() =>
  import("@/pages/item-detail-note/page").then((module) => ({ default: module.ItemDetailNotePage })),
);
const ItemDetailReminderPage = lazy(() =>
  import("@/pages/item-detail-reminder/page").then((module) => ({ default: module.ItemDetailReminderPage })),
);
const ChatEdgeCasesPage = lazy(() =>
  import("@/pages/chat-edge-cases/page").then((module) => ({ default: module.ChatEdgeCasesPage })),
);
const ChatEmptyPage = lazy(() =>
  import("@/pages/chat-empty/page").then((module) => ({ default: module.ChatEmptyPage })),
);
const ChatErrorPage = lazy(() =>
  import("@/pages/chat-error/page").then((module) => ({ default: module.ChatErrorPage })),
);
const ChatLoadingPage = lazy(() =>
  import("@/pages/chat-loading/page").then((module) => ({ default: module.ChatLoadingPage })),
);
const ChatOfflinePage = lazy(() =>
  import("@/pages/chat-offline/page").then((module) => ({ default: module.ChatOfflinePage })),
);
const ChatPermissionDeniedPage = lazy(() =>
  import("@/pages/chat-permission-denied/page").then((module) => ({ default: module.ChatPermissionDeniedPage })),
);
const ChatPopulatedPage = lazy(() =>
  import("@/pages/chat-populated/page").then((module) => ({ default: module.ChatPopulatedPage })),
);
const ChatRecordingPage = lazy(() =>
  import("@/pages/chat-recording/page").then((module) => ({ default: module.ChatRecordingPage })),
);
const ChatTranscribingPage = lazy(() =>
  import("@/pages/chat-transcribing/page").then((module) => ({ default: module.ChatTranscribingPage })),
);
const LoginEdgeExtendedWaitPage = lazy(() =>
  import("@/pages/login-edge-extended-wait/page").then((module) => ({ default: module.LoginEdgeExtendedWaitPage })),
);
const LoginEmptyPage = lazy(() =>
  import("@/pages/login-empty/page").then((module) => ({ default: module.LoginEmptyPage })),
);
const LoginErrorPage = lazy(() =>
  import("@/pages/login-error/page").then((module) => ({ default: module.LoginErrorPage })),
);
const LoginLoadingPage = lazy(() =>
  import("@/pages/login-loading/page").then((module) => ({ default: module.LoginLoadingPage })),
);
const LoginPermissionDeniedPage = lazy(() =>
  import("@/pages/login-permission-denied/page").then((module) => ({ default: module.LoginPermissionDeniedPage })),
);
const TaskPickerEdgeCasesPage = lazy(() =>
  import("@/pages/task-picker-edge-cases/page").then((module) => ({ default: module.TaskPickerEdgeCasesPage })),
);
const TaskPickerEmptyPage = lazy(() =>
  import("@/pages/task-picker-empty/page").then((module) => ({ default: module.TaskPickerEmptyPage })),
);
const TaskPickerErrorPage = lazy(() =>
  import("@/pages/task-picker-error/page").then((module) => ({ default: module.TaskPickerErrorPage })),
);
const TaskPickerLoadingPage = lazy(() =>
  import("@/pages/task-picker-loading/page").then((module) => ({ default: module.TaskPickerLoadingPage })),
);
const TaskPickerPopulatedPage = lazy(() =>
  import("@/pages/task-picker-populated/page").then((module) => ({ default: module.TaskPickerPopulatedPage })),
);
const WorkspaceComposingPage = lazy(() =>
  import("@/pages/workspace-composing/page").then((module) => ({ default: module.WorkspaceComposingPage })),
);
const WorkspaceEdgeCasesPage = lazy(() =>
  import("@/pages/workspace-edge-cases/page").then((module) => ({ default: module.WorkspaceEdgeCasesPage })),
);
const WorkspaceEmptyPage = lazy(() =>
  import("@/pages/workspace-empty/page").then((module) => ({ default: module.WorkspaceEmptyPage })),
);
const WorkspaceErrorPage = lazy(() =>
  import("@/pages/workspace-error/page").then((module) => ({ default: module.WorkspaceErrorPage })),
);
const WorkspaceFinishedPage = lazy(() =>
  import("@/pages/workspace-finished/page").then((module) => ({ default: module.WorkspaceFinishedPage })),
);
const WorkspaceListPopulatedPage = lazy(() =>
  import("@/pages/workspace-list-populated/page").then((module) => ({ default: module.WorkspaceListPopulatedPage })),
);
const WorkspaceOfflinePage = lazy(() =>
  import("@/pages/workspace-offline/page").then((module) => ({ default: module.WorkspaceOfflinePage })),
);
const WorkspacePendingDiffPage = lazy(() =>
  import("@/pages/workspace-pending-diff/page").then((module) => ({ default: module.WorkspacePendingDiffPage })),
);
const WorkspacePermissionDeniedPage = lazy(() =>
  import("@/pages/workspace-permission-denied/page").then((module) => ({ default: module.WorkspacePermissionDeniedPage })),
);
const WorkspaceRecordingPage = lazy(() =>
  import("@/pages/workspace-recording/page").then((module) => ({ default: module.WorkspaceRecordingPage })),
);
const WorkspaceTextPopulatedPage = lazy(() =>
  import("@/pages/workspace-text-populated/page").then((module) => ({ default: module.WorkspaceTextPopulatedPage })),
);
const WorkspaceTranscribingPage = lazy(() =>
  import("@/pages/workspace-transcribing/page").then((module) => ({ default: module.WorkspaceTranscribingPage })),
);
const BrandMarkPreviewPage = lazy(() =>
  import("@/pages/brand-mark-preview/page").then((module) => ({ default: module.BrandMarkPreviewPage })),
);
const ButtonPreviewPage = lazy(() =>
  import("@/pages/button-preview/page").then((module) => ({ default: module.ButtonPreviewPage })),
);
const CaptureCardPreviewPage = lazy(() =>
  import("@/pages/capture-card-preview/page").then((module) => ({ default: module.CaptureCardPreviewPage })),
);
const ItemDetailSheetPreviewPage = lazy(() =>
  import("@/pages/item-detail-sheet-preview/page").then((module) => ({ default: module.ItemDetailSheetPreviewPage })),
);
const ChatBannerPreviewPage = lazy(() =>
  import("@/pages/chat-banner-preview/page").then((module) => ({ default: module.ChatBannerPreviewPage })),
);
const ChatInputPreviewPage = lazy(() =>
  import("@/pages/chat-input-preview/page").then((module) => ({ default: module.ChatInputPreviewPage })),
);
const ComposerPreviewPage = lazy(() =>
  import("@/pages/composer-preview/page").then((module) => ({ default: module.ComposerPreviewPage })),
);
const DesignTokensPage = lazy(() =>
  import("@/pages/design-tokens/page").then((module) => ({ default: module.DesignTokensPage })),
);
const IconButtonPreviewPage = lazy(() =>
  import("@/pages/icon-button-preview/page").then((module) => ({ default: module.IconButtonPreviewPage })),
);
const ActiveTaskPeekPreviewPage = lazy(() =>
  import("@/pages/active-task-peek-preview/page").then((module) => ({ default: module.ActiveTaskPeekPreviewPage })),
);
const MessageBubblePreviewPage = lazy(() =>
  import("@/pages/message-bubble-preview/page").then((module) => ({ default: module.MessageBubblePreviewPage })),
);
const SuggestedActionPreviewPage = lazy(() =>
  import("@/pages/suggested-action-preview/page").then((module) => ({ default: module.SuggestedActionPreviewPage })),
);
const DiffBarPreviewPage = lazy(() =>
  import("@/pages/diff-bar-preview/page").then((module) => ({ default: module.DiffBarPreviewPage })),
);
const SubThreadBannerPreviewPage = lazy(() =>
  import("@/pages/sub-thread-banner-preview/page").then((module) => ({ default: module.SubThreadBannerPreviewPage })),
);
const TaskPickerSheetPreviewPage = lazy(() =>
  import("@/pages/task-picker-sheet-preview/page").then((module) => ({ default: module.TaskPickerSheetPreviewPage })),
);
const TodoListItemPreviewPage = lazy(() =>
  import("@/pages/todo-list-item-preview/page").then((module) => ({ default: module.TodoListItemPreviewPage })),
);
const WorkspaceTopBarPreviewPage = lazy(() =>
  import("@/pages/workspace-top-bar-preview/page").then((module) => ({ default: module.WorkspaceTopBarPreviewPage })),
);
const TypingIndicatorPreviewPage = lazy(() =>
  import("@/pages/typing-indicator-preview/page").then((module) => ({ default: module.TypingIndicatorPreviewPage })),
);
const TypographyPreviewPage = lazy(() =>
  import("@/pages/typography-preview/page").then((module) => ({ default: module.TypographyPreviewPage })),
);
const MenuSidebarPopulatedPage = lazy(() =>
  import("@/pages/menu-sidebar-populated/page").then((module) => ({ default: module.MenuSidebarPopulatedPage })),
);
const MenuSidebarLoadingPage = lazy(() =>
  import("@/pages/menu-sidebar-loading/page").then((module) => ({ default: module.MenuSidebarLoadingPage })),
);
const MenuSidebarErrorPage = lazy(() =>
  import("@/pages/menu-sidebar-error/page").then((module) => ({ default: module.MenuSidebarErrorPage })),
);
const MenuTasksEmptyPage = lazy(() =>
  import("@/pages/menu-tasks-empty/page").then((module) => ({ default: module.MenuTasksEmptyPage })),
);
const MenuTasksPopulatedPage = lazy(() =>
  import("@/pages/menu-tasks-populated/page").then((module) => ({ default: module.MenuTasksPopulatedPage })),
);
const MenuTasksLoadingPage = lazy(() =>
  import("@/pages/menu-tasks-loading/page").then((module) => ({ default: module.MenuTasksLoadingPage })),
);
const MenuTasksErrorPage = lazy(() =>
  import("@/pages/menu-tasks-error/page").then((module) => ({ default: module.MenuTasksErrorPage })),
);
const MenuTasksEdgeCasesPage = lazy(() =>
  import("@/pages/menu-tasks-edge-cases/page").then((module) => ({ default: module.MenuTasksEdgeCasesPage })),
);
const MenuNotesEmptyPage = lazy(() =>
  import("@/pages/menu-notes-empty/page").then((module) => ({ default: module.MenuNotesEmptyPage })),
);
const MenuNotesPopulatedPage = lazy(() =>
  import("@/pages/menu-notes-populated/page").then((module) => ({ default: module.MenuNotesPopulatedPage })),
);
const MenuNotesLoadingPage = lazy(() =>
  import("@/pages/menu-notes-loading/page").then((module) => ({ default: module.MenuNotesLoadingPage })),
);
const MenuNotesErrorPage = lazy(() =>
  import("@/pages/menu-notes-error/page").then((module) => ({ default: module.MenuNotesErrorPage })),
);
const MenuNotesEdgeCasesPage = lazy(() =>
  import("@/pages/menu-notes-edge-cases/page").then((module) => ({ default: module.MenuNotesEdgeCasesPage })),
);
const MenuRemindersEmptyPage = lazy(() =>
  import("@/pages/menu-reminders-empty/page").then((module) => ({ default: module.MenuRemindersEmptyPage })),
);
const MenuRemindersPopulatedPage = lazy(() =>
  import("@/pages/menu-reminders-populated/page").then((module) => ({ default: module.MenuRemindersPopulatedPage })),
);
const MenuRemindersLoadingPage = lazy(() =>
  import("@/pages/menu-reminders-loading/page").then((module) => ({ default: module.MenuRemindersLoadingPage })),
);
const MenuRemindersErrorPage = lazy(() =>
  import("@/pages/menu-reminders-error/page").then((module) => ({ default: module.MenuRemindersErrorPage })),
);
const MenuRemindersEdgeCasesPage = lazy(() =>
  import("@/pages/menu-reminders-edge-cases/page").then((module) => ({ default: module.MenuRemindersEdgeCasesPage })),
);
const MenuSettingsPopulatedPage = lazy(() =>
  import("@/pages/menu-settings-populated/page").then((module) => ({ default: module.MenuSettingsPopulatedPage })),
);
const MenuSettingsLoadingPage = lazy(() =>
  import("@/pages/menu-settings-loading/page").then((module) => ({ default: module.MenuSettingsLoadingPage })),
);
const MenuSettingsErrorPage = lazy(() =>
  import("@/pages/menu-settings-error/page").then((module) => ({ default: module.MenuSettingsErrorPage })),
);
const MenuSettingsEdgeCasesPage = lazy(() =>
  import("@/pages/menu-settings-edge-cases/page").then((module) => ({ default: module.MenuSettingsEdgeCasesPage })),
);
const MenuSidebarPreviewPage = lazy(() =>
  import("@/pages/menu-sidebar-preview/page").then((module) => ({ default: module.MenuSidebarPreviewPage })),
);
const MenuListRowPreviewPage = lazy(() =>
  import("@/pages/menu-list-row-preview/page").then((module) => ({ default: module.MenuListRowPreviewPage })),
);
const SettingsSheetPreviewPage = lazy(() =>
  import("@/pages/settings-sheet-preview/page").then((module) => ({ default: module.SettingsSheetPreviewPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app/login-empty" element={<LoginEmptyPage />} />
        <Route path="/app/login-loading" element={<LoginLoadingPage />} />
        <Route path="/app/login-error" element={<LoginErrorPage />} />
        <Route path="/app/login-permission-denied" element={<LoginPermissionDeniedPage />} />
        <Route path="/app/login-edge-extended-wait" element={<LoginEdgeExtendedWaitPage />} />
        <Route path="/app/chat-empty" element={<ChatEmptyPage />} />
        <Route path="/app/chat-loading" element={<ChatLoadingPage />} />
        <Route path="/app/chat-populated" element={<ChatPopulatedPage />} />
        <Route path="/app/chat-composing" element={<ChatComposingPage />} />
        <Route path="/app/chat-recording" element={<ChatRecordingPage />} />
        <Route path="/app/chat-transcribing" element={<ChatTranscribingPage />} />
        <Route path="/app/chat-awaiting-reply" element={<ChatAwaitingReplyPage />} />
        <Route path="/app/chat-error" element={<ChatErrorPage />} />
        <Route path="/app/chat-permission-denied" element={<ChatPermissionDeniedPage />} />
        <Route path="/app/chat-offline" element={<ChatOfflinePage />} />
        <Route path="/app/chat-edge-cases" element={<ChatEdgeCasesPage />} />
        <Route path="/app/capture-note-loading" element={<CaptureNoteLoadingPage />} />
        <Route path="/app/capture-note-populated" element={<CaptureNotePopulatedPage />} />
        <Route path="/app/capture-note-error" element={<CaptureNoteErrorPage />} />
        <Route path="/app/capture-note-edge-cases" element={<CaptureNoteEdgeCasesPage />} />
        <Route path="/app/capture-reminder-loading" element={<CaptureReminderLoadingPage />} />
        <Route path="/app/capture-reminder-upcoming" element={<CaptureReminderUpcomingPage />} />
        <Route path="/app/capture-reminder-fired" element={<CaptureReminderFiredPage />} />
        <Route path="/app/capture-reminder-error" element={<CaptureReminderErrorPage />} />
        <Route path="/app/capture-reminder-edge-cases" element={<CaptureReminderEdgeCasesPage />} />
        <Route path="/app/capture-task-loading" element={<CaptureTaskLoadingPage />} />
        <Route path="/app/capture-task-not-started" element={<CaptureTaskNotStartedPage />} />
        <Route path="/app/capture-task-active" element={<CaptureTaskActivePage />} />
        <Route path="/app/capture-task-finished" element={<CaptureTaskFinishedPage />} />
        <Route path="/app/capture-task-error" element={<CaptureTaskErrorPage />} />
        <Route path="/app/capture-task-edge-cases" element={<CaptureTaskEdgeCasesPage />} />
        <Route path="/app/capture-clarifying-question" element={<CaptureClarifyingQuestionPage />} />
        <Route path="/app/capture-clarifying-question-edge-cases" element={<CaptureClarifyingQuestionEdgeCasesPage />} />
        <Route path="/app/item-detail-note" element={<ItemDetailNotePage />} />
        <Route path="/app/item-detail-reminder" element={<ItemDetailReminderPage />} />
        <Route path="/app/item-detail-loading" element={<ItemDetailLoadingPage />} />
        <Route path="/app/item-detail-error" element={<ItemDetailErrorPage />} />
        <Route path="/app/item-detail-edge-cases" element={<ItemDetailEdgeCasesPage />} />
        <Route path="/components/design-tokens" element={<DesignTokensPage />} />
        <Route path="/components/typography" element={<TypographyPreviewPage />} />
        <Route path="/components/button" element={<ButtonPreviewPage />} />
        <Route path="/components/icon-button" element={<IconButtonPreviewPage />} />
        <Route path="/components/brand-mark" element={<BrandMarkPreviewPage />} />
        <Route path="/components/composer" element={<ComposerPreviewPage />} />
        <Route path="/components/chat-input" element={<ChatInputPreviewPage />} />
        <Route path="/components/message-bubble" element={<MessageBubblePreviewPage />} />
        <Route path="/components/typing-indicator" element={<TypingIndicatorPreviewPage />} />
        <Route path="/components/active-task-peek" element={<ActiveTaskPeekPreviewPage />} />
        <Route path="/components/capture-card" element={<CaptureCardPreviewPage />} />
        <Route path="/components/item-detail-sheet" element={<ItemDetailSheetPreviewPage />} />
        <Route path="/components/chat-banner" element={<ChatBannerPreviewPage />} />
        <Route path="/components/suggested-action" element={<SuggestedActionPreviewPage />} />
        <Route path="/app/task-picker-empty" element={<TaskPickerEmptyPage />} />
        <Route path="/app/task-picker-loading" element={<TaskPickerLoadingPage />} />
        <Route path="/app/task-picker-populated" element={<TaskPickerPopulatedPage />} />
        <Route path="/app/task-picker-error" element={<TaskPickerErrorPage />} />
        <Route path="/app/task-picker-edge-cases" element={<TaskPickerEdgeCasesPage />} />
        <Route path="/app/workspace-empty" element={<WorkspaceEmptyPage />} />
        <Route path="/app/workspace-text-populated" element={<WorkspaceTextPopulatedPage />} />
        <Route path="/app/workspace-list-populated" element={<WorkspaceListPopulatedPage />} />
        <Route path="/app/workspace-composing" element={<WorkspaceComposingPage />} />
        <Route path="/app/workspace-recording" element={<WorkspaceRecordingPage />} />
        <Route path="/app/workspace-transcribing" element={<WorkspaceTranscribingPage />} />
        <Route path="/app/workspace-pending-diff" element={<WorkspacePendingDiffPage />} />
        <Route path="/app/workspace-error" element={<WorkspaceErrorPage />} />
        <Route path="/app/workspace-permission-denied" element={<WorkspacePermissionDeniedPage />} />
        <Route path="/app/workspace-offline" element={<WorkspaceOfflinePage />} />
        <Route path="/app/workspace-finished" element={<WorkspaceFinishedPage />} />
        <Route path="/app/workspace-edge-cases" element={<WorkspaceEdgeCasesPage />} />
        <Route path="/components/workspace-top-bar" element={<WorkspaceTopBarPreviewPage />} />
        <Route path="/components/todo-list-item" element={<TodoListItemPreviewPage />} />
        <Route path="/components/diff-bar" element={<DiffBarPreviewPage />} />
        <Route path="/components/sub-thread-banner" element={<SubThreadBannerPreviewPage />} />
        <Route path="/components/task-picker-sheet" element={<TaskPickerSheetPreviewPage />} />
        <Route path="/app/menu-sidebar-populated" element={<MenuSidebarPopulatedPage />} />
        <Route path="/app/menu-sidebar-loading" element={<MenuSidebarLoadingPage />} />
        <Route path="/app/menu-sidebar-error" element={<MenuSidebarErrorPage />} />
        <Route path="/app/menu-tasks-empty" element={<MenuTasksEmptyPage />} />
        <Route path="/app/menu-tasks-populated" element={<MenuTasksPopulatedPage />} />
        <Route path="/app/menu-tasks-loading" element={<MenuTasksLoadingPage />} />
        <Route path="/app/menu-tasks-error" element={<MenuTasksErrorPage />} />
        <Route path="/app/menu-tasks-edge-cases" element={<MenuTasksEdgeCasesPage />} />
        <Route path="/app/menu-notes-empty" element={<MenuNotesEmptyPage />} />
        <Route path="/app/menu-notes-populated" element={<MenuNotesPopulatedPage />} />
        <Route path="/app/menu-notes-loading" element={<MenuNotesLoadingPage />} />
        <Route path="/app/menu-notes-error" element={<MenuNotesErrorPage />} />
        <Route path="/app/menu-notes-edge-cases" element={<MenuNotesEdgeCasesPage />} />
        <Route path="/app/menu-reminders-empty" element={<MenuRemindersEmptyPage />} />
        <Route path="/app/menu-reminders-populated" element={<MenuRemindersPopulatedPage />} />
        <Route path="/app/menu-reminders-loading" element={<MenuRemindersLoadingPage />} />
        <Route path="/app/menu-reminders-error" element={<MenuRemindersErrorPage />} />
        <Route path="/app/menu-reminders-edge-cases" element={<MenuRemindersEdgeCasesPage />} />
        <Route path="/app/menu-settings-populated" element={<MenuSettingsPopulatedPage />} />
        <Route path="/app/menu-settings-loading" element={<MenuSettingsLoadingPage />} />
        <Route path="/app/menu-settings-error" element={<MenuSettingsErrorPage />} />
        <Route path="/app/menu-settings-edge-cases" element={<MenuSettingsEdgeCasesPage />} />
        <Route path="/components/menu-sidebar" element={<MenuSidebarPreviewPage />} />
        <Route path="/components/menu-list-row" element={<MenuListRowPreviewPage />} />
        <Route path="/components/settings-sheet" element={<SettingsSheetPreviewPage />} />
      </Routes>
    </Suspense>
  );
}
