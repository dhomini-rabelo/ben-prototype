import { useEffect, useState } from "react";
import { useConnectivityStore } from "@/layout/stores/connectivity-store";

export function useConnectivity() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const setOffline = useConnectivityStore((store) => store.setOffline);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setOffline(isOffline);
  }, [isOffline, setOffline]);

  return {
    isOffline,
  };
}
