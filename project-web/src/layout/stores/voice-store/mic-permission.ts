import type { MicPermission } from "./types";

export function subscribeMicPermission(
  onChange: (permission: MicPermission) => void,
): () => void {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return () => undefined;
  }

  let permissionStatus: PermissionStatus | null = null;

  function handleChange() {
    if (permissionStatus) {
      onChange(permissionStatus.state as MicPermission);
    }
  }

  navigator.permissions
    .query({ name: "microphone" as PermissionName })
    .then((status) => {
      permissionStatus = status;
      onChange(status.state as MicPermission);
      status.addEventListener("change", handleChange);
    })
    .catch(() => undefined);

  return () => {
    permissionStatus?.removeEventListener("change", handleChange);
  };
}
