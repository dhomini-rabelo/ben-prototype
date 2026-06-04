import type { StoreGet, StoreSet } from "./types";

const TYPING_STEP_MS = 24;
const TYPING_CHARS_PER_STEP = 3;

export function animateReply(
  set: StoreSet,
  get: StoreGet,
  messageId: string,
  fullText: string,
) {
  get().stopTyping();
  let revealed = 0;
  const intervalId = setInterval(() => {
    revealed = Math.min(revealed + TYPING_CHARS_PER_STEP, fullText.length);
    const nextText = fullText.slice(0, revealed);
    set((state) => ({
      sessionMessages: state.sessionMessages.map((message) =>
        message.id === messageId
          ? { ...message, parts: [{ type: "text", text: nextText }] }
          : message,
      ),
    }));
    if (revealed >= fullText.length) {
      get().stopTyping();
    }
  }, TYPING_STEP_MS);
  set({ typingIntervalId: intervalId });
}
