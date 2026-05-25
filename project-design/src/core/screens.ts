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
];

export const COMPONENTS: ComponentEntry[] = [
  { id: "design-tokens", title: "Design tokens", file: "/components/design-tokens" },
  { id: "typography", title: "Typography", file: "/components/typography" },
  { id: "button", title: "Button", file: "/components/button" },
  { id: "icon-button", title: "IconButton", file: "/components/icon-button" },
  { id: "brand-mark", title: "BrandMark", file: "/components/brand-mark" },
  { id: "composer", title: "Composer (peek)", file: "/components/composer" },
  { id: "chat-composer", title: "ChatComposer", file: "/components/chat-composer" },
  { id: "message-bubble", title: "MessageBubble", file: "/components/message-bubble" },
  { id: "typing-indicator", title: "TypingIndicator", file: "/components/typing-indicator" },
  { id: "ledger-peek", title: "LedgerPeek", file: "/components/ledger-peek" },
  { id: "capture-card", title: "CaptureCard", file: "/components/capture-card" },
  { id: "chat-banner", title: "ChatBanner", file: "/components/chat-banner" },
  { id: "suggested-action", title: "SuggestedAction", file: "/components/suggested-action" },
];
