export type ScreenState = {
  id: string;
  title: string;
  file: string;
};

export type ScreenPage = {
  id: string;
  title: string;
  states: ScreenState[];
};

export type ComponentEntry = {
  id: string;
  title: string;
  file: string;
};

export const PAGES: ScreenPage[] = [
  {
    id: "login",
    title: "Sign in",
    states: [
      { id: "empty", title: "Empty", file: "/app/login-empty" },
      { id: "loading", title: "Loading", file: "/app/login-loading" },
      { id: "error", title: "Error", file: "/app/login-error" },
      {
        id: "permission-denied",
        title: "Permission denied",
        file: "/app/login-permission-denied",
      },
      {
        id: "edge-extended-wait",
        title: "Edge — extended wait",
        file: "/app/login-edge-extended-wait",
      },
    ],
  },
  {
    id: "chat",
    title: "Chat",
    states: [
      { id: "empty", title: "Empty", file: "/app/chat-empty" },
      { id: "loading", title: "Loading", file: "/app/chat-loading" },
      { id: "populated", title: "Populated", file: "/app/chat-populated" },
      { id: "composing", title: "Composing", file: "/app/chat-composing" },
      { id: "recording", title: "Recording", file: "/app/chat-recording" },
      {
        id: "transcribing",
        title: "Transcribing",
        file: "/app/chat-transcribing",
      },
      {
        id: "awaiting-reply",
        title: "Awaiting Ben reply",
        file: "/app/chat-awaiting-reply",
      },
      { id: "error", title: "Error", file: "/app/chat-error" },
      {
        id: "permission-denied",
        title: "Permission denied",
        file: "/app/chat-permission-denied",
      },
      { id: "offline", title: "Offline", file: "/app/chat-offline" },
      {
        id: "edge-cases",
        title: "Edge cases",
        file: "/app/chat-edge-cases",
      },
    ],
  },
  {
    id: "inline-capture",
    title: "Inline Capture Cards",
    states: [
      { id: "note-loading", title: "Note — Loading", file: "/app/capture-note-loading" },
      { id: "note-populated", title: "Note — Populated", file: "/app/capture-note-populated" },
      { id: "note-error", title: "Note — Error", file: "/app/capture-note-error" },
      { id: "note-edge-cases", title: "Note — Edge cases", file: "/app/capture-note-edge-cases" },
      { id: "reminder-loading", title: "Reminder — Loading", file: "/app/capture-reminder-loading" },
      { id: "reminder-upcoming", title: "Reminder — Upcoming", file: "/app/capture-reminder-upcoming" },
      { id: "reminder-fired", title: "Reminder — Fired", file: "/app/capture-reminder-fired" },
      { id: "reminder-error", title: "Reminder — Error", file: "/app/capture-reminder-error" },
      { id: "reminder-edge-cases", title: "Reminder — Edge cases", file: "/app/capture-reminder-edge-cases" },
      { id: "task-loading", title: "Task — Loading", file: "/app/capture-task-loading" },
      { id: "task-not-started", title: "Task — Not started", file: "/app/capture-task-not-started" },
      { id: "task-active", title: "Task — Active", file: "/app/capture-task-active" },
      { id: "task-finished", title: "Task — Finished", file: "/app/capture-task-finished" },
      { id: "task-error", title: "Task — Error", file: "/app/capture-task-error" },
      { id: "task-edge-cases", title: "Task — Edge cases", file: "/app/capture-task-edge-cases" },
      { id: "clarifying-question", title: "Clarifying question", file: "/app/capture-clarifying-question" },
      { id: "clarifying-question-edge-cases", title: "Clarifying question — Edge cases", file: "/app/capture-clarifying-question-edge-cases" },
    ],
  },
  {
    id: "task-picker",
    title: "Active-task picker",
    states: [
      { id: "empty", title: "Empty", file: "/app/task-picker-empty" },
      { id: "loading", title: "Loading", file: "/app/task-picker-loading" },
      { id: "populated", title: "Populated", file: "/app/task-picker-populated" },
      { id: "error", title: "Error", file: "/app/task-picker-error" },
      { id: "edge-cases", title: "Edge cases — long list", file: "/app/task-picker-edge-cases" },
    ],
  },
  {
    id: "task-workspace",
    title: "Task workspace",
    states: [
      { id: "empty", title: "Empty", file: "/app/workspace-empty" },
      { id: "text-populated", title: "Populated — text", file: "/app/workspace-text-populated" },
      { id: "list-populated", title: "Populated — list", file: "/app/workspace-list-populated" },
      { id: "composing", title: "Composing", file: "/app/workspace-composing" },
      { id: "recording", title: "Recording", file: "/app/workspace-recording" },
      { id: "transcribing", title: "Transcribing", file: "/app/workspace-transcribing" },
      { id: "pending-diff", title: "Pending diff", file: "/app/workspace-pending-diff" },
      { id: "error", title: "Error", file: "/app/workspace-error" },
      { id: "permission-denied", title: "Permission denied", file: "/app/workspace-permission-denied" },
      { id: "offline", title: "Offline", file: "/app/workspace-offline" },
      { id: "finished", title: "Finished", file: "/app/workspace-finished" },
      { id: "edge-cases", title: "Edge cases", file: "/app/workspace-edge-cases" },
    ],
  },
  {
    id: "menu-sidebar",
    title: "Menu sidebar",
    states: [
      { id: "sidebar-populated", title: "Sidebar — Populated", file: "/app/menu-sidebar-populated" },
      { id: "sidebar-loading", title: "Sidebar — Loading", file: "/app/menu-sidebar-loading" },
      { id: "sidebar-error", title: "Sidebar — Error", file: "/app/menu-sidebar-error" },
      { id: "tasks-empty", title: "Tasks — Empty", file: "/app/menu-tasks-empty" },
      { id: "tasks-populated", title: "Tasks — Populated", file: "/app/menu-tasks-populated" },
      { id: "tasks-loading", title: "Tasks — Loading", file: "/app/menu-tasks-loading" },
      { id: "tasks-error", title: "Tasks — Error", file: "/app/menu-tasks-error" },
      { id: "tasks-edge-cases", title: "Tasks — Edge cases", file: "/app/menu-tasks-edge-cases" },
      { id: "notes-empty", title: "Notes — Empty", file: "/app/menu-notes-empty" },
      { id: "notes-populated", title: "Notes — Populated", file: "/app/menu-notes-populated" },
      { id: "notes-loading", title: "Notes — Loading", file: "/app/menu-notes-loading" },
      { id: "notes-error", title: "Notes — Error", file: "/app/menu-notes-error" },
      { id: "notes-edge-cases", title: "Notes — Edge cases", file: "/app/menu-notes-edge-cases" },
      { id: "reminders-empty", title: "Reminders — Empty", file: "/app/menu-reminders-empty" },
      { id: "reminders-populated", title: "Reminders — Populated", file: "/app/menu-reminders-populated" },
      { id: "reminders-loading", title: "Reminders — Loading", file: "/app/menu-reminders-loading" },
      { id: "reminders-error", title: "Reminders — Error", file: "/app/menu-reminders-error" },
      { id: "reminders-edge-cases", title: "Reminders — Edge cases", file: "/app/menu-reminders-edge-cases" },
      { id: "settings-populated", title: "Settings — Populated", file: "/app/menu-settings-populated" },
      { id: "settings-loading", title: "Settings — Loading", file: "/app/menu-settings-loading" },
      { id: "settings-error", title: "Settings — Error", file: "/app/menu-settings-error" },
      { id: "settings-edge-cases", title: "Settings — Edge cases", file: "/app/menu-settings-edge-cases" },
    ],
  },
  {
    id: "item-detail",
    title: "Item detail modal",
    states: [
      { id: "note", title: "Note detail", file: "/app/item-detail-note" },
      { id: "reminder", title: "Reminder detail", file: "/app/item-detail-reminder" },
      { id: "loading", title: "Loading", file: "/app/item-detail-loading" },
      { id: "error", title: "Error", file: "/app/item-detail-error" },
      { id: "edge-cases", title: "Edge cases", file: "/app/item-detail-edge-cases" },
    ],
  },
];

