import { SettingsSheet } from "../../layout/components/settings-sheet";
import { SettingsShell } from "./_settings-shell";

export function MenuSettingsEdgeCases() {
  return (
    <SettingsShell
      sheet={
        <SettingsSheet
          name="Sam Carter"
          email="sam.carter@example.com"
          signOutState="failed"
        />
      }
    />
  );
}
