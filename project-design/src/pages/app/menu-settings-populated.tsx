import { SettingsSheet } from "../../layout/components/settings-sheet";
import { SettingsShell } from "./_settings-shell";

export function MenuSettingsPopulated() {
  return (
    <SettingsShell
      sheet={
        <SettingsSheet
          name="Sam Carter"
          email="sam.carter@example.com"
        />
      }
    />
  );
}