export const COMPONENTS: ComponentEntry[] = [
  { id: "design-tokens", title: "Design tokens", file: "/components/design-tokens" },
  { id: "typography", title: "Typography", file: "/components/typography" },
  { id: "button", title: "Button", file: "/components/button" },
  { id: "icon-button", title: "IconButton", file: "/components/icon-button" },
  { id: "brand-mark", title: "BrandMark", file: "/components/brand-mark" },
  { id: "composer", title: "Composer (peek)", file: "/components/composer" },
  { id: "chat-input", title: "ChatInput", file: "/components/chat-input" },
  { id: "message-bubble", title: "MessageBubble", file: "/components/message-bubble" },
  { id: "typing-indicator", title: "TypingIndicator", file: "/components/typing-indicator" },
  { id: "active-task-peek", title: "ActiveTaskPeek", file: "/components/active-task-peek" },
  { id: "capture-card", title: "CaptureCard", file: "/components/capture-card" },
  { id: "item-detail-sheet", title: "ItemDetailSheet", file: "/components/item-detail-sheet" },
  { id: "chat-banner", title: "ChatBanner", file: "/components/chat-banner" },
  { id: "suggested-action", title: "SuggestedAction", file: "/components/suggested-action" },
  { id: "workspace-top-bar", title: "WorkspaceTopBar", file: "/components/workspace-top-bar" },
  { id: "todo-list-item", title: "TodoListItem", file: "/components/todo-list-item" },
  { id: "diff-bar", title: "DiffBar", file: "/components/diff-bar" },
  { id: "sub-thread-banner", title: "SubThreadBanner", file: "/components/sub-thread-banner" },
  { id: "task-picker-sheet", title: "TaskPickerSheet", file: "/components/task-picker-sheet" },
  { id: "menu-sidebar", title: "MenuSidebar", file: "/components/menu-sidebar" },
  { id: "menu-list-row", title: "MenuListRow", file: "/components/menu-list-row" },
  { id: "settings-sheet", title: "SettingsSheet", file: "/components/settings-sheet" },
];
