import { useConnectivityStore } from "../states/connectivity-store";
import { useVoiceStore } from "../states/voice-store";

export function useCanRecord(): boolean {
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  return micPermission !== "denied" && !isOffline;
}
