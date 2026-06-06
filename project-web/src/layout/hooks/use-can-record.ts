import { useConnectivityStore } from "@/layout/stores/connectivity-store";
import { useVoiceStore } from "@/layout/stores/voice-store";

export function useCanRecord(): boolean {
  const micPermission = useVoiceStore((store) => store.micPermission);
  const isOffline = useConnectivityStore((store) => store.isOffline);

  return micPermission !== "denied" && !isOffline;
}
