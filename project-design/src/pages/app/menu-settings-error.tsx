import { SettingsSheet } from "../../layout/components/ui/settings-sheet";
import { SettingsShell } from "./_settings-shell";

export function MenuSettingsError() {
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
