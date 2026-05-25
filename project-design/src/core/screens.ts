export type ScreenEntry = {
  id: string;
  title: string;
  file: string;
};

export const PAGES: ScreenEntry[] = [
  { id: "login", title: "Ben — Login", file: "/app/login" },
  { id: "chat", title: "Ben — Chat", file: "/app/chat" },
];

export const COMPONENTS: ScreenEntry[] = [];
