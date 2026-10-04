import { SettingsSheet } from "@/layout/components/menu/settings-sheet";
import { SettingsShell } from "@/layout/components/common/settings-shell";

export function MenuSettingsErrorPage() {
  return (
    <SettingsShell
      sheet={
        <SettingsSheet
          variant="error"
          email="sam.carter@example.com"
        />
      }
    />
  );
}
