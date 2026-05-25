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

export const COMPONENTS: ComponentEntry[] = [];
