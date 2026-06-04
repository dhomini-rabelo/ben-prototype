import { useEffect, useState } from "react";

export type MicPermission = "granted" | "denied" | "prompt";

export function useMicrophonePermission() {
  const [permission, setPermission] = useState<MicPermission>("prompt");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    function handleChange() {
      if (permissionStatus) {
        setPermission(permissionStatus.state as MicPermission);
      }
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setPermission(status.state as MicPermission);
        status.addEventListener("change", handleChange);
      })
      .catch(() => undefined);

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
    };
  }, []);

  return { permission, setPermission };
}
