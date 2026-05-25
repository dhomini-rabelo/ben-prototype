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
    states: [{ id: "empty", title: "Empty", file: "/app/login-empty" }],
  },
  {
    id: "chat",
    title: "Chat",
    states: [{ id: "empty", title: "Empty", file: "/app/chat-empty" }],
  },
];

export const COMPONENTS: ComponentEntry[] = [
  { id: "design-tokens", title: "Design tokens", file: "/components/design-tokens" },
  { id: "typography", title: "Typography", file: "/components/typography" },
  { id: "button", title: "Button", file: "/components/button" },
  { id: "icon-button", title: "IconButton", file: "/components/icon-button" },
  { id: "brand-mark", title: "BrandMark", file: "/components/brand-mark" },
  { id: "composer", title: "Composer", file: "/components/composer" },
  { id: "suggested-action", title: "SuggestedAction", file: "/components/suggested-action" },
];
