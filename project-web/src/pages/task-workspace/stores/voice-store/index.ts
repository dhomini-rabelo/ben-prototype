import { createVoiceStore } from "../../../../layout/stores/voice-store/create-voice-store";
import { useTaskStore } from "../task-store";

export const useVoiceStore = createVoiceStore((text) => {
  void useTaskStore.getState().sendText(text);
});

export { selectVoiceStatus } from "../../../../layout/stores/voice-store/select-voice-status";
export type {
  MicPermission,
  TranscriptionStatus,
  VoiceStatus,
  VoiceStore,
} from "../../../../layout/stores/voice-store/types";
